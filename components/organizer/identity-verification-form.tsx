'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';

export interface IdentityVerificationData {
  governmentIdUrl?: string;
  selfieWithIdUrl?: string;
  businessIdUrl?: string;
}

interface IdentityVerificationFormProps {
  initialData?: IdentityVerificationData;
  onSave: (data: IdentityVerificationData) => Promise<void>;
  onSaveAndExit: (data: IdentityVerificationData) => Promise<void>;
}

export function IdentityVerificationForm({
  initialData,
  onSave,
  onSaveAndExit,
}: IdentityVerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IdentityVerificationData>(
    initialData || {
      governmentIdUrl: '',
      selfieWithIdUrl: '',
      businessIdUrl: '',
    }
  );

  const updateField = (field: keyof IdentityVerificationData, value: string | undefined) => {
    setData({ ...data, [field]: value || '' });
  };

  const handleSave = async (shouldExit = false) => {
    setIsLoading(true);
    try {
      if (shouldExit) {
        await onSaveAndExit(data);
      } else {
        await onSave(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
          <CardDescription>
            Please provide the required identity verification documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload
            label="Valid Government ID"
            description="Upload a clear photo of a valid government-issued ID (driver's license, passport, etc.)"
            required
            folder="identity-verification"
            value={data.governmentIdUrl || undefined}
            onChange={(url) => updateField('governmentIdUrl', url)}
          />

          <FileUpload
            label="Selfie with ID"
            description="Upload a selfie photo holding your government ID next to your face"
            required
            folder="identity-verification"
            value={data.selfieWithIdUrl || undefined}
            onChange={(url) => updateField('selfieWithIdUrl', url)}
          />

          <FileUpload
            label="Business ID Card (Optional)"
            description="If applicable, upload a business registration or business ID card"
            folder="identity-verification"
            value={data.businessIdUrl || undefined}
            onChange={(url) => updateField('businessIdUrl', url)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => handleSave(true)}
          disabled={isLoading}
        >
          Save & Exit
        </Button>
        <Button
          onClick={() => handleSave(false)}
          disabled={isLoading || !data.governmentIdUrl || !data.selfieWithIdUrl}
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
