import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SessionProvider } from '@/components/providers/session-provider';

import { Toaster } from 'sonner';
import './globals.css';

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfairDisplay.variable} antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-ring">
          Skip to main content
        </a>
        <SessionProvider>
          <main id="main-content">
            {children}
          </main>
        </SessionProvider>
        <Toaster richColors position="top-right" />
        <SpeedInsights />
      </body>
    </html>
  );
}
