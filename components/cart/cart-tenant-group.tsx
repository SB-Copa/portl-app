'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartItem } from './cart-item';
import { useCart } from './cart-provider';
import { tenantUrl } from '@/lib/url';
import type { TenantCartGroup } from '@/app/actions/cart';

interface CartTenantGroupProps {
  group: TenantCartGroup;
}

export function CartTenantGroup({ group }: CartTenantGroupProps) {
  const { closeCart } = useCart();
  const itemCount = group.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{group.tenant.name}</h3>
        <span className="text-xs text-muted-foreground">
          {itemCount} {itemCount === 1 ? 'ticket' : 'tickets'}
        </span>
      </div>

      <div className="space-y-0">
        {group.items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="text-sm font-semibold">
          PHP {group.subtotal.toLocaleString()}
        </span>
      </div>

      <Button asChild className="w-full" onClick={closeCart}>
        <a href={tenantUrl(group.tenant.subdomain, '/checkout')}>
          Checkout
        </a>
      </Button>

      <Separator className="mt-4" />
    </div>
  );
}
