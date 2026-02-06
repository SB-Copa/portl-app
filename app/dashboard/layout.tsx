import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar
        userName={user.name}
        userEmail={user.email}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
