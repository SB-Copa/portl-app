import { getPlatformStatsAction } from '@/app/actions/admin'
import { PlatformStatsCards } from '@/components/admin/platform-stats-cards'
import { RecentActivity } from '@/components/admin/recent-activity'

export default async function AdminPage() {
  const result = await getPlatformStatsAction()

  if (result.error || !result.data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground">{result.error || 'Failed to load dashboard'}</p>
        </div>
      </div>
    )
  }

  const { data } = result

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Platform overview and management</p>
      </div>

      <PlatformStatsCards stats={data} />

      <RecentActivity
        recentUsers={data.recentUsers}
        recentTenants={data.recentTenants}
        recentApplications={data.recentApplications}
      />
    </div>
  )
}
