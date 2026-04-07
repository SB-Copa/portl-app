'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { StatusFilter } from './types';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or ticket code..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-1">
        {(['ALL', 'CHECKED_IN', 'NOT_CHECKED_IN'] as StatusFilter[]).map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusFilterChange(filter)}
          >
            {filter === 'ALL' && 'All'}
            {filter === 'CHECKED_IN' && 'Checked In'}
            {filter === 'NOT_CHECKED_IN' && 'Not Checked In'}
          </Button>
        ))}
      </div>
    </div>
  );
}
