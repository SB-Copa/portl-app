import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardApplicationWizard } from '@/components/organizer/dashboard-application-wizard'

async function getApplication(userId: string, subdomain: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: {
      application: true,
    },
  })

  if (!tenant || tenant.ownerId !== userId) {
    return null
  }

  return { tenant, application: tenant.application }
}

export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ step?: string }>
}) {
  const user = await getCurrentUser()
  const { tenant: subdomain } = await params
  const { step } = await searchParams

  if (!user) {
    redirect(`/auth/signin?callbackUrl=/dashboard/${subdomain}/apply`)
  }

  const data = await getApplication(user.id, subdomain)

  if (!data) {
    redirect('/dashboard')
  }

  const { tenant, application } = data

  // If already approved or submitted, redirect to dashboard
  if (application?.status === 'APPROVED' || application?.status === 'SUBMITTED') {
    redirect(`/dashboard/${subdomain}`)
  }

  const initialStep = step ? parseInt(step) : application?.currentStep || 1

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Organizer Application</h1>
        <p className="text-muted-foreground mt-1">
          Complete your application to become an approved event organizer for {tenant.name}.
        </p>
      </div>

      <DashboardApplicationWizard
        tenantId={tenant.id}
        tenant={subdomain}
        initialStep={initialStep}
        initialApplication={application}
      />
    </div>
  )
}
