import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, Plus } from 'lucide-react';

interface EmptyGalleryProps {
  onAddImage: () => void;
}

export function EmptyGallery({ onAddImage }: EmptyGalleryProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No images yet</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          Add images to showcase your event. The first image will be used as the default thumbnail.
        </p>
        <Button onClick={onAddImage}>
          <Plus className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </CardContent>
    </Card>
  );
}
