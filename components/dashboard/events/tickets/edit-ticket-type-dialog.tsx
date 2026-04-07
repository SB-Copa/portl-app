import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TicketTypeForm } from '../ticket-type-form';
import type { TicketTypeFormData } from '@/lib/validations/events';
import type { TicketType, EventWithTicketTypes } from './types';

interface EditTicketTypeDialogProps {
  ticketType: TicketType;
  tables: EventWithTicketTypes['tables'];
  onClose: () => void;
  onSubmit: (data: TicketTypeFormData) => Promise<void>;
}

export function EditTicketTypeDialog({
  ticketType,
  tables,
  onClose,
  onSubmit,
}: EditTicketTypeDialogProps) {
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ticket Type</DialogTitle>
          <DialogDescription>
            Update the details for this ticket type
          </DialogDescription>
        </DialogHeader>
        <TicketTypeForm
          tables={tables}
          defaultValues={{
            name: ticketType.name,
            description: ticketType.description || undefined,
            kind: ticketType.kind,
            basePrice: ticketType.basePrice,
            quantityTotal: ticketType.quantityTotal ?? undefined,
            tableId: ticketType.tableId,
            transferrable: ticketType.transferrable,
            cancellable: ticketType.cancellable,
            imageUrl: ticketType.imageUrl,
          }}
          onSubmit={onSubmit}
          onCancel={onClose}
          isEdit
          quantitySold={ticketType.quantitySold}
        />
      </DialogContent>
    </Dialog>
  );
}
