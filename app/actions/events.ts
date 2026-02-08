'use server';

import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { EventFormData, TableFormData, BulkTableFormData, TicketTypeFormData, PriceTierFormData, PromotionFormData, VoucherCodeFormData } from '@/lib/validations/events';

// ============================================================================
// EVENTS
// ============================================================================

/**
 * Get all events
 */
export async function getAllEventsAction() {
  try {
    await requireAdmin();

    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { data: events };
  } catch (error) {
    console.error('Error fetching events:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to fetch events' };
  }
}

/**
 * Get a single event by ID with all related data
 */
export async function getEventByIdAction(eventId: string) {
  try {
    await requireAdmin();

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tables: {
          include: {
            seats: true,
            _count: {
              select: {
                ticketTypes: true,
              },
            },
          },
          orderBy: {
            label: 'asc',
          },
        },
        ticketTypes: {
          include: {
            table: true,
            priceTiers: {
              orderBy: {
                priority: 'desc',
              },
            },
            _count: {
              select: {
                promotions: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        promotions: {
          include: {
            voucherCodes: true,
            ticketTypes: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!event) {
      return { error: 'Event not found' };
    }

    return { data: event };
  } catch (error) {
    console.error('Error fetching event:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to fetch event' };
  }
}

/**
 * Create a new event
 */
export async function createEventAction(data: EventFormData, tenantId: string) {
  try {
    await requireAdmin();

    // Validate tenantId
    if (!tenantId) {
      return { error: 'Tenant ID is required' };
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return { error: 'Tenant not found' };
    }

    // Convert date strings to Date objects for storage
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Validate dates are valid
    if (isNaN(startDate.getTime())) {
      return { error: 'Invalid start date' };
    }
    if (isNaN(endDate.getTime())) {
      return { error: 'Invalid end date' };
    }

    const event = await prisma.event.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description ?? null,
        venueName: data.venueName,
        venueAddress: data.venueAddress ?? null,
        startDate,
        startTime: data.startTime,
        endDate,
        endTime: data.endTime,
        status: data.status ?? 'DRAFT',
      },
    });

    revalidatePath('/admin/events');
    return { data: event };
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to create event' };
  }
}

/**
 * Update an event
 */
export async function updateEventAction(eventId: string, data: EventFormData) {
  try {
    await requireAdmin();

    // Convert date strings to Date objects for storage
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Validate dates are valid
    if (isNaN(startDate.getTime())) {
      return { error: 'Invalid start date' };
    }
    if (isNaN(endDate.getTime())) {
      return { error: 'Invalid end date' };
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        name: data.name,
        description: data.description ?? null,
        venueName: data.venueName,
        venueAddress: data.venueAddress ?? null,
        startDate,
        startTime: data.startTime,
        endDate,
        endTime: data.endTime,
        status: data.status ?? 'DRAFT',
      },
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath('/admin/events');
    return { data: event };
  } catch (error) {
    console.error('Error updating event:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to update event' };
  }
}

/**
 * Archive an event
 */
export async function archiveEventAction(eventId: string) {
  try {
    await requireAdmin();

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'ARCHIVED',
      },
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath('/admin/events');
    return { data: event };
  } catch (error) {
    console.error('Error archiving event:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to archive event' };
  }
}

/**
 * Publish an event
 */
export async function publishEventAction(eventId: string) {
  try {
    await requireAdmin();

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'PUBLISHED',
      },
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath('/admin/events');
    return { data: event };
  } catch (error) {
    console.error('Error publishing event:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to publish event' };
  }
}

// ============================================================================
// TABLES
// ============================================================================

/**
 * Create a table and auto-generate seats
 */
export async function createTableAction(eventId: string, data: TableFormData) {
  try {
    await requireAdmin();

    const result = await prisma.$transaction(async (tx) => {
      // Create table
      const table = await tx.table.create({
        data: {
          eventId,
          label: data.label,
          capacity: data.capacity,
          minSpend: data.minSpend,
          notes: data.notes,
          mode: data.mode,
        },
      });

      // Auto-generate seats
      const seats = [];
      for (let i = 1; i <= data.capacity; i++) {
        seats.push({
          tableId: table.id,
          seatIndex: i,
        });
      }

      await tx.seat.createMany({
        data: seats,
      });

      return table;
    });

    revalidatePath(`/admin/events/${eventId}`);
    return { data: result };
  } catch (error) {
    console.error('Error creating table:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { error: 'A table with this label already exists for this event' };
    }
    return { error: 'Failed to create table' };
  }
}

