import type { Event, EventImage } from '@/prisma/generated/prisma/client';

export type EventWithImages = Event & {
  images: EventImage[];
};

export interface GallerySectionProps {
  event: EventWithImages;
  tenantSubdomain: string;
}

export const MAX_IMAGES = 10;
