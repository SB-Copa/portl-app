'use server';

import { requireTenantOwner } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { EventFormData, TableFormData, BulkTableFormData, TicketTypeFormData, PriceTierFormData, PromotionFormData, VoucherCodeFormData } from '@/lib/validations/events';

// Helper to verify event belongs to tenant
async function verifyEventBelongsToTenant(eventId: string, tenantId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { tenantId: true },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.tenantId !== tenantId) {
    throw new Error('Event does not belong to this tenant');
  }

  return true;
}

// ============================================================================
// EVENTS
// ============================================================================

/**
 * Get all events for a tenant
 */
export async function getEventsForTenantAction(tenantSubdomain: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const events = await prisma.event.findMany({
      where: { tenantId: tenant.id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { data: events };
  } catch (error) {
    console.error('Error fetching events:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not approved'))) {
      return { error: error.message };
    }
    return { error: 'Failed to fetch events' };
  }
}

/**
 * Get a single event by ID with all related data (tenant-scoped)
 */
export async function getEventByIdForTenantAction(tenantSubdomain: string, eventId: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    await verifyEventBelongsToTenant(eventId, tenant.id);

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
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to fetch event' };
  }
}

/**
 * Create a new event for a tenant
 */
export async function createEventForTenantAction(tenantSubdomain: string, data: EventFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

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
        tenantId: tenant.id,
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

    revalidatePath(`/dashboard/${tenantSubdomain}/events`);
    return { data: event };
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not approved'))) {
      return { error: error.message };
    }
    return { error: 'Failed to create event' };
  }
}

/**
 * Update an event (tenant-scoped)
 */
export async function updateEventForTenantAction(tenantSubdomain: string, eventId: string, data: EventFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    await verifyEventBelongsToTenant(eventId, tenant.id);

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

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${eventId}`);
    revalidatePath(`/dashboard/${tenantSubdomain}/events`);
    return { data: event };
  } catch (error) {
    console.error('Error updating event:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to update event' };
  }
}

/**
 * Archive an event (tenant-scoped)
 */
export async function archiveEventForTenantAction(tenantSubdomain: string, eventId: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    await verifyEventBelongsToTenant(eventId, tenant.id);

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'ARCHIVED',
      },
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${eventId}`);
    revalidatePath(`/dashboard/${tenantSubdomain}/events`);
    return { data: event };
  } catch (error) {
    console.error('Error archiving event:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to archive event' };
  }
}

/**
 * Publish an event (tenant-scoped)
 */
export async function publishEventForTenantAction(tenantSubdomain: string, eventId: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    await verifyEventBelongsToTenant(eventId, tenant.id);

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'PUBLISHED',
      },
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${eventId}`);
    revalidatePath(`/dashboard/${tenantSubdomain}/events`);
    return { data: event };
  } catch (error) {
    console.error('Error publishing event:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to publish event' };
  }
}

// ============================================================================
// TABLES
// ============================================================================

/**
 * Create a table and auto-generate seats (tenant-scoped)
 */
export async function createTableForTenantAction(tenantSubdomain: string, eventId: string, data: TableFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    await verifyEventBelongsToTenant(eventId, tenant.id);

    const result = await prisma.$transaction(async (tx) => {
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

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${eventId}`);
    return { data: result };
  } catch (error) {
    console.error('Error creating table:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { error: 'A table with this label already exists for this event' };
    }
    return { error: 'Failed to create table' };
  }
}

/**
 * Bulk create tables (tenant-scoped)
 */