/**
 * Bulk create tables
 */
export async function bulkCreateTablesAction(eventId: string, data: BulkTableFormData) {
  try {
    await requireAdmin();

    const result = await prisma.$transaction(async (tx) => {
      const tables = [];
      const allSeats = [];

      for (let num = data.startNumber; num <= data.endNumber; num++) {
        const label = `${data.prefix}${num}`;
        
        const table = await tx.table.create({
          data: {
            eventId,
            label,
            capacity: data.capacity,
            minSpend: data.minSpend,
            mode: data.mode,
          },
        });

        tables.push(table);

        // Generate seats for this table
        const seats = [];
        for (let i = 1; i <= data.capacity; i++) {
          seats.push({
            tableId: table.id,
            seatIndex: i,
          });
        }
        allSeats.push(...seats);
      }

      // Create all seats in bulk
      if (allSeats.length > 0) {
        await tx.seat.createMany({
          data: allSeats,
        });
      }

      return tables;
    });

    revalidatePath(`/admin/events/${eventId}`);
    return { data: result };
  } catch (error) {
    console.error('Error bulk creating tables:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to bulk create tables' };
  }
}

/**
 * Update table capacity and regenerate seats
 */
export async function updateTableCapacityAction(tableId: string, newCapacity: number) {
  try {
    await requireAdmin();

    const result = await prisma.$transaction(async (tx) => {
      const table = await tx.table.findUnique({
        where: { id: tableId },
        include: {
          seats: true,
        },
      });

      if (!table) {
        throw new Error('Table not found');
      }

      // TODO: Check if seats are assigned (for future use)
      // For now, we'll regenerate seats

      // Delete existing seats
      await tx.seat.deleteMany({
        where: { tableId },
      });

      // Update table capacity
      const updatedTable = await tx.table.update({
        where: { id: tableId },
        data: {
          capacity: newCapacity,
        },
      });

      // Generate new seats
      const seats = [];
      for (let i = 1; i <= newCapacity; i++) {
        seats.push({
          tableId,
          seatIndex: i,
        });
      }

      await tx.seat.createMany({
        data: seats,
      });

      return updatedTable;
    });

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        event: true,
      },
    });

    if (table) {
      revalidatePath(`/admin/events/${table.eventId}`);
    }
    return { data: result };
  } catch (error) {
    console.error('Error updating table capacity:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: error instanceof Error ? error.message : 'Failed to update table capacity' };
  }
}

/**
 * Regenerate seats for a table
 */
export async function regenerateSeatsAction(tableId: string) {
  try {
    await requireAdmin();

    const result = await prisma.$transaction(async (tx) => {
      const table = await tx.table.findUnique({
        where: { id: tableId },
      });

      if (!table) {
        throw new Error('Table not found');
      }

      // Delete existing seats
      await tx.seat.deleteMany({
        where: { tableId },
      });

      // Generate new seats
      const seats = [];
      for (let i = 1; i <= table.capacity; i++) {
        seats.push({
          tableId,
          seatIndex: i,
        });
      }

      await tx.seat.createMany({
        data: seats,
      });

      return table;
    });

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        event: true,
      },
    });

    if (table) {
      revalidatePath(`/admin/events/${table.eventId}`);
    }
    return { data: result };
  } catch (error) {
    console.error('Error regenerating seats:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: error instanceof Error ? error.message : 'Failed to regenerate seats' };
  }
}

/**
 * Update table
 */
export async function updateTableAction(tableId: string, data: TableFormData) {
  try {
    await requireAdmin();

    const table = await prisma.table.update({
      where: { id: tableId },
      data: {
        label: data.label,
        capacity: data.capacity,
        minSpend: data.minSpend,
        notes: data.notes,
        mode: data.mode,
      },
    });

    const tableWithEvent = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        event: true,
      },
    });

    if (tableWithEvent) {
      revalidatePath(`/admin/events/${tableWithEvent.eventId}`);
    }
    return { data: table };
  } catch (error) {
    console.error('Error updating table:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to update table' };
  }
}

