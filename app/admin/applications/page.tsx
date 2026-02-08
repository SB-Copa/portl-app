import { getAllApplicationsAction } from '@/app/actions/admin';
import { ApplicationStatsCards } from '@/components/admin/application-stats-cards';
import { ApplicationsPageContent } from '@/components/admin/applications-page-content';
import { OrganizerApplication, Prisma } from '@/prisma/generated/prisma/client';

type Application = OrganizerApplication & Prisma.OrganizerApplicationGetPayload<{
  include: {
    tenant: {
      include: {
        owner: {
          select: {
            id: true;
            email: true;
            firstName: true;
            lastName: true;
          };
        };
      };
    };
  };
}>;

export default async function ApplicationsPage() {
  const result = await getAllApplicationsAction();
  
  if (result.error || !result.data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error Loading Applications</h1>
          <p className="text-gray-600">{result.error || 'Failed to load applications'}</p>
        </div>
      </div>
    );
  }

  const applications = result.data as Application[];

  return (
    <div className="container mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Organizer Applications</h1>
        <p className="mt-2">
          Review and manage all organizer applications
        </p>
      </div>

      <ApplicationStatsCards applications={applications} />

      <ApplicationsPageContent applications={applications} />
    </div>
  );
}
