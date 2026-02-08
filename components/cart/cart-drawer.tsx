'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from './cart-provider';
import { CartTenantGroup } from './cart-tenant-group';
import { CartEmptyState } from './cart-empty-state';

export function CartDrawer() {
  const { cartSummary, isLoading, isOpen, closeCart } = useCart();

  const isEmpty = !cartSummary || cartSummary.totalItems === 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart
            {!isEmpty && (
              <span className="text-sm font-normal text-muted-foreground">
                ({cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'ticket' : 'tickets'})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isEmpty ? (
            <CartEmptyState />
          ) : (
            <div className="space-y-6">
              {cartSummary.groupedByTenant.map((group) => (
                <CartTenantGroup key={group.tenant.id} group={group} />
              ))}
            </div>
          )}
        </div>

        {!isEmpty && !isLoading && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-bold">
                  PHP {cartSummary.totalAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Checkout is per organizer. Select a section above to proceed.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
