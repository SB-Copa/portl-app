import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserRow } from './users-table-columns'

interface UserStatsCardsProps {
  users: UserRow[]
}

export function UserStatsCards({ users }: UserStatsCardsProps) {
  const total = users.length
  const userCount = users.filter((u) => u.role === 'USER').length
  const adminCount = users.filter((u) => u.role === 'ADMIN').length

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-3xl">{total}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Users</CardDescription>
          <CardTitle className="text-3xl">{userCount}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Admins</CardDescription>
          <CardTitle className="text-3xl">{adminCount}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
