import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface ApplicationStatsCardsProps {
  applications: Application[];
}

export function ApplicationStatsCards({ applications }: ApplicationStatsCardsProps) {
  const stats = {
    total: applications.length,
    submitted: applications.filter((a) => a.status === 'SUBMITTED').length,
    approved: applications.filter((a) => a.status === 'APPROVED').length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
    inProgress: applications.filter((a) => a.status === 'IN_PROGRESS').length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Applications</CardDescription>
          <CardTitle className="text-3xl">{stats.total}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Submitted</CardDescription>
          <CardTitle className="text-3xl flex items-center gap-2">
            {stats.submitted}
            {stats.submitted > 0 && (
              <Badge className="text-xs">
                Needs Review
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>In Progress</CardDescription>
          <CardTitle className="text-3xl">{stats.inProgress}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Approved</CardDescription>
          <CardTitle className="text-3xl">{stats.approved}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Rejected</CardDescription>
          <CardTitle className="text-3xl">{stats.rejected}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
