import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AccountSidebar from '@/components/account/account-sidebar'

async function getUserTenantCount(userId: string): Promise<number> {
    return await prisma.tenant.count({
        where: { ownerId: userId },
    })
}

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/auth/signin?callbackUrl=/account')
    }

    const tenantCount = await getUserTenantCount(user.id)
    const hasTenants = tenantCount > 0

    return (
        <div className="dark">
            <div className="flex h-screen overflow-hidden">
                <AccountSidebar
                    hasTenants={hasTenants}
                    userName={user.name}
                    userEmail={user.email}
                />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
