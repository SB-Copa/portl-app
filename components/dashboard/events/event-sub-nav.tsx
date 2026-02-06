'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, TableIcon, Ticket, Tag } from 'lucide-react';

interface EventSubNavProps {
  eventId: string;
  tenantSubdomain: string;
  tableCounts?: {
    tables: number;
    ticketTypes: number;
    promotions: number;
  };
}

export function EventSubNav({ eventId, tenantSubdomain, tableCounts }: EventSubNavProps) {
  const pathname = usePathname();

  const basePath = `/dashboard/${tenantSubdomain}/events/${eventId}`;

  const navItems = [
    {
      label: 'Overview',
      href: basePath,
      icon: LayoutDashboard,
      isActive: pathname === basePath,
    },
    {
      label: `Tables${tableCounts ? ` (${tableCounts.tables})` : ''}`,
      href: `${basePath}/tables`,
      icon: TableIcon,
      isActive: pathname === `${basePath}/tables`,
    },
    {
      label: `Tickets${tableCounts ? ` (${tableCounts.ticketTypes})` : ''}`,
      href: `${basePath}/tickets`,
      icon: Ticket,
      isActive: pathname === `${basePath}/tickets`,
    },
    {
      label: `Promotions${tableCounts ? ` (${tableCounts.promotions})` : ''}`,
      href: `${basePath}/promotions`,
      icon: Tag,
      isActive: pathname === `${basePath}/promotions`,
    },
  ];

  return (
    <nav className="flex gap-1 border-b">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              item.isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
