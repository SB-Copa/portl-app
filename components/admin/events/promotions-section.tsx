'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PromotionForm } from './promotion-form';
import { VoucherCodesSection } from './voucher-codes-section';
import { Plus, Trash2, Tag, Ticket } from 'lucide-react';
import { Event, Prisma } from '@/prisma/generated/prisma/client';
import { createPromotionAction, deletePromotionAction } from '@/app/actions/events';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type EventWithPromotions = Event & Prisma.EventGetPayload<{
  include: {
    promotions: {
      include: {
        voucherCodes: true;
        ticketTypes: true;
      };
    };
    ticketTypes: true;
  };
}>;

interface PromotionsSectionProps {
  event: EventWithPromotions;
}

const discountTypeLabels = {
  PERCENT: 'Percent',
  FIXED: 'Fixed Amount',
};

const appliesToLabels = {
  ORDER: 'Order',
  ITEM: 'Item',
};

export function PromotionsSection({ event }: PromotionsSectionProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [voucherCodesDialogOpen, setVoucherCodesDialogOpen] = useState<string | null>(null);

  const handleCreatePromotion = async (data: any) => {
    const result = await createPromotionAction(event.id, data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Promotion created successfully');
      setCreateDialogOpen(false);
      router.refresh();
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this promotion? This will also delete all voucher codes.')) {
      return;
    }
    const result = await deletePromotionAction(promotionId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Promotion deleted successfully');
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Promotions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage promotions and voucher codes for this event
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Promotion</DialogTitle>
              <DialogDescription>
                Add a new promotion with discount rules
              </DialogDescription>
            </DialogHeader>
            <PromotionForm
              eventId={event.id}
              ticketTypes={event.ticketTypes}
              onSubmit={handleCreatePromotion}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {event.promotions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600 mb-4 text-center">
              No promotions created yet. Create your first promotion to get started.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Promotion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Promotions</CardTitle>
            <CardDescription>
              {event.promotions.length} promotion{event.promotions.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Voucher Codes</TableHead>
                  <TableHead>Eligible Types</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell className="font-medium">{promotion.name}</TableCell>
                    <TableCell>
                      {promotion.discountType === 'PERCENT'
                        ? `${promotion.discountValue / 100}%`
                        : `$${(promotion.discountValue / 100).toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {discountTypeLabels[promotion.discountType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {appliesToLabels[promotion.appliesTo]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(promotion.validFrom).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(promotion.validUntil).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setVoucherCodesDialogOpen(promotion.id)}
                      >
                        {promotion.voucherCodes.length} code{promotion.voucherCodes.length !== 1 ? 's' : ''}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {promotion.ticketTypes.length > 0 ? (
                        <span className="text-sm">{promotion.ticketTypes.length} type{promotion.ticketTypes.length !== 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-sm text-gray-400">All types</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVoucherCodesDialogOpen(promotion.id)}
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          Codes
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePromotion(promotion.id)}
                        >
                          <Trash2 className="h-3 w-3" />
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

      {voucherCodesDialogOpen && (
        <Dialog open={!!voucherCodesDialogOpen} onOpenChange={(open) => !open && setVoucherCodesDialogOpen(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Voucher Codes</DialogTitle>
              <DialogDescription>
                Manage voucher codes for this promotion
              </DialogDescription>
            </DialogHeader>
            {event.promotions.find(p => p.id === voucherCodesDialogOpen) && (
              <VoucherCodesSection
                promotion={event.promotions.find(p => p.id === voucherCodesDialogOpen)!}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
