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

The application uses **path-based multi-tenancy** with a simple `/t/[tenant]` prefix:

- **Main domain** (`localhost:3000` / `portl.com`): Landing page, auth, account, dashboard
- **Admin subdomain** (`admin.localhost:3000`): Admin panel (only subdomain used)
- **Tenant pages** (`localhost:3000/t/tenant-name`): Public tenant pages under `/t/` prefix

#### URL Structure

| Area | URL Pattern | Notes |
|------|-------------|-------|
| Main site | `portl.com/` | Landing page |
| Auth | `portl.com/auth/*` | Sign in, sign up |
| Account | `portl.com/account/*` | User account area |
| Dashboard | `portl.com/dashboard/*` | Organizer dashboard |
| **Tenant pages** | `portl.com/t/[tenant]/*` | Public tenant pages |
| Admin | `admin.portl.com/*` | Admin panel (keep subdomain) |

#### Routing Flow

1. **Proxy-based routing** - Uses `proxy.ts` (Next.js 15+ pattern) for minimal routing
2. The proxy only handles:
   - Admin subdomain rewrites (`admin.domain.com` → `/admin` routes)
   - Path redirects (`/admin` → `admin.domain.com`)
3. Tenant routes use `app/t/[tenant]/` dynamic route structure (standard Next.js routing)
4. Tenant validation happens at the **page/layout level** using `lib/tenant.ts`
5. No wildcard subdomains needed - simpler auth cookie handling

#### Proxy Configuration

The `proxy.ts` file is simplified to only handle admin subdomain:

**Key Features**:
- Runs in Edge Runtime (no Prisma/database access)
- Only handles admin subdomain routing
- All other routes use standard Next.js path-based routing
- Skips static files (`/_next`) and API routes early for performance

**Export Pattern**:
```typescript
export function proxy(request: NextRequest) {
  // Only handle admin subdomain
  if (host.startsWith('admin.')) {
    return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] }
```

#### Tenant Validation Pattern

