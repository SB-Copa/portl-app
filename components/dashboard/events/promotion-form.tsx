'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { promotionSchema, type PromotionFormData } from '@/lib/validations/events';
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
import { TicketType } from '@/prisma/generated/prisma/client';

interface PromotionFormProps {
  ticketTypes: TicketType[];
  defaultValues?: Partial<PromotionFormData>;
  onSubmit: (data: PromotionFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function PromotionForm({ ticketTypes, defaultValues, onSubmit, onCancel, isEdit }: PromotionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: defaultValues || {
      requiresCode: true,
      discountType: 'PERCENT',
      appliesTo: 'ITEM',
      ticketTypeIds: [],
    },
  });

  const discountType = watch('discountType');
  const appliesTo = watch('appliesTo');
  const requiresCode = watch('requiresCode');
  const selectedTicketTypeIds = watch('ticketTypeIds') || [];

  const onSubmitForm = async (data: PromotionFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTicketType = (ticketTypeId: string) => {
    const current = selectedTicketTypeIds;
    if (current.includes(ticketTypeId)) {
      setValue('ticketTypeIds', current.filter((id) => id !== ticketTypeId));
    } else {
      setValue('ticketTypeIds', [...current, ticketTypeId]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Promotion Name *</Label>
        <Input
          id="name"
          {...register('name')}
          disabled={isLoading}
          placeholder="e.g., Early Bird Discount, Group Deal"
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
          rows={2}
          placeholder="Describe this promotion..."
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount Type *</Label>
          <Select
            value={discountType}
            onValueChange={(value) => setValue('discountType', value as 'PERCENT' | 'FIXED')}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.discountType ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENT">Percentage</SelectItem>
              <SelectItem value="FIXED">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
          {errors.discountType && (
            <p className="text-sm text-red-600">{errors.discountType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountValue">
            Discount Value *
            {discountType === 'PERCENT' && (
              <span className="text-xs text-muted-foreground ml-1">(basis points: 1000 = 10%)</span>
            )}
            {discountType === 'FIXED' && (
              <span className="text-xs text-muted-foreground ml-1">(PHP)</span>
            )}
          </Label>
          <Input
            id="discountValue"
            type="number"
            {...register('discountValue', { valueAsNumber: true })}
            disabled={isLoading}
            placeholder={discountType === 'PERCENT' ? 'e.g., 1000 for 10%' : 'e.g., 100 for ₱100'}
            className={errors.discountValue ? 'border-red-500' : ''}
          />
          {errors.discountValue && (
            <p className="text-sm text-red-600">{errors.discountValue.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appliesTo">Applies To *</Label>
          <Select
            value={appliesTo}
            onValueChange={(value) => setValue('appliesTo', value as 'ORDER' | 'ITEM')}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.appliesTo ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ORDER">Entire Order</SelectItem>
              <SelectItem value="ITEM">Per Ticket</SelectItem>
            </SelectContent>
          </Select>
          {errors.appliesTo && (
            <p className="text-sm text-red-600">{errors.appliesTo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Code Required</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="requiresCode"
              checked={requiresCode}
              onCheckedChange={(checked) => setValue('requiresCode', !!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="requiresCode" className="font-normal cursor-pointer">
              Requires voucher code
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            {requiresCode
              ? 'Customers must enter a code to apply'
              : 'Discount applies automatically'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Valid From *</Label>
          <Input
            id="validFrom"
            type="datetime-local"
            {...register('validFrom')}
            disabled={isLoading}
            className={errors.validFrom ? 'border-red-500' : ''}
          />
          {errors.validFrom && (
            <p className="text-sm text-red-600">{errors.validFrom.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid Until *</Label>
          <Input
            id="validUntil"
            type="datetime-local"
            {...register('validUntil')}
            disabled={isLoading}
            className={errors.validUntil ? 'border-red-500' : ''}
          />
          {errors.validUntil && (
            <p className="text-sm text-red-600">{errors.validUntil.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxRedemptions">Max Total Redemptions</Label>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPerUser">Max Per User</Label>
          <Input
            id="maxPerUser"
            type="number"
            {...register('maxPerUser', {
              valueAsNumber: true,
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
            disabled={isLoading}
            placeholder="Unlimited"
            className={errors.maxPerUser ? 'border-red-500' : ''}
          />
          {errors.maxPerUser && (
            <p className="text-sm text-red-600">{errors.maxPerUser.message}</p>
          )}
        </div>
      </div>

      {ticketTypes.length > 0 && (
        <div className="space-y-2">
          <Label>Eligible Ticket Types</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Select which ticket types this promotion applies to. Leave empty for all types.
          </p>
          <div className="border rounded-lg p-4 max-h-40 overflow-y-auto space-y-2">
            {ticketTypes.map((ticketType) => (
              <div key={ticketType.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`ticketType-${ticketType.id}`}
                  checked={selectedTicketTypeIds.includes(ticketType.id)}
                  onCheckedChange={() => toggleTicketType(ticketType.id)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor={`ticketType-${ticketType.id}`}
                  className="font-normal cursor-pointer"
                >
                  {ticketType.name} ({ticketType.kind})
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEdit ? 'Update Promotion' : 'Create Promotion'}
        </Button>
      </div>
    </form>
  );
}
