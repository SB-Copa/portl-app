import { Event, Prisma } from '@/prisma/generated/prisma/client';

export type EventWithTables = Event & Prisma.EventGetPayload<{
  include: {
    tables: {
      include: {
        seats: true;
        ticketTypes: {
          select: {
            id: true;
            name: true;
            quantityTotal: true;
            quantitySold: true;
            status: true;
          };
        };
        _count: {
          select: {
            ticketTypes: true;
          };
        };
      };
    };
  };
}>;

export interface TablesSectionProps {
  event: EventWithTables;
  tenantSubdomain: string;
}

export type TableItem = EventWithTables['tables'][number];

export interface TableInventory {
  totalQty: number | null;
  totalSold: number | null;
  totalAvailable: number | null;
  hasUnlimited?: boolean;
}
