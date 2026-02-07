import Link from 'next/link'
import Image from 'next/image'
import { HeaderActions } from './header-actions'
import { mainUrl } from '@/lib/url'

type TenantNavbarProps = {
    tenantSubdomain: string
    tenantName?: string
    tenantLogoUrl?: string
}

export async function TenantNavbar({
    tenantSubdomain,
    tenantName,
    tenantLogoUrl,
}: TenantNavbarProps) {
    return (
        <nav className="bg-background/95 backdrop-blur-sm fixed top-0 w-full px-6 md:px-12 py-3 flex items-center justify-between border-b border-border z-50">
            {/* Logo */}
            <div className="flex items-center">
                <Link href="/">
                    {tenantLogoUrl ? (
                        <img
                            src={tenantLogoUrl}
                            alt={tenantName || tenantSubdomain}
                            className="h-8 w-auto max-w-[120px] object-contain"
                        />
                    ) : (
                        <Image
                            src="/images/logo/portl-logo-white.svg"
                            alt="Portl Logo"
                            width={80}
                            height={32}
                            className="h-8 w-auto"
                        />
                    )}
                </Link>
            </div>

            {/* Tenant Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-sm">
                <Link
                    href="/"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Home
                </Link>
                <Link
                    href="/events"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Events
                </Link>
            </div>

            {/* Action Buttons */}
            <HeaderActions mainDomainPrefix={mainUrl('')} />
        </nav>
    )
}
