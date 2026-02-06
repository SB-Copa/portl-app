import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { EventsList } from '@/components/dashboard/events/events-list';

async function getTenantEvents(userId: string, subdomain: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: {
      application: true,
      events: {
        orderBy: { startDate: 'desc' },
      },
    },
  });

  if (!tenant || tenant.ownerId !== userId) {
    return null;
  }

  return tenant;
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const user = await getCurrentUser();
  const { tenant: subdomain } = await params;

  if (!user) {
    redirect(`/auth/signin?callbackUrl=/dashboard/${subdomain}/events`);
  }

  const tenant = await getTenantEvents(user.id, subdomain);

  if (!tenant) {
    redirect('/dashboard');
  }

  const isApproved = tenant.application?.status === 'APPROVED';

  if (!isApproved) {
    redirect(`/dashboard/${subdomain}`);
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <EventsList
        events={tenant.events}
        tenantSubdomain={subdomain}
        tenantName={tenant.name}
      />
    </div>
  );
}
