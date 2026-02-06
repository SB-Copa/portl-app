'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { registerOrganizerAction } from '@/app/actions/organizer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const registrationSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  subdomain: z
    .string()
    .min(1, 'Subdomain is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomain can only contain lowercase letters, numbers, and hyphens'
    ),
  businessEmail: z.string().email('Invalid email address'),
  businessPhone: z.string().min(1, 'Business phone is required'),
  sameAsBusinessContact: z.boolean(),
  contactEmail: z.string().optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (!data.sameAsBusinessContact) {
    return data.contactEmail && data.contactEmail.length > 0 && data.contactPhone && data.contactPhone.length > 0;
  }
  return true;
}, {
  message: 'Contact email and phone are required when different from business contact',
  path: ['contactEmail'],
}).refine((data) => {
  if (!data.sameAsBusinessContact && data.contactEmail) {
    return z.string().email().safeParse(data.contactEmail).success;
  }
  return true;
}, {
  message: 'Contact email must be a valid email address',
  path: ['contactEmail'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

// Extend the type to include contact fields for the action
type RegistrationActionData = {
  name: string;
  subdomain: string;
  businessEmail: string;
  businessPhone: string;
  contactEmail?: string;
  contactPhone?: string;
  sameAsBusinessContact: boolean;
};

function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export function RegistrationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      subdomain: '',
      businessEmail: '',
      businessPhone: '',
      sameAsBusinessContact: true,
      contactEmail: '',
      contactPhone: '',
    },
  });

  const nameValue = watch('name');
  const sameAsBusinessContact = watch('sameAsBusinessContact');
  const businessEmail = watch('businessEmail');
  const businessPhone = watch('businessPhone');

  // Auto-generate subdomain when name changes
  useEffect(() => {
    if (nameValue) {
      const generated = generateSubdomain(nameValue);
      setValue('subdomain', generated, { shouldValidate: false });
    }
  }, [nameValue, setValue]);

  // Sync contact info when toggle is on
  useEffect(() => {
    if (sameAsBusinessContact) {
      setValue('contactEmail', businessEmail, { shouldValidate: false });
      setValue('contactPhone', businessPhone, { shouldValidate: false });
    }
  }, [sameAsBusinessContact, businessEmail, businessPhone, setValue]);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setMessage(null);

    const actionData: RegistrationActionData = {
      name: data.name,
      subdomain: data.subdomain,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      sameAsBusinessContact: data.sameAsBusinessContact,
      contactEmail: data.sameAsBusinessContact ? undefined : data.contactEmail,
      contactPhone: data.sameAsBusinessContact ? undefined : data.contactPhone,
    };

    const result = await registerOrganizerAction(actionData);

    setIsLoading(false);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else if (result.data) {
      setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
      // Redirect to the tenant dashboard
      setTimeout(() => {
        router.push(`/dashboard/${result.data.subdomain}`);
      }, 1000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Your Business</CardTitle>
        <CardDescription>
          Get started by registering your business. You can complete your application later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Message */}
          {message && (
            <div
              className={`rounded-lg border p-4 ${
                message.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {message.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <div className="text-sm">{message.text}</div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Business / Brand Name</Label>
            <Input
              id="name"
              {...register('name')}
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Acme Events"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                {...register('subdomain')}
                disabled={isLoading}
                className={errors.subdomain ? 'border-red-500' : ''}
                placeholder="acme-events"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">
                .portl.com
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Auto-generated from your business name. You can edit it if needed.
            </p>
            {errors.subdomain && (
              <p className="text-sm text-red-600">{errors.subdomain.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              id="businessEmail"
              type="email"
              {...register('businessEmail')}
              disabled={isLoading}
              className={errors.businessEmail ? 'border-red-500' : ''}
              placeholder="contact@acme-events.com"
            />
            {errors.businessEmail && (
              <p className="text-sm text-red-600">{errors.businessEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business Phone</Label>
            <Input
              id="businessPhone"
              type="tel"
              {...register('businessPhone')}
              disabled={isLoading}
              className={errors.businessPhone ? 'border-red-500' : ''}
              placeholder="+1 (555) 123-4567"
            />
            {errors.businessPhone && (
              <p className="text-sm text-red-600">{errors.businessPhone.message}</p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="sameAsBusinessContact"
                checked={sameAsBusinessContact}
                onCheckedChange={(checked) => {
                  setValue('sameAsBusinessContact', checked as boolean, { shouldValidate: true });
                }}
              />
              <div className="space-y-1">
                <Label htmlFor="sameAsBusinessContact" className="cursor-pointer font-medium">
                  Same as business contact information
                </Label>
                <p className="text-sm text-gray-500">
                  Use the same email and phone for contact information
                </p>
              </div>
            </div>

            {!sameAsBusinessContact && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    disabled={isLoading}
                    className={errors.contactEmail ? 'border-red-500' : ''}
                    placeholder="contact@acme-events.com"
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-red-600">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    {...register('contactPhone')}
                    disabled={isLoading}
                    className={errors.contactPhone ? 'border-red-500' : ''}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.contactPhone && (
                    <p className="text-sm text-red-600">{errors.contactPhone.message}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register Business'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
