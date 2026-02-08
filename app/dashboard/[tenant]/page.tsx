import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stepper, type Step } from '@/components/ui/stepper'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  TrendingUp,
  Plus
} from 'lucide-react'
import Link from 'next/link'

async function getOrganizerApplication(userId: string, subdomain: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: {
      application: true,
      _count: {
        select: { events: true }
      }
    },
  })

  if (!tenant) {
    return { application: null, tenant: null }
  }

  const membership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId, tenantId: tenant.id },
    },
  })

  if (!membership) {
    return { application: null, tenant: null }
  }

  return { application: tenant.application, tenant }
}

async function getRecentEvents(tenantId: string) {
  return await prisma.event.findMany({
    where: { tenantId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  })
}

async function getTenantStats(tenantId: string) {
  const [orderStats, ticketCount] = await Promise.all([
    prisma.order.aggregate({
      where: { tenantId, status: 'CONFIRMED' },
      _sum: { total: true },
      _count: true,
    }),
    prisma.ticket.count({
      where: {
        order: { tenantId, status: 'CONFIRMED' },
        status: 'ACTIVE',
      },
    }),
  ])

  return {
    totalAttendees: ticketCount,
    totalRevenue: orderStats._sum.total || 0,
    totalOrders: orderStats._count,
  }
}

function getStepStatus(currentStep: number, stepNumber: number, isSubmitted: boolean): Step['status'] {
  if (isSubmitted) return 'completed'
  if (stepNumber < currentStep) return 'completed'
  if (stepNumber === currentStep) return 'in_progress'
  return 'not_started'
}

export default async function TenantDashboardPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const user = await getCurrentUser()
  const { tenant: subdomain } = await params

  if (!user) {
    redirect(`/auth/signin?callbackUrl=/dashboard/${subdomain}`)
  }

  const { application, tenant } = await getOrganizerApplication(user.id, subdomain)

  if (!tenant) {
    redirect('/account')
  }

  const isSubmitted = application?.status === 'SUBMITTED'
  const isApproved = application?.status === 'APPROVED'
  const isRejected = application?.status === 'REJECTED'
  const isNotStarted = !application || application.status === 'NOT_STARTED'

  const [recentEvents, stats] = isApproved
    ? await Promise.all([getRecentEvents(tenant.id), getTenantStats(tenant.id)])
    : [[], { totalAttendees: 0, totalRevenue: 0, totalOrders: 0 }]

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
  ]

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name || 'Organizer'}. Here&apos;s what&apos;s happening with {tenant.name}.
          </p>
        </div>
        {isApproved && (
          <Button asChild>
            <Link href={`/dashboard/${subdomain}/events/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant._count?.events || 0}</div>
            <p className="text-xs text-muted-foreground">+0 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttendees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.totalOrders} confirmed order{stats.totalOrders !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(stats.totalRevenue / 100)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Status</CardTitle>
            {isApproved ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Clock className="h-4 w-4 text-amber-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {isApproved ? 'Active' : 'Pending'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isApproved ? 'Account fully verified' : 'Complete verification'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4 space-y-6">
          {!isApproved ? (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Complete Your Registration</CardTitle>
                    <CardDescription>
                      Finish setting up your organizer profile to start hosting events.
                    </CardDescription>
                  </div>
                  <Badge variant={isSubmitted ? "secondary" : "default"}>
                    {isSubmitted ? 'Under Review' : 'In Progress'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Stepper steps={steps} currentStep={application?.currentStep || 1} />

                {!isSubmitted && !isRejected && (
                  <div className="mt-6 flex justify-end">
                    <Button asChild>
                      <Link href={`/dashboard/${subdomain}/apply?step=${application?.currentStep}`}>
                        {isNotStarted ? 'Start Application' : 'Continue Application'}
                      </Link>
                    </Button>
                  </div>
                )}

                {isSubmitted && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    We are reviewing your application. You will be notified via email once approved.
                  </div>
                )}

                {isRejected && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 rounded-lg flex items-start gap-3 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="font-medium">Application Rejected</p>
                      <p>{application?.reviewNotes || 'Please contact support.'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>
                  Your most recent events and their status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentEvents.length > 0 ? (
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={`/dashboard/${subdomain}/events/${event.id}`}
                        className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{event.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No events found.</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href={`/dashboard/${subdomain}/events/new`}>Create your first event</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-4 lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Latest updates for your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isApproved ? (
                <div className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50">
                  <div className="mt-1 bg-green-100 dark:bg-green-900 p-1 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Account Approved</p>
                    <p className="text-xs text-muted-foreground">
                      Your organizer account has been fully approved.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50">
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Setup Required</p>
                    <p className="text-xs text-muted-foreground">
                      Please complete the application steps to start.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
