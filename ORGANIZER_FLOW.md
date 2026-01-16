# Organizer Application Flow - Implementation Guide

## Overview

This document describes the complete organizer onboarding flow implementation for the multi-tenant Portl platform.

## What's Been Implemented

### 1. Database Schema Updates

**New Models:**
- `OrganizerApplication` - Stores organizer application data
  - Tracks application status (NOT_STARTED, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED)
  - Stores organizer type, description, event portfolio, and compliance acknowledgement
  - Unique constraint per user per tenant (multi-tenant support)

**Updated Models:**
- `User` - Added `role` field (USER, ORGANIZER, ADMIN)
- `Tenant` - Added relationship to organizer applications

**Enums:**
- `UserRole` - USER, ORGANIZER, ADMIN
- `OrganizerApplicationStatus` - NOT_STARTED, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED
- `OrganizerType` - INDIVIDUAL, TEAM, COMPANY

### 2. UI Components

**New Components:**
- `components/ui/stepper.tsx` - Step indicator component
- `components/ui/badge.tsx` - Status badges
- `components/ui/textarea.tsx` - Text area input
- `components/ui/checkbox.tsx` - Checkbox input
- `components/ui/radio-group.tsx` - Radio button group

**Form Components:**
- `components/organizer/organizer-type-form.tsx` - Step 1 form
- `components/organizer/event-portfolio-form.tsx` - Step 2 form
- `components/organizer/compliance-form.tsx` - Step 3 form

### 3. Pages & Routes

**Organizer Pages:**
- `app/[tenant]/organizer/dashboard/page.tsx` - Main organizer dashboard
  - Shows application status
  - Displays progress stepper
  - Shows CTA for new applications
- `app/[tenant]/organizer/apply/page.tsx` - Application flow
  - Multi-step form
  - Progress saving
  - Resume capability

**API Routes:**
- `app/api/organizer/application/route.ts` - Application CRUD operations
- `app/api/organizer/tenant/route.ts` - Tenant lookup/creation

### 4. Authentication Updates

**Enhanced Auth:**
- Session now includes user role
- Role fetched from database on each session request
- TypeScript types updated for role support

## User Flow

### Phase 1: Account Creation (Already Complete)
1. User signs up or logs in
2. Default role assigned: `USER`

### Phase 2: Organizer Application

#### Step 1: Organizer Type Selection
- **Purpose:** Understand organizer type
- **Fields:**
  - Organizer type (required): Individual, Team, or Company
  - Description (optional): Brief background
- **Actions:** Save & Continue, Save & Exit

#### Step 2: Event Portfolio
- **Purpose:** Validate experience and intent
- **Fields:**
  - Have you organized events before? (Yes/No)
  - If Yes: Event name, type, year (multiple entries allowed)
  - If No: Planned event type, expected timeframe
- **Actions:** Save & Continue, Save & Exit, Add Another Event

#### Step 3: Compliance & Acknowledgement
- **Purpose:** Set expectations and get consent
- **Required Checkboxes:**
  - Platform terms & conditions
  - Event compliance confirmation
  - Future verification acknowledgement
- **Action:** Confirm & Submit

### Post-Submission
- Application status changes to `SUBMITTED`
- User role remains `USER` (locked until approval)
- Dashboard shows "Under Review" status
- Event creation tools remain hidden

## Multi-Tenant Support

The implementation fully supports multi-tenancy:
- Each tenant has its own set of organizer applications
- Users can apply to become organizers on different tenants
- Application data is scoped per tenant
- Unique constraint: one application per user per tenant

## API Endpoints

### GET `/api/organizer/application?tenantId={id}`
Fetches or creates an application for the current user and tenant.

**Response:**
```json
{
  "id": "app_123",
  "userId": "user_123",
  "tenantId": "tenant_123",
  "status": "IN_PROGRESS",
  "currentStep": 2,
  "organizerType": "INDIVIDUAL",
  "organizerDescription": "...",
  "eventPortfolio": [...],
  "complianceAcknowledged": false
}
```

