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

    // *.domain.com (wildcard subdomains) → your app
    // Check if it's a subdomain (not www, not admin, not bare domain)
    const subdomain = host.split('.')[0]
    if (subdomain && subdomain !== 'www' && subdomain !== 'admin' && host.includes('.')) {
        // Rewrite to /app/[subdomain] or however you structure it
        return NextResponse.rewrite(new URL(`/app/${subdomain}${pathname}`, request.url))
    }

    // domain.com/ → landing page (no rewrite needed, just serve /)
    // domain.com/slug → your app routes

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}