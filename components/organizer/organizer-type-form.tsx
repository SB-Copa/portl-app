'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type OrganizerType = 'INDIVIDUAL' | 'TEAM' | 'COMPANY';

interface OrganizerTypeFormProps {
  initialData?: {
    organizerType?: OrganizerType;
    organizerDescription?: string;
  };
  onSave: (data: { organizerType: OrganizerType; organizerDescription?: string }) => Promise<void>;
  onSaveAndExit: (data: { organizerType: OrganizerType; organizerDescription?: string }) => Promise<void>;
}

export function OrganizerTypeForm({ initialData, onSave, onSaveAndExit }: OrganizerTypeFormProps) {
  const [organizerType, setOrganizerType] = useState<OrganizerType | undefined>(
    initialData?.organizerType
  );
  const [description, setDescription] = useState(initialData?.organizerDescription || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (shouldExit = false) => {
    if (!organizerType) return;
    
    setIsLoading(true);
    try {
      const data = { organizerType, organizerDescription: description || undefined };
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
          <CardTitle>Organizer Type</CardTitle>
          <CardDescription>
            Help us understand what kind of organizer you are
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Select your organizer type *</Label>
            <RadioGroup value={organizerType} onValueChange={(value) => setOrganizerType(value as OrganizerType)}>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="INDIVIDUAL" id="individual" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="individual" className="cursor-pointer font-medium">
                    Individual / Solo Organizer
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    You organize events independently as an individual
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="TEAM" id="team" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="team" className="cursor-pointer font-medium">
                    Team / Collective
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    You work with a team or collective to organize events
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="COMPANY" id="company" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="company" className="cursor-pointer font-medium">
                    Company / Brand
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    You represent a registered company or brand
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Tell us a bit about yourself and your event organizing experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              This helps us better understand your background
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => handleSave(true)}
          disabled={!organizerType || isLoading}
        >
          Save & Exit
        </Button>
        <Button
          onClick={() => handleSave(false)}
          disabled={!organizerType || isLoading}
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
