import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stepper, type Step } from '@/components/ui/stepper';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

async function getOrganizerApplication(userId: string, subdomain: string) {
  // Get or create tenant
  let tenant = await prisma.tenant.findUnique({
    where: { subdomain },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        subdomain,
        name: subdomain,
      },
    });
  }

  // Get application
  const application = await prisma.organizerApplication.findUnique({
    where: {
      userId_tenantId: {
        userId,
        tenantId: tenant.id,
      },
    },
  });

  return { application, tenant };
}

function getStepStatus(currentStep: number, stepNumber: number, isSubmitted: boolean): Step['status'] {
  if (isSubmitted) return 'completed';
  if (stepNumber < currentStep) return 'completed';
  if (stepNumber === currentStep) return 'in_progress';
  return 'not_started';
}

export default async function OrganizerDashboardPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const user = await getCurrentUser();
  const { tenant: subdomain } = await params;

  if (!user) {
    redirect(`/auth/signin?callbackUrl=/${subdomain}/organizer/dashboard`);
  }

  const { application, tenant } = await getOrganizerApplication(user.id, subdomain);

  const isSubmitted = application?.status === 'SUBMITTED';
  const isApproved = application?.status === 'APPROVED';
  const isRejected = application?.status === 'REJECTED';
  const isNotStarted = !application || application.status === 'NOT_STARTED';

  const steps: Step[] = [
    {
      id: 1,
      title: 'Organizer Type',
      description: 'Tell us about yourself',
      status: getStepStatus(application?.currentStep || 1, 1, isSubmitted),
    },
    {
      id: 2,
      title: 'Event Portfolio',
      description: 'Your experience',
      status: getStepStatus(application?.currentStep || 1, 2, isSubmitted),
    },
    {
      id: 3,
      title: 'Compliance',
      description: 'Acknowledge requirements',
      status: getStepStatus(application?.currentStep || 1, 3, isSubmitted),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.name || user.email}
          </p>
        </div>

        {/* Status Banner */}
        {isApproved && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">Application Approved!</p>
                <p className="text-sm text-green-700">
                  You can now create and manage events on the platform.
                </p>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="font-medium text-red-800">Application Not Approved</p>
                <p className="text-sm text-red-700">
                  {application?.reviewNotes || 'Please contact support for more information.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {isSubmitted && !isApproved && !isRejected && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-800">Application Under Review</p>
                <p className="text-sm text-blue-700">
                  We're reviewing your organizer application. This typically takes 2-3 business days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Application Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organizer Application</CardTitle>
                <CardDescription>
                  Complete these steps to become an organizer
                </CardDescription>
              </div>
              <Badge
                variant={
                  isApproved
                    ? 'success'
                    : isSubmitted
                      ? 'info'
                      : isRejected
                        ? 'destructive'
                        : 'warning'
                }
              >
                {isApproved
                  ? 'Approved'
                  : isSubmitted
                    ? 'Under Review'
                    : isRejected
                      ? 'Rejected'
                      : isNotStarted
                        ? 'Not Started'
                        : 'In Progress'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isNotStarted ? (
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold mb-2">Ready to become an organizer?</h3>
                <p className="text-gray-600 mb-6">
                  Start your application to create and manage events on {subdomain}
                </p>
                <Link href={`/${subdomain}/organizer/apply`}>
                  <Button size="lg">Start Application</Button>
                </Link>
              </div>
            ) : (
              <>
                <Stepper steps={steps} currentStep={application?.currentStep || 1} />
                
                {!isSubmitted && !isApproved && !isRejected && (
                  <div className="mt-6 flex justify-center">
                    <Link href={`/${subdomain}/organizer/apply?step=${application?.currentStep}`}>
                      <Button>Continue Application</Button>
                    </Link>
                  </div>
                )}

                {isSubmitted && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Application Details</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Submitted:</dt>
                        <dd>{application?.submittedAt?.toLocaleDateString()}</dd>
                      </div>
                      {application?.organizerType && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Organizer Type:</dt>
                          <dd className="capitalize">{application.organizerType.toLowerCase()}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for future modules */}
        {!isApproved && (
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-gray-500">Event Management</CardTitle>
              <CardDescription>
                Available after organizer approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Once your application is approved, you'll be able to create and manage events,
                configure ticketing, and access organizer tools.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
