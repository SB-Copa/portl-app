import type { Event, Prisma } from '@/prisma/generated/prisma/client';

export type EventWithTicketTypes = Event & Prisma.EventGetPayload<{
  include: {
    ticketTypes: {
      include: {
        table: true;
        priceTiers: true;
        _count: {
          select: {
            promotions: true;
          };
        };
      };
    };
    tables: true;
  };
}>;

export interface TicketsSectionProps {
  event: EventWithTicketTypes;
  tenantSubdomain: string;
}

export type TicketType = EventWithTicketTypes['ticketTypes'][number];
