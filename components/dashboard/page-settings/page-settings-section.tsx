'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { BrandingForm } from './branding-form';
import { TenantGallerySection } from './tenant-gallery-section';
import { updateTenantLogoAction, updateTenantBannerAction } from '@/app/actions/tenant-page';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { TenantImage } from '@/prisma/generated/prisma/client';

type TenantPageSettings = {
  id: string;
  subdomain: string;
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  tagline: string | null;
  description: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialTiktok: string | null;
  socialWebsite: string | null;
  images: TenantImage[];
};

interface PageSettingsSectionProps {
  tenant: TenantPageSettings;
  tenantSubdomain: string;
}

export function PageSettingsSection({ tenant, tenantSubdomain }: PageSettingsSectionProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string | undefined>(tenant.logoUrl ?? undefined);
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(tenant.bannerUrl ?? undefined);

  const handleLogoChange = useCallback(async (url: string | undefined) => {
    setLogoUrl(url);
    const result = await updateTenantLogoAction(tenantSubdomain, url ?? null);
    if (result.error) {
      toast.error(result.error);
      setLogoUrl(tenant.logoUrl ?? undefined);
    } else {
      toast.success(url ? 'Logo updated' : 'Logo removed');
      router.refresh();
    }
  }, [tenantSubdomain, tenant.logoUrl, router]);

  const handleBannerChange = useCallback(async (url: string | undefined) => {
    setBannerUrl(url);
    const result = await updateTenantBannerAction(tenantSubdomain, url ?? null);
    if (result.error) {
      toast.error(result.error);
      setBannerUrl(tenant.bannerUrl ?? undefined);
    } else {
      toast.success(url ? 'Banner updated' : 'Banner removed');
      router.refresh();
    }
  }, [tenantSubdomain, tenant.bannerUrl, router]);

  return (
    <div className="space-y-6">
      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>
            Your logo appears in the tenant navbar and on your landing page hero section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            value={logoUrl}
            onChange={handleLogoChange}
            folder={`tenants/${tenant.id}/logo`}
            description="Recommended: Square image, at least 200x200px"
          />
        </CardContent>
      </Card>

      {/* Banner */}
      <Card>
        <CardHeader>
          <CardTitle>Banner</CardTitle>
          <CardDescription>
            The banner is displayed as the hero background on your landing page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            value={bannerUrl}
            onChange={handleBannerChange}
            folder={`tenants/${tenant.id}/banner`}
            description="Recommended: 1920x600px or wider for best results"
          />
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Set your tagline, description, and social media links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingForm
            tenant={tenant}
            tenantSubdomain={tenantSubdomain}
          />
        </CardContent>
      </Card>

      {/* Gallery */}
      <TenantGallerySection
        tenant={tenant}
        tenantSubdomain={tenantSubdomain}
      />
    </div>
  );
}
