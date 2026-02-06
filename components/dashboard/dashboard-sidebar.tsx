import Link from 'next/link'
import Image from 'next/image'
import { LogoutButton } from '@/components/layout/logout-button'
import { Home } from 'lucide-react'

type DashboardSidebarProps = {
  userName?: string | null
  userEmail?: string | null
}

export default function DashboardSidebar({
  userName,
  userEmail
}: DashboardSidebarProps) {
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-foreground"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
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
