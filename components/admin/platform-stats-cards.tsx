import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, FileText, Calendar, ShoppingCart } from 'lucide-react'

interface PlatformStats {
  users: { total: number; byRole: Record<string, number> }
  tenants: { total: number; byStatus: Record<string, number> }
  applications: { total: number; byStatus: Record<string, number> }
  events: { total: number; byStatus: Record<string, number> }
  orders: { total: number }
}

interface PlatformStatsCardsProps {
  stats: PlatformStats
}

export function PlatformStatsCards({ stats }: PlatformStatsCardsProps) {
  const submittedApps = stats.applications.byStatus['SUBMITTED'] || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription>Users</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">{stats.users.total}</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {stats.users.byRole['USER'] || 0} users
            </span>
            <span className="text-xs text-muted-foreground">
              {stats.users.byRole['ADMIN'] || 0} admins
            </span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription>Tenants</CardDescription>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">{stats.tenants.total}</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {stats.tenants.byStatus['ACTIVE'] || 0} active
            </span>
            <span className="text-xs text-muted-foreground">
              {stats.tenants.byStatus['INACTIVE'] || 0} inactive
            </span>
            {(stats.tenants.byStatus['SUSPENDED'] || 0) > 0 && (
              <span className="text-xs text-red-500">
                {stats.tenants.byStatus['SUSPENDED']} suspended
              </span>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription>Applications</CardDescription>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl flex items-center gap-2">
            {stats.applications.total}
            {submittedApps > 0 && (
              <Badge className="text-xs">
                {submittedApps} Needs Review
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {stats.applications.byStatus['APPROVED'] || 0} approved
            </span>
            <span className="text-xs text-muted-foreground">
              {stats.applications.byStatus['REJECTED'] || 0} rejected
            </span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription>Events</CardDescription>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">{stats.events.total}</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {stats.events.byStatus['PUBLISHED'] || 0} published
            </span>
            <span className="text-xs text-muted-foreground">
              {stats.events.byStatus['DRAFT'] || 0} drafts
            </span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription>Orders</CardDescription>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">{stats.orders.total}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
