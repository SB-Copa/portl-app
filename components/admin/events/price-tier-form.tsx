'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { priceTierSchema, type PriceTierFormData } from '@/lib/validations/events';
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

interface PriceTierFormProps {
  ticketTypeId: string;
  defaultValues?: Partial<PriceTierFormData>;
  onSubmit: (data: PriceTierFormData) => Promise<void>;
  onCancel: () => void;
}

export function PriceTierForm({ ticketTypeId, defaultValues, onSubmit, onCancel }: PriceTierFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PriceTierFormData>({
    resolver: zodResolver(priceTierSchema),
    defaultValues: defaultValues || {
      strategy: 'TIME_WINDOW',
      priority: 0,
    },
  });

  const strategy = watch('strategy');

  const onSubmitForm = async (data: PriceTierFormData) => {
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
        <Label htmlFor="name">Tier Name *</Label>
        <Input
          id="name"
          {...register('name')}
          disabled={isLoading}
          placeholder="e.g., Early Bird, Regular, Door"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price *</Label>
        <Input
          id="price"
          type="number"
          {...register('price', { valueAsNumber: true })}
          disabled={isLoading}
          placeholder="e.g., 50 for ₱50.00"
          className={errors.price ? 'border-red-500' : ''}
        />
        {errors.price && (
          <p className="text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="strategy">Strategy *</Label>
        <Select
          value={strategy}
          onValueChange={(value) => setValue('strategy', value as 'TIME_WINDOW' | 'ALLOCATION')}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.strategy ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TIME_WINDOW">Time Window</SelectItem>
            <SelectItem value="ALLOCATION">Allocation</SelectItem>
          </SelectContent>
        </Select>
        {errors.strategy && (
          <p className="text-sm text-red-600">{errors.strategy.message}</p>
        )}
      </div>

      {strategy === 'TIME_WINDOW' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startsAt">Start Date & Time *</Label>
            <Input
              id="startsAt"
              type="datetime-local"
              {...register('startsAt')}
              disabled={isLoading}
              className={errors.startsAt ? 'border-red-500' : ''}
            />
            {errors.startsAt && (
              <p className="text-sm text-red-600">{errors.startsAt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endsAt">End Date & Time *</Label>
            <Input
              id="endsAt"
              type="datetime-local"
              {...register('endsAt')}
              disabled={isLoading}
              className={errors.endsAt ? 'border-red-500' : ''}
            />
            {errors.endsAt && (
              <p className="text-sm text-red-600">{errors.endsAt.message}</p>
            )}
          </div>
        </div>
      )}

      {strategy === 'ALLOCATION' && (
        <div className="space-y-2">
          <Label htmlFor="allocationTotal">Allocation Total *</Label>
          <Input
            id="allocationTotal"
            type="number"
            {...register('allocationTotal', { valueAsNumber: true, setValueAs: (v) => v === '' ? undefined : Number(v) })}
            disabled={isLoading}
            placeholder="e.g., 100"
            className={errors.allocationTotal ? 'border-red-500' : ''}
          />
          {errors.allocationTotal && (
            <p className="text-sm text-red-600">{errors.allocationTotal.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Input
          id="priority"
          type="number"
          {...register('priority', { valueAsNumber: true })}
          disabled={isLoading}
          placeholder="Higher priority tiers take precedence"
          className={errors.priority ? 'border-red-500' : ''}
        />
        {errors.priority && (
          <p className="text-sm text-red-600">{errors.priority.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Higher priority tiers take precedence when multiple tiers are active
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Price Tier'}
        </Button>
      </div>
    </form>
  );
}
