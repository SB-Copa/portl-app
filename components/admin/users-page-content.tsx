'use client'

import { useRouter } from 'next/navigation'
import { columns, type UserRow } from '@/components/admin/users-table-columns'
import { UsersDataTable } from '@/components/admin/users-data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateUserRoleAction } from '@/app/actions/admin-users'
import { toast } from 'sonner'

interface UsersPageContentProps {
  users: UserRow[]
}

export function UsersPageContent({ users }: UsersPageContentProps) {
  const router = useRouter()

  const handleRoleChange = async (userId: string, role: 'USER' | 'ADMIN') => {
    const result = await updateUserRoleAction(userId, role)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`User role updated to ${role}`)
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          View and manage platform users. Click on a user to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UsersDataTable
          columns={columns}
          data={users}
          meta={{ onRoleChange: handleRoleChange }}
        />
      </CardContent>
    </Card>
  )
}
