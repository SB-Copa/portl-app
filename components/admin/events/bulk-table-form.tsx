'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bulkTableSchema, type BulkTableFormData } from '@/lib/validations/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BulkTableFormProps {
  eventId: string;
  onSubmit: (data: BulkTableFormData) => Promise<{ error?: string; data?: any }>;
  onCancel: () => void;
}

export function BulkTableForm({ eventId, onSubmit, onCancel }: BulkTableFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BulkTableFormData>({
    resolver: zodResolver(bulkTableSchema),
    defaultValues: {
      prefix: 'A',
      startNumber: 1,
      endNumber: 10,
      capacity: 6,
      mode: 'EXCLUSIVE',
    },
  });

  const mode = watch('mode');
  const prefix = watch('prefix');
  const startNumber = watch('startNumber');
  const endNumber = watch('endNumber');

  const onSubmitForm = async (data: BulkTableFormData) => {
    setIsLoading(true);
    try {
      const result = await onSubmit(data);
      if (result.error) {
        // Error handling is done in parent component
        return;
      }
      router.refresh();
      onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-400">
          This will create tables from {prefix}{startNumber} to {prefix}{endNumber} ({endNumber - startNumber + 1} tables total)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prefix">Prefix *</Label>
          <Input
            id="prefix"
            {...register('prefix')}
            disabled={isLoading}
            placeholder="e.g., A, B, VIP"
            className={errors.prefix ? 'border-red-500' : ''}
          />
          {errors.prefix && (
            <p className="text-sm text-destructive">{errors.prefix.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="startNumber">Start Number *</Label>
            <Input
              id="startNumber"
              type="number"
              {...register('startNumber', { valueAsNumber: true })}
              disabled={isLoading}
              className={errors.startNumber ? 'border-red-500' : ''}
            />
            {errors.startNumber && (
              <p className="text-sm text-destructive">{errors.startNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endNumber">End Number *</Label>
            <Input
              id="endNumber"
              type="number"
              {...register('endNumber', { valueAsNumber: true })}
              disabled={isLoading}
              className={errors.endNumber ? 'border-red-500' : ''}
            />
            {errors.endNumber && (
              <p className="text-sm text-destructive">{errors.endNumber.message}</p>
            )}
          </div>
        </div>
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : `Create ${endNumber - startNumber + 1} Tables`}
        </Button>
      </div>
    </form>
  );
}
