import 'next-auth';
import 'next-auth/jwt';
import type { UserRole as PrismaUserRole } from '@prisma/client';

// Use the Prisma enum type for consistency
type UserRole = PrismaUserRole;

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    emailVerified?: Date | null;
    image?: string | null;
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
