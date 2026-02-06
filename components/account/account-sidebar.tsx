'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/layout/logout-button'
import { Home, Ticket, Receipt, Settings, Building2, Plus, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

type AccountSidebarProps = {
  hasTenants: boolean
  userName?: string | null
  userEmail?: string | null
}

export default function AccountSidebar({
  hasTenants,
  userName,
  userEmail
}: AccountSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/account', label: 'Overview', icon: Home },
    { href: '/account/tickets', label: 'My Tickets', icon: Ticket },
    { href: '/account/orders', label: 'Order History', icon: Receipt },
    { href: '/account/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-64 border-r bg-background flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/">
          <Image
            src="/images/logo/portl-logo-white.svg"
            alt="Portl Logo"
            width={80}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/account' && pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        <Separator className="my-4" />

        {/* Organizer Section */}
        {hasTenants ? (
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground text-foreground"
            )}
          >
            <Building2 className="h-4 w-4" />
            Organizer Dashboard
          </Link>
        ) : (
          <Link
            href="/organizer/register"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground text-foreground"
            )}
          >
            <Plus className="h-4 w-4" />
            Become an Organizer
          </Link>
        )}
      </nav>

      {/* Back to Home */}
      <div className="p-4 border-t">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
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
