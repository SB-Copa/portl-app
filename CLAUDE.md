# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portl is a multi-tenant event platform built with Next.js 16, allowing organizations to host their own branded event pages on custom subdomains. Each tenant operates independently with their own events, organizers, and applications.

## Tech Stack

- **Framework**: Next.js 16.1.2 with App Router, React 19, Turbopack
- **Database**: PostgreSQL via Prisma 7.2.0 with PostgreSQL adapter
- **Authentication**: NextAuth v5 (beta.30) with JWT sessions
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Payments**: PayMongo Checkout Sessions (PHP currency, centavo amounts)
- **QR Codes**: react-qr-code (SVG-based)
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

The application uses **subdomain-based multi-tenancy** where each tenant gets its own subdomain:

- **Main domain** (`lvh.me:3000` / `portl.com`): Landing page, auth, account, dashboard
- **Admin subdomain** (`admin.lvh.me:3000`): Admin panel
- **Tenant subdomains** (`acme.lvh.me:3000` / `acme.portl.com`): Public tenant pages

The `proxy.ts` rewrites `tenant.domain.com/*` → internal `/t/tenant/*` routes. The `app/t/[tenant]/` file structure is preserved but URLs are clean subdomains.

`lvh.me` is used for local development because it resolves to `127.0.0.1` and supports wildcard subdomain cookies (`.lvh.me`).

#### URL Structure

| Area | URL Pattern | Notes |
|------|-------------|-------|
| Main site | `lvh.me:3000/` | Landing page |
| Auth | `lvh.me:3000/auth/*` | Sign in, sign up |
| Account | `lvh.me:3000/account/*` | User account area |
| Dashboard | `lvh.me:3000/dashboard/*` | Organizer dashboard |
| **Tenant pages** | `acme.lvh.me:3000/*` | Public tenant pages (subdomain) |
| Admin | `admin.lvh.me:3000/*` | Admin panel |

#### Routing Flow

1. **Proxy-based routing** - Uses `proxy.ts` (Next.js 15+ pattern) for subdomain routing
2. The proxy handles:
   - Admin subdomain rewrites (`admin.domain.com/*` → `/admin/*` routes)
   - **Tenant subdomain rewrites** (`tenant.domain.com/*` → `/t/tenant/*` routes)
   - Backward compat redirects (`/t/tenant/*` on main domain → `tenant.domain.com/*`)
   - Auth page redirect for authenticated users (main domain only)
3. File structure uses `app/t/[tenant]/` internally — URLs are clean subdomains
4. Tenant validation happens at the **page/layout level** using `lib/tenant.ts`

#### Proxy Configuration

The `proxy.ts` handles admin + tenant subdomain routing:

**Key Features**:
- Runs in Edge Runtime (no Prisma/database access)
- Handles admin and tenant subdomain rewrites
- Redirects `/t/*` paths on main domain to proper subdomain URLs
- Uses `NEXT_PUBLIC_ROOT_DOMAIN` to determine the root domain
- Skips static files (`/_next`) and API routes early for performance

#### URL Helper (`lib/url.ts`)

Two helper functions for building cross-domain URLs:

```typescript
import { tenantUrl, mainUrl } from '@/lib/url';

tenantUrl('acme', '/events')     // → 'http://acme.lvh.me:3000/events'
mainUrl('/auth/signin')          // → 'http://lvh.me:3000/auth/signin'
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

- **User**: Stores user accounts with `role` (USER, ADMIN) — global platform role only
- **Tenant**: Represents each organization/subdomain with unique subdomain constraint, has `type` (ORGANIZER, VENUE, ARTIST)
- **TenantMember**: Join table for tenant-scoped roles (`userId + tenantId` unique). Roles: OWNER, ADMIN, MANAGER, MEMBER
- **TenantInvitation**: Email-based team invitations with token, expiration, status (PENDING, ACCEPTED, EXPIRED, REVOKED)
- **OrganizerApplication**: Tracks organizer applications with multi-step status (NOT_STARTED, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED)
- One application per user per tenant (composite unique constraint)

#### TenantMember Roles

| Role | Dashboard Access | Events | Team Management |
|------|-----------------|--------|-----------------|
| OWNER | Full | Full | Full (can change roles) |
| ADMIN | Full | Full | Can invite/remove MANAGER/MEMBER |
| MANAGER | Limited | View/Edit | View only |
| MEMBER | Home only | None | None |

#### Authorization Pattern

```typescript
import { requireTenantAccess } from '@/lib/tenant';

