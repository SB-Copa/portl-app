'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, ImageIcon, AlertCircle, X } from 'lucide-react';
import { uploadFileAction, deleteFileAction } from '@/app/actions/upload';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/validations/upload';

interface FileUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  folder: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
}

export function FileUpload({
  value,
  onChange,
  folder,
  label,
  description,
  required = false,
  disabled = false,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
        )
      ) {
        setError(
          'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
        );
        return;
      }

      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const result = await uploadFileAction(formData);

        if ('error' in result) {
          setError(result.error);
          setPreviewUrl(null);
          URL.revokeObjectURL(localPreview);
          return;
        }

        if (value) {
          deleteFileAction(value).catch(() => {});
        }

        onChange(result.data.url);
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);
      } catch {
        setError('Upload failed. Please try again.');
        setPreviewUrl(null);
        URL.revokeObjectURL(localPreview);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [folder, value, onChange]
  );

  const handleRemove = useCallback(async () => {
    if (!value) return;
    setIsDeleting(true);
    setError(null);

    try {
      await deleteFileAction(value);
      onChange(undefined);
    } catch {
      setError('Failed to remove file.');
    } finally {
      setIsDeleting(false);
    }
  }, [value, onChange]);

  const displayUrl = previewUrl || value;
  const isLoading = isUploading || isDeleting;

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {displayUrl ? (
        <div className="group relative">
          <div className="overflow-hidden rounded-lg border bg-gray-50">
            <img
              src={displayUrl}
              alt={label || 'Uploaded file'}
              className="h-48 w-full object-contain"
            />
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </div>
            </div>
          )}
          {isDeleting && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Removing...</span>
              </div>
            </div>
          )}
          {!disabled && !isLoading && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                Click to upload
              </span>
              <span className="text-xs text-gray-400">
                JPEG, PNG, WebP, or GIF (max 4MB)
              </span>
            </div>
          )}
        </button>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isLoading}
      />
    </div>
  );
}