/**
 * Delete a table
 */
export async function deleteTableAction(tableId: string) {
  try {
    await requireAdmin();

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        event: true,
      },
    });

    if (!table) {
      return { error: 'Table not found' };
    }

    await prisma.table.delete({
      where: { id: tableId },
    });

    revalidatePath(`/admin/events/${table.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting table:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to delete table' };
  }
}

// ============================================================================
// TICKET TYPES
// ============================================================================

/**
 * Get all ticket types for an event
 */
export async function getTicketTypesByEventAction(eventId: string) {
  try {
    await requireAdmin();

    const ticketTypes = await prisma.ticketType.findMany({
      where: { eventId },
      include: {
        table: true,
        priceTiers: {
          orderBy: {
            priority: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { data: ticketTypes };
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to fetch ticket types' };
  }
}

/**
 * Create a ticket type with validation
 */
export async function createTicketTypeAction(eventId: string, data: TicketTypeFormData) {
  try {
    await requireAdmin();

    // Validate table mode for TABLE and SEAT kinds
    if (data.kind === 'TABLE' || data.kind === 'SEAT') {
      if (!data.tableId) {
        return { error: 'Table is required for TABLE and SEAT ticket types' };
      }

      const table = await prisma.table.findUnique({
        where: { id: data.tableId },
      });

      if (!table) {
        return { error: 'Table not found' };
      }

      if (data.kind === 'TABLE' && table.mode !== 'EXCLUSIVE' && table.mode !== 'SHARED') {
        return { error: 'TABLE ticket type must reference an EXCLUSIVE or SHARED table' };
      }

      if (data.kind === 'SEAT' && table.mode !== 'SHARED' && table.mode !== 'EXCLUSIVE') {
        return { error: 'SEAT ticket type must reference a SHARED or EXCLUSIVE table' };
      }

      // For TABLE kind, set quantityTotal to 1
      if (data.kind === 'TABLE') {
        data.quantityTotal = 1;
      }

      // For SEAT kind, set quantityTotal to table capacity
      if (data.kind === 'SEAT') {
        data.quantityTotal = table.capacity;
      }
    }

    const ticketType = await prisma.ticketType.create({
      data: {
        eventId,
        name: data.name,
        description: data.description,
        kind: data.kind,
        basePrice: data.basePrice,
        quantityTotal: data.quantityTotal,
        transferrable: data.transferrable,
        cancellable: data.cancellable,
        tableId: data.tableId || null,
      },
    });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (event) {
      revalidatePath(`/admin/events/${eventId}`);
    }
    return { data: ticketType };
  } catch (error) {
    console.error('Error creating ticket type:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to create ticket type' };
  }
}

/**
 * Update a ticket type
 */
export async function updateTicketTypeAction(ticketTypeId: string, data: TicketTypeFormData) {
  try {
    await requireAdmin();

    const existingTicketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    });

    if (!existingTicketType) {
      return { error: 'Ticket type not found' };
    }

    // Validate table mode for TABLE and SEAT kinds
    if (data.kind === 'TABLE' || data.kind === 'SEAT') {
      if (!data.tableId) {
        return { error: 'Table is required for TABLE and SEAT ticket types' };
      }

      const table = await prisma.table.findUnique({
        where: { id: data.tableId },
      });

      if (!table) {
        return { error: 'Table not found' };
      }

      if (data.kind === 'TABLE' && table.mode !== 'EXCLUSIVE' && table.mode !== 'SHARED') {
        return { error: 'TABLE ticket type must reference an EXCLUSIVE or SHARED table' };
      }

      if (data.kind === 'SEAT' && table.mode !== 'SHARED' && table.mode !== 'EXCLUSIVE') {
        return { error: 'SEAT ticket type must reference a SHARED or EXCLUSIVE table' };
      }

      // For TABLE kind, set quantityTotal to 1
      if (data.kind === 'TABLE') {
        data.quantityTotal = 1;
      }

      // For SEAT kind, set quantityTotal to table capacity
      if (data.kind === 'SEAT') {
        data.quantityTotal = table.capacity;
      }
    }

    const ticketType = await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: {
        name: data.name,
        description: data.description,
        kind: data.kind,
        basePrice: data.basePrice,
        quantityTotal: data.quantityTotal,
        transferrable: data.transferrable,
        cancellable: data.cancellable,
        tableId: data.tableId || null,
      },
    });

    revalidatePath(`/admin/events/${existingTicketType.eventId}`);
    return { data: ticketType };
  } catch (error) {
    console.error('Error updating ticket type:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to update ticket type' };
  }
}

/**
 * Delete a ticket type
 */
export async function deleteTicketTypeAction(ticketTypeId: string) {
  try {
    await requireAdmin();

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    });

    if (!ticketType) {
      return { error: 'Ticket type not found' };
    }

    await prisma.ticketType.delete({
      where: { id: ticketTypeId },
    });

    revalidatePath(`/admin/events/${ticketType.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting ticket type:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to delete ticket type' };
  }
}

