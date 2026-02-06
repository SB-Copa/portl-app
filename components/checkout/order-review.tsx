'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Tag, X } from 'lucide-react';
import { applyVoucherCodeAction, removeVoucherCodeAction, type OrderWithRelations } from '@/app/actions/checkout';

interface OrderReviewProps {
  order: OrderWithRelations;
  onContinue: () => void;
  onOrderUpdate: (order: OrderWithRelations) => void;
}

export function OrderReview({ order, onContinue, onOrderUpdate }: OrderReviewProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) return;

    setVoucherError(null);
    startTransition(async () => {
      const result = await applyVoucherCodeAction(order.id, { code: voucherCode.trim() });

      if ('error' in result) {
        setVoucherError(result.error);
        return;
      }

      setVoucherCode('');
      onOrderUpdate(result.data);
    });
  };

  const handleRemoveVoucher = () => {
    setVoucherError(null);
    startTransition(async () => {
      const result = await removeVoucherCodeAction(order.id);

      if ('error' in result) {
        setVoucherError(result.error);
        return;
      }

      onOrderUpdate(result.data);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Info */}
          <div className="pb-4 border-b">
            <h3 className="font-semibold">{order.event.name}</h3>
            <p className="text-sm text-muted-foreground">{order.tenant.name}</p>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.ticketType.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x PHP {item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <p className="font-medium">
                  PHP {item.totalPrice.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Voucher Code */}
          <div className="space-y-2">
            <Label htmlFor="voucher">Voucher Code</Label>
            {order.voucherCode ? (
              <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-medium">{order.voucherCode.code}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveVoucher}
                  disabled={isPending}
                  className="h-8 w-8"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="voucher"
                  placeholder="Enter code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  disabled={isPending}
                />
                <Button
                  variant="outline"
                  onClick={handleApplyVoucher}
                  disabled={isPending || !voucherCode.trim()}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
            )}
            {voucherError && (
              <p className="text-sm text-destructive">{voucherError}</p>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>PHP {order.subtotal.toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-PHP {order.discountAmount.toLocaleString()}</span>
              </div>
            )}
            {order.serviceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span>PHP {order.serviceFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span>PHP {order.total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={onContinue}>
        Continue to Attendee Details
      </Button>
    </div>
  );
}
