import { Badge } from '@/components/ui/badge';
import type { TableItem } from './types';

export function TableStatusBadge({ table }: { table: TableItem }) {
  if (table.status === 'HIDDEN') {
    return <Badge variant="outline">Hidden</Badge>;
  }
  if (table.status === 'CLOSED') {
    return <Badge variant="secondary">Closed</Badge>;
  }
  // Sold out: all associated ticket types are sold out
  if (table.ticketTypes.length > 0) {
    const allSoldOut = table.ticketTypes.every(
      (tt) => tt.quantityTotal !== null && tt.quantitySold >= tt.quantityTotal
    );
    if (allSoldOut) {
      return <Badge variant="destructive">Sold Out</Badge>;
    }
  }
  return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Open</Badge>;
}
