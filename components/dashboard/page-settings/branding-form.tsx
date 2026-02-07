'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tenantBrandingSchema, type TenantBrandingFormData } from '@/lib/validations/tenant-page';
import { updateTenantBrandingAction } from '@/app/actions/tenant-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BrandingFormProps {
  tenant: {
    tagline: string | null;
    description: string | null;
    socialInstagram: string | null;
    socialFacebook: string | null;
    socialTwitter: string | null;
    socialTiktok: string | null;
    socialWebsite: string | null;
  };
  tenantSubdomain: string;
}

export function BrandingForm({ tenant, tenantSubdomain }: BrandingFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TenantBrandingFormData>({
    resolver: zodResolver(tenantBrandingSchema),
    defaultValues: {
      tagline: tenant.tagline ?? '',
      description: tenant.description ?? '',
      socialInstagram: tenant.socialInstagram ?? '',
      socialFacebook: tenant.socialFacebook ?? '',
      socialTwitter: tenant.socialTwitter ?? '',
      socialTiktok: tenant.socialTiktok ?? '',
      socialWebsite: tenant.socialWebsite ?? '',
    },
  });

  const taglineValue = watch('tagline');

  const onSubmit = async (data: TenantBrandingFormData) => {
    setIsSaving(true);
    const result = await updateTenantBrandingAction(tenantSubdomain, data);
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Branding updated');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tagline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tagline">Tagline</Label>
          <span className="text-xs text-muted-foreground">
            {taglineValue?.length ?? 0}/120
          </span>
        </div>
        <Input
          id="tagline"
          placeholder="A short tagline for your page"
          {...register('tagline')}
        />
        {errors.tagline && (
          <p className="text-sm text-red-600">{errors.tagline.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">About / Description</Label>
        <Textarea
          id="description"
          placeholder="Tell visitors about your organization..."
          rows={5}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <Label className="text-base">Social Links</Label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="socialInstagram" className="text-sm font-normal text-muted-foreground">
              Instagram
            </Label>
            <Input
              id="socialInstagram"
              placeholder="https://instagram.com/..."
              {...register('socialInstagram')}
            />
            {errors.socialInstagram && (
              <p className="text-sm text-red-600">{errors.socialInstagram.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialFacebook" className="text-sm font-normal text-muted-foreground">
              Facebook
            </Label>
            <Input
              id="socialFacebook"
              placeholder="https://facebook.com/..."
              {...register('socialFacebook')}
            />
            {errors.socialFacebook && (
              <p className="text-sm text-red-600">{errors.socialFacebook.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialTwitter" className="text-sm font-normal text-muted-foreground">
              Twitter / X
            </Label>
            <Input
              id="socialTwitter"
              placeholder="https://x.com/..."
              {...register('socialTwitter')}
            />
            {errors.socialTwitter && (
              <p className="text-sm text-red-600">{errors.socialTwitter.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialTiktok" className="text-sm font-normal text-muted-foreground">
              TikTok
            </Label>
            <Input
              id="socialTiktok"
              placeholder="https://tiktok.com/@..."
              {...register('socialTiktok')}
            />
            {errors.socialTiktok && (
              <p className="text-sm text-red-600">{errors.socialTiktok.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="socialWebsite" className="text-sm font-normal text-muted-foreground">
            Website
          </Label>
          <Input
            id="socialWebsite"
            placeholder="https://yourwebsite.com"
            {...register('socialWebsite')}
          />
          {errors.socialWebsite && (
            <p className="text-sm text-red-600">{errors.socialWebsite.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
