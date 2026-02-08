import { getCurrentUser } from '@/lib/auth';

/**
 * Require admin access
 * Throws an error if user is not authenticated or not an admin
 * Use this in Server Actions and API routes that require admin access
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  if (user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return user;
}
