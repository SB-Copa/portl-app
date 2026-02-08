import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/account')
  }

  // Just provide auth protection - sidebars are handled by child layouts/pages
  return <>{children}</>
}