export async function bulkCreateTablesForTenantAction(tenantSubdomain: string, eventId: string, data: BulkTableFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    await verifyEventBelongsToTenant(eventId, tenant.id);

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

        const seats = [];
        for (let i = 1; i <= data.capacity; i++) {
          seats.push({
            tableId: table.id,
            seatIndex: i,
          });
        }
        allSeats.push(...seats);
      }

      if (allSeats.length > 0) {
        await tx.seat.createMany({
          data: allSeats,
        });
      }

      return tables;
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${eventId}`);
    return { data: result };
  } catch (error) {
    console.error('Error bulk creating tables:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to bulk create tables' };
  }
}

/**
 * Update table capacity and regenerate seats (tenant-scoped)
 */
export async function updateTableCapacityForTenantAction(tenantSubdomain: string, tableId: string, newCapacity: number) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        event: true,
      },
    });

    if (!table) {
      return { error: 'Table not found' };
    }

    await verifyEventBelongsToTenant(table.eventId, tenant.id);

    const result = await prisma.$transaction(async (tx) => {
      await tx.seat.deleteMany({
        where: { tableId },
      });

      const updatedTable = await tx.table.update({
        where: { id: tableId },
        data: {
          capacity: newCapacity,
        },
      });

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

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${table.eventId}`);
    return { data: result };
  } catch (error) {
    console.error('Error updating table capacity:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: error instanceof Error ? error.message : 'Failed to update table capacity' };
  }
}

/**
 * Regenerate seats for a table (tenant-scoped)
 */
export async function regenerateSeatsForTenantAction(tenantSubdomain: string, tableId: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        event: true,
      },
    });

    if (!table) {
      return { error: 'Table not found' };
    }

    await verifyEventBelongsToTenant(table.eventId, tenant.id);

    const result = await prisma.$transaction(async (tx) => {
      await tx.seat.deleteMany({
        where: { tableId },
      });

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

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${table.eventId}`);
    return { data: result };
  } catch (error) {
    console.error('Error regenerating seats:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: error instanceof Error ? error.message : 'Failed to regenerate seats' };
  }
}

/**
 * Update table (tenant-scoped)
 */
export async function updateTableForTenantAction(tenantSubdomain: string, tableId: string, data: TableFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        event: true,
      },
    });

    if (!table) {
      return { error: 'Table not found' };
    }

    await verifyEventBelongsToTenant(table.eventId, tenant.id);

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: {
        label: data.label,
        capacity: data.capacity,
        minSpend: data.minSpend,
        notes: data.notes,
        mode: data.mode,
      },
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${table.eventId}`);
    return { data: updatedTable };
  } catch (error) {
    console.error('Error updating table:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to update table' };
  }
}

/**
 * Delete a table (tenant-scoped)
 */
export async function deleteTableForTenantAction(tenantSubdomain: string, tableId: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        event: true,
      },
    });

    if (!table) {
      return { error: 'Table not found' };
    }

    await verifyEventBelongsToTenant(table.eventId, tenant.id);

    await prisma.table.delete({
      where: { id: tableId },
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${table.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting table:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to delete table' };
  }
}

// ============================================================================
// TICKET TYPES
// ============================================================================

/**
 * Get all ticket types for an event (tenant-scoped)
 */
export async function getTicketTypesByEventForTenantAction(tenantSubdomain: string, eventId: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    await verifyEventBelongsToTenant(eventId, tenant.id);

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
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to fetch ticket types' };
  }
}

/**
 * Create a ticket type with validation (tenant-scoped)
 */
