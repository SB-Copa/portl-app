import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js 15 Proxy Function (replaces middleware)
 * 
 * NOTE: This runs in Edge Runtime which doesn't support:
 * - Prisma (use Node.js runtime in pages/API routes instead)
 * - Full Node.js APIs
 * 
 * Authentication checks should be done at the page/layout level using Server Components
 * where you have access to Prisma and full Node.js runtime.
 */
export function proxy(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const pathname = request.nextUrl.pathname

    // Skip static files and API routes early
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
        return NextResponse.next()
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

    // Multi-tenant routing: /[tenant]/... → tenant.localhost:3000/...
    // Extract tenant name from pathname (first segment after /)
    const tenantMatch = pathname.match(/^\/([^\/]+)/)
    if (tenantMatch && tenantMatch[1]) {
        const potentialTenant = tenantMatch[1]
        // Skip reserved paths (admin is already handled above)
        const reservedPaths = ['_next', 'api', 'admin', 'auth']
        
        if (!reservedPaths.includes(potentialTenant) && !host.includes('.')) {
            // We're on root domain with a tenant path → redirect to tenant subdomain
            const tenantUrl = new URL(request.url)
            tenantUrl.host = `${potentialTenant}.${host}`
            // Remove the /[tenant] prefix from pathname
            tenantUrl.pathname = pathname.replace(/^\/[^\/]+/, '') || '/'
            return NextResponse.redirect(tenantUrl)
        }
    }

    // *.domain.com (wildcard subdomains) → rewrite to /[tenant] routes
    // Check if it's a subdomain (not www, not admin, not bare domain)
    const hostname = host.split(':')[0] // Remove port
    const subdomain = hostname.split('.')[0]
    
    // Check if we have a subdomain (e.g., tenant.localhost or tenant.example.com)
    const isSubdomain = hostname.includes('.') && 
                        subdomain && 
                        subdomain !== 'www' && 
                        subdomain !== 'admin' &&
                        (hostname.includes('.localhost') || hostname.split('.').length > 2)
    
    if (isSubdomain) {
        // Rewrite to /[tenant] dynamic route
        // Tenant validation happens in the [tenant] layout.tsx
        return NextResponse.rewrite(new URL(`/${subdomain}${pathname}`, request.url))
    }

    // domain.com/ → landing page (no rewrite needed, just serve /)
    // domain.com/slug → your app routes

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}