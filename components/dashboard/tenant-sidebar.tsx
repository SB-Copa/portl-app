'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/layout/logout-button'
import { Home, Calendar, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

type TenantSidebarProps = {
  tenantSubdomain: string
  isApproved: boolean
  userName?: string | null
  userEmail?: string | null
}

export default function TenantSidebar({
  tenantSubdomain,
  isApproved,
  userName,
  userEmail
}: TenantSidebarProps) {
  const pathname = usePathname()

  const basePath = `/dashboard/${tenantSubdomain}`
  const homePath = basePath
  const eventsPath = `${basePath}/events`

  const isHomeActive = pathname === homePath || pathname === basePath
  const isEventsActive = pathname?.startsWith(eventsPath)

  return (
    <aside className="w-64 border-r bg-background flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard">
          <Image
            src="/images/logo/portl-logo-white.svg"
            alt="Portl Logo"
            width={80}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Tenant Context */}
      <div className="p-4 border-b">
        <p className="text-sm font-semibold text-foreground truncate">
          {tenantSubdomain}
        </p>
        <p className="text-xs text-muted-foreground">
          {tenantSubdomain}.localhost
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <Link
          href={homePath}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isHomeActive
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground text-foreground"
          )}
        >
          <Home className="h-4 w-4" />
          Home
        </Link>

        {isApproved ? (
          <Link
            href={eventsPath}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isEventsActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground text-foreground"
            )}
          >
            <Calendar className="h-4 w-4" />
            Events
          </Link>
        ) : (
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
              "text-muted-foreground cursor-not-allowed opacity-60"
            )}
            title="Available after application approval"
          >
            <Lock className="h-4 w-4" />
            Events
          </div>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t">
        {(userName || userEmail) && (
          <div className="mb-3">
            <p className="text-sm font-medium text-foreground">
              {userName || userEmail}
            </p>
            {userEmail && userName && (
              <p className="text-xs text-muted-foreground truncate">
                {userEmail}
              </p>
            )}
          </div>
        )}
        <LogoutButton />
      </div>
    </aside>
  )
}