export async function createTicketTypeForTenantAction(tenantSubdomain: string, eventId: string, data: TicketTypeFormData) {
  console.log('createTicketTypeForTenantAction called with:', { tenantSubdomain, eventId, data });
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    await verifyEventBelongsToTenant(eventId, tenant.id);

    if (data.kind === 'TABLE' || data.kind === 'SEAT') {
      if (!data.tableId) {
        return { error: 'Table is required for TABLE and SEAT ticket types' };
      }

      const table = await prisma.table.findUnique({
        where: { id: data.tableId },
        include: {
          event: true,
        },
      });

      if (!table) {
        return { error: 'Table not found' };
      }

      if (table.eventId !== eventId) {
        return { error: 'Table does not belong to this event' };
      }

      if (data.kind === 'TABLE' && table.mode !== 'EXCLUSIVE' && table.mode !== 'SHARED') {
        return { error: 'TABLE ticket type must reference an EXCLUSIVE or SHARED table' };
      }

      if (data.kind === 'SEAT' && table.mode !== 'SHARED' && table.mode !== 'EXCLUSIVE') {
        return { error: 'SEAT ticket type must reference a SHARED or EXCLUSIVE table' };
      }

      if (data.kind === 'TABLE') {
        data.quantityTotal = 1;
      }

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

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${eventId}`);
    return { data: ticketType };
  } catch (error) {
    console.error('Error creating ticket type:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to create ticket type' };
  }
}

/**
 * Update a ticket type (tenant-scoped)
 */
export async function updateTicketTypeForTenantAction(tenantSubdomain: string, ticketTypeId: string, data: TicketTypeFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const existingTicketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        event: true,
      },
    });

    if (!existingTicketType) {
      return { error: 'Ticket type not found' };
    }

    await verifyEventBelongsToTenant(existingTicketType.eventId, tenant.id);

    if (data.kind === 'TABLE' || data.kind === 'SEAT') {
      if (!data.tableId) {
        return { error: 'Table is required for TABLE and SEAT ticket types' };
      }

      const table = await prisma.table.findUnique({
        where: { id: data.tableId },
        include: {
          event: true,
        },
      });

      if (!table) {
        return { error: 'Table not found' };
      }

      if (table.eventId !== existingTicketType.eventId) {
        return { error: 'Table does not belong to this event' };
      }

      if (data.kind === 'TABLE' && table.mode !== 'EXCLUSIVE' && table.mode !== 'SHARED') {
        return { error: 'TABLE ticket type must reference an EXCLUSIVE or SHARED table' };
      }

      if (data.kind === 'SEAT' && table.mode !== 'SHARED' && table.mode !== 'EXCLUSIVE') {
        return { error: 'SEAT ticket type must reference a SHARED or EXCLUSIVE table' };
      }

      if (data.kind === 'TABLE') {
        data.quantityTotal = 1;
      }

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

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${existingTicketType.eventId}`);
    return { data: ticketType };
  } catch (error) {
    console.error('Error updating ticket type:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to update ticket type' };
  }
}

/**
 * Delete a ticket type (tenant-scoped)
 */
export async function deleteTicketTypeForTenantAction(tenantSubdomain: string, ticketTypeId: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        event: true,
      },
    });

    if (!ticketType) {
      return { error: 'Ticket type not found' };
    }

    await verifyEventBelongsToTenant(ticketType.eventId, tenant.id);

    await prisma.ticketType.delete({
      where: { id: ticketTypeId },
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${ticketType.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting ticket type:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to delete ticket type' };
  }
}

// ============================================================================
// PRICE TIERS
// ============================================================================

/**
 * Create a price tier (tenant-scoped)
 */
export async function createPriceTierForTenantAction(tenantSubdomain: string, ticketTypeId: string, data: PriceTierFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        event: true,
      },
    });

    if (!ticketType) {
      return { error: 'Ticket type not found' };
    }

    await verifyEventBelongsToTenant(ticketType.eventId, tenant.id);

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

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${ticketType.eventId}`);
    return { data: priceTier };
  } catch (error) {
    console.error('Error creating price tier:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to create price tier' };
  }
}

/**
 * Update a price tier (tenant-scoped)
 */
export async function updatePriceTierForTenantAction(tenantSubdomain: string, priceTierId: string, data: PriceTierFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const priceTier = await prisma.ticketTypePriceTier.findUnique({
      where: { id: priceTierId },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!priceTier) {
      return { error: 'Price tier not found' };
    }

    await verifyEventBelongsToTenant(priceTier.ticketType.eventId, tenant.id);

    const updatedPriceTier = await prisma.ticketTypePriceTier.update({
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

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${priceTier.ticketType.eventId}`);
    return { data: updatedPriceTier };
  } catch (error) {
    console.error('Error updating price tier:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to update price tier' };
  }
}

/**
 * Delete a price tier (tenant-scoped)
 */
