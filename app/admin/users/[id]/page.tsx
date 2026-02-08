import { getUserByIdAction } from '@/app/actions/admin-users'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { UserDetailView } from '@/components/admin/user-detail-view'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/signin')
  }

  const result = await getUserByIdAction(id)

  if (result.error || !result.data) {
    redirect('/users')
  }

  const user = result.data

  const userName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.email

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/users">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{userName}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserDetailView user={user} currentUserId={currentUser.id} />
      </div>
    </div>
  )
}
