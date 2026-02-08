'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export interface EventPortfolioEntry {
  hasOrganizedBefore: boolean;
  eventName?: string;
  eventType?: string;
  year?: string;
  plannedEventType?: string;
  expectedTimeframe?: string;
}

interface EventPortfolioFormProps {
  initialData?: EventPortfolioEntry[];
  onSave: (data: EventPortfolioEntry[]) => Promise<void>;
  onSaveAndExit: (data: EventPortfolioEntry[]) => Promise<void>;
}

export function EventPortfolioForm({ initialData, onSave, onSaveAndExit }: EventPortfolioFormProps) {
  const [hasOrganizedBefore, setHasOrganizedBefore] = useState<boolean | undefined>(
    initialData && initialData.length > 0 ? initialData[0].hasOrganizedBefore : undefined
  );
  const [entries, setEntries] = useState<EventPortfolioEntry[]>(
    initialData || [{ hasOrganizedBefore: false }]
  );
  const [isLoading, setIsLoading] = useState(false);

  const addEntry = () => {
    setEntries([...entries, { hasOrganizedBefore: true }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: string, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const handleHasOrganizedChange = (value: string) => {
    const organized = value === 'yes';
    setHasOrganizedBefore(organized);
    setEntries([{ hasOrganizedBefore: organized }]);
  };

  const handleSave = async (shouldExit = false) => {
    if (hasOrganizedBefore === undefined) return;

    setIsLoading(true);
    try {
      const data = entries.map(entry => ({
        ...entry,
        hasOrganizedBefore: hasOrganizedBefore,
      }));
      
      if (shouldExit) {
        await onSaveAndExit(data);
      } else {
        await onSave(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = () => {
    if (hasOrganizedBefore === undefined) return false;
    
    if (hasOrganizedBefore) {
      return entries.every(e => e.eventName && e.eventType && e.year);
    } else {
      return entries[0]?.plannedEventType && entries[0]?.expectedTimeframe;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Portfolio</CardTitle>
          <CardDescription>
            Tell us about your event organizing experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Have you organized events before? *</Label>
            <RadioGroup
              value={hasOrganizedBefore === undefined ? undefined : hasOrganizedBefore ? 'yes' : 'no'}
              onValueChange={handleHasOrganizedChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {hasOrganizedBefore === true && (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Event {index + 1}</h3>
                      {entries.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEntry(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`eventName-${index}`}>Event Name *</Label>
                      <Input
                        id={`eventName-${index}`}
                        placeholder="e.g., Tech Conference 2024"
                        value={entry.eventName || ''}
                        onChange={(e) => updateEntry(index, 'eventName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`eventType-${index}`}>Event Type *</Label>
                      <Input
                        id={`eventType-${index}`}
                        placeholder="e.g., Conference, Workshop, Concert"
                        value={entry.eventType || ''}
                        onChange={(e) => updateEntry(index, 'eventType', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`year-${index}`}>Year *</Label>
                      <Input
                        id={`year-${index}`}
                        type="number"
                        placeholder="e.g., 2024"
                        value={entry.year || ''}
                        onChange={(e) => updateEntry(index, 'year', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" onClick={addEntry} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Event
              </Button>
            </div>
          )}

          {hasOrganizedBefore === false && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plannedEventType">Planned Event Type *</Label>
                <Input
                  id="plannedEventType"
                  placeholder="e.g., Music Festival, Workshop Series"
                  value={entries[0]?.plannedEventType || ''}
                  onChange={(e) => updateEntry(0, 'plannedEventType', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedTimeframe">Expected Timeframe *</Label>
                <Input
                  id="expectedTimeframe"
                  placeholder="e.g., Q2 2026, Summer 2026"
                  value={entries[0]?.expectedTimeframe || ''}
                  onChange={(e) => updateEntry(0, 'expectedTimeframe', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => handleSave(true)}
          disabled={!isValid() || isLoading}
        >
          Save & Exit
        </Button>
        <Button
          onClick={() => handleSave(false)}
          disabled={!isValid() || isLoading}
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
