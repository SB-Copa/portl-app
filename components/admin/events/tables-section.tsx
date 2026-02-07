'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TableForm } from './table-form';
import { BulkTableForm } from './bulk-table-form';
import { SeatsList } from './seats-list';
import { Plus, Package } from 'lucide-react';
import { Event, Prisma } from '@/prisma/generated/prisma/client';
import { createTableAction, bulkCreateTablesAction, deleteTableAction, updateTableCapacityAction, regenerateSeatsAction } from '@/app/actions/events';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type EventWithTables = Event & Prisma.EventGetPayload<{
  include: {
    tables: {
      include: {
        seats: true;
        _count: {
          select: {
            ticketTypes: true;
          };
        };
      };
    };
  };
}>;

interface TablesSectionProps {
  event: EventWithTables;
}

export function TablesSection({ event }: TablesSectionProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [seatsDialogOpen, setSeatsDialogOpen] = useState<string | null>(null);

  const handleCreateTable = async (data: any) => {
    const result = await createTableAction(event.id, data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Table created successfully');
      setCreateDialogOpen(false);
      router.refresh();
    }
  };

  const handleBulkCreate = async (data: any) => {
    const result = await bulkCreateTablesAction(event.id, data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Tables created successfully');
      setBulkDialogOpen(false);
      router.refresh();
    }
    return result;
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table? This will also delete all seats.')) {
      return;
    }
    const result = await deleteTableAction(tableId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Table deleted successfully');
      router.refresh();
    }
  };

  const handleRegenerateSeats = async (tableId: string) => {
    const result = await regenerateSeatsAction(tableId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Seats regenerated successfully');
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Tables & Seats</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tables and their seat configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Bulk Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Create Tables</DialogTitle>
                <DialogDescription>
                  Create multiple tables at once (e.g., A1-A10)
                </DialogDescription>
              </DialogHeader>
              <BulkTableForm
                eventId={event.id}
                onSubmit={handleBulkCreate}
                onCancel={() => setBulkDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Table
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Table</DialogTitle>
                <DialogDescription>
                  Add a new table to this event
                </DialogDescription>
              </DialogHeader>
              <TableForm
                eventId={event.id}
                onSubmit={handleCreateTable}
                onCancel={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {event.tables.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4 text-center">
              No tables created yet. Create your first table to get started.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Table
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Tables</CardTitle>
            <CardDescription>
              {event.tables.length} table{event.tables.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Min Spend</TableHead>
                  <TableHead>Ticket Types</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.tables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">{table.label}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{table.mode}</Badge>
                    </TableCell>
                    <TableCell>{table.capacity}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setSeatsDialogOpen(table.id)}
                      >
                        {table.seats.length} seats
                      </Button>
                    </TableCell>
                    <TableCell>
                      {table.minSpend ? `$${(table.minSpend / 100).toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell>{table._count.ticketTypes}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateSeats(table.id)}
                        >
                          Regenerate Seats
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTable(table.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {seatsDialogOpen && (
        <Dialog open={!!seatsDialogOpen} onOpenChange={(open) => !open && setSeatsDialogOpen(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Seats</DialogTitle>
              <DialogDescription>
                View and manage seats for this table
              </DialogDescription>
            </DialogHeader>
            {event.tables.find(t => t.id === seatsDialogOpen) && (
              <SeatsList
                table={event.tables.find(t => t.id === seatsDialogOpen)!}
                onRegenerate={handleRegenerateSeats}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
