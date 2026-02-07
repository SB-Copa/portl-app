import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AccountSidebar from '@/components/account/account-sidebar'

async function getUserOrganizations(userId: string) {
    return await prisma.tenantMember.findMany({
        where: { userId },
        select: {
            id: true,
            role: true,
            tenant: { select: { name: true, subdomain: true } },
        },
        orderBy: { createdAt: 'asc' },
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

    const organizations = await getUserOrganizations(user.id)

    return (
        <div className="flex h-screen overflow-hidden">
            <AccountSidebar
                organizations={organizations}
                userName={user.name}
                userEmail={user.email}
            />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
