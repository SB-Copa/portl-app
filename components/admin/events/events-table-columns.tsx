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
import { MoreHorizontal, Edit, Archive, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Event } from '@/prisma/generated/prisma/client';

const statusColors = {
  DRAFT: 'bg-muted text-muted-foreground',
  PUBLISHED: 'bg-green-500/20 text-green-400',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

const statusLabels = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: 'name',
    header: 'Event Name',
    cell: ({ row }) => {
      const eventId = row.original.id;
      return (
        <Link
          href={`/events/${eventId}`}
          className="font-medium hover:underline text-primary"
        >
          {row.original.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'venueName',
    header: 'Venue',
    cell: ({ row }) => {
      return <span className="text-sm">{row.original.venueName}</span>;
    },
  },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <span className="text-sm">
            {new Date(event.startDate).toLocaleDateString()} {event.startTime}
          </span>
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
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const event = row.original;

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
              <Link href={`/events/${event.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/events/${event.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            {event.status !== 'ARCHIVED' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/events/${event.id}`}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
