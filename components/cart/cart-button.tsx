'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from './cart-provider';

export function CartButton() {
  const { cartSummary, isLoading, toggleCart } = useCart();

  const itemCount = cartSummary?.totalItems ?? 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleCart}
      className="relative"
      aria-label={`Shopping cart${itemCount > 0 ? ` with ${itemCount} items` : ''}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
}
