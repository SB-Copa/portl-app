# Tenant-Scoped Ticketing System Documentation

## Overview 

The Ticketing System provides a comprehensive interface for organizers (tenants) to manage their own events, tables, seats, ticket types, price tiers, and promotions. Each organizer manages their events independently through their tenant dashboard.

## Accessing Events Management

1. **Sign in** with your organizer account
2. Navigate to `/dashboard` to see your tenants
3. Click on a tenant to access the tenant dashboard
4. Click **Events** in the sidebar (only available for approved organizers)
5. Or navigate directly to `/dashboard/[tenant-subdomain]/events`

## Access Control

All event management pages and actions are protected:
- User must own the tenant (`tenant.ownerId === user.id`)
- Tenant application must be approved (`application.status === 'APPROVED'`)
- Unauthorized access attempts will redirect or show error messages
- All server actions verify tenant ownership before executing

## Getting Started

### 1. Run Database Migrations

Before using the ticketing system, ensure your database schema is up to date:

```bash
pnpm prisma:migrate
```

This will create all necessary tables:
- `events` (with `tenantId` foreign key)
- `tables`
- `seats`
- `ticket_types`
- `ticket_type_price_tiers`
- `promotions`
- `voucher_codes`
- `promotion_ticket_types`

### 2. Seed Sample Data (Optional)

To populate the database with sample data for testing:

```bash
pnpm prisma:seed
```

This creates:
- 1 test admin user (admin@example.com)
- 1 test tenant (test-org) with approved application
- 1 sample event (Summer Music Festival 2024) linked to the tenant
- 3 tables (2 EXCLUSIVE, 1 SHARED)
- Auto-generated seats for all tables
- 3 ticket types (GENERAL, TABLE, SEAT)
- 2 price tiers per ticket type
- 1 promotion with 2 voucher codes

**Note**: To access the seeded event, sign in as the admin user and navigate to `/dashboard/test-org/events`

## Creating an Event

1. Navigate to `/dashboard/[your-tenant-subdomain]/events`
2. Click **Create Event**
3. Fill in the form:
   - **Event Name**: Required
   - **Description**: Optional
   - **Venue Name**: Required
   - **Venue Address**: Optional
   - **Start Date & Time**: Required
   - **End Date & Time**: Required
   - **Timezone**: Select from dropdown (e.g., America/New_York)
   - **Status**: DRAFT, PUBLISHED, or ARCHIVED
4. Click **Create Event**

The event is automatically linked to your tenant.

### Event Status Workflow

- **DRAFT**: Event is being prepared, not visible to public
- **PUBLISHED**: Event is live and available
- **ARCHIVED**: Event is no longer active

## Managing Tables & Seats

### Creating a Single Table

1. Open an event detail page (`/dashboard/[tenant]/events/[id]`)
2. Go to the **Tables & Seats** tab
3. Click **Create Table**
4. Fill in:
   - **Table Label**: e.g., "A1", "B2", "VIP1"
   - **Capacity**: Number of seats (positive integer)
   - **Mode**: 
     - **EXCLUSIVE**: Sold as whole table only
     - **SHARED**: Seats can be sold individually
   - **Minimum Spend**: Optional, in cents (e.g., 50000 = $500.00)
   - **Notes**: Optional
5. Click **Create Table**

Seats are automatically generated (1 through capacity) when a table is created.

### Bulk Creating Tables

1. In the **Tables & Seats** tab, click **Bulk Create**
2. Fill in:
   - **Prefix**: e.g., "A", "B", "VIP"
   - **Start Number**: e.g., 1
   - **End Number**: e.g., 10
   - **Capacity**: Same for all tables
   - **Mode**: EXCLUSIVE or SHARED
   - **Minimum Spend**: Optional
3. Click **Create [N] Tables**

This creates tables from `[Prefix][Start]` to `[Prefix][End]` (e.g., A1-A10).

### Regenerating Seats

If you need to regenerate seats for a table (e.g., after changing capacity):

1. Find the table in the list
2. Click **Regenerate Seats**

**Note**: This will delete existing seats and create new ones. Use with caution if seats are already assigned (future feature).

### Viewing Seats

1. Click on the seat count for any table
2. A dialog will show all seats with their indices

## Creating Ticket Types

### General Ticket Type

1. Go to the **Ticket Types** tab
2. Click **Create Ticket Type**
3. Fill in:
   - **Name**: e.g., "General Admission"
   - **Kind**: Select **General**
   - **Currency**: 3-letter ISO code (e.g., "USD")
   - **Base Price**: In cents (e.g., 7500 = $75.00)
   - **Total Quantity**: Optional (leave empty for unlimited)
   - **On-Sale Window**: Optional start/end dates
   - **Transferrable**: Checkbox
   - **Cancellable**: Checkbox
4. Click **Create Ticket Type**

### Table Ticket Type

1. Create a ticket type with **Kind: Table**
2. **Table** field becomes required
3. Select an **EXCLUSIVE** or **SHARED** mode table
4. **Quantity Total** is automatically set to 1
5. Click **Create Ticket Type**

**Note**: TABLE ticket types must reference a table with EXCLUSIVE or SHARED mode.

### Seat Ticket Type

1. Create a ticket type with **Kind: Seat**
2. **Table** field becomes required
3. Select a **SHARED** or **EXCLUSIVE** mode table
4. **Quantity Total** is automatically set to the table's capacity
5. Click **Create Ticket Type**

**Note**: SEAT ticket types must reference a table with SHARED or EXCLUSIVE mode.

## Managing Price Tiers

