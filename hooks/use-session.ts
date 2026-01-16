'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

/**
 * Client-side hook to get the current session
 * Use this in Client Components
 */
export function useSession() {
  return useNextAuthSession();
}
