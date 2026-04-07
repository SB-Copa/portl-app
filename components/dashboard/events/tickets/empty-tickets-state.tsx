import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Ticket } from 'lucide-react';

interface EmptyTicketsStateProps {
  onCreateClick: () => void;
}

export function EmptyTicketsState({ onCreateClick }: EmptyTicketsStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Ticket className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No ticket types yet</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          Create ticket types for general admission, VIP tables, or individual seats.
        </p>
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Ticket Type
        </Button>
      </CardContent>
    </Card>
  );
}
