'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { OrganizerApplication, Prisma } from '@/prisma/generated/prisma/client';

type Application = OrganizerApplication & Prisma.OrganizerApplicationGetPayload<{
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
  };
}>;

const statusColors = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const statusLabels = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const columns: ColumnDef<Application>[] = [
  {
    accessorKey: 'tenant.subdomain',
    header: 'Subdomain',
    cell: ({ row }) => {
      const subdomain = row.original.tenant.subdomain;
      const applicationId = row.original.id;
      return (
        <Link
          href={`/applications/${applicationId}`}
          className="font-mono text-sm hover:underline text-blue-600"
        >
          {subdomain}
        </Link>
      );
    },
  },
  {
    accessorKey: 'tenant.name',
    header: 'Organization Name',
    cell: ({ row }) => {
      const applicationId = row.original.id;
      return (
        <Link
          href={`/applications/${applicationId}`}
          className="font-medium hover:underline text-blue-600"
        >
          {row.original.tenant.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'tenant.owner',
    header: 'Owner',
    cell: ({ row }) => {
      const owner = row.original.tenant.owner;
      const name = owner.firstName && owner.lastName
        ? `${owner.firstName} ${owner.lastName}`
        : owner.email;
      return (
        <div className="flex flex-col">
          <span className="text-sm">{name}</span>
          <span className="text-xs text-gray-500">{owner.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status as keyof typeof statusColors;
      return (
        <Badge className={statusColors[status]}>
          {statusLabels[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'currentStep',
    header: 'Progress',
    cell: ({ row }) => {
      const step = row.original.currentStep;
      const status = row.original.status;
      
      if (status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED') {
        return <span className="text-sm text-gray-500">Completed</span>;
      }
      
      return <span className="text-sm text-gray-500">Step {step}/3</span>;
    },
  },
  {
    accessorKey: 'submittedAt',
    header: 'Submitted',
    cell: ({ row }) => {
      const submittedAt = row.original.submittedAt;
      if (!submittedAt) return <span className="text-gray-400">—</span>;
      return (
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const application = row.original;
      const meta = table.options.meta as any;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/applications/${application.id}`}>
                View Details
              </Link>
            </DropdownMenuItem>
            {application.status === 'SUBMITTED' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => meta?.onApprove(application)}
                  className="text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => meta?.onReject(application)}
                  className="text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
