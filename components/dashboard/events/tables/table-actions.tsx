'use client';

import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, Edit, Eye, EyeOff } from 'lucide-react';
import type { TableItem } from './types';

interface TableActionsProps {
  table: TableItem;
  isDeleting: boolean;
  isRegenerating: boolean;
  isPending: boolean;
  onEdit: (table: TableItem) => void;
  onRegenerateSeats: (tableId: string) => void;
  onToggleStatus: (tableId: string, currentStatus: string) => void;
  onDelete: (tableId: string) => void;
}

export function TableActions({
  table,
  isDeleting,
  isRegenerating,
  isPending,
  onEdit,
  onRegenerateSeats,
  onToggleStatus,
  onDelete,
}: TableActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(table)}
        aria-label="Edit table"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRegenerateSeats(table.id)}
        disabled={isRegenerating}
        aria-label="Regenerate seats"
      >
        <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggleStatus(table.id, table.status)}
        disabled={isPending}
        title={table.status === 'HIDDEN' ? 'Show table' : 'Hide table'}
        aria-label={table.status === 'HIDDEN' ? 'Show table' : 'Hide table'}
      >
        {table.status === 'HIDDEN' ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(table.id)}
        disabled={isDeleting}
        className="text-destructive hover:text-destructive"
        aria-label="Delete table"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
