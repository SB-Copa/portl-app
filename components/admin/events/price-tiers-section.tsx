'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PriceTierForm } from './price-tier-form';
import { Plus, Trash2, Clock, Package } from 'lucide-react';
import { TicketType, Prisma } from '@/prisma/generated/prisma/client';
import { createPriceTierAction, deletePriceTierAction } from '@/app/actions/events';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type TicketTypeWithTiers = TicketType & Prisma.TicketTypeGetPayload<{
  include: {
    priceTiers: true;
  };
}>;

interface PriceTiersSectionProps {
  ticketType: TicketTypeWithTiers;
}

const strategyLabels = {
  TIME_WINDOW: 'Time Window',
  ALLOCATION: 'Allocation',
};

export function PriceTiersSection({ ticketType }: PriceTiersSectionProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreatePriceTier = async (data: any) => {
    const result = await createPriceTierAction(ticketType.id, data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Price tier created successfully');
      setCreateDialogOpen(false);
      router.refresh();
    }
  };

  const handleDeletePriceTier = async (priceTierId: string) => {
    if (!confirm('Are you sure you want to delete this price tier?')) {
      return;
    }
    const result = await deletePriceTierAction(priceTierId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Price tier deleted successfully');
      router.refresh();
    }
  };

  // Determine active tier (simplified - in production, check time windows and allocations)
  const getActiveTier = () => {
    const now = new Date();
    return ticketType.priceTiers.find(tier => {
      if (tier.strategy === 'TIME_WINDOW' && tier.startsAt && tier.endsAt) {
        return new Date(tier.startsAt) <= now && now <= new Date(tier.endsAt);
      }
      if (tier.strategy === 'ALLOCATION' && tier.allocationTotal) {
        return tier.allocationSold < tier.allocationTotal;
      }
      return false;
    });
  };

  const activeTier = getActiveTier();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{ticketType.name} - Price Tiers</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage pricing tiers for this ticket type
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Price Tier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Price Tier</DialogTitle>
              <DialogDescription>
                Add a new price tier (e.g., Early Bird, Regular, Door)
              </DialogDescription>
            </DialogHeader>
            <PriceTierForm
              ticketTypeId={ticketType.id}
              onSubmit={handleCreatePriceTier}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {ticketType.priceTiers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4 text-center">
              No price tiers created yet. Create your first price tier to get started.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Price Tier
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Price Tiers</CardTitle>
            <CardDescription>
              {ticketType.priceTiers.length} tier{ticketType.priceTiers.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketType.priceTiers
                  .sort((a, b) => b.priority - a.priority)
                  .map((tier) => {
                    const isActive = activeTier?.id === tier.id;
                    return (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">{tier.name}</TableCell>
                        <TableCell>
                          ₱{tier.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {strategyLabels[tier.strategy]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tier.strategy === 'TIME_WINDOW' && tier.startsAt && tier.endsAt ? (
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(tier.startsAt).toLocaleDateString()} - {new Date(tier.endsAt).toLocaleDateString()}
                              </div>
                            </div>
                          ) : tier.strategy === 'ALLOCATION' && tier.allocationTotal ? (
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {tier.allocationSold}/{tier.allocationTotal}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{tier.priority}</TableCell>
                        <TableCell>
                          {isActive ? (
                            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePriceTier(tier.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
