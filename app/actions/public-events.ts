'use server';

import { getCurrentTenant } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

/**
 * Get all published events for a tenant (public, no auth required)
 */
export async function getPublicEventsForTenant(subdomain: string) {
  try {
    const tenant = await getCurrentTenant(subdomain);
    if (!tenant) {
      return { error: 'Tenant not found' };
    }

    const events = await prisma.event.findMany({
      where: {
        tenantId: tenant.id,
        status: 'PUBLISHED',
      },
      orderBy: {
        startDate: 'asc',
      },
      include: {
        ticketTypes: {
          select: {
            id: true,
            basePrice: true,
          },
        },
      },
    });

    return { data: events };
  } catch (error) {
    console.error('Error fetching public events:', error);
    return { error: 'Failed to fetch events' };
  }
}

/**
 * Get a single published event by ID (public, no auth required)
 */
export async function getPublicEventById(subdomain: string, eventId: string) {
  try {
    const tenant = await getCurrentTenant(subdomain);
    if (!tenant) {
      return { error: 'Tenant not found' };
    }

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        tenantId: tenant.id,
        status: 'PUBLISHED',
      },
      include: {
        ticketTypes: {
          include: {
            priceTiers: {
              orderBy: {
                priority: 'desc',
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!event) {
      return { error: 'Event not found' };
    }

    return { data: event };
  } catch (error) {
    console.error('Error fetching public event:', error);
    return { error: 'Failed to fetch event' };
  }
}
