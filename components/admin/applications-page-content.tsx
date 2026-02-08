'use client';

import { useRouter } from 'next/navigation';
import { columns } from '@/components/admin/applications-table-columns';
import { ApplicationsDataTable } from '@/components/admin/applications-data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { approveApplicationAction, rejectApplicationAction } from '@/app/actions/admin';
import { toast } from 'sonner';
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

interface ApplicationsPageContentProps {
  applications: Application[];
}

export function ApplicationsPageContent({ applications }: ApplicationsPageContentProps) {
  const router = useRouter();

  const handleApprove = async (application: Application) => {
    const result = await approveApplicationAction(application.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Application approved successfully');
      router.refresh();
    }
  };

  const handleReject = async (application: Application) => {
    const result = await rejectApplicationAction(application.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.error('Application rejected');
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Applications</CardTitle>
        <CardDescription>
          View and manage organizer applications. Click on an application to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ApplicationsDataTable
          columns={columns}
          data={applications}
          meta={{
            onApprove: handleApprove,
            onReject: handleReject,
          }}
        />
      </CardContent>
    </Card>
  );
}
