import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { PublicEventCard } from './public-event-card';
import type { Event, TicketType } from '@/prisma/generated/prisma/client';

type EventWithTicketTypes = Event & {
  ticketTypes: Pick<TicketType, 'id' | 'basePrice'>[];
  images: { url: string }[];
};

interface PublicEventsListProps {
  events: EventWithTicketTypes[];
  tenantSubdomain: string;
  tenantName: string;
}

export function PublicEventsList({ events, tenantSubdomain, tenantName }: PublicEventsListProps) {
  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No events available</h3>
          <p className="text-muted-foreground max-w-sm">
            {tenantName} doesn&apos;t have any upcoming events at the moment. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <PublicEventCard
          key={event.id}
          event={event}
          tenantSubdomain={tenantSubdomain}
        />
      ))}
    </div>
  );
}
