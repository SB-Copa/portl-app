'use client';

import { useState } from 'react';
import { AddImageDialog } from './gallery/add-image-dialog';
import { ImageGrid } from './gallery/image-grid';
import { EmptyGallery } from './gallery/empty-gallery';
import { MAX_IMAGES } from './gallery/types';
import type { GallerySectionProps } from './gallery/types';

export function GallerySection({ event, tenantSubdomain }: GallerySectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Gallery</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {event.images.length} of {MAX_IMAGES} images
          </p>
        </div>
        <AddImageDialog
          eventId={event.id}
          tenantSubdomain={tenantSubdomain}
          disabled={event.images.length >= MAX_IMAGES}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
        />
      </div>

      {event.images.length === 0 ? (
        <EmptyGallery onAddImage={() => setAddDialogOpen(true)} />
      ) : (
        <ImageGrid event={event} tenantSubdomain={tenantSubdomain} />
      )}
    </div>
  );
}
