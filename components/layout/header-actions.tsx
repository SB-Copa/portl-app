import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserMenu } from './user-menu'
import { CartButton } from '@/components/cart'

async function getUserTenantCount(userId: string): Promise<number> {
    return await prisma.tenant.count({
        where: { ownerId: userId },
    })
}

export async function HeaderActions() {
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
                />
            ) : (
                <>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/auth/signup">Get Started</Link>
                    </Button>
                </>
            )}
        </div>
    )
}
