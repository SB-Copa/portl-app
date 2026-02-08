# Admin Applications Module

## Overview
A comprehensive admin module for managing organizer applications with full CRUD capabilities, status management, and detailed application review.

## Features

### 1. **Applications Dashboard** (`/admin/applications`)
- View all organizer applications in a sortable, filterable data table
- Statistics cards showing:
  - Total applications
  - Submitted (needs review)
  - In Progress
  - Approved
  - Rejected
- Filter by:
  - Subdomain (search)
  - Status (dropdown)
- Pagination support

### 2. **Data Table**
- Built with TanStack Table (React Table v8)
- Columns:
  - Subdomain (monospace font)
  - Organization Name
  - Owner (name + email)
  - Organizer Type (Individual/Team/Company)
  - Status (with color-coded badges)
  - Progress (Step X/3)
  - Submitted date (relative time)
  - Actions dropdown
- Responsive design
- Sorting and filtering built-in

### 3. **Application Details Dialog**
View complete application information:
- **Status**: Current application status with badge
- **Organization Info**: Subdomain, name, business email, phone, tenant status
- **Owner Info**: Name and email of the tenant owner
- **Application Details**:
  - Organizer type
  - Organization description
  - Event portfolio (JSON display)
  - Compliance acknowledgment status
  - Current step progress
- **Timeline**: Created, updated, submitted, and reviewed dates
- **Review Notes**: Previous review notes (if any)
- **Actions**:
  - Change status (dropdown)
  - Add review notes
  - Quick approve/reject buttons (for submitted applications)

### 4. **Status Management**
Available statuses:
- `NOT_STARTED`: Application hasn't been started
- `IN_PROGRESS`: Organizer is filling out the application
- `SUBMITTED`: Application submitted and awaiting review
- `APPROVED`: Application approved (tenant becomes ACTIVE)
- `REJECTED`: Application rejected (tenant becomes INACTIVE)

### 5. **Admin Actions**
Server actions for managing applications:
- `getAllApplicationsAction()`: Fetch all applications with tenant/owner details
- `getApplicationByIdAction(id)`: Get single application details
- `updateApplicationStatusAction(id, status, notes)`: Update status
- `approveApplicationAction(id, notes)`: Quick approve
- `rejectApplicationAction(id, notes)`: Quick reject
- `deleteApplicationAction(id)`: Delete application and tenant

### 6. **Toast Notifications**
- Success messages for approvals
- Error messages for rejections
- Status update confirmations
- Using Sonner toast library

## File Structure

```
app/
├── actions/
│   └── admin.ts                    # Server actions for admin operations
├── admin/
│   ├── page.tsx                    # Admin dashboard home
│   └── applications/
│       └── page.tsx                # Applications management page

components/
└── admin/
    ├── applications-table-columns.tsx        # Table column definitions
    ├── applications-data-table.tsx           # Data table component
    └── application-details-dialog.tsx        # Detail view dialog
```

## Technologies Used

- **Next.js 15**: App Router, Server Components, Server Actions
- **React**: Client components for interactive features
- **TanStack Table**: Powerful data table with sorting/filtering
- **shadcn/ui**: UI components (Table, Dialog, Badge, Button, Select, etc.)
- **Prisma**: Database ORM
- **Sonner**: Toast notifications
- **date-fns**: Date formatting
- **Lucide React**: Icons

## Usage

### Access the Applications Module
1. Navigate to `http://admin.portl.local:3000`
2. Click on "Applications" card
3. Or go directly to `http://admin.portl.local:3000/applications`

### Review an Application
1. Find the application in the table
2. Click the three-dot menu (⋮) in the Actions column
3. Select "View Details"
4. Review all information
5. Add review notes (optional)
6. Click "Approve" or "Reject"

### Change Application Status
1. Open application details
2. Select new status from dropdown
3. Add review notes (optional)
4. Click "Update Status"

### Filter Applications
- Use the search box to filter by subdomain
- Use the status dropdown to filter by application status
- Combine filters for precise results

## Database Schema

The module uses the `OrganizerApplication` model:
```prisma
model OrganizerApplication {
  id                      String
  tenantId                String
  status                  OrganizerApplicationStatus
  currentStep             Int
  organizerType           OrganizerType?
  organizerDescription    String?
  eventPortfolio          Json?
  complianceAcknowledged  Boolean
  submittedAt             DateTime?
  reviewedAt              DateTime?
  reviewedBy              String?
  reviewNotes             String?
  createdAt               DateTime
  updatedAt               DateTime
}
```

## Future Enhancements

Potential features to add:
- [ ] Bulk actions (approve/reject multiple)
- [ ] Export to CSV
- [ ] Email notifications to organizers
- [ ] Application history/audit log
- [ ] Advanced search and filters
- [ ] Comments/discussion thread per application
- [ ] File attachments support
- [ ] Custom review workflow stages

## Notes

- Approved applications automatically set the tenant status to `ACTIVE`
- Rejected applications set the tenant status to `INACTIVE`
- All actions are revalidated automatically to keep data fresh
- The module includes proper loading states and error handling
- Toast notifications provide user feedback for all actions
