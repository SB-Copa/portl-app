import { getTenantByIdAction } from '@/app/actions/admin-tenants'
import { redirect } from 'next/navigation'
import { TenantDetailView } from '@/components/admin/tenant-detail-view'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'

interface TenantDetailPageProps {
  params: Promise<{ id: string }>
}

const statusColors: Record<string, string> = {
  INACTIVE: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
}

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  const { id } = await params
  const result = await getTenantByIdAction(id)

  if (result.error || !result.data) {
    redirect('/tenants')
  }

  const tenant = result.data

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/tenants">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Building2 className="h-8 w-8" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{tenant.name}</h1>
                <Badge className={statusColors[tenant.status] || ''}>
                  {tenant.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono">{tenant.subdomain}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TenantDetailView tenant={tenant} />
      </div>
    </div>
  )
}
