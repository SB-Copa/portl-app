'use server';

import { put, del } from '@vercel/blob';
import { getCurrentUser } from '@/lib/auth';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/validations/upload';

export type UploadResult =
  | { data: { url: string } }
  | { error: string };

export async function uploadFileAction(formData: FormData): Promise<UploadResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const file = formData.get('file') as File | null;
  const folder = formData.get('folder') as string | null;

  if (!file || !(file instanceof File)) {
    return { error: 'No file provided' };
  }

  if (!folder) {
    return { error: 'Upload folder is required' };
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return {
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathname = `${folder}/${user.id}-${Date.now()}-${sanitizedName}`;

  try {
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    });

    return { data: { url: blob.url } };
  } catch (error) {
    console.error('Upload error:', error);
    return { error: 'Failed to upload file. Please try again.' };
  }
}

export async function deleteFileAction(
  url: string
): Promise<{ success: true } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  if (!url || !url.includes('.public.blob.vercel-storage.com')) {
    return { error: 'Invalid blob URL' };
  }

  try {
    await del(url);
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { error: 'Failed to delete file.' };
  }
}
