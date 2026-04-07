'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pencil, Tag, Trash2, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { formatPhp } from '@/lib/format';
import { kindLabels, kindColors } from './constants';
import { TicketTypeStatusBadge } from './ticket-type-status-badge';
import type { TicketType } from './types';

interface TicketTypeGroupProps {
  kind: string;
  items: TicketType[];
  isOpen: boolean;
  onToggle: () => void;
  onEdit: (ticketTypeId: string) => void;
  onOpenPriceTiers: (ticketTypeId: string) => void;
  onToggleStatus: (ticketTypeId: string, currentStatus: string) => void;
  onDelete: (ticketTypeId: string) => void;
  isPending: boolean;
  isDeleting: string | null;
}

export function TicketTypeGroup({
  kind,
  items,
  isOpen,
  onToggle,
  onEdit,
  onOpenPriceTiers,
  onToggleStatus,
  onDelete,
  isPending,
  isDeleting,
}: TicketTypeGroupProps) {
  const totalQty = items.reduce((sum, tt) => sum + (tt.quantityTotal ?? 0), 0);
  const totalSold = items.reduce((sum, tt) => sum + tt.quantitySold, 0);
  const totalAvailable = totalQty - totalSold;
  const hasUnlimited = items.some((tt) => tt.quantityTotal === null);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
              <Badge className={kindColors[kind]}>{kindLabels[kind]}</Badge>
              <span className="text-sm text-muted-foreground">
                ({items.length})
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mr-2">
              <span>Qty: {hasUnlimited ? `${totalQty}+` : totalQty}</span>
              <span>Available: {hasUnlimited ? `${totalAvailable}+` : totalAvailable}</span>
              <span>Sold: {totalSold}</span>
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Total Qty</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price Tiers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((ticketType) => {
                  const available = ticketType.quantityTotal !== null
                    ? ticketType.quantityTotal - ticketType.quantitySold
                    : null;

                  return (
                    <TableRow key={ticketType.id}>
                      <TableCell className="font-medium">{ticketType.name}</TableCell>
                      <TableCell>{formatPhp(ticketType.basePrice)}</TableCell>
                      <TableCell>
                        {ticketType.quantityTotal ?? <span className="text-muted-foreground">Unlimited</span>}
                      </TableCell>
                      <TableCell>
                        {available !== null ? available : <span className="text-muted-foreground">Unlimited</span>}
                      </TableCell>
                      <TableCell>{ticketType.quantitySold}</TableCell>
                      <TableCell>
                        <TicketTypeStatusBadge
                          status={ticketType.status}
                          quantityTotal={ticketType.quantityTotal}
                          quantitySold={ticketType.quantitySold}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto"
                          onClick={() => onOpenPriceTiers(ticketType.id)}
                        >
                          {ticketType.priceTiers.length} tier{ticketType.priceTiers.length !== 1 ? 's' : ''}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(ticketType.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenPriceTiers(ticketType.id)}
                          >
                            <Tag className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleStatus(ticketType.id, ticketType.status)}
                            disabled={isPending}
                            title={ticketType.status === 'HIDDEN' ? 'Show ticket type' : 'Hide ticket type'}
                          >
                            {ticketType.status === 'HIDDEN' ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(ticketType.id)}
                            disabled={isDeleting === ticketType.id || ticketType.quantitySold > 0}
                            className="text-destructive hover:text-destructive"
                            title={ticketType.quantitySold > 0 ? `Cannot delete: ${ticketType.quantitySold} tickets sold` : 'Delete ticket type'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
