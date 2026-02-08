import { getApplicationByIdAction } from '@/app/actions/admin';
import { redirect } from 'next/navigation';
import { ApplicationDetailView } from '@/components/admin/application-detail-view';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusColors = {
  NOT_STARTED: '',
  IN_PROGRESS: '',
  SUBMITTED: '',
  APPROVED: '',
  REJECTED: '',
};

const statusLabels = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  const result = await getApplicationByIdAction(id);

  if (result.error) {
    console.error('Error loading application:', result.error, 'ID:', id);
    // Redirect on error (could be unauthorized, not found, or server error)
    redirect('/applications');
  }

  const application = result.data;

  if (!application) {
    console.error('Application not found for ID:', id);
    redirect('/applications');
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-4">
            <Link href="/applications">
              <Button variant="ghost" size="icon" className="mt-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">
                    {application.tenant.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm font-mono">
                      {application.tenant.subdomain}.portl.com
                    </p>
                    <Badge
                      className={`${
                        statusColors[application.status as keyof typeof statusColors]
                      } border`}
                    >
                      {statusLabels[application.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="max-w-2xl">
                Review and manage this organizer application. You can approve, reject, or
                request changes to the application.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/applications">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Applications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApplicationDetailView application={application} />
      </div>
    </div>
  );
}
