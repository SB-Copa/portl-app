import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  quantityTotal: number | null;
  quantitySold: number;
}

export function TicketTypeStatusBadge({ status, quantityTotal, quantitySold }: StatusBadgeProps) {
  if (status === 'HIDDEN') {
    return <Badge variant="outline">Hidden</Badge>;
  }
  if (status === 'CLOSED') {
    return <Badge variant="secondary">Closed</Badge>;
  }
  if (quantityTotal !== null && quantitySold >= quantityTotal) {
    return <Badge variant="destructive">Sold Out</Badge>;
  }
  return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Open</Badge>;
}
