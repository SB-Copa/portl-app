'use client'

import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { User, Ticket, Settings, Building2, Plus, LogOut, ChevronDown } from 'lucide-react'
import { signOut } from 'next-auth/react'

type UserMenuProps = {
  userName: string | null
  userEmail: string | null
  hasTenants: boolean
}

export function UserMenu({ userName, userEmail, hasTenants }: UserMenuProps) {
  const displayName = userName || userEmail || 'Account'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="hidden md:inline max-w-[120px] truncate">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {userName && <p className="text-sm font-medium leading-none">{userName}</p>}
            {userEmail && (
              <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/tickets" className="cursor-pointer">
            <Ticket className="mr-2 h-4 w-4" />
            My Tickets
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {hasTenants ? (
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer">
              <Building2 className="mr-2 h-4 w-4" />
              Organizer Dashboard
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/organizer/register" className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Become an Organizer
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
