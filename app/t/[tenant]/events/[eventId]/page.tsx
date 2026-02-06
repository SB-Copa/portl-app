import { notFound } from 'next/navigation';
import { getCurrentTenant } from '@/lib/tenant';
import { getPublicEventById } from '@/app/actions/public-events';
import { PublicEventDetail } from '@/components/public/events/public-event-detail';

type EventDetailPageProps = {
  params: Promise<{ tenant: string; eventId: string }>;
};

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { tenant: subdomain, eventId } = await params;
  const tenant = await getCurrentTenant(subdomain);

  if (!tenant) {
    return {
      title: 'Event Not Found',
    };
  }

  const result = await getPublicEventById(subdomain, eventId);

  if (result.error || !result.data) {
    return {
      title: 'Event Not Found',
    };
  }

  const event = result.data;

  return {
    title: `${event.name} | ${tenant.name}`,
    description: event.description || `Event details for ${event.name}`,
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { tenant: subdomain, eventId } = await params;
  const tenant = await getCurrentTenant(subdomain);

  if (!tenant) {
    notFound();
  }

  const result = await getPublicEventById(subdomain, eventId);

  if (result.error || !result.data) {
    notFound();
  }

  const event = result.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <PublicEventDetail
          event={event}
          tenantSubdomain={subdomain}
          tenantName={tenant.name}
        />
      </div>
    </div>
  );
}
