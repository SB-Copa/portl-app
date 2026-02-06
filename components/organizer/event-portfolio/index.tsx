'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PastEventsForm, type PastEvent } from './past-events-form';
import { VenuesForm, type Venue } from './venues-form';
import { ArtistsForm, type ArtistsTalent } from './artists-form';
import { ReferencesForm, type Reference } from './references-form';

export interface EventPortfolioData {
  pastEvents?: PastEvent[];
  venues?: Venue[];
  artistsTalent?: ArtistsTalent;
  references?: Reference[];
}

interface EventPortfolioFormProps {
  initialData?: EventPortfolioData;
  onSave: (data: EventPortfolioData) => Promise<void>;
  onSaveAndExit: (data: EventPortfolioData) => Promise<void>;
}

type PortfolioTab = 'past-events' | 'venues' | 'artists' | 'references';

export function EventPortfolioForm({ initialData, onSave, onSaveAndExit }: EventPortfolioFormProps) {
  const [activeTab, setActiveTab] = useState<PortfolioTab>('past-events');
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<EventPortfolioData>(initialData || {});

  const updateData = (section: keyof EventPortfolioData, data: any) => {
    const newData = { ...portfolioData, [section]: data };
    setPortfolioData(newData);
  };

  const handleSave = async (shouldExit = false) => {
    setIsLoading(true);
    try {
      if (shouldExit) {
        await onSaveAndExit(portfolioData);
      } else {
        await onSave(portfolioData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'past-events' as PortfolioTab, label: 'Past Events' },
    { id: 'venues' as PortfolioTab, label: 'Venues' },
    { id: 'artists' as PortfolioTab, label: 'Artists / Talent' },
    { id: 'references' as PortfolioTab, label: 'References' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Portfolio</CardTitle>
          <CardDescription>
            Showcase your event organizing experience and relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'past-events' && (
              <PastEventsForm
                initialData={portfolioData.pastEvents}
                onChange={(data) => updateData('pastEvents', data)}
              />
            )}

            {activeTab === 'venues' && (
              <VenuesForm
                initialData={portfolioData.venues}
                onChange={(data) => updateData('venues', data)}
              />
            )}

            {activeTab === 'artists' && (
              <ArtistsForm
                initialData={portfolioData.artistsTalent}
                onChange={(data) => updateData('artistsTalent', data)}
              />
            )}

            {activeTab === 'references' && (
              <ReferencesForm
                initialData={portfolioData.references}
                onChange={(data) => updateData('references', data)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => handleSave(true)}
          disabled={isLoading}
        >
          Save & Exit
        </Button>
        <Button
          onClick={() => handleSave(false)}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
