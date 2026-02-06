import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getCurrentTenant } from '@/lib/tenant'
import { TenantNavbar } from '@/components/layout/tenant-navbar'

type TenantWithNavbarLayoutProps = {
    children: ReactNode
    params: Promise<{ tenant: string }>
}

export default async function TenantWithNavbarLayout({
    children,
    params,
}: TenantWithNavbarLayoutProps) {
    const { tenant: subdomain } = await params
    const tenant = await getCurrentTenant(subdomain)

    if (!tenant) {
        notFound()
    }

    return (
        <div className="dark">
            <TenantNavbar
                tenantSubdomain={subdomain}
                tenantName={tenant.name}
            />
            <main className="pt-16">
                {children}
            </main>
        </div>
    )
}
