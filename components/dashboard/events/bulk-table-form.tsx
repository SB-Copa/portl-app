'use client';

import { useState } from 'react';
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

interface BulkTableFormProps {
  onSubmit: (data: BulkTableFormData) => Promise<{ error?: string; data?: unknown }>;
  onCancel: () => void;
}

export function BulkTableForm({ onSubmit, onCancel }: BulkTableFormProps) {
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
      prefix: 'VIP',
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

  const tableCount = endNumber >= startNumber ? endNumber - startNumber + 1 : 0;

  const onSubmitForm = async (data: BulkTableFormData) => {
    setIsLoading(true);
    try {
      const result = await onSubmit(data);
      if (!result.error) {
        onCancel();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="bg-muted/50 border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          This will create tables:{' '}
          <span className="font-medium text-foreground">
            {prefix}{startNumber} to {prefix}{endNumber}
          </span>{' '}
          ({tableCount} table{tableCount !== 1 ? 's' : ''} total)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
            <p className="text-sm text-red-600">{errors.prefix.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startNumber">Start # *</Label>
          <Input
            id="startNumber"
            type="number"
            {...register('startNumber', { valueAsNumber: true })}
            disabled={isLoading}
            className={errors.startNumber ? 'border-red-500' : ''}
          />
          {errors.startNumber && (
            <p className="text-sm text-red-600">{errors.startNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endNumber">End # *</Label>
          <Input
            id="endNumber"
            type="number"
            {...register('endNumber', { valueAsNumber: true })}
            disabled={isLoading}
            className={errors.endNumber ? 'border-red-500' : ''}
          />
          {errors.endNumber && (
            <p className="text-sm text-red-600">{errors.endNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity (per table) *</Label>
          <Input
            id="capacity"
            type="number"
            {...register('capacity', { valueAsNumber: true })}
            disabled={isLoading}
            className={errors.capacity ? 'border-red-500' : ''}
          />
          {errors.capacity && (
            <p className="text-sm text-red-600">{errors.capacity.message}</p>
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
            <p className="text-sm text-red-600">{errors.mode.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minSpend">Minimum Spend (PHP)</Label>
        <Input
          id="minSpend"
          type="number"
          {...register('minSpend', { valueAsNumber: true, setValueAs: (v) => v === '' ? undefined : Number(v) })}
          disabled={isLoading}
          placeholder="e.g., 5000 (applies to all tables)"
          className={errors.minSpend ? 'border-red-500' : ''}
        />
        {errors.minSpend && (
          <p className="text-sm text-red-600">{errors.minSpend.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || tableCount === 0}>
          {isLoading ? 'Creating...' : `Create ${tableCount} Table${tableCount !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </form>
  );
}
