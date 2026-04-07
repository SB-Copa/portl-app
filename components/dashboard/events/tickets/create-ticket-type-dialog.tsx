import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TicketTypeForm } from '../ticket-type-form';
import { Plus } from 'lucide-react';
import type { TicketTypeFormData } from '@/lib/validations/events';
import type { EventWithTicketTypes } from './types';

interface CreateTicketTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: EventWithTicketTypes['tables'];
  onSubmit: (data: TicketTypeFormData) => Promise<void>;
}

export function CreateTicketTypeDialog({
  open,
  onOpenChange,
  tables,
  onSubmit,
}: CreateTicketTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Ticket Type
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Ticket Type</DialogTitle>
          <DialogDescription>
            Create a new ticket type for this event
          </DialogDescription>
        </DialogHeader>
        <TicketTypeForm
          tables={tables}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