export async function deletePriceTierForTenantAction(tenantSubdomain: string, priceTierId: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const priceTier = await prisma.ticketTypePriceTier.findUnique({
      where: { id: priceTierId },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!priceTier) {
      return { error: 'Price tier not found' };
    }

    await verifyEventBelongsToTenant(priceTier.ticketType.eventId, tenant.id);

    await prisma.ticketTypePriceTier.delete({
      where: { id: priceTierId },
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${priceTier.ticketType.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting price tier:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to delete price tier' };
  }
}

// ============================================================================
// PROMOTIONS
// ============================================================================

/**
 * Create a promotion (tenant-scoped)
 */
export async function createPromotionForTenantAction(tenantSubdomain: string, eventId: string, data: PromotionFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    await verifyEventBelongsToTenant(eventId, tenant.id);

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

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${eventId}`);
    return { data: result };
  } catch (error) {
    console.error('Error creating promotion:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to create promotion' };
  }
}

/**
 * Update a promotion (tenant-scoped)
 */
export async function updatePromotionForTenantAction(tenantSubdomain: string, promotionId: string, data: PromotionFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        event: true,
      },
    });

    if (!existingPromotion) {
      return { error: 'Promotion not found' };
    }

    await verifyEventBelongsToTenant(existingPromotion.eventId, tenant.id);

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

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${existingPromotion.eventId}`);
    return { data: result };
  } catch (error) {
    console.error('Error updating promotion:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to update promotion' };
  }
}

/**
 * Delete a promotion (tenant-scoped)
 */
export async function deletePromotionForTenantAction(tenantSubdomain: string, promotionId: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        event: true,
      },
    });

    if (!promotion) {
      return { error: 'Promotion not found' };
    }

    await verifyEventBelongsToTenant(promotion.eventId, tenant.id);

    await prisma.promotion.delete({
      where: { id: promotionId },
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${promotion.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting promotion:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to delete promotion' };
  }
}

// ============================================================================
// VOUCHER CODES
// ============================================================================

/**
 * Create a voucher code (tenant-scoped)
 */
export async function createVoucherCodeForTenantAction(tenantSubdomain: string, promotionId: string, data: VoucherCodeFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        event: true,
      },
    });

    if (!promotion) {
      return { error: 'Promotion not found' };
    }

    await verifyEventBelongsToTenant(promotion.eventId, tenant.id);

    const voucherCode = await prisma.voucherCode.create({
      data: {
        promotionId,
        code: data.code.toUpperCase(),
        maxRedemptions: data.maxRedemptions,
      },
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${promotion.eventId}`);
    return { data: voucherCode };
  } catch (error) {
    console.error('Error creating voucher code:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { error: 'A voucher code with this code already exists' };
    }
    return { error: 'Failed to create voucher code' };
  }
}

/**
 * Update a voucher code (tenant-scoped)
 */
export async function updateVoucherCodeForTenantAction(tenantSubdomain: string, voucherCodeId: string, data: VoucherCodeFormData) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const voucherCode = await prisma.voucherCode.findUnique({
      where: { id: voucherCodeId },
      include: {
        promotion: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!voucherCode) {
      return { error: 'Voucher code not found' };
    }

    await verifyEventBelongsToTenant(voucherCode.promotion.eventId, tenant.id);

    const updatedVoucherCode = await prisma.voucherCode.update({
      where: { id: voucherCodeId },
      data: {
        code: data.code.toUpperCase(),
        maxRedemptions: data.maxRedemptions,
      },
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${voucherCode.promotion.eventId}`);
    return { data: updatedVoucherCode };
  } catch (error) {
    console.error('Error updating voucher code:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { error: 'A voucher code with this code already exists' };
    }
    return { error: 'Failed to update voucher code' };
  }
}

/**
 * Delete a voucher code (tenant-scoped)
 */
export async function deleteVoucherCodeForTenantAction(tenantSubdomain: string, voucherCodeId: string) {
  try {
    const { tenant } = await requireTenantOwner(tenantSubdomain);

    const voucherCode = await prisma.voucherCode.findUnique({
      where: { id: voucherCodeId },
      include: {
        promotion: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!voucherCode) {
      return { error: 'Voucher code not found' };
    }

    await verifyEventBelongsToTenant(voucherCode.promotion.eventId, tenant.id);

    await prisma.voucherCode.delete({
      where: { id: voucherCodeId },
    });

    revalidatePath(`/dashboard/${tenantSubdomain}/events/${voucherCode.promotion.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting voucher code:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found') || error.message.includes('not belong'))) {
      return { error: error.message };
    }
    return { error: 'Failed to delete voucher code' };
  }
}
