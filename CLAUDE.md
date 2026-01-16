# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portl is a multi-tenant event platform built with Next.js 16, allowing organizations to host their own branded event pages on custom subdomains. Each tenant operates independently with their own events, organizers, and applications.

## Tech Stack

- **Framework**: Next.js 16.1.2 with App Router, React 19, Turbopack
- **Database**: PostgreSQL via Prisma 7.2.0 with PostgreSQL adapter
- **Authentication**: NextAuth v5 (beta.30) with JWT sessions
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Storage**: Upstash Redis for tenant data caching
- **Package Manager**: pnpm 10.12.4

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server with Turbopack
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm prisma:generate        # Generate Prisma Client
pnpm prisma:studio          # Open Prisma Studio GUI
pnpm prisma:migrate         # Create and apply migration

# Note: Prisma Client is generated to ./prisma/generated/prisma/
```

## Architecture

### Multi-Tenancy System

The application uses **subdomain-based multi-tenancy**:

- **Main domain** (`localhost:3000` / `portl.com`): Landing page
- **Admin subdomain** (`admin.localhost:3000`): Admin panel (requires auth)
- **Tenant subdomains** (`tenant-name.localhost:3000`): Individual tenant pages

#### Routing Flow

1. **Proxy-based routing** - Uses `proxy.ts` (Next.js 15+ pattern) instead of middleware for subdomain routing
2. The proxy handles:
   - Admin subdomain rewrites (`admin.domain.com` → `/admin` routes)
   - Tenant subdomain rewrites (`tenant.domain.com` → `/[tenant]` routes)
   - Path-based redirects (`/admin` → `admin.domain.com`)
3. Tenant routes use `app/[tenant]/` dynamic route structure
4. Tenant validation happens at the **page/layout level** using `lib/tenant.ts`
5. Reserved subdomains: `www`, `admin`, `api`, `auth`

#### Proxy Configuration

The `proxy.ts` file uses the Next.js 15+ proxy pattern (replaces traditional middleware):

**Key Features**:
- Runs in Edge Runtime (no Prisma/database access)
- Handles subdomain routing via rewrites and redirects
- Admin panel: `admin.domain.com` → rewrites to `/admin` routes
- Tenant pages: `tenant.domain.com` → rewrites to `/[tenant]` routes
- Path redirects: `/admin` → redirects to `admin.domain.com`
- Skips static files (`/_next`) and API routes early for performance

**Export Pattern**:
```typescript
export function proxy(request: NextRequest) { /* ... */ }
export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] }
```

#### Tenant Validation Pattern

```typescript
// In app/[tenant]/page.tsx or layout.tsx
import { getCurrentTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';

const tenant = await getCurrentTenant(params.tenant);
if (!tenant) {
  notFound();
}
```

**Important**: The proxy runs in Edge Runtime and cannot access Prisma/database. Tenant validation happens in Server Components at the page/layout level where you have access to the full Node.js runtime and Prisma Client.

### Database Architecture

#### Prisma 7 Configuration

- Custom configuration in `prisma.config.ts` (required for Prisma 7)
- Prisma Client generated to `./prisma/generated/prisma/`
- Uses PostgreSQL adapter (`@prisma/adapter-pg`) for compatibility
- Singleton pattern in `prisma/client.ts`, re-exported from `lib/prisma.ts`

#### Key Models

- **User**: Stores user accounts with `role` (USER, ORGANIZER, ADMIN)
- **Tenant**: Represents each organization/subdomain with unique subdomain constraint
- **OrganizerApplication**: Tracks organizer applications with multi-step status (NOT_STARTED, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED)
- One application per user per tenant (composite unique constraint)

#### Database Connection

Uses `DATABASE_URL` from environment variables. Alternative configurations supported:
- Vercel Postgres: `POSTGRES_PRISMA_URL` + `POSTGRES_URL_NON_POOLING`
- Prisma Accelerate: `PRISMA_DATABASE_URL`

### Authentication System

**NextAuth v5 (beta) with Credentials provider**:

- Uses JWT strategy (required for Credentials provider, not database sessions)
- Session data includes `id` and `role` from JWT token
- Auth helpers in `lib/auth.ts`: `getSession()`, `getCurrentUser()`, `requireAuth()`
- Auth pages: `/auth/signin`, `/auth/signup`, `/auth/error`
- Session expires after 30 days

**Important**: The auth configuration uses `trustHost: true` for multi-domain/Vercel deployment support.

### Organizer Application Flow

Multi-step application system for users to become organizers:

1. **Step 1**: Organizer Type Selection (INDIVIDUAL, TEAM, COMPANY) + description
2. **Step 2**: Event Portfolio (past events or planned events)
3. **Step 3**: Compliance & Acknowledgement (checkboxes for T&C)

#### Key Implementation Files

- `app/[tenant]/organizer/dashboard/page.tsx`: Main dashboard showing application status
- `app/[tenant]/organizer/apply/page.tsx`: Multi-step application form
- `app/api/organizer/application/route.ts`: CRUD operations for applications
- `app/api/organizer/tenant/route.ts`: Tenant lookup/creation
- `components/organizer/*.tsx`: Form components for each step
- `components/ui/stepper.tsx`: Progress indicator component

#### Application State Management

- Applications save progress automatically (can exit and resume)
- Status tracked: NOT_STARTED → IN_PROGRESS → SUBMITTED → (future: APPROVED/REJECTED)
- User role remains USER until admin approval (not yet implemented)

### File Organization

```
app/
├── (landing-page)/         # Route group for main landing page
├── [tenant]/               # Dynamic tenant routes
│   ├── organizer/          # Organizer-specific pages
│   │   ├── dashboard/      # Application status dashboard
│   │   └── apply/          # Multi-step application form
│   ├── events/             # Tenant events listing
│   └── page.tsx            # Tenant home page
├── admin/                  # Admin panel (requires auth)
├── api/                    # API routes
│   ├── auth/               # NextAuth handlers
│   └── organizer/          # Organizer application APIs
└── auth/                   # Auth pages (signin, signup, error)

components/
├── layout/                 # Navbar, Footer
├── organizer/              # Organizer form components
├── providers/              # SessionProvider wrapper
└── ui/                     # shadcn/ui components

lib/
├── auth.ts                 # Auth helper functions
├── prisma.ts               # Prisma client re-export
└── tenant.ts               # Tenant validation utilities

prisma/
├── client.ts               # Prisma Client singleton
├── generated/              # Generated Prisma Client (gitignored)
└── schema.prisma           # Database schema

prisma.config.ts            # Prisma 7 configuration (root level)
auth.ts                     # NextAuth configuration (root level)
proxy.ts                    # Next.js proxy for subdomain routing (root level)
```

### Path Aliases

Uses `@/*` for imports mapping to project root:
```typescript
import { prisma } from '@/lib/prisma';
import { getCurrentTenant } from '@/lib/tenant';
```

## Coding Conventions

### Server Actions
- **Always use Server Actions** for server-side operations instead of API routes
- Server Actions should be defined in `app/actions/` directory
- Use `"use server"` directive at the top of action files

### Form Handling
- **Always use React Hook Form** with **Zod** for form validation and handling
- Use Zod schemas for validation
- Integrate React Hook Form with Server Actions for form submissions

## Development Notes

### Local Subdomain Testing

To test subdomains locally, add entries to `/etc/hosts`:
```
127.0.0.1 test.localhost
127.0.0.1 admin.localhost
```

Then access: `http://test.localhost:3000`

### Database Workflow

1. Modify `prisma/schema.prisma`
2. Run `pnpm prisma:migrate` to create migration
3. Run `pnpm prisma:generate` to update Prisma Client
4. Import types from `@/prisma/generated/prisma/client`

### Adding shadcn/ui Components

The project uses shadcn/ui. Components are in `components/ui/` and use:
- Radix UI primitives
- Tailwind CSS 4
- `class-variance-authority` for variants
- `tailwind-merge` for class merging

### API Route Patterns

API routes follow this pattern:
```typescript
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your logic here
}
```

### Type Safety

- Prisma types from `@/prisma/generated/prisma/client`
- NextAuth session types extended in `types/next-auth.d.ts`
- TypeScript strict mode enabled

## Important Constraints

1. **Proxy-based routing**: Uses `proxy.ts` for subdomain routing (Next.js 15+ pattern), runs in Edge Runtime
2. **Edge Runtime limitations**: The proxy cannot access Prisma, database, or full Node.js APIs
3. **Tenant validation in components**: Always validate tenants in Server Components, not in the proxy
4. **JWT sessions required**: Credentials provider requires JWT strategy, not database sessions
5. **Prisma 7 specific**: Must use `prisma.config.ts` and custom client output path
6. **Multi-tenant unique constraints**: Users can have one application per tenant
7. **Reserved subdomains**: Don't use `www`, `admin`, `api`, `auth` as tenant subdomains

## Current Implementation Status

**Completed (Phase 2)**:
- User authentication system (credentials-based)
- Multi-tenant tenant model
- Organizer application flow (3-step form)
- Progress saving and resume capability
- Tenant-scoped applications
- Basic UI components

**Not Yet Implemented**:
- Admin approval system for organizer applications
- Role elevation (USER → ORGANIZER)
- Event creation and management
- Ticketing system
- Analytics dashboard
- Email notifications
- OAuth providers (Google, GitHub) - configured but commented out

## References

See these project-specific docs for detailed information:
- `ORGANIZER_FLOW.md`: Complete organizer application implementation guide
- `SETUP_FIXES_SUMMARY.md`: Database, auth, and multi-tenancy setup details
- `README.md`: General project overview and getting started
