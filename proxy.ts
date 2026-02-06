import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

/**
 * Next.js 15 Proxy Function (replaces middleware)
 *
 * Simplified routing:
 * - Admin subdomain (admin.domain.com) → rewrites to /admin routes
 * - All other routes use path-based routing (no subdomain rewrites)
 * - Tenant pages use /t/[tenant]/ path pattern
 *
 * NOTE: This runs in Edge Runtime which doesn't support:
 * - Prisma (use Node.js runtime in pages/API routes instead)
 * - Full Node.js APIs
 */
export async function proxy(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const pathname = request.nextUrl.pathname

    // Skip static files and API routes early
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
        return NextResponse.next()
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth/')) {
        try {
            const session = await auth()
            if (session?.user) {
                // Authenticated user trying to access auth pages → redirect to dashboard
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        } catch {
            // If auth() fails in Edge Runtime, check for auth cookie directly
            // NextAuth JWT strategy uses 'authjs.session-token' cookie
            const sessionCookie = request.cookies.get('authjs.session-token') ||
                                 request.cookies.get('__Secure-authjs.session-token') ||
                                 request.cookies.get('next-auth.session-token') ||
                                 request.cookies.get('__Secure-next-auth.session-token')
            if (sessionCookie) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        }
    }

    // /admin route → redirect to admin. subdomain
    if (pathname.startsWith('/admin') && !host.startsWith('admin.')) {
        const adminUrl = new URL(request.url)
        adminUrl.host = `admin.${host}`
        // Remove /admin prefix from pathname
        adminUrl.pathname = pathname.replace(/^\/admin/, '') || '/'
        return NextResponse.redirect(adminUrl)
    }

    // admin.domain.com → rewrite to /admin routes
    // Note: Authentication is handled in the /admin layout.tsx or page.tsx
    if (host.startsWith('admin.')) {
        return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url))
    }

    // All other routes: normal path-based routing
    // - /t/[tenant]/* → public tenant pages
    // - /dashboard/* → organizer dashboard
    // - /account/* → user account
    // - /auth/* → auth pages
    // No rewrites needed - Next.js handles these directly

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
