import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const pathname = request.nextUrl.pathname

    // /admin route → redirect to admin. subdomain
    if (pathname.startsWith('/admin') && !host.startsWith('admin.')) {
        const adminUrl = new URL(request.url)
        adminUrl.host = `admin.${host}`
        // Remove /admin prefix from pathname
        adminUrl.pathname = pathname.replace(/^\/admin/, '') || '/'
        return NextResponse.redirect(adminUrl)
    }
    
    // admin.domain.com → rewrite to /admin routes
    if (host.startsWith('admin.')) {
        return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url))
    }

    // Multi-tenant routing: /[tenant]/... → tenant.localhost:3000/...
    // Extract tenant name from pathname (first segment after /)
    const tenantMatch = pathname.match(/^\/([^\/]+)/)
    if (tenantMatch && tenantMatch[1]) {
        const potentialTenant = tenantMatch[1]
        // Skip reserved paths (admin is already handled above)
        const reservedPaths = ['_next', 'api', 'admin']
        
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
        return NextResponse.rewrite(new URL(`/${subdomain}${pathname}`, request.url))
    }

    // domain.com/ → landing page (no rewrite needed, just serve /)
    // domain.com/slug → your app routes

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}