// ============================================================================
// PRICE TIERS
// ============================================================================

/**
 * Create a price tier
 */
export async function createPriceTierAction(ticketTypeId: string, data: PriceTierFormData) {
  try {
    await requireAdmin();

    const priceTier = await prisma.ticketTypePriceTier.create({
      data: {
        ticketTypeId,
        name: data.name,
        price: data.price,
        strategy: data.strategy,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        allocationTotal: data.allocationTotal,
        priority: data.priority,
      },
    });

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    });

    if (ticketType) {
      revalidatePath(`/admin/events/${ticketType.eventId}`);
    }
    return { data: priceTier };
  } catch (error) {
    console.error('Error creating price tier:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to create price tier' };
  }
}

/**
 * Update a price tier
 */
export async function updatePriceTierAction(priceTierId: string, data: PriceTierFormData) {
  try {
    await requireAdmin();

    const priceTier = await prisma.ticketTypePriceTier.update({
      where: { id: priceTierId },
      data: {
        name: data.name,
        price: data.price,
        strategy: data.strategy,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        allocationTotal: data.allocationTotal,
        priority: data.priority,
      },
    });

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: priceTier.ticketTypeId },
    });

    if (ticketType) {
      revalidatePath(`/admin/events/${ticketType.eventId}`);
    }
    return { data: priceTier };
  } catch (error) {
    console.error('Error updating price tier:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to update price tier' };
  }
}

/**
 * Delete a price tier
 */
