import { z } from 'zod';

export const tenantBrandingSchema = z.object({
  tagline: z.string().max(120).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  socialInstagram: z.string().url().optional().or(z.literal('')),
  socialFacebook: z.string().url().optional().or(z.literal('')),
  socialTwitter: z.string().url().optional().or(z.literal('')),
  socialTiktok: z.string().url().optional().or(z.literal('')),
  socialWebsite: z.string().url().optional().or(z.literal('')),
});

export type TenantBrandingFormData = z.infer<typeof tenantBrandingSchema>;
