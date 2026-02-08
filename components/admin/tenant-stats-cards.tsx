import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { TenantRow } from './tenants-table-columns'

interface TenantStatsCardsProps {
  tenants: TenantRow[]
}

export function TenantStatsCards({ tenants }: TenantStatsCardsProps) {
  const total = tenants.length
  const active = tenants.filter((t) => t.status === 'ACTIVE').length
  const inactive = tenants.filter((t) => t.status === 'INACTIVE').length
  const suspended = tenants.filter((t) => t.status === 'SUSPENDED').length

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Tenants</CardDescription>
          <CardTitle className="text-3xl">{total}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Active</CardDescription>
          <CardTitle className="text-3xl">{active}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Inactive</CardDescription>
          <CardTitle className="text-3xl">{inactive}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Suspended</CardDescription>
          <CardTitle className="text-3xl">{suspended}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
