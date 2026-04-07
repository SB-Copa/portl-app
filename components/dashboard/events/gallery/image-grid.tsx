'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  deleteEventImageAction,
  reorderEventImagesAction,
  setEventThumbnailAction,
} from '@/app/actions/tenant-events';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { GalleryImageCard } from './gallery-image-card';
import type { EventWithImages } from './types';

interface ImageGridProps {
  event: EventWithImages;
  tenantSubdomain: string;
}

export function ImageGrid({ event, tenantSubdomain }: ImageGridProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isSettingThumbnail, setIsSettingThumbnail] = useState(false);

  const handleDeleteImage = async (imageId: string) => {
    setIsDeleting(imageId);
    const result = await deleteEventImageAction(tenantSubdomain, imageId);
    setIsDeleting(null);
    setDeleteTarget(null);

    if ('error' in result) {
      toast.error(result.error);
    } else {
      toast.success('Image removed');
      router.refresh();
    }
  };

  const handleReorder = async (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = event.images.findIndex((img) => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= event.images.length) return;

    const newOrder = [...event.images];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, moved);

    setIsReordering(true);
    const result = await reorderEventImagesAction(
      tenantSubdomain,
      event.id,
      newOrder.map((img) => img.id)
    );
    setIsReordering(false);

    if ('error' in result) {
      toast.error(result.error);
    } else {
      router.refresh();
    }
  };

  const handleSetThumbnail = async (imageUrl: string) => {
    setIsSettingThumbnail(true);
    const isCurrent = event.thumbnailUrl === imageUrl;
    const result = await setEventThumbnailAction(
      tenantSubdomain,
      event.id,
      isCurrent ? null : imageUrl
    );
    setIsSettingThumbnail(false);

    if ('error' in result) {
      toast.error(result.error);
    } else {
      toast.success(isCurrent ? 'Thumbnail cleared (will use first gallery image)' : 'Thumbnail set');
      router.refresh();
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Event Images</CardTitle>
        <CardDescription>
          Click the star to set an image as the event thumbnail. Use arrows to reorder.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {event.images.map((image, index) => (
            <GalleryImageCard
              key={image.id}
              imageId={image.id}
              imageUrl={image.url}
              index={index}
              totalImages={event.images.length}
              isThumbnail={event.thumbnailUrl === image.url}
              isDefaultThumbnail={!event.thumbnailUrl && index === 0}
              isDeleting={isDeleting === image.id}
              isReordering={isReordering}
              isSettingThumbnail={isSettingThumbnail}
              onSetThumbnail={handleSetThumbnail}
              onReorder={handleReorder}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      </CardContent>
    </Card>

    <ConfirmationDialog
      open={!!deleteTarget}
      onOpenChange={(open) => !open && setDeleteTarget(null)}
      title="Delete image"
      description="Are you sure you want to delete this image?"
      confirmLabel="Delete"
      variant="destructive"
      loading={!!isDeleting}
      onConfirm={() => deleteTarget && handleDeleteImage(deleteTarget)}
    />
  </>
  );
}
