import { prisma } from './prisma';
import { cache } from 'react';

/**
 * Validates if a tenant exists by subdomain
 * Uses React cache to avoid duplicate DB queries in the same request
 */
export const getTenantBySubdomain = cache(async (subdomain: string) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        subdomain: true,
        name: true,
      },
    });
    return tenant;
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
});

/**
 * Get current tenant from subdomain in server components
 * Call this in your [tenant] layout or pages
 */
export async function getCurrentTenant(subdomain: string) {
  return await getTenantBySubdomain(subdomain);
}

/**
 * Require tenant - throws error if not found
 * Use in server actions or API routes that require a valid tenant
 */
export async function requireTenant(subdomain: string) {
  const tenant = await getTenantBySubdomain(subdomain);
  if (!tenant) {
    throw new Error(`Tenant not found: ${subdomain}`);
  }
  return tenant;
}
