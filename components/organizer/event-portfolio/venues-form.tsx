'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export interface Venue {
  name: string;
  relationship: 'owner' | 'partner' | 'renter';
  images: string[]; // URLs - max 2
}

interface VenuesFormProps {
  initialData?: Venue[];
  onChange: (venues: Venue[]) => void;
}

export function VenuesForm({ initialData, onChange }: VenuesFormProps) {
  const [venues, setVenues] = useState<Venue[]>(
    initialData && initialData.length > 0
      ? initialData
      : [{ name: '', relationship: 'renter', images: [] }]
  );

  const updateVenue = (index: number, field: keyof Venue, value: string | string[]) => {
    const newVenues = [...venues];
    newVenues[index] = { ...newVenues[index], [field]: value };
    setVenues(newVenues);
    onChange(newVenues);
  };

  const addVenue = () => {
    if (venues.length >= 10) return;
    const newVenues = [...venues, { name: '', relationship: 'renter' as const, images: [] }];
    setVenues(newVenues);
    onChange(newVenues);
  };

  const removeVenue = (index: number) => {
    if (venues.length <= 1) return;
    const newVenues = venues.filter((_, i) => i !== index);
    setVenues(newVenues);
    onChange(newVenues);
  };

  const addImage = (venueIndex: number, imageUrl: string) => {
    const venue = venues[venueIndex];
    if (venue.images.length >= 2) return;
    const newImages = [...venue.images, imageUrl];
    updateVenue(venueIndex, 'images', newImages);
  };

  const removeImage = (venueIndex: number, imageIndex: number) => {
    const venue = venues[venueIndex];
    const newImages = venue.images.filter((_, i) => i !== imageIndex);
    updateVenue(venueIndex, 'images', newImages);
  };

  return (
    <div className="space-y-4">
      {venues.map((venue, venueIndex) => (
        <Card key={venueIndex}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Venue {venueIndex + 1}</h3>
              {venues.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVenue(venueIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`venue-name-${venueIndex}`}>Venue Name</Label>
              <Input
                id={`venue-name-${venueIndex}`}
                placeholder="e.g., Grand Convention Center"
                value={venue.name}
                onChange={(e) => updateVenue(venueIndex, 'name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`venue-relationship-${venueIndex}`}>Relationship</Label>
              <Select
                value={venue.relationship}
                onValueChange={(value) => updateVenue(venueIndex, 'relationship', value as 'owner' | 'partner' | 'renter')}
              >
                <SelectTrigger id={`venue-relationship-${venueIndex}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="renter">Renter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Venue Images (up to 2)</Label>
              <div className="space-y-2">
                {venue.images.map((image, imageIndex) => (
                  <div key={imageIndex} className="flex items-center gap-2">
                    <Input
                      placeholder="Image URL (Vercel Blob placeholder)"
                      value={image}
                      onChange={(e) => {
                        const newImages = [...venue.images];
                        newImages[imageIndex] = e.target.value;
                        updateVenue(venueIndex, 'images', newImages);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(venueIndex, imageIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {venue.images.length < 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addImage(venueIndex, '')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {venues.length < 10 && (
        <Button variant="outline" onClick={addVenue} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Venue
        </Button>
      )}
    </div>
  );
}
