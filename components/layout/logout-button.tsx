'use client'

import { Button } from '@/components/ui/button'
import { signOutAction } from '@/app/actions/auth'

export function LogoutButton() {
  async function handleLogout() {
    await signOutAction()
  }

  return (
    <form action={handleLogout}>
      <Button type="submit" variant="ghost" size="sm">
        Logout
      </Button>
    </form>
  )
}
