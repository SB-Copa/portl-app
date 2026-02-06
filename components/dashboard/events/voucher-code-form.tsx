'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { voucherCodeSchema, type VoucherCodeFormData } from '@/lib/validations/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VoucherCodeFormProps {
  defaultValues?: Partial<VoucherCodeFormData>;
  onSubmit: (data: VoucherCodeFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function VoucherCodeForm({ defaultValues, onSubmit, onCancel, isEdit }: VoucherCodeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VoucherCodeFormData>({
    resolver: zodResolver(voucherCodeSchema),
    defaultValues: defaultValues || {},
  });

  const onSubmitForm = async (data: VoucherCodeFormData) => {
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
        <Label htmlFor="code">Voucher Code *</Label>
        <Input
          id="code"
          {...register('code')}
          disabled={isLoading}
          placeholder="e.g., SUMMER2024, VIP50"
          className={errors.code ? 'border-red-500' : ''}
          style={{ textTransform: 'uppercase' }}
        />
        {errors.code && (
          <p className="text-sm text-red-600">{errors.code.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Letters, numbers, hyphens, and underscores only. Will be converted to uppercase.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxRedemptions">Max Redemptions</Label>
        <Input
          id="maxRedemptions"
          type="number"
          {...register('maxRedemptions', {
            valueAsNumber: true,
            setValueAs: (v) => (v === '' ? undefined : Number(v)),
          })}
          disabled={isLoading}
          placeholder="Unlimited"
          className={errors.maxRedemptions ? 'border-red-500' : ''}
        />
        {errors.maxRedemptions && (
          <p className="text-sm text-red-600">{errors.maxRedemptions.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          How many times this specific code can be used (in addition to promotion limits)
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEdit ? 'Update Code' : 'Create Code'}
        </Button>
      </div>
    </form>
  );
}