```typescript
// In app/t/[tenant]/page.tsx or layout.tsx
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

### User Spaces

The platform has two distinct user-facing areas:

#### Account Area (Attendees)
- **Purpose**: Ticket purchases, order history, profile settings
- **Routes**: `/account/*` on main domain
- **Access**: Any authenticated user
- **Key pages**:
  - `/account` - Overview
  - `/account/tickets` - My tickets (placeholder until Order model exists)
  - `/account/orders` - Order history (placeholder)
  - `/account/settings` - Profile and password settings

#### Dashboard Area (Organizers)
- **Purpose**: Business/tenant management, event creation
- **Routes**: `/dashboard/*` on main domain
- **Access**: Users who own tenants
- **Key pages**:
  - `/dashboard` - Business selector (auto-redirects to tenant dashboard if user has only 1 tenant)
  - `/dashboard/[tenant]` - Tenant dashboard
  - `/dashboard/[tenant]/events` - Event management
  - `/dashboard/[tenant]/apply` - Organizer application

**Smart redirect**: Users with a single tenant skip the business selector and go directly to their dashboard.

#### Navigation Pattern
- Users without tenants see "Become an Organizer" CTA
- Users with tenants see "Organizer Dashboard" link
- Both spaces accessible from navbar dropdown menu

### Organizer Application Flow

Multi-step application system for users to become organizers:

1. **Step 1**: Organizer Type Selection (INDIVIDUAL, TEAM, COMPANY) + description
2. **Step 2**: Event Portfolio (past events or planned events)
3. **Step 3**: Compliance & Acknowledgement (checkboxes for T&C)

#### Key Implementation Files

- `app/dashboard/[tenant]/page.tsx`: Main dashboard showing application status
- `app/dashboard/[tenant]/apply/page.tsx`: Multi-step application form
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
│   ├── account/            # Attendee account area
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Account overview
│   │   ├── tickets/        # My tickets
│   │   ├── orders/         # Order history
│   │   └── settings/       # Profile settings
│   └── organizer/          # Organizer registration
├── dashboard/              # Organizer dashboard (main domain)
│   ├── page.tsx            # Business selector (auto-redirects if 1 tenant)
│   └── [tenant]/           # Tenant-specific dashboard
├── t/                      # Tenant routes prefix
│   └── [tenant]/           # Dynamic tenant routes (public-facing)
│       ├── events/         # Tenant events listing
│       ├── organizer/      # Tenant organizer routes
│       ├── profile/        # Tenant profile page
│       └── page.tsx        # Tenant home page
├── admin/                  # Admin panel (requires auth)
├── api/                    # API routes
│   ├── auth/               # NextAuth handlers
│   └── organizer/          # Organizer application APIs
└── auth/                   # Auth pages (signin, signup, error)

components/
├── account/                # Account area components
├── dashboard/              # Dashboard components
├── layout/                 # Navbar, Footer, UserMenu
├── organizer/              # Organizer form components
├── profile/                # Profile form components
├── providers/              # SessionProvider wrapper
├── public/                 # Public-facing components
│   └── events/             # Public event pages components
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

### React Imports
- **Always use direct imports for hooks**: `import { useState, useEffect, useCallback } from 'react'`
- **Always use direct imports for utilities**: `import { forwardRef, memo } from 'react'`
- **Use type-only imports for types**: `import type { ComponentProps, ElementRef } from 'react'`
- **Remove unnecessary React imports**: React 17+ doesn't require `import React from 'react'` for JSX
- **Only import what you use**: Don't import React if you're only using JSX (no hooks or React APIs)
- **shadcn/ui components exception**: Do not modify shadcn/ui components in `components/ui/` - they use `import * as React` and `React.ComponentProps` patterns by design

### Multi-Tenant Link Handling

With path-based routing, link handling is simpler - all links are on the same domain.

#### Rules

1. **Main domain routes** (`/account`, `/dashboard`, `/auth/*`, `/organizer/*`):
   - Use absolute paths: `href="/account"`

2. **Tenant public pages** (inside `app/t/[tenant]/`):
   - Always use `/t/` prefix: `href={`/t/${tenant}/events`}`
   - Never omit the `/t/` prefix for tenant routes

3. **Dashboard routes** (inside `app/dashboard/[tenant]/`):
   - Use `/dashboard/` prefix: `href={`/dashboard/${tenant}/events`}`
   - These are organizer-facing, not public

4. **Server Actions and redirects**:
   - Use `redirect('/path')` for main domain routes
   - Use `redirect(`/t/${tenant}/path`)` for public tenant routes
   - Use `redirect(`/dashboard/${tenant}/path`)` for dashboard routes

#### Examples

```typescript
// GOOD - Main domain link
<Link href="/account">My Account</Link>
<Link href="/dashboard">Dashboard</Link>

// GOOD - Public tenant page (note the /t/ prefix)
<Link href={`/t/${tenant}/events`}>Events</Link>
<Link href={`/t/${tenant}/events/${eventId}`}>Event Detail</Link>

// GOOD - Dashboard tenant page
<Link href={`/dashboard/${tenant}/events`}>Manage Events</Link>

// GOOD - Server Action redirects
redirect(`/t/${subdomain}/events`)      // Public tenant page
redirect(`/dashboard/${subdomain}`)     // Dashboard page

// BAD - Missing /t/ prefix for public tenant page
<Link href={`/${tenant}/events`}>Events</Link>

// BAD - Using /t/ for dashboard routes
<Link href={`/t/${tenant}/events/new`}>Create Event</Link> // Should be /dashboard/
```

#### Route Prefixes

- `/t/[tenant]/*` - Public tenant pages (events, profile, etc.)
- `/dashboard/[tenant]/*` - Organizer dashboard (event management)
- `/account/*` - User account area
- `/auth/*` - Authentication pages
- `/admin/*` - Admin panel (admin subdomain only)

## Development Notes

### Local Testing

Most routes work on `localhost:3000` directly:
- Landing page: `http://localhost:3000`
- Tenant pages: `http://localhost:3000/t/tenant-name/events`
- Dashboard: `http://localhost:3000/dashboard`

For admin subdomain testing, add to `/etc/hosts`:
```
127.0.0.1 admin.localhost
```

Then access: `http://admin.localhost:3000`

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

- **Always use generated Prisma types** from `@/prisma/generated/prisma/client`
- **Never manually define types** that duplicate Prisma-generated types
- For models with relationships, use the pattern: `Model & Prisma.ModelGetPayload<{include: {...}}>`
- Match type includes with actual Prisma query includes for type safety
- NextAuth session types extended in `types/next-auth.d.ts`
- TypeScript strict mode enabled

#### Prisma Type Pattern

When working with Prisma models that have relationships:

```typescript
import { OrganizerApplication, Prisma } from '@/prisma/generated/prisma/client';

// For models with relationships, use GetPayload to ensure type safety
type ApplicationWithRelations = OrganizerApplication & Prisma.OrganizerApplicationGetPayload<{
  include: {
    tenant: {
      include: {
        owner: {
          select: {
            id: true;
            email: true;
            firstName: true;
            lastName: true;
          };
        };
      };
    };
    notes: {
      include: {
        user: {
          select: {
            id: true;
            email: true;
            firstName: true;
            lastName: true;
          };
        };
      };
    };
  };
}>;
```

**Important**: The `include` structure in your type definition should exactly match the `include` structure in your Prisma query to ensure type safety.

## Event Management System

The platform includes a complete event management system for organizers to create and manage events, tables, tickets, and promotions.

### Routes Structure

```
app/dashboard/[tenant]/events/
├── page.tsx                    # Events listing with status filters
├── new/
│   └── page.tsx                # Create event form
└── [eventId]/
    ├── page.tsx                # Event overview (mini-dashboard)
    ├── edit/
    │   └── page.tsx            # Edit event details
    ├── tables/
    │   └── page.tsx            # Manage tables & seats
    ├── tickets/
    │   └── page.tsx            # Manage ticket types & price tiers
    └── promotions/
        └── page.tsx            # Manage promotions & voucher codes
```

### Components

Event management components are located in `components/dashboard/events/`:

- **event-form.tsx**: Create/edit event form (name, venue, dates, status)
- **event-header.tsx**: Event title, status badge, publish/archive actions
- **event-stats-cards.tsx**: Stats overview (tickets sold, revenue, tables)
- **event-sub-nav.tsx**: Tab navigation between event sections
- **events-list.tsx**: Events listing with status filters
- **tables-section.tsx**: Table listing and CRUD operations
- **table-form.tsx**: Single table form (label, capacity, mode, min spend)
- **bulk-table-form.tsx**: Bulk table creation (VIP1-VIP10 pattern)
- **tickets-section.tsx**: Ticket types listing and CRUD
- **ticket-type-form.tsx**: Ticket type form with table selection
- **price-tiers-section.tsx**: Price tiers per ticket type
- **price-tier-form.tsx**: Price tier form (TIME_WINDOW/ALLOCATION)
- **promotions-section.tsx**: Promotions listing and CRUD
- **promotion-form.tsx**: Promotion form with discount config
- **voucher-codes-section.tsx**: Voucher codes per promotion
- **voucher-code-form.tsx**: Voucher code form

### Server Actions

All event management server actions are in `app/actions/tenant-events.ts`:

- **Events**: `getEventsForTenantAction`, `getEventByIdForTenantAction`, `createEventForTenantAction`, `updateEventForTenantAction`, `publishEventForTenantAction`, `archiveEventForTenantAction`
- **Tables**: `createTableForTenantAction`, `bulkCreateTablesForTenantAction`, `updateTableForTenantAction`, `deleteTableForTenantAction`, `regenerateSeatsForTenantAction`
- **Ticket Types**: `createTicketTypeForTenantAction`, `updateTicketTypeForTenantAction`, `deleteTicketTypeForTenantAction`
- **Price Tiers**: `createPriceTierForTenantAction`, `updatePriceTierForTenantAction`, `deletePriceTierForTenantAction`
- **Promotions**: `createPromotionForTenantAction`, `updatePromotionForTenantAction`, `deletePromotionForTenantAction`
- **Voucher Codes**: `createVoucherCodeForTenantAction`, `updateVoucherCodeForTenantAction`, `deleteVoucherCodeForTenantAction`

### Validation Schemas

Zod schemas in `lib/validations/events.ts`:

- `eventSchema`: Event name, venue, dates, status
- `tableSchema`: Label, capacity, mode (EXCLUSIVE/SHARED), min spend
- `bulkTableSchema`: Prefix, start/end numbers, capacity, mode
- `ticketTypeSchema`: Name, kind (GENERAL/TABLE/SEAT), base price, table reference
- `priceTierSchema`: Name, price, strategy (TIME_WINDOW/ALLOCATION)
- `promotionSchema`: Name, discount type/value, applies to, valid period
- `voucherCodeSchema`: Code, max redemptions

### Key Concepts

#### Table Modes
- **EXCLUSIVE**: VIP tables sold as whole unit (bottle service)
- **SHARED**: Communal tables, seats sold individually

#### Ticket Types
- **GENERAL**: Standard admission (GA entry, drink tickets)
- **TABLE**: Full table booking (requires tableId, quantity = 1)
- **SEAT**: Individual seat at shared table (requires tableId, quantity = table capacity)

#### Price Tier Strategies
- **TIME_WINDOW**: Price applies during specific date/time range
- **ALLOCATION**: Price applies until allocation is sold out

#### Promotions
- Discount types: PERCENT (basis points, 100 = 1%), FIXED (PHP amount)
- Applies to: ORDER (cart total) or ITEM (per ticket)
- Optional voucher codes with max redemptions

## Public Events Pages

Public-facing event pages allow users to browse and view published events.

### Routes Structure

```
app/t/[tenant]/events/
├── page.tsx                    # Public events listing (published only)
└── [eventId]/
    └── page.tsx                # Public event detail page
```

### Components

Public event components are in `components/public/events/`:

- **public-events-list.tsx**: Grid of event cards with empty state
- **public-event-card.tsx**: Event card (name, date, venue, starting price)
- **public-event-detail.tsx**: Full event view with sidebar
- **ticket-types-display.tsx**: Ticket options with current pricing

### Server Actions

Public event server actions in `app/actions/public-events.ts`:

- `getPublicEventsForTenant(subdomain)`: Fetch published events (no auth required)
- `getPublicEventById(subdomain, eventId)`: Fetch single published event

### Key Features

- **No authentication required**: Public pages are accessible to anyone
- **Published events only**: Only `PUBLISHED` status events are visible
- **Dynamic pricing display**: Shows current price based on active price tiers
- **Availability indicators**: Shows "Sold out" or remaining quantity
- **Responsive grid**: 1-3 column layout based on screen size

### URL Patterns

- Events list: `localhost:3000/t/[tenant]/events`
- Event detail: `localhost:3000/t/[tenant]/events/[eventId]`

## Important Constraints

1. **Path-based tenant routing**: Tenant pages use `/t/[tenant]/*` prefix, not subdomains
2. **Admin subdomain only**: Admin panel is the only subdomain (`admin.domain.com`)
3. **Edge Runtime limitations**: The proxy cannot access Prisma, database, or full Node.js APIs
4. **Tenant validation in components**: Always validate tenants in Server Components, not in the proxy
5. **JWT sessions required**: Credentials provider requires JWT strategy, not database sessions
6. **Prisma 7 specific**: Must use `prisma.config.ts` and custom client output path
7. **Multi-tenant unique constraints**: Users can have one application per tenant
8. **Tenant route prefix**: Always use `/t/` prefix for public tenant routes, `/dashboard/` for organizer routes

## Current Implementation Status

**Completed (Phase 3)**:
- User authentication system (credentials-based)
- Multi-tenant tenant model
- Organizer application flow (3-step form)
- Progress saving and resume capability
- Tenant-scoped applications
- Basic UI components
- Attendee account area (`/account/*`)
- Navbar user dropdown with space switching
- Dashboard auto-redirect for single-tenant users
- Event creation and management (CRUD)
- Tables management (single + bulk creation)
- Ticket types with table associations
- Price tiers (time window + allocation strategies)
- Promotions with voucher codes
- Public events pages with path-based routing (`/t/[tenant]/*`)

**Not Yet Implemented**:
- Admin approval system for organizer applications
- Role elevation (USER → ORGANIZER)
- Ticketing system (Order, Ticket, purchase flow)
- Analytics dashboard
- Email notifications
- OAuth providers (Google, GitHub) - configured but commented out

## References

See these project-specific docs for detailed information:
- `ORGANIZER_FLOW.md`: Complete organizer application implementation guide
- `SETUP_FIXES_SUMMARY.md`: Database, auth, and multi-tenancy setup details
- `README.md`: General project overview and getting started
