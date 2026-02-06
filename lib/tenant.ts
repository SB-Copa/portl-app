import { prisma } from './prisma';
import { getCurrentUser } from './auth';

/**
 * Validates if a tenant exists by subdomain
 */
export async function getTenantBySubdomain(subdomain: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        subdomain: true,
        name: true,
        ownerId: true,
      },
    });
    return tenant;
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
}

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

/**
 * Require tenant owner - verifies user owns the tenant and tenant is approved
 * Use in server actions for tenant-scoped operations (events, etc.)
 * Throws error if:
 * - User is not authenticated
 * - Tenant not found
 * - User doesn't own the tenant
 * - Tenant application is not approved
 */
export async function requireTenantOwner(subdomain: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: {
      application: true,
    },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  if (tenant.ownerId !== user.id) {
    throw new Error('Unauthorized: You do not own this tenant');
  }

  if (tenant.application?.status !== 'APPROVED') {
    throw new Error('Tenant application not approved');
  }

  return { tenant, user };
}
