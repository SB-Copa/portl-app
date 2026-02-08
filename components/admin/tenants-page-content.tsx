'use client'

import { useRouter } from 'next/navigation'
import { columns, type TenantRow } from '@/components/admin/tenants-table-columns'
import { TenantsDataTable } from '@/components/admin/tenants-data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateTenantStatusAction } from '@/app/actions/admin-tenants'
import { toast } from 'sonner'

interface TenantsPageContentProps {
  tenants: TenantRow[]
}

export function TenantsPageContent({ tenants }: TenantsPageContentProps) {
  const router = useRouter()

  const handleStatusChange = async (tenantId: string, status: 'INACTIVE' | 'ACTIVE' | 'SUSPENDED') => {
    const result = await updateTenantStatusAction(tenantId, status)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Tenant status updated to ${status}`)
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tenants</CardTitle>
        <CardDescription>
          View and manage platform tenants. Click on a tenant to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TenantsDataTable
          columns={columns}
          data={tenants}
          meta={{ onStatusChange: handleStatusChange }}
        />
      </CardContent>
    </Card>
  )
}
