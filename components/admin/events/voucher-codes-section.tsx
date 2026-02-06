'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VoucherCodeForm } from './voucher-code-form';
import { Plus, Trash2, Copy } from 'lucide-react';
import { Promotion, Prisma } from '@/prisma/generated/prisma/client';
import { createVoucherCodeAction, deleteVoucherCodeAction } from '@/app/actions/events';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type PromotionWithCodes = Promotion & Prisma.PromotionGetPayload<{
  include: {
    voucherCodes: true;
  };
}>;

interface VoucherCodesSectionProps {
  promotion: PromotionWithCodes;
}

export function VoucherCodesSection({ promotion }: VoucherCodesSectionProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateVoucherCode = async (data: any) => {
    const result = await createVoucherCodeAction(promotion.id, data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Voucher code created successfully');
      setCreateDialogOpen(false);
      router.refresh();
    }
  };

  const handleDeleteVoucherCode = async (voucherCodeId: string) => {
    if (!confirm('Are you sure you want to delete this voucher code?')) {
      return;
    }
    const result = await deleteVoucherCodeAction(voucherCodeId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Voucher code deleted successfully');
      router.refresh();
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{promotion.name} - Voucher Codes</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage voucher codes for this promotion
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Voucher Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Voucher Code</DialogTitle>
              <DialogDescription>
                Add a new voucher code for this promotion
              </DialogDescription>
            </DialogHeader>
            <VoucherCodeForm
              promotionId={promotion.id}
              onSubmit={handleCreateVoucherCode}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {promotion.voucherCodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600 mb-4 text-center">
              No voucher codes created yet. Create your first voucher code to get started.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Voucher Code
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Voucher Codes</CardTitle>
            <CardDescription>
              {promotion.voucherCodes.length} code{promotion.voucherCodes.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Redemptions</TableHead>
                  <TableHead>Max Redemptions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotion.voucherCodes.map((code) => {
                  const isExhausted = code.maxRedemptions ? code.redeemedCount >= code.maxRedemptions : false;
                  return (
                    <TableRow key={code.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{code.code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(code.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{code.redeemedCount}</TableCell>
                      <TableCell>
                        {code.maxRedemptions ? code.maxRedemptions : 'Unlimited'}
                      </TableCell>
                      <TableCell>
                        {isExhausted ? (
                          <Badge className="bg-red-100 text-red-800">Exhausted</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteVoucherCode(code.id)}
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
