'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';

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

  const updateField = (field: keyof IdentityVerificationData, value: string) => {
    setData({ ...data, [field]: value });
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

  // Placeholder for file upload - will be replaced with Vercel Blob integration
  const handleFileUpload = (field: keyof IdentityVerificationData) => {
    // TODO: Implement Vercel Blob upload
    // For now, just a placeholder input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Placeholder: In real implementation, upload to Vercel Blob and get URL
        // For now, just show a message
        alert('File upload will be implemented with Vercel Blob. Selected file: ' + file.name);
        // updateField(field, 'https://blob.vercel-storage.com/...');
      }
    };
    input.click();
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
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> File upload functionality will be implemented with Vercel Blob storage.
              For now, you can enter URLs manually or use the placeholder upload button.
            </p>
          </div>

          {/* Government ID */}
          <div className="space-y-2">
            <Label htmlFor="government-id">Valid Government ID *</Label>
            <p className="text-sm text-gray-500">
              Upload a clear photo of a valid government-issued ID (driver's license, passport, etc.)
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="government-id"
                placeholder="File URL (Vercel Blob placeholder)"
                value={data.governmentIdUrl || ''}
                onChange={(e) => updateField('governmentIdUrl', e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleFileUpload('governmentIdUrl')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              {data.governmentIdUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateField('governmentIdUrl', '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {data.governmentIdUrl && (
              <p className="text-xs text-gray-500">Current: {data.governmentIdUrl}</p>
            )}
          </div>

          {/* Selfie with ID */}
          <div className="space-y-2">
            <Label htmlFor="selfie-id">Selfie with ID *</Label>
            <p className="text-sm text-gray-500">
              Upload a selfie photo holding your government ID next to your face
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="selfie-id"
                placeholder="File URL (Vercel Blob placeholder)"
                value={data.selfieWithIdUrl || ''}
                onChange={(e) => updateField('selfieWithIdUrl', e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleFileUpload('selfieWithIdUrl')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              {data.selfieWithIdUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateField('selfieWithIdUrl', '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {data.selfieWithIdUrl && (
              <p className="text-xs text-gray-500">Current: {data.selfieWithIdUrl}</p>
            )}
          </div>

          {/* Business ID (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="business-id">Business ID Card (Optional)</Label>
            <p className="text-sm text-gray-500">
              If applicable, upload a business registration or business ID card
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="business-id"
                placeholder="File URL (Vercel Blob placeholder)"
                value={data.businessIdUrl || ''}
                onChange={(e) => updateField('businessIdUrl', e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleFileUpload('businessIdUrl')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              {data.businessIdUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateField('businessIdUrl', '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {data.businessIdUrl && (
              <p className="text-xs text-gray-500">Current: {data.businessIdUrl}</p>
            )}
          </div>
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
