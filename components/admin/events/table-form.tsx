'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tableSchema, type TableFormData } from '@/lib/validations/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface TableFormProps {
  eventId: string;
  defaultValues?: Partial<TableFormData>;
  onSubmit: (data: TableFormData) => Promise<void>;
  onCancel: () => void;
}

export function TableForm({ eventId, defaultValues, onSubmit, onCancel }: TableFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: defaultValues || {
      mode: 'EXCLUSIVE',
      capacity: 6,
    },
  });

  const mode = watch('mode');

  const onSubmitForm = async (data: TableFormData) => {
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
        <Label htmlFor="label">Table Label *</Label>
        <Input
          id="label"
          {...register('label')}
          disabled={isLoading}
          placeholder="e.g., A1, B2"
          className={errors.label ? 'border-red-500' : ''}
        />
        {errors.label && (
          <p className="text-sm text-destructive">{errors.label.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            {...register('capacity', { valueAsNumber: true })}
            disabled={isLoading}
            className={errors.capacity ? 'border-red-500' : ''}
          />
          {errors.capacity && (
            <p className="text-sm text-destructive">{errors.capacity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mode">Mode *</Label>
          <Select
            value={mode}
            onValueChange={(value) => setValue('mode', value as 'EXCLUSIVE' | 'SHARED')}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.mode ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXCLUSIVE">Exclusive (Whole Table)</SelectItem>
              <SelectItem value="SHARED">Shared (Individual Seats)</SelectItem>
            </SelectContent>
          </Select>
          {errors.mode && (
            <p className="text-sm text-destructive">{errors.mode.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minSpend">Minimum Spend</Label>
        <Input
          id="minSpend"
          type="number"
          {...register('minSpend', { valueAsNumber: true, setValueAs: (v) => v === '' ? undefined : Number(v) })}
          disabled={isLoading}
          placeholder="e.g., 500 for ₱500.00"
          className={errors.minSpend ? 'border-red-500' : ''}
        />
        {errors.minSpend && (
          <p className="text-sm text-destructive">{errors.minSpend.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          disabled={isLoading}
          rows={3}
          className={errors.notes ? 'border-red-500' : ''}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Table'}
        </Button>
      </div>
    </form>
  );
}
