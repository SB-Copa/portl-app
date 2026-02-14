import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter_Tight, Geist_Mono, Manrope, Playfair_Display } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SessionProvider } from '@/components/providers/session-provider';
import { CartProvider, CartDrawer } from '@/components/cart';
import { Toaster } from 'sonner';
import './globals.css';

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Portl',
  description: 'Portl'
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} ${geistMono.variable} ${manrope.variable} ${playfairDisplay.variable} antialiased`}>
        <SessionProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </SessionProvider>
        <Toaster richColors position="top-right" />
        <SpeedInsights />
      </body>
    </html>
  );
}
