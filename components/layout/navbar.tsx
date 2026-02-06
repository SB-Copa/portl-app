import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserMenu } from './user-menu'

async function getUserTenantCount(userId: string): Promise<number> {
    return await prisma.tenant.count({
        where: { ownerId: userId },
    })
}

export default async function Navbar() {
    const session = await getSession()
    const user = session?.user ? await getCurrentUser() : null
    const isAuthenticated = !!user
    const userName = user?.name || null
    const userEmail = user?.email || null
    const hasTenants = user ? (await getUserTenantCount(user.id)) > 0 : false

    return (
        <nav className="bg-background/95 backdrop-blur-sm fixed top-0 w-full px-6 md:px-12 py-3 flex items-center justify-between border-b border-border z-50">
            {/* Logo */}
            <div className="flex items-center">
                <Link href="/">
                    <Image src="/images/logo/portl-logo-white.svg" alt="Portl Logo" width={80} height={32} className="h-8 w-auto" />
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-sm">
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                </Link>
                <Link href="#events-section" className="text-muted-foreground hover:text-foreground transition-colors">
                    Events
                </Link>
                <Link href="#about-us" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                </Link>
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                </Link>
                <Link href="#contact-us" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
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
        </nav>
    )
}
