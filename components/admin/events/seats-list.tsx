'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Table as TableModel, Seat } from '@/prisma/generated/prisma/client';

interface SeatsListProps {
  table: TableModel & { seats: Seat[] };
  onRegenerate: (tableId: string) => Promise<void>;
}

export function SeatsList({ table, onRegenerate }: SeatsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Table {table.label}</p>
          <p className="text-sm text-gray-600">
            {table.seats.length} seat{table.seats.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => onRegenerate(table.id)}
        >
          Regenerate Seats
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seat Index</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.seats.map((seat) => (
              <TableRow key={seat.id}>
                <TableCell className="font-medium">Seat {seat.seatIndex}</TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">Available</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
