'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { voucherCodeSchema, type VoucherCodeFormData } from '@/lib/validations/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface VoucherCodeFormProps {
  promotionId: string;
  defaultValues?: Partial<VoucherCodeFormData>;
  onSubmit: (data: VoucherCodeFormData) => Promise<void>;
  onCancel: () => void;
}

export function VoucherCodeForm({ promotionId, defaultValues, onSubmit, onCancel }: VoucherCodeFormProps) {
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
          placeholder="e.g., SUMMER2024, EARLYBIRD"
          className={errors.code ? 'border-red-500' : ''}
          style={{ textTransform: 'uppercase' }}
        />
        {errors.code && (
          <p className="text-sm text-red-600">{errors.code.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Code will be converted to uppercase. Only letters, numbers, hyphens, and underscores allowed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxRedemptions">Max Redemptions</Label>
        <Input
          id="maxRedemptions"
          type="number"
          {...register('maxRedemptions', { valueAsNumber: true, setValueAs: (v) => v === '' ? undefined : Number(v) })}
          disabled={isLoading}
          placeholder="Per-code limit (in addition to promotion limit)"
          className={errors.maxRedemptions ? 'border-red-500' : ''}
        />
        {errors.maxRedemptions && (
          <p className="text-sm text-red-600">{errors.maxRedemptions.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Leave empty for unlimited redemptions (subject to promotion limits)
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Voucher Code'}
        </Button>
      </div>
    </form>
  );
}
