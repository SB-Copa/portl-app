import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PriceTiersSection } from '../price-tiers-section';
import type { TicketType } from './types';

interface PriceTiersDialogProps {
  ticketType: TicketType;
  tenantSubdomain: string;
  onClose: () => void;
}

export function PriceTiersDialog({
  ticketType,
  tenantSubdomain,
  onClose,
}: PriceTiersDialogProps) {
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Price Tiers</DialogTitle>
          <DialogDescription>
            Manage price tiers for this ticket type
          </DialogDescription>
        </DialogHeader>
        <PriceTiersSection
          ticketType={ticketType}
          tenantSubdomain={tenantSubdomain}
        />
      </DialogContent>
    </Dialog>
  );
}
