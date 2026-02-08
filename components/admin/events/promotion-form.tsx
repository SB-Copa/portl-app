'use client';

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
import { useState } from 'react';
import { TicketType } from '@/prisma/generated/prisma/client';

interface PromotionFormProps {
  eventId: string;
  ticketTypes: TicketType[];
  defaultValues?: Partial<PromotionFormData>;
  onSubmit: (data: PromotionFormData) => Promise<void>;
  onCancel: () => void;
}

export function PromotionForm({ eventId, ticketTypes, defaultValues, onSubmit, onCancel }: PromotionFormProps) {
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
      setValue('ticketTypeIds', current.filter(id => id !== ticketTypeId));
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
          placeholder="e.g., Summer Sale, Early Bird"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
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
          <p className="text-sm text-destructive">{errors.description.message}</p>
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
              <SelectItem value="PERCENT">Percent</SelectItem>
              <SelectItem value="FIXED">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
          {errors.discountType && (
            <p className="text-sm text-destructive">{errors.discountType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountValue">
            Discount Value * 
            {discountType === 'PERCENT' && ' (basis points, e.g., 1000 = 10%)'}
            {discountType === 'FIXED' && ' (e.g., 50 = ₱50.00)'}
          </Label>
          <Input
            id="discountValue"
            type="number"
            {...register('discountValue', { valueAsNumber: true })}
            disabled={isLoading}
            placeholder={discountType === 'PERCENT' ? 'e.g., 1000 for 10%' : 'e.g., 50 for ₱50.00'}
            className={errors.discountValue ? 'border-red-500' : ''}
          />
          {errors.discountValue && (
            <p className="text-sm text-destructive">{errors.discountValue.message}</p>
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
              <SelectItem value="ORDER">Order Level</SelectItem>
              <SelectItem value="ITEM">Item Level</SelectItem>
            </SelectContent>
          </Select>
          {errors.appliesTo && (
            <p className="text-sm text-destructive">{errors.appliesTo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="requiresCode">Requires Code</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="requiresCode"
              checked={watch('requiresCode')}
              onCheckedChange={(checked) => setValue('requiresCode', !!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="requiresCode" className="font-normal">
              Code-based promotion (requires voucher code)
            </Label>
          </div>
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
            <p className="text-sm text-destructive">{errors.validFrom.message}</p>
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
            <p className="text-sm text-destructive">{errors.validUntil.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxRedemptions">Max Redemptions</Label>
          <Input
            id="maxRedemptions"
            type="number"
            {...register('maxRedemptions', { valueAsNumber: true, setValueAs: (v) => v === '' ? undefined : Number(v) })}
            disabled={isLoading}
            placeholder="Global limit"
            className={errors.maxRedemptions ? 'border-red-500' : ''}
          />
          {errors.maxRedemptions && (
            <p className="text-sm text-destructive">{errors.maxRedemptions.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPerUser">Max Per User</Label>
          <Input
            id="maxPerUser"
            type="number"
            {...register('maxPerUser', { valueAsNumber: true, setValueAs: (v) => v === '' ? undefined : Number(v) })}
            disabled={isLoading}
            placeholder="Per-user limit"
            className={errors.maxPerUser ? 'border-red-500' : ''}
          />
          {errors.maxPerUser && (
            <p className="text-sm text-destructive">{errors.maxPerUser.message}</p>
          )}
        </div>
      </div>

      {ticketTypes.length > 0 && (
        <div className="space-y-2">
          <Label>Eligible Ticket Types</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Select specific ticket types. Leave empty to apply to all types.
          </p>
          <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
            {ticketTypes.map((ticketType) => (
              <div key={ticketType.id} className="flex items-center space-x-2 py-2">
                <Checkbox
                  id={`ticketType-${ticketType.id}`}
                  checked={selectedTicketTypeIds.includes(ticketType.id)}
                  onCheckedChange={() => toggleTicketType(ticketType.id)}
                  disabled={isLoading}
                />
                <Label htmlFor={`ticketType-${ticketType.id}`} className="font-normal cursor-pointer">
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
          {isLoading ? 'Creating...' : 'Create Promotion'}
        </Button>
      </div>
    </form>
  );
}
