'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createTableForTenantAction,
  bulkCreateTablesForTenantAction,
  deleteTableForTenantAction,
  updateTableForTenantAction,
  regenerateSeatsForTenantAction,
  updateTableStatusForTenantAction,
} from '@/app/actions/tenant-events';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import type { TableFormData } from '@/lib/validations/events';
import type { TablesSectionProps, TableItem } from './types';
import { groupTablesByTicketType, getSortedGroupNames } from './table-utils';
import { CreateTableDialog, BulkCreateTableDialog, EditTableDialog } from './table-dialogs';
import { EmptyTablesState } from './empty-tables-state';
import { TableGroup } from './table-group';

export function TablesSection({ event, tenantSubdomain }: TablesSectionProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const groupMap = groupTablesByTicketType(event.tables);
  const groupNames = getSortedGroupNames(groupMap);

  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(groupNames));

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleCreateTable = async (data: TableFormData) => {
    const result = await createTableForTenantAction(tenantSubdomain, event.id, data);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      toast.success('Table created successfully');
      setCreateDialogOpen(false);
      router.refresh();
    }
  };

  const handleUpdateTable = async (data: TableFormData) => {
    if (!editingTable) return;
    const result = await updateTableForTenantAction(tenantSubdomain, editingTable.id, data);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      toast.success('Table updated successfully');
      setEditingTable(null);
      router.refresh();
    }
  };

  const handleBulkCreate = async (data: Parameters<typeof bulkCreateTablesForTenantAction>[2]) => {
    const result = await bulkCreateTablesForTenantAction(tenantSubdomain, event.id, data);
    if ('error' in result) {
      toast.error(result.error);
      return { error: result.error };
    } else {
      toast.success('Tables created successfully');
      setBulkDialogOpen(false);
      router.refresh();
      return { data: result.data };
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    setIsDeleting(tableId);
    const result = await deleteTableForTenantAction(tenantSubdomain, tableId);
    setIsDeleting(null);
    setDeleteTarget(null);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      toast.success('Table deleted successfully');
      router.refresh();
    }
  };

  const handleRegenerateSeats = async (tableId: string) => {
    setIsRegenerating(tableId);
    const result = await regenerateSeatsForTenantAction(tenantSubdomain, tableId);
    setIsRegenerating(null);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      toast.success('Seats regenerated successfully');
      router.refresh();
    }
  };

  const handleToggleStatus = (tableId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'HIDDEN' ? 'OPEN' : 'HIDDEN';
    startTransition(async () => {
      const result = await updateTableStatusForTenantAction(tenantSubdomain, tableId, newStatus);
      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success(newStatus === 'HIDDEN' ? 'Table hidden' : 'Table visible');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Tables & Seats</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tables and their seat configurations for this event
          </p>
        </div>
        <div className="flex gap-2">
          <BulkCreateTableDialog
            open={bulkDialogOpen}
            onOpenChange={setBulkDialogOpen}
            onSubmit={handleBulkCreate}
          />
          <CreateTableDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSubmit={handleCreateTable}
          />
        </div>
      </div>

      {event.tables.length === 0 ? (
        <EmptyTablesState
          onBulkCreate={() => setBulkDialogOpen(true)}
          onAddTable={() => setCreateDialogOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {groupNames.map((groupName) => (
            <TableGroup
              key={groupName}
              groupName={groupName}
              tables={groupMap.get(groupName)!}
              isOpen={openGroups.has(groupName)}
              onToggle={() => toggleGroup(groupName)}
              isDeleting={isDeleting}
              isRegenerating={isRegenerating}
              isPending={isPending}
              onEdit={setEditingTable}
              onRegenerateSeats={handleRegenerateSeats}
              onToggleStatus={handleToggleStatus}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete table"
        description="Are you sure you want to delete this table? This will also delete all seats."
        confirmLabel="Delete"
        variant="destructive"
        loading={!!isDeleting}
        onConfirm={() => deleteTarget && handleDeleteTable(deleteTarget)}
      />

      <EditTableDialog
        editingTable={editingTable}
        onOpenChange={() => setEditingTable(null)}
        onSubmit={handleUpdateTable}
      />
    </div>
  );
}
