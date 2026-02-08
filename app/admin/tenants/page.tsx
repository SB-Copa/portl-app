import { getAllTenantsAction } from '@/app/actions/admin-tenants'
import { TenantStatsCards } from '@/components/admin/tenant-stats-cards'
import { TenantsPageContent } from '@/components/admin/tenants-page-content'

export default async function TenantsPage() {
  const result = await getAllTenantsAction()

  if (result.error || !result.data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error Loading Tenants</h1>
          <p className="text-muted-foreground">{result.error || 'Failed to load tenants'}</p>
        </div>
      </div>
    )
  }

  const tenants = result.data

  return (
    <div className="container mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tenants</h1>
        <p className="mt-2 text-muted-foreground">Manage all platform tenants</p>
      </div>

      <TenantStatsCards tenants={tenants} />

      <TenantsPageContent tenants={tenants} />
    </div>
  )
}