Price tiers allow dynamic pricing based on time windows or allocation limits.

### Creating a Price Tier

1. In the **Ticket Types** tab, find a ticket type
2. Click **Tiers** button or the tier count
3. Click **Create Price Tier**
4. Fill in:
   - **Tier Name**: e.g., "Early Bird", "Regular", "Door"
   - **Price**: In cents
   - **Strategy**: 
     - **Time Window**: Active based on start/end dates
     - **Allocation**: Active based on allocation limit
   - **Priority**: Higher priority tiers take precedence (default: 0)
5. For **Time Window**:
   - **Start Date & Time**: Required
   - **End Date & Time**: Required
6. For **Allocation**:
   - **Allocation Total**: Required (e.g., 100 tickets)
7. Click **Create Price Tier**

### Active Tier Logic

- **Time Window**: Active if current time is between start and end dates
- **Allocation**: Active if `allocationSold < allocationTotal`
- If multiple tiers are active, the one with highest priority is used

## Managing Promotions

### Creating a Promotion

1. Go to the **Promotions** tab
2. Click **Create Promotion**
3. Fill in:
   - **Name**: e.g., "Summer Sale"
   - **Description**: Optional
   - **Discount Type**: 
     - **Percent**: Stored as basis points (1000 = 10%, max 10000 = 100%)
     - **Fixed Amount**: Stored in cents (5000 = $50.00)
   - **Discount Value**: Based on type selected
   - **Applies To**: 
     - **Order**: Discount applied to entire order
     - **Item**: Discount applied per ticket/item
   - **Requires Code**: Checkbox (code-based vs automatic)
   - **Valid From/Until**: Promotion validity period
   - **Max Redemptions**: Optional global limit
   - **Max Per User**: Optional per-user limit
   - **Eligible Ticket Types**: Optional multi-select (leave empty for all types)
4. Click **Create Promotion**

### Creating Voucher Codes

1. In the **Promotions** tab, find a promotion
2. Click **Codes** button or the code count
3. Click **Create Voucher Code**
4. Fill in:
   - **Code**: Alphanumeric, hyphens, underscores allowed (auto-uppercased)
   - **Max Redemptions**: Optional per-code limit
5. Click **Create Voucher Code**

**Note**: Voucher codes are globally unique across all promotions.

## Data Model Constraints

### Tables
- Table labels must be unique per event: `(eventId, label)`
- Seats are auto-generated when tables are created
- Changing table capacity regenerates all seats

### Ticket Types
- TABLE ticket types must reference EXCLUSIVE or SHARED tables
- SEAT ticket types must reference SHARED or EXCLUSIVE tables
- TABLE ticket types have `quantityTotal = 1`
- SEAT ticket types have `quantityTotal = table.capacity`

### Price Tiers
- Per ticket type (not event-wide)
- Priority determines which tier is active when multiple overlap
- TIME_WINDOW requires start and end dates
- ALLOCATION requires allocation total

### Promotions
- Event-scoped (within a tenant's event)
- Can be restricted to specific ticket types via join table
- Voucher codes are globally unique
- Supports both code-based and automatic promotions

## Money Storage

All monetary values are stored as **integer cents**:
- $75.00 → 7500 cents
- $500.00 → 50000 cents
- Percent discounts stored as **basis points**:
  - 10% → 1000 basis points
  - 20% → 2000 basis points
  - 100% → 10000 basis points (maximum)

## Common Workflows

### Setting Up a New Event

1. **Create Event** → Fill in basic info, set status to DRAFT
2. **Add Tables** → Create EXCLUSIVE tables for VIP, SHARED tables for general seating
3. **Create Ticket Types** → 
   - GENERAL for general admission
   - TABLE for each exclusive table
   - SEAT for shared tables
4. **Add Price Tiers** → Create Early Bird, Regular, Door tiers for each ticket type
5. **Create Promotions** → Add discounts with voucher codes if needed
6. **Publish Event** → Change status to PUBLISHED

### Bulk Setup Example

1. Create event "Summer Festival"
2. Bulk create tables: Prefix "A", Numbers 1-20, Capacity 6, Mode EXCLUSIVE
3. Bulk create tables: Prefix "S", Numbers 1-10, Capacity 10, Mode SHARED
4. Create GENERAL ticket type
5. Create TABLE ticket type for table A1
6. Create SEAT ticket type for table S1
7. Add Early Bird and Regular tiers to each ticket type
8. Create promotion with voucher codes

## Troubleshooting

### "Tenant application not approved"
- Your organizer application must be approved before you can manage events
- Check your application status at `/dashboard/[tenant]`
- Contact support if your application is stuck

### "Tenant not found or access denied"
- Ensure you own the tenant (you are the tenant owner)
- Verify you're accessing the correct tenant subdomain
- Sign out and sign back in to refresh session

### "Table is required for TABLE and SEAT ticket types"
- TABLE and SEAT ticket types must link to a table
- Ensure tables are created before ticket types

### "A table with this label already exists"
- Table labels must be unique per event
- Use a different label or check existing tables

### "A voucher code with this code already exists"
- Voucher codes are globally unique
- Use a different code

## Next Steps

This is v1 of the tenant-scoped ticketing system. Future enhancements may include:
- Orders & Tickets management (read-only placeholders ready)
- Guest assignment workflows for seat tickets
- Table groups/areas for better organization
- Advanced reporting and analytics
- Bulk operations for ticket types and promotions
- Client-facing checkout and purchase flows

## Support

For issues or questions, refer to the main project documentation or contact the development team.
