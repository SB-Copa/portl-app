'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilterBar } from './search-filter-bar';
import { AttendeeRow } from './attendee-row';
import type { Attendee, StatusFilter } from './types';

interface AttendeeTableProps {
  attendees: Attendee[];
  filteredAttendees: Attendee[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  loadingTicketId: string | null;
  onRowCheckIn: (ticketCode: string, ticketId: string) => void;
  onUndoCheckIn: (ticketId: string) => void;
  onPrint: (attendee: Attendee) => void;
}

export function AttendeeTable({
  attendees,
  filteredAttendees,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  loadingTicketId,
  onRowCheckIn,
  onUndoCheckIn,
  onPrint,
}: AttendeeTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendees</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />

        {filteredAttendees.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>{attendees.length === 0 ? 'No attendees yet for this event.' : 'No attendees match your filter.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Ticket Code</th>
                  <th className="text-left py-3 px-2 font-medium">Attendee</th>
                  <th className="text-left py-3 px-2 font-medium">Email</th>
                  <th className="text-left py-3 px-2 font-medium">Ticket Type</th>
                  <th className="text-left py-3 px-2 font-medium">Status</th>
                  <th className="text-left py-3 px-2 font-medium">Checked In At</th>
                  <th className="text-right py-3 px-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((attendee) => (
                  <AttendeeRow
                    key={attendee.id}
                    attendee={attendee}
                    isLoading={loadingTicketId === attendee.id}
                    onCheckIn={onRowCheckIn}
                    onUndoCheckIn={onUndoCheckIn}
                    onPrint={onPrint}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredAttendees.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {filteredAttendees.length} of {attendees.length} attendees
          </p>
        )}
      </CardContent>
    </Card>
  );
}
