'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { addToCartAction } from '@/app/actions/cart';
import { useCart } from './cart-provider';

interface AddToCartButtonProps {
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  maxQuantity?: number;
  disabled?: boolean;
  disabledReason?: string;
}

export function AddToCartButton({
  eventId,
  ticketTypeId,
  ticketTypeName,
  price,
  maxQuantity = 10,
  disabled = false,
  disabledReason,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showQuantity, setShowQuantity] = useState(false);
  const { refreshCart, openCart } = useCart();

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    setError(null);
    startTransition(async () => {
      const result = await addToCartAction({
        eventId,
        ticketTypeId,
        quantity,
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }

      // Reset state
      setQuantity(1);
      setShowQuantity(false);

      // Refresh cart and open drawer
      await refreshCart();
      openCart();
    });
  };

  if (disabled) {
    return (
      <Button disabled variant="outline">
        {disabledReason || 'Sold Out'}
      </Button>
    );
  }

  if (!showQuantity) {
    return (
      <Button onClick={() => setShowQuantity(true)}>
        <ShoppingCart className="h-4 w-4 mr-2" />
        Get Tickets
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={quantity <= 1 || isPending}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          min={1}
          max={maxQuantity}
          className="w-16 h-8 text-center"
          disabled={isPending}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={quantity >= maxQuantity || isPending}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button onClick={handleAddToCart} disabled={isPending} className="ml-2">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Add</>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        PHP {(price * quantity).toLocaleString()} total
      </p>
    </div>
  );
}
