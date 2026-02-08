'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/layout/logout-button'
import { LayoutDashboard, FileText, Users, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type AdminSidebarProps = {
  userName?: string | null
  userEmail?: string | null
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/applications', label: 'Applications', icon: FileText },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/tenants', label: 'Tenants', icon: Building2 },
]

export function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-background flex flex-col h-screen shrink-0">
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

      {/* Admin Context */}
      <div className="p-4 border-b">
        <p className="text-sm font-semibold text-foreground">Admin Panel</p>
        <p className="text-xs text-muted-foreground">Platform Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
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
