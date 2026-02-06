'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, CheckCircle2, XCircle } from 'lucide-react';
import type { EventPortfolioData } from './event-portfolio';
import type { IdentityVerificationData } from './identity-verification-form';
import type { AgreementsData } from './agreements-form';

interface ReviewFormProps {
  eventPortfolio?: EventPortfolioData;
  identityVerification?: IdentityVerificationData;
  agreements?: AgreementsData;
  onEditStep: (step: number) => void;
  onSubmit: () => Promise<void>;
  canEdit: boolean;
}

export function ReviewForm({
  eventPortfolio,
  identityVerification,
  agreements,
  onEditStep,
  onSubmit,
  canEdit,
}: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['event-portfolio', 'identity', 'agreements']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit();
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = (section: string): boolean => {
    switch (section) {
      case 'event-portfolio':
        return !!eventPortfolio;
      case 'identity':
        return !!(identityVerification?.governmentIdUrl && identityVerification?.selfieWithIdUrl);
      case 'agreements':
        return !!(
          agreements?.tosAccepted &&
          agreements?.organizerAgreementAccepted &&
          agreements?.privacyPolicyAccepted &&
          agreements?.communityGuidelinesAccepted
        );
      default:
        return false;
    }
  };

  const canSubmit = isComplete('event-portfolio') && isComplete('identity') && isComplete('agreements');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Application</CardTitle>
          <CardDescription>
            Please review all sections before submitting. You can edit any section by clicking the Edit button.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Portfolio Section */}
          <div className="border rounded-lg">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('event-portfolio')}
            >
              <div className="flex items-center gap-3">
                {isComplete('event-portfolio') ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h3 className="font-medium">Event Portfolio</h3>
                  <p className="text-sm text-gray-500">Past events, venues, artists, and references</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isComplete('event-portfolio') ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Incomplete
                  </Badge>
                )}
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditStep(1);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            {expandedSections.has('event-portfolio') && (
              <div className="p-4 border-t bg-gray-50">
                {eventPortfolio ? (
                  <div className="space-y-3 text-sm">
                    {eventPortfolio.pastEvents && eventPortfolio.pastEvents.length > 0 && (
                      <div>
                        <strong>Past Events:</strong> {eventPortfolio.pastEvents.length} event(s)
                      </div>
                    )}
                    {eventPortfolio.venues && eventPortfolio.venues.length > 0 && (
                      <div>
                        <strong>Venues:</strong> {eventPortfolio.venues.length} venue(s)
                      </div>
                    )}
                    {eventPortfolio.artistsTalent && (
                      <div>
                        <strong>Artists & Talent:</strong> Provided
                      </div>
                    )}
                    {eventPortfolio.references && eventPortfolio.references.length > 0 && (
                      <div>
                        <strong>References:</strong> {eventPortfolio.references.length} reference(s)
                      </div>
                    )}
                    {!eventPortfolio.pastEvents?.length &&
                      !eventPortfolio.venues?.length &&
                      !eventPortfolio.artistsTalent &&
                      !eventPortfolio.references?.length && (
                        <p className="text-gray-500 italic">No portfolio information provided</p>
                      )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No portfolio information provided</p>
                )}
              </div>
            )}
          </div>

          {/* Identity Verification Section */}
          <div className="border rounded-lg">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('identity')}
            >
              <div className="flex items-center gap-3">
                {isComplete('identity') ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h3 className="font-medium">Identity Verification</h3>
                  <p className="text-sm text-gray-500">Government ID, selfie, and business documents</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isComplete('identity') ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Incomplete
                  </Badge>
                )}
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditStep(2);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            {expandedSections.has('identity') && (
              <div className="p-4 border-t bg-gray-50">
                {identityVerification ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Government ID:</strong>{' '}
                      {identityVerification.governmentIdUrl ? (
                        <span className="text-green-600">✓ Provided</span>
                      ) : (
                        <span className="text-red-600">✗ Missing</span>
                      )}
                    </div>
                    <div>
                      <strong>Selfie with ID:</strong>{' '}
                      {identityVerification.selfieWithIdUrl ? (
                        <span className="text-green-600">✓ Provided</span>
                      ) : (
                        <span className="text-red-600">✗ Missing</span>
                      )}
                    </div>
                    <div>
                      <strong>Business ID:</strong>{' '}
                      {identityVerification.businessIdUrl ? (
                        <span className="text-green-600">✓ Provided</span>
                      ) : (
                        <span className="text-gray-500">Optional - Not provided</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No identity verification documents provided</p>
                )}
              </div>
            )}
          </div>

          {/* Agreements Section */}
          <div className="border rounded-lg">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('agreements')}
            >
              <div className="flex items-center gap-3">
                {isComplete('agreements') ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h3 className="font-medium">Agreements</h3>
                  <p className="text-sm text-gray-500">Terms of Service, Organizer Agreement, Privacy Policy, Community Guidelines</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isComplete('agreements') ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Incomplete
                  </Badge>
                )}
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditStep(3);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            {expandedSections.has('agreements') && (
              <div className="p-4 border-t bg-gray-50">
                {agreements ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Terms of Service:</strong>{' '}
                      {agreements.tosAccepted ? (
                        <span className="text-green-600">✓ Accepted</span>
                      ) : (
                        <span className="text-red-600">✗ Not accepted</span>
                      )}
                    </div>
                    <div>
                      <strong>Organizer Agreement:</strong>{' '}
                      {agreements.organizerAgreementAccepted ? (
                        <span className="text-green-600">✓ Accepted</span>
                      ) : (
                        <span className="text-red-600">✗ Not accepted</span>
                      )}
                    </div>
                    <div>
                      <strong>Privacy Policy:</strong>{' '}
                      {agreements.privacyPolicyAccepted ? (
                        <span className="text-green-600">✓ Accepted</span>
                      ) : (
                        <span className="text-red-600">✗ Not accepted</span>
                      )}
                    </div>
                    <div>
                      <strong>Community Guidelines:</strong>{' '}
                      {agreements.communityGuidelinesAccepted ? (
                        <span className="text-green-600">✓ Accepted</span>
                      ) : (
                        <span className="text-red-600">✗ Not accepted</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No agreements accepted</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!canSubmit && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <strong>Please complete all sections</strong> before submitting your application.
          </p>
        </div>
      )}

      {!canEdit && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Application Under Review:</strong> Your application is currently being reviewed by our team.
            You cannot make changes at this time.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || !canEdit || isLoading}
          size="lg"
        >
          {isLoading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  );
}
