import { Suspense } from 'react'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Sign In | Portl',
  description: 'Sign in to your Portl account',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark">
      <div className="min-h-screen bg-background">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen" />}>
          {children}
        </Suspense>
      </div>
    </div>
  )
}
