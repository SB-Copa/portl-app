import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle2, Clock, AlertCircle, Plus, Building2, ArrowRight } from 'lucide-react'

async function getUserTenants(userId: string) {
  const tenants = await prisma.tenant.findMany({
    where: { ownerId: userId },
    include: {
      application: true,
      _count: {
        select: { events: true }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return tenants
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Not authenticated</h1>
          <p className="mt-2 text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    )
  }

  const tenants = await getUserTenants(user.id)

  // Auto-redirect to single tenant dashboard
  if (tenants.length === 1) {
    redirect(`/dashboard/${tenants[0].subdomain}`)
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Businesses</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name || user.email}. Select a business to manage.
          </p>
        </div>
        <Button asChild>
          <Link href="/organizer/register">
            <Plus className="mr-2 h-4 w-4" />
            Register New Business
          </Link>
        </Button>
      </div>

      {tenants.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No businesses yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              You haven&apos;t registered any businesses. Create one to start hosting events.
            </p>
            <Button asChild>
              <Link href="/organizer/register">
                <Plus className="mr-2 h-4 w-4" />
                Register Your First Business
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => {
            const application = tenant.application
            const isApproved = application?.status === 'APPROVED'
            const isSubmitted = application?.status === 'SUBMITTED'
            const isRejected = application?.status === 'REJECTED'

            return (
              <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {tenant.name}
                      </CardTitle>
                      <CardDescription>
                        {tenant.subdomain}.localhost
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        isApproved
                          ? 'default'
                          : isSubmitted
                            ? 'secondary'
                            : isRejected
                              ? 'destructive'
                              : 'outline'
                      }
                    >
                      {isApproved
                        ? 'Active'
                        : isSubmitted
                          ? 'Pending'
                          : isRejected
                            ? 'Rejected'
                            : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 py-2">
                     <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Events</p>
                        <p className="text-2xl font-bold">{tenant._count?.events || 0}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                        <div className="flex items-center gap-1.5 font-medium text-sm">
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Verified</span>
                            </>
                          ) : isSubmitted ? (
                            <>
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span>Reviewing</span>
                            </>
                          ) : isRejected ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span>Action Needed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Incomplete</span>
                            </>
                          )}
                        </div>
                     </div>
                  </div>

                  {isRejected && application?.reviewNotes && (
                    <div className="mt-4 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 text-xs p-3 rounded-md border border-red-100 dark:border-red-900">
                      {application.reviewNotes}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild variant={isApproved ? "default" : "outline"}>
                    <Link href={`/dashboard/${tenant.subdomain}`}>
                      {isApproved ? 'Manage Dashboard' : 'Continue Setup'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
