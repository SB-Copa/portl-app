import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserMenu } from './user-menu'
import { CartButton } from '@/components/cart'

async function getUserTenantCount(userId: string): Promise<number> {
    return await prisma.tenantMember.count({
        where: { userId },
    })
}

interface HeaderActionsProps {
    /** When rendered on a tenant subdomain, set to the main domain URL (e.g. "http://lvh.me:3000") so auth/account/dashboard links navigate cross-domain. Empty string for main domain. */
    mainDomainPrefix?: string
}

export async function HeaderActions({ mainDomainPrefix = '' }: HeaderActionsProps) {
    const session = await getSession()
    const user = session?.user ? await getCurrentUser() : null
    const isAuthenticated = !!user
    const userName = user?.name || null
    const userEmail = user?.email || null
    const hasTenants = user ? (await getUserTenantCount(user.id)) > 0 : false

    return (
        <div className="flex items-center gap-3">
            <CartButton />
            {isAuthenticated ? (
                <UserMenu
                    userName={userName}
                    userEmail={userEmail}
                    hasTenants={hasTenants}
                    mainDomainPrefix={mainDomainPrefix}
                />
            ) : (
                <>
                    <Button variant="ghost" size="sm" asChild>
                        {mainDomainPrefix ? (
                            <a href={`${mainDomainPrefix}/auth/signin`}>Sign In</a>
                        ) : (
                            <Link href="/auth/signin">Sign In</Link>
                        )}
                    </Button>
                    <Button size="sm" asChild>
                        {mainDomainPrefix ? (
                            <a href={`${mainDomainPrefix}/auth/signup`}>Get Started</a>
                        ) : (
                            <Link href="/auth/signup">Get Started</Link>
                        )}
                    </Button>
                </>
            )}
        </div>
    )
}