export async function deletePriceTierAction(priceTierId: string) {
  try {
    await requireAdmin();

    const priceTier = await prisma.ticketTypePriceTier.findUnique({
      where: { id: priceTierId },
      include: {
        ticketType: true,
      },
    });

    if (!priceTier) {
      return { error: 'Price tier not found' };
    }

    await prisma.ticketTypePriceTier.delete({
      where: { id: priceTierId },
    });

    revalidatePath(`/admin/events/${priceTier.ticketType.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting price tier:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to delete price tier' };
  }
}

// ============================================================================
// PROMOTIONS
// ============================================================================

/**
 * Create a promotion
 */
export async function createPromotionAction(eventId: string, data: PromotionFormData) {
  try {
    await requireAdmin();

    const result = await prisma.$transaction(async (tx) => {
      const promotion = await tx.promotion.create({
        data: {
          eventId,
          name: data.name,
          description: data.description,
          requiresCode: data.requiresCode,
          discountType: data.discountType,
          discountValue: data.discountValue,
          appliesTo: data.appliesTo,
          validFrom: new Date(data.validFrom),
          validUntil: new Date(data.validUntil),
          maxRedemptions: data.maxRedemptions,
          maxPerUser: data.maxPerUser,
        },
      });

      // Link ticket types if provided
      if (data.ticketTypeIds && data.ticketTypeIds.length > 0) {
        await tx.promotionTicketType.createMany({
          data: data.ticketTypeIds.map((ticketTypeId) => ({
            promotionId: promotion.id,
            ticketTypeId,
          })),
        });
      }

      return promotion;
    });

    revalidatePath(`/admin/events/${eventId}`);
    return { data: result };
  } catch (error) {
    console.error('Error creating promotion:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to create promotion' };
  }
}

/**
 * Update a promotion
 */
export async function updatePromotionAction(promotionId: string, data: PromotionFormData) {
  try {
    await requireAdmin();

    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!existingPromotion) {
      return { error: 'Promotion not found' };
    }

    const result = await prisma.$transaction(async (tx) => {
      const promotion = await tx.promotion.update({
        where: { id: promotionId },
        data: {
          name: data.name,
          description: data.description,
          requiresCode: data.requiresCode,
          discountType: data.discountType,
          discountValue: data.discountValue,
          appliesTo: data.appliesTo,
          validFrom: new Date(data.validFrom),
          validUntil: new Date(data.validUntil),
          maxRedemptions: data.maxRedemptions,
          maxPerUser: data.maxPerUser,
        },
      });

      // Update ticket type links
      await tx.promotionTicketType.deleteMany({
        where: { promotionId },
      });

      if (data.ticketTypeIds && data.ticketTypeIds.length > 0) {
        await tx.promotionTicketType.createMany({
          data: data.ticketTypeIds.map((ticketTypeId) => ({
            promotionId: promotion.id,
            ticketTypeId,
          })),
        });
      }

      return promotion;
    });

    revalidatePath(`/admin/events/${existingPromotion.eventId}`);
    return { data: result };
  } catch (error) {
    console.error('Error updating promotion:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to update promotion' };
  }
}

/**
 * Delete a promotion
 */
export async function deletePromotionAction(promotionId: string) {
  try {
    await requireAdmin();

    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      return { error: 'Promotion not found' };
    }

    await prisma.promotion.delete({
      where: { id: promotionId },
    });

    revalidatePath(`/admin/events/${promotion.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting promotion:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to delete promotion' };
  }
}

// ============================================================================
// VOUCHER CODES
// ============================================================================

/**
 * Create a voucher code
 */
export async function createVoucherCodeAction(promotionId: string, data: VoucherCodeFormData) {
  try {
    await requireAdmin();

    const voucherCode = await prisma.voucherCode.create({
      data: {
        promotionId,
        code: data.code.toUpperCase(),
        maxRedemptions: data.maxRedemptions,
      },
    });

    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (promotion) {
      revalidatePath(`/admin/events/${promotion.eventId}`);
    }
    return { data: voucherCode };
  } catch (error) {
    console.error('Error creating voucher code:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { error: 'A voucher code with this code already exists' };
    }
    return { error: 'Failed to create voucher code' };
  }
}

/**
 * Update a voucher code
 */
export async function updateVoucherCodeAction(voucherCodeId: string, data: VoucherCodeFormData) {
  try {
    await requireAdmin();

    const voucherCode = await prisma.voucherCode.update({
      where: { id: voucherCodeId },
      data: {
        code: data.code.toUpperCase(),
        maxRedemptions: data.maxRedemptions,
      },
    });

    const promotion = await prisma.promotion.findUnique({
      where: { id: voucherCode.promotionId },
    });

    if (promotion) {
      revalidatePath(`/admin/events/${promotion.eventId}`);
    }
    return { data: voucherCode };
  } catch (error) {
    console.error('Error updating voucher code:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { error: 'A voucher code with this code already exists' };
    }
    return { error: 'Failed to update voucher code' };
  }
}

/**
 * Delete a voucher code
 */
export async function deleteVoucherCodeAction(voucherCodeId: string) {
  try {
    await requireAdmin();

    const voucherCode = await prisma.voucherCode.findUnique({
      where: { id: voucherCodeId },
      include: {
        promotion: true,
      },
    });

    if (!voucherCode) {
      return { error: 'Voucher code not found' };
    }

    await prisma.voucherCode.delete({
      where: { id: voucherCodeId },
    });

    revalidatePath(`/admin/events/${voucherCode.promotion.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting voucher code:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: error.message };
    }
    return { error: 'Failed to delete voucher code' };
  }
}