### POST `/api/organizer/application`
Saves application progress or submits the application.

**Request:**
```json
{
  "tenantId": "tenant_123",
  "step": 1,
  "data": {
    "organizerType": "INDIVIDUAL",
    "organizerDescription": "..."
  },
  "shouldExit": false
}
```

### GET `/api/organizer/tenant?subdomain={name}`
Gets or creates a tenant by subdomain.

## Database Migration

To apply the schema changes:

```bash
# Generate Prisma client with new schema
pnpm prisma generate

# Create and apply migration
pnpm prisma migrate dev --name add_organizer_applications

# Or for production
pnpm prisma migrate deploy
```

## Testing the Flow

### 1. Local Development Setup

```bash
# Install dependencies
pnpm install

# Set up database
pnpm prisma migrate dev

# Start development server
pnpm dev
```

### 2. Test Scenarios

**Scenario A: New User Application**
1. Sign in as a new user
2. Navigate to `{tenant}.localhost:3000`
3. Click "Dashboard" or "Get Started"
4. Click "Start Application"
5. Complete Step 1, click "Save & Continue"
6. Complete Step 2, click "Save & Continue"
7. Complete Step 3, click "Confirm & Submit"
8. Verify dashboard shows "Under Review" status

**Scenario B: Resume Application**
1. Start application (Step 1)
2. Click "Save & Exit"
3. Navigate away
4. Return to dashboard
5. Click "Continue Application"
6. Verify you're at Step 2

**Scenario C: Multi-Tenant**
1. Apply as organizer on `tenant1.localhost:3000`
2. Navigate to `tenant2.localhost:3000`
3. Verify separate application exists
4. Complete both applications independently

## Next Steps (Future Phases)

### Phase 3: Admin Review (Not Implemented)
- Admin panel for reviewing applications
- Approve/reject functionality
- Review notes and feedback
- Email notifications

### Phase 4: Organizer Features (Not Implemented)
- Event creation interface
- Ticketing configuration
- Analytics dashboard
- Payout management

## File Structure

```
app/
├── [tenant]/
│   ├── organizer/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Main dashboard
│   │   └── apply/
│   │       └── page.tsx          # Application form
│   └── page.tsx                  # Updated with CTA
├── api/
│   └── organizer/
│       ├── application/
│       │   └── route.ts          # Application API
│       └── tenant/
│           └── route.ts          # Tenant lookup
components/
├── organizer/
│   ├── organizer-type-form.tsx   # Step 1
│   ├── event-portfolio-form.tsx  # Step 2
│   └── compliance-form.tsx       # Step 3
└── ui/
    ├── stepper.tsx               # Progress stepper
    ├── badge.tsx                 # Status badges
    ├── checkbox.tsx              # Checkbox input
    ├── radio-group.tsx           # Radio buttons
    └── textarea.tsx              # Text area
prisma/
└── schema.prisma                 # Updated schema
```

## Configuration Notes

### Environment Variables
No new environment variables required. Uses existing:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- Auth provider credentials

### Dependencies Added
- `@radix-ui/react-checkbox`: ^1.1.2
- `@radix-ui/react-radio-group`: ^1.2.2

## Troubleshooting

### Issue: Application not saving
- Check browser console for API errors
- Verify tenant ID is being passed correctly
- Ensure user is authenticated

### Issue: Stepper not updating
- Verify currentStep is being updated in database
- Check that step completion logic is correct
- Ensure page is refreshing application data

### Issue: Multi-tenant routing not working
- Verify middleware configuration
- Check subdomain DNS/hosts file
- Ensure tenant exists in database

## Security Considerations

- All API routes check authentication
- Applications are scoped per user per tenant
- Role elevation requires admin approval (future phase)
- Form data is validated on both client and server

## Performance Notes

- Applications are cached per request
- Tenant lookup uses unique index
- Database queries use composite indexes
- Progress auto-saves to prevent data loss

---

**Implementation Date:** January 2026  
**Status:** Phase 2 Complete  
**Next Phase:** Admin Review & Approval System
