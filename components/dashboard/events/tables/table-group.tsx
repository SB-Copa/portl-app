'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import type { TableItem } from './types';
import { getTableInventory } from './table-utils';
import { TableStatusBadge } from './table-status-badge';
import { TableActions } from './table-actions';

interface TableGroupProps {
  groupName: string;
  tables: TableItem[];
  isOpen: boolean;
  onToggle: () => void;
  isDeleting: string | null;
  isRegenerating: string | null;
  isPending: boolean;
  onEdit: (table: TableItem) => void;
  onRegenerateSeats: (tableId: string) => void;
  onToggleStatus: (tableId: string, currentStatus: string) => void;
  onDelete: (tableId: string) => void;
}

export function TableGroup({
  groupName,
  tables,
  isOpen,
  onToggle,
  isDeleting,
  isRegenerating,
  isPending,
  onEdit,
  onRegenerateSeats,
  onToggleStatus,
  onDelete,
}: TableGroupProps) {
  // Aggregate inventory for the group
  let groupTotalQty = 0;
  let groupTotalSold = 0;
  let groupHasUnlimited = false;
  for (const t of tables) {
    const inv = getTableInventory(t);
    if (inv.totalQty !== null) {
      groupTotalQty += inv.totalQty;
      groupTotalSold += inv.totalSold!;
      if (inv.hasUnlimited) groupHasUnlimited = true;
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
              <span className="font-medium">{groupName}</span>
              <span className="text-sm text-muted-foreground">
                ({tables.length} table{tables.length !== 1 ? 's' : ''})
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mr-2">
              {groupTotalQty > 0 || groupHasUnlimited ? (
                <>
                  <span>Qty: {groupHasUnlimited ? `${groupTotalQty}+` : groupTotalQty}</span>
                  <span>Available: {groupHasUnlimited ? `${groupTotalQty - groupTotalSold}+` : groupTotalQty - groupTotalSold}</span>
                  <span>Sold: {groupTotalSold}</span>
                </>
              ) : (
                <span>No ticket types</span>
              )}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Total Qty</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => {
                  const inv = getTableInventory(table);
                  return (
                    <TableRow key={table.id}>
                      <TableCell className="font-medium">{table.label}</TableCell>
                      <TableCell>
                        <Badge variant={table.mode === 'EXCLUSIVE' ? 'default' : 'secondary'}>
                          {table.mode === 'EXCLUSIVE' ? 'Exclusive' : 'Shared'}
                        </Badge>
                      </TableCell>
                      <TableCell>{table.capacity}</TableCell>
                      <TableCell>
                        {inv.totalQty !== null ? (inv.hasUnlimited ? `${inv.totalQty}+` : inv.totalQty) : <span className="text-muted-foreground">&mdash;</span>}
                      </TableCell>
                      <TableCell>
                        {inv.totalAvailable !== null ? (inv.hasUnlimited ? `${inv.totalAvailable}+` : inv.totalAvailable) : <span className="text-muted-foreground">&mdash;</span>}
                      </TableCell>
                      <TableCell>
                        {inv.totalSold !== null ? inv.totalSold : <span className="text-muted-foreground">&mdash;</span>}
                      </TableCell>
                      <TableCell><TableStatusBadge table={table} /></TableCell>
                      <TableCell>
                        <TableActions
                          table={table}
                          isDeleting={isDeleting === table.id}
                          isRegenerating={isRegenerating === table.id}
                          isPending={isPending}
                          onEdit={onEdit}
                          onRegenerateSeats={onRegenerateSeats}
                          onToggleStatus={onToggleStatus}
                          onDelete={onDelete}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
