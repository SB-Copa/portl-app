'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/layout/logout-button'
import { Home, Calendar, Lock, Users, Globe, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TenantMemberRole } from '@/prisma/generated/prisma/client'

type TenantSidebarProps = {
  tenantSubdomain: string
  isApproved: boolean
  memberRole: TenantMemberRole
  userName?: string | null
  userEmail?: string | null
}

export default function TenantSidebar({
  tenantSubdomain,
  isApproved,
  memberRole,
  userName,
  userEmail
}: TenantSidebarProps) {
  const pathname = usePathname()

  const basePath = `/dashboard/${tenantSubdomain}`
  const homePath = basePath
  const eventsPath = `${basePath}/events`
  const teamPath = `${basePath}/team`
  const pageSettingsPath = `${basePath}/page-settings`

  const isHomeActive = pathname === homePath || pathname === basePath
  const isEventsActive = pathname?.startsWith(eventsPath)
  const isTeamActive = pathname?.startsWith(teamPath)
  const isPageSettingsActive = pathname?.startsWith(pageSettingsPath)

  const canSeeTeam = memberRole === 'OWNER' || memberRole === 'ADMIN'
  const canSeePageSettings = memberRole === 'OWNER' || memberRole === 'ADMIN'
  const canSeeEvents = memberRole !== 'MEMBER'

  return (
    <aside className="w-64 border-r bg-background flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/account">
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

        {isApproved && canSeeEvents ? (
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
            title={!isApproved ? "Available after application approval" : "Requires Manager role or above"}
          >
            <Lock className="h-4 w-4" />
            Events
          </div>
        )}

        {isApproved && canSeeTeam && (
          <Link
            href={teamPath}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isTeamActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground text-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            Team
          </Link>
        )}

        {isApproved && canSeePageSettings ? (
          <Link
            href={pageSettingsPath}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isPageSettingsActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground text-foreground"
            )}
          >
            <Globe className="h-4 w-4" />
            Page
          </Link>
        ) : canSeePageSettings ? (
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
              "text-muted-foreground cursor-not-allowed opacity-60"
            )}
            title="Available after application approval"
          >
            <Lock className="h-4 w-4" />
            Page
          </div>
        ) : null}
      </nav>

      {/* Back to Profile */}
      <div className="p-4 border-t">
        <Link
          href="/account"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
      </div>

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
