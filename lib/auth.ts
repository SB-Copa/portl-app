import { auth } from '@/auth';

/**
 * Get the current session on the server
 * Use this in Server Components, Server Actions, and API routes
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user on the server
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Require authentication
 * Throws an error if user is not authenticated
 * Use this in Server Actions and API routes that require auth
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}
