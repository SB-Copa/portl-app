'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketTypeSchema, type TicketTypeFormData } from '@/lib/validations/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Table } from '@/prisma/generated/prisma/client';

interface TicketTypeFormProps {
  eventId: string;
  tables: Table[];
  defaultValues?: Partial<TicketTypeFormData>;
  onSubmit: (data: TicketTypeFormData) => Promise<void>;
  onCancel: () => void;
}

export function TicketTypeForm({ eventId, tables, defaultValues, onSubmit, onCancel }: TicketTypeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TicketTypeFormData>({
    resolver: zodResolver(ticketTypeSchema),
    defaultValues: defaultValues || {
      kind: 'GENERAL',
      transferrable: false,
      cancellable: false,
    },
  });

  const kind = watch('kind');

  // Filter tables based on kind
  const availableTables = kind === 'TABLE'
    ? tables.filter(t => t.mode === 'EXCLUSIVE' || t.mode === 'SHARED')
    : kind === 'SEAT'
      ? tables.filter(t => t.mode === 'SHARED' || t.mode === 'EXCLUSIVE')
      : [];

  const onSubmitForm = async (data: TicketTypeFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Ticket Type Name *</Label>
        <Input
          id="name"
          {...register('name')}
          disabled={isLoading}
          placeholder="e.g., General Admission, VIP Table"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          disabled={isLoading}
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="kind">Kind *</Label>
        <Select
          value={kind}
          onValueChange={(value) => setValue('kind', value as 'GENERAL' | 'TABLE' | 'SEAT')}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.kind ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select kind" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GENERAL">General</SelectItem>
            <SelectItem value="TABLE">Table</SelectItem>
            <SelectItem value="SEAT">Seat</SelectItem>
          </SelectContent>
        </Select>
        {errors.kind && (
          <p className="text-sm text-red-600">{errors.kind.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="basePrice">Base Price *</Label>
        <Input
          id="basePrice"
          type="number"
          {...register('basePrice', { valueAsNumber: true })}
          disabled={isLoading}
          placeholder="e.g., 50 for ₱50.00"
          className={errors.basePrice ? 'border-red-500' : ''}
        />
        {errors.basePrice && (
          <p className="text-sm text-red-600">{errors.basePrice.message}</p>
        )}
      </div>

      {(kind === 'TABLE' || kind === 'SEAT') && (
        <div className="space-y-2">
          <Label htmlFor="tableId">Table *</Label>
          <Select
            value={watch('tableId') || ''}
            onValueChange={(value) => setValue('tableId', value)}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.tableId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent>
              {availableTables.map((table) => (
                <SelectItem key={table.id} value={table.id}>
                  {table.label} ({table.mode}, Capacity: {table.capacity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tableId && (
            <p className="text-sm text-red-600">{errors.tableId.message}</p>
          )}
        </div>
      )}

      {kind === 'GENERAL' && (
        <div className="space-y-2">
          <Label htmlFor="quantityTotal">Total Quantity</Label>
          <Input
            id="quantityTotal"
            type="number"
            {...register('quantityTotal', { valueAsNumber: true, setValueAs: (v) => v === '' ? undefined : Number(v) })}
            disabled={isLoading}
            placeholder="Leave empty for unlimited"
            className={errors.quantityTotal ? 'border-red-500' : ''}
          />
          {errors.quantityTotal && (
            <p className="text-sm text-red-600">{errors.quantityTotal.message}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="transferrable"
            {...register('transferrable')}
            disabled={isLoading}
          />
          <Label htmlFor="transferrable" className="font-normal">
            Transferrable
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="cancellable"
            {...register('cancellable')}
            disabled={isLoading}
          />
          <Label htmlFor="cancellable" className="font-normal">
            Cancellable
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Ticket Type'}
        </Button>
      </div>
    </form>
  );
}
