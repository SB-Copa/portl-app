import { getAllUsersAction } from '@/app/actions/admin-users'
import { UserStatsCards } from '@/components/admin/user-stats-cards'
import { UsersPageContent } from '@/components/admin/users-page-content'

export default async function UsersPage() {
  const result = await getAllUsersAction()

  if (result.error || !result.data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error Loading 2Users</h1>
          <p className="text-muted-foreground">{result.error || 'Failed to load users'}</p>
        </div>
      </div>
    )
  }

  const users = result.data

  return (
    <div className="container mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-2 text-muted-foreground">Manage all platform users</p>
      </div>

      <UserStatsCards users={users} />

      <UsersPageContent users={users} />
    </div>
  )
}
