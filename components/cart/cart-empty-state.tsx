import { ShoppingCart } from 'lucide-react';

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Your cart is empty</h3>
      <p className="text-sm text-muted-foreground max-w-[200px]">
        Browse events and add tickets to get started.
      </p>
    </div>
  );
}
