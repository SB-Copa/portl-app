import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TenantSidebar from '@/components/dashboard/tenant-sidebar'

async function getTenantInfo(userId: string, subdomain: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: { application: true },
  })

  if (!tenant || tenant.ownerId !== userId) {
    return null
  }

  return tenant
}

export default async function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const user = await getCurrentUser()
  const { tenant: subdomain } = await params

  if (!user) {
    redirect(`/auth/signin?callbackUrl=/dashboard/${subdomain}`)
  }

  const tenant = await getTenantInfo(user.id, subdomain)

  if (!tenant) {
    redirect('/dashboard')
  }

  const isApproved = tenant.application?.status === 'APPROVED'

  return (
    <div className="flex h-screen overflow-hidden">
      <TenantSidebar
        tenantSubdomain={subdomain}
        isApproved={isApproved}
        userName={user.name}
        userEmail={user.email}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
