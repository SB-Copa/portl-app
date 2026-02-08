'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getCartSummaryAction, type CartSummary } from '@/app/actions/cart';

interface CartContextValue {
  cartSummary: CartSummary | null;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCartSummaryAction();
      if ('data' in result) {
        setCartSummary(result.data);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);

  // Initial load
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartSummary,
        isLoading,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
