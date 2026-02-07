import type { ReactNode } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { mainUrl } from '@/lib/url'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(mainUrl('/auth/signin'))
  }

  if (user.role !== 'ADMIN') {
    redirect(mainUrl('/'))
  }

  const userName = user.name || user.email
  const userEmail = user.email

  return (
    <div className="dark">
      <div className="flex h-screen overflow-hidden bg-background">
        <AdminSidebar userName={userName} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto p-10">
          {children}
        </main>
      </div>
    </div>
  )
}
