const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://lvh.me:3000';
const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lvh.me:3000';

/**
 * Build a full URL for a tenant subdomain page.
 * e.g. tenantUrl('acme', '/events') → 'http://acme.lvh.me:3000/events'
 */
export function tenantUrl(subdomain: string, path = '/') {
  const protocol = appUrl.startsWith('https') ? 'https' : 'http';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${protocol}://${subdomain}.${rootDomain}${normalizedPath}`;
}

/**
 * Build a full URL for the main domain.
 * e.g. mainUrl('/auth/signin') → 'http://lvh.me:3000/auth/signin'
 */
export function mainUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${appUrl}${normalizedPath}`;
}
