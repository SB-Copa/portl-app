'use client';

import { Button } from '@/components/ui/button';
import { Star, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface GalleryImageCardProps {
  imageId: string;
  imageUrl: string;
  index: number;
  totalImages: number;
  isThumbnail: boolean;
  isDefaultThumbnail: boolean;
  isDeleting: boolean;
  isReordering: boolean;
  isSettingThumbnail: boolean;
  onSetThumbnail: (imageUrl: string) => void;
  onReorder: (imageId: string, direction: 'up' | 'down') => void;
  onDelete: (imageId: string) => void;
}

export function GalleryImageCard({
  imageId,
  imageUrl,
  index,
  totalImages,
  isThumbnail,
  isDefaultThumbnail,
  isDeleting,
  isReordering,
  isSettingThumbnail,
  onSetThumbnail,
  onReorder,
  onDelete,
}: GalleryImageCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-gray-50">
      <div className="aspect-[16/9]">
        <img
          src={imageUrl}
          alt={`Gallery image ${index + 1}`}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="rounded bg-black/60 px-2 py-1 text-xs text-white">
            {index + 1}
          </span>
        </div>

        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => onSetThumbnail(imageUrl)}
            disabled={isSettingThumbnail}
            title={isThumbnail ? 'Clear thumbnail' : 'Set as thumbnail'}
          >
            <Star
              className={`h-4 w-4 ${isThumbnail ? 'fill-yellow-500 text-yellow-500' : ''}`}
            />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => onReorder(imageId, 'up')}
            disabled={index === 0 || isReordering}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={() => onReorder(imageId, 'down')}
            disabled={index === totalImages - 1 || isReordering}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(imageId)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thumbnail badge */}
      {isThumbnail && (
        <div className="absolute bottom-2 left-2">
          <span className="flex items-center gap-1 rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
            <Star className="h-3 w-3 fill-white" />
            Thumbnail
          </span>
        </div>
      )}

      {/* Default thumbnail indicator */}
      {isDefaultThumbnail && (
        <div className="absolute bottom-2 left-2">
          <span className="rounded bg-black/60 px-2 py-1 text-xs text-white">
            Default thumbnail
          </span>
        </div>
      )}
    </div>
  );
}
