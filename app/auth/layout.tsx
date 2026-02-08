import { Suspense } from 'react'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark">
      <div className="min-h-screen bg-background">
        <Suspense>{children}</Suspense>
      </div>
    </div>
  )
}