// In server actions - specify minimum role
const { tenant, user, membership } = await requireTenantAccess(subdomain, 'ADMIN');

// requireTenantOwner delegates to requireTenantAccess('ADMIN')
const { tenant, user } = await requireTenantOwner(subdomain);

// Check role hierarchy
import { hasMinimumRole } from '@/lib/tenant';
hasMinimumRole('ADMIN', 'MANAGER'); // true
```

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
  - `/account/tickets` - My tickets list (grouped by event)
  - `/account/tickets/[ticketId]` - Ticket detail with QR code
  - `/account/orders` - Order history
  - `/account/orders/[orderId]` - Order detail
  - `/account/settings` - Profile and password settings

#### Dashboard Area (Organizers)
- **Purpose**: Business/tenant management, event creation, team management
- **Routes**: `/dashboard/*` on main domain
- **Access**: Users with `TenantMember` membership (role-based visibility)
- **Key pages**:
  - `/dashboard` - Business selector (auto-redirects to tenant dashboard if user has only 1 tenant)
  - `/dashboard/[tenant]` - Tenant dashboard
  - `/dashboard/[tenant]/events` - Event management (OWNER, ADMIN, MANAGER)
  - `/dashboard/[tenant]/team` - Team management (OWNER, ADMIN)
  - `/dashboard/[tenant]/apply` - Organizer application (OWNER only)

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
- Status tracked: NOT_STARTED → IN_PROGRESS → SUBMITTED → APPROVED/REJECTED
- On approval: `TenantMember(role: OWNER)` is created, tenant status set to ACTIVE
- User's global role stays `USER` — tenant access is controlled by `TenantMember` membership

### File Organization

```
app/
├── account/                # Attendee account area
│   ├── layout.tsx
│   ├── page.tsx            # Account overview + affiliations
│   ├── tickets/            # My tickets
│   ├── orders/             # Order history
│   └── settings/           # Profile settings
├── actions/                # Server actions
│   ├── admin.ts            # Admin application management
│   ├── admin-tenants.ts    # Admin tenant management
│   ├── admin-users.ts      # Admin user management
│   ├── checkout.ts         # Checkout/payment actions
│   ├── invitations.ts      # Invitation accept/get actions
│   ├── organizer.ts        # Organizer registration/application
│   ├── profile.ts          # User profile actions
│   ├── public-events.ts    # Public event queries
│   ├── tenant-events.ts    # Tenant event CRUD (tables, tickets, promotions)
│   ├── tenant-members.ts   # Team management actions
│   └── upload.ts           # File upload actions
├── admin/                  # Admin panel (admin subdomain)
├── auth/                   # Auth pages (signin, signup, error)
├── dashboard/              # Organizer dashboard (main domain)
│   ├── page.tsx            # Business selector (auto-redirects if 1 tenant)
│   └── [tenant]/           # Tenant-specific dashboard
│       ├── events/         # Event management
│       └── team/           # Team management (OWNER/ADMIN only)
│           └── page.tsx
├── invite/                 # Invitation accept flow
│   └── [token]/
│       ├── page.tsx        # Server component
│       └── invite-accept-card.tsx  # Client component
├── t/                      # Tenant routes (internal, served via subdomain rewrite)
│   └── [tenant]/           # Dynamic tenant routes (public via tenant.domain.com)
│       ├── checkout/       # Checkout flow
│       ├── events/         # Tenant events listing
│       ├── profile/        # Tenant profile page
│       └── page.tsx        # Tenant home page
└── api/                    # API routes
    ├── auth/               # NextAuth handlers
    └── webhooks/
        └── paymongo/       # PayMongo webhook (checkout_session.payment.paid)

components/
├── account/                # Account area components
│   └── affiliations-section.tsx  # Tenant memberships with visibility toggle
├── admin/                  # Admin panel components
├── checkout/               # Checkout flow components
├── dashboard/              # Dashboard components
│   ├── events/             # Event management components
│   └── team/               # Team management components
│       ├── team-section.tsx
│       ├── invite-member-form.tsx
│       └── edit-member-form.tsx
├── layout/                 # Navbar, Footer, UserMenu
├── organizer/              # Organizer form components
├── profile/                # Profile form components
├── providers/              # SessionProvider wrapper
├── public/                 # Public-facing components
│   └── events/             # Public event pages components
└── ui/                     # shadcn/ui components + ticket-qr-code.tsx

lib/
├── auth.ts                 # Auth helper functions
├── email.ts                # SendGrid email helper
├── paymongo.ts             # PayMongo API client helper
├── prisma.ts               # Prisma client re-export
├── tenant.ts               # Tenant validation + requireTenantAccess()
├── url.ts                  # URL helpers (tenantUrl, mainUrl)
└── validations/
    ├── checkout.ts          # Checkout/payment Zod schemas
    ├── events.ts            # Event management Zod schemas
    └── team.ts              # Team management Zod schemas

prisma/
├── client.ts               # Prisma Client singleton
├── generated/              # Generated Prisma Client (gitignored)
├── models/                 # Prisma schema files (multi-file)
│   ├── event.prisma
│   ├── event-image.prisma
│   ├── order.prisma
│   ├── tenant.prisma
│   ├── tenant-invitation.prisma
│   ├── tenant-member.prisma
│   ├── ticket-type.prisma
│   └── user.prisma
├── scripts/                # Migration/backfill scripts
│   └── backfill-tenant-members.ts
└── seed.ts                 # Database seed script

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

With subdomain-based routing, there are three link contexts:

#### Rules

1. **Within-tenant links** (components rendered on a tenant subdomain):
   - Use **relative paths**: `href="/events"`, `href="/checkout"`
   - The proxy rewrites these to the correct internal `/t/[tenant]/*` route
   - **Never** use `/t/${tenant}/` prefix in tenant-rendered components

2. **Cross-domain links from main domain TO tenant** (dashboard, account, admin):
   - Use `tenantUrl()` helper: `href={tenantUrl(subdomain, '/events')}`
   - Use `<a>` tag (not `<Link>`) since it's a different domain

3. **Cross-domain links from tenant TO main domain** (auth, account, dashboard):
   - Use `mainUrl()` helper: `href={mainUrl('/auth/signin')}`
   - TenantNavbar passes `mainDomainPrefix` to HeaderActions/UserMenu
   - Use `<a>` tag (not `<Link>`) for cross-domain navigation

4. **Dashboard routes** (on main domain):
   - Use `/dashboard/` prefix: `href={`/dashboard/${tenant}/events`}`
   - These are organizer-facing, on the main domain

5. **Server Actions and redirects**:
   - Use `tenantUrl()` for PayMongo callback URLs
   - `revalidatePath('/t/${sub}/...')` still uses internal path (correct)
   - Auth redirects from tenant pages use `mainUrl()` with full `callbackUrl`

#### Examples

```typescript
import { tenantUrl, mainUrl } from '@/lib/url';

// GOOD - Within-tenant link (on tenant subdomain)
<Link href="/events">Events</Link>
<Link href={`/events/${eventId}`}>Event Detail</Link>

// GOOD - Main domain to tenant (cross-domain)
<a href={tenantUrl(subdomain, '/events')}>View Events</a>
<a href={tenantUrl(subdomain, `/events/${eventId}`)}>View Live</a>

// GOOD - Tenant to main domain (cross-domain)
<a href={mainUrl('/auth/signin')}>Sign In</a>
<a href={mainUrl('/account/tickets')}>My Tickets</a>

// GOOD - Dashboard (main domain, same domain)
<Link href={`/dashboard/${tenant}/events`}>Manage Events</Link>

// GOOD - Server Action PayMongo URLs
successUrl: tenantUrl(subdomain, `/checkout/success/${orderId}`)

// BAD - Using /t/ prefix in tenant-rendered component
<Link href={`/t/${tenant}/events`}>Events</Link>

// BAD - Using <Link> for cross-domain navigation
<Link href={tenantUrl(sub, '/events')}>Events</Link> // Should use <a>
```

#### Route Prefixes (internal file structure)

- `app/t/[tenant]/*` - Tenant pages (served via `tenant.domain.com/*`)
- `app/dashboard/[tenant]/*` - Organizer dashboard (main domain)
- `app/account/*` - User account area (main domain)
- `app/auth/*` - Authentication pages (main domain)
- `app/admin/*` - Admin panel (admin subdomain)

## Development Notes

### Local Testing

Uses `lvh.me` which resolves to `127.0.0.1` and supports wildcard subdomains:
- Landing page: `http://lvh.me:3000`
- Tenant pages: `http://acme.lvh.me:3000/events`
- Dashboard: `http://lvh.me:3000/dashboard`
- Admin: `http://admin.lvh.me:3000`

No `/etc/hosts` configuration needed - `lvh.me` works out of the box.

#### Environment Variables (required for local dev)

```
AUTH_URL="http://lvh.me:3000"
NEXT_PUBLIC_APP_URL="http://lvh.me:3000"
NEXT_PUBLIC_ROOT_DOMAIN="lvh.me:3000"
```

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

#### Ticket Type Edit Restrictions (Sales Protection)

Once tickets have been sold (`quantitySold > 0`), structural fields are locked:

| Field | Status | Reason |
|-------|--------|--------|
| `kind` | LOCKED | Changing type breaks existing tickets |
| `tableId` | LOCKED | Changing table breaks seat assignments |
| `quantityTotal` | Must be >= `quantitySold` | Can't go below already sold |
| `name`, `description`, `basePrice`, `transferrable`, `cancellable` | Editable | Cosmetic/policy changes |

**Enforcement**:
- **Server-side**: `updateTicketTypeForTenantAction` rejects `kind`/`tableId` changes and invalid `quantityTotal` when `quantitySold > 0`
- **Server-side**: `deleteTicketTypeForTenantAction` blocks deletion when `quantitySold > 0`
- **UI**: `TicketTypeForm` accepts `quantitySold` prop, disables Kind/Table selects and shows amber warning banner
- **UI**: `TicketsSection` disables delete button with tooltip when sales exist

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

## Checkout & Payment System

### PayMongo Integration

The platform uses PayMongo Checkout Sessions for payment processing.

- **Currency**: PHP (amounts stored in centavos — 100 = PHP 1.00)
- **Flow**: Cart → Attendee details → Create checkout session → Redirect to PayMongo → Webhook confirms payment → Redirect to success page
- **Webhook**: `/api/webhooks/paymongo` handles `checkout_session.payment.paid` event
- **Signature verification**: HMAC-SHA256 with `"${timestamp}.${rawBody}"` format; `te` = test, `li` = live in `Paymongo-Signature` header
- **Success page sync fallback**: If webhook hasn't arrived yet, success page retrieves checkout session directly from PayMongo API

### Routes

```
app/t/[tenant]/checkout/
├── page.tsx                        # Checkout flow (cart review, attendee forms)
└── success/
    └── [orderId]/
        └── page.tsx                # Order confirmation with ticket QR codes
```

### Key Files

- `app/actions/checkout.ts`: Server actions for creating orders and checkout sessions
- `app/api/webhooks/paymongo/route.ts`: Webhook handler for payment confirmation
- `lib/paymongo.ts`: PayMongo API client helper
- `lib/validations/checkout.ts`: Checkout Zod schemas (`paymentAttendeeSchema`)
- `components/checkout/`: Checkout flow components (attendee form, payment step, success)
- `prisma/models/order.prisma`: Order, OrderItem, Ticket models

### Order Metadata

Order metadata (Json field) stores attendee data across the redirect to PayMongo. The `paymentAttendeeSchema` (from `lib/validations/checkout.ts`) is used for payment session data — distinct from the component-level `AttendeeData` type.

## Ticket QR Codes

- **Library**: `react-qr-code` (SVG-based, lightweight)
- **Component**: `components/ui/ticket-qr-code.tsx` — client component wrapper (`'use client'`)
- **Ticket detail page** (`/account/tickets/[ticketId]`): Full-size QR (192px) encoding `ticketCode`
- **Checkout success page**: Small QR (64px) next to each ticket in order confirmation
- QR encodes the `ticketCode` string (format: `TKT-XXXX-XXXX`)

## Team Management

### Invitation Flow

1. OWNER/ADMIN invites via email → `TenantInvitation` created with 7-day expiry token
2. SendGrid sends email with invite link (`/invite/[token]`)
3. Recipient clicks link → redirected to signin if not authenticated
4. Authenticated user sees invitation details → clicks "Accept"
5. `TenantMember` created, invitation marked ACCEPTED, user redirected to dashboard

### Server Actions (`app/actions/tenant-members.ts`)

- `getTeamMembersAction(subdomain)` — requires MANAGER+
- `inviteTeamMemberAction(subdomain, data)` — requires ADMIN+
- `updateTeamMemberAction(subdomain, memberId, data)` — OWNER for role changes, ADMIN for title/visibility
- `removeTeamMemberAction(subdomain, memberId)` — cannot remove self or OWNER
- `toggleMemberProfileVisibilityAction(memberId, visible)` — user toggles own `userShowInProfile`
- `getPendingInvitationsAction(subdomain)` — requires ADMIN+
- `revokeInvitationAction(subdomain, invitationId)` — requires ADMIN+

### Validation Schemas (`lib/validations/team.ts`)

- `inviteMemberSchema`: email, role (ADMIN/MANAGER/MEMBER), optional title
- `updateMemberSchema`: optional role, title, tenantShowInProfile

### Email (`lib/email.ts`)

- Uses SendGrid (`@sendgrid/mail`)
- Graceful fallback: logs to console when `SENDGRID_API_KEY` not set
- Env vars: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`

## Important Constraints

1. **Subdomain-based tenant routing**: Tenant pages served via `tenant.domain.com/*`, proxy rewrites to internal `/t/[tenant]/*`
2. **Admin subdomain**: Admin panel on `admin.domain.com`
3. **Edge Runtime limitations**: The proxy cannot access Prisma, database, or full Node.js APIs
4. **Tenant validation in components**: Always validate tenants in Server Components, not in the proxy
5. **JWT sessions required**: Credentials provider requires JWT strategy, not database sessions
6. **Prisma 7 specific**: Must use `prisma.config.ts` and custom client output path
7. **Multi-tenant unique constraints**: Users can have one application per tenant
8. **Cross-domain links**: Use `tenantUrl()` / `mainUrl()` helpers; use `<a>` not `<Link>` for cross-domain nav
9. **Cookie domain**: Set via `AUTH_URL` → `.lvh.me` in dev, `.portl.com` in prod; shared across all subdomains

## Current Implementation Status

**Completed**:
- User authentication system (credentials-based)
- Multi-tenant tenant model with `TenantMember` role-based access
- Tenant-scoped roles (OWNER, ADMIN, MANAGER, MEMBER) via `TenantMember` join table
- Team management UI with invite/edit/remove member functionality
- Email invitations via SendGrid with token-based accept flow (`/invite/[token]`)
- Organizer application flow (3-step form) with admin approval
- Admin approval creates `TenantMember(OWNER)` + sets tenant ACTIVE
- Progress saving and resume capability
- Tenant-scoped applications
- Account affiliations section with visibility toggles
- Basic UI components
- Attendee account area (`/account/*`) with tickets and orders
- Navbar user dropdown with space switching
- Dashboard auto-redirect for single-tenant users
- Event creation and management (CRUD)
- Tables management (single + bulk creation)
- Ticket types with table associations
- Ticket type edit restrictions (sales protection)
- Price tiers (time window + allocation strategies)
- Promotions with voucher codes
- Public events pages with subdomain-based routing
- Checkout flow with PayMongo payment integration
- Order and ticket creation via webhooks
- Ticket QR codes on detail page and checkout success
- Ticket detail page with attendee info, event details, QR code

**Not Yet Implemented**:
- Ticket check-in / QR scanning
- Analytics dashboard
- OAuth providers (Google, GitHub) - configured but commented out

## References

See these project-specific docs for detailed information:
- `ORGANIZER_FLOW.md`: Complete organizer application implementation guide
- `SETUP_FIXES_SUMMARY.md`: Database, auth, and multi-tenancy setup details
- `README.md`: General project overview and getting started
