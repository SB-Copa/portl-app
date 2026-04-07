import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Image,
  Video,
  Users,
  MapPin,
  Music,
  UserCheck,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { type Application, type PastEvent, type Venue, type ArtistsTalent, type Reference, parseJson, referenceTypeLabels } from './types';
import { DocImage, ComplianceItem, EmptyField } from './helpers';

interface SubmissionTabProps {
  application: Application;
}

export function SubmissionTab({ application }: SubmissionTabProps) {
  const pastEvents = parseJson<PastEvent[]>(application.pastEvents);
  const venues = parseJson<Venue[]>(application.venuesWorkedWith);
  const artists = parseJson<ArtistsTalent>(application.artistsTalent);
  const references = parseJson<Reference[]>(application.references);
  const hasIdentityDocs = application.governmentIdUrl || application.selfieWithIdUrl || application.businessIdUrl;

  return (
    <div className="space-y-6">
      {/* Step 1: Event Portfolio */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
            <CardTitle className="text-base">Event Portfolio</CardTitle>
          </div>
          <CardDescription>Past events, venues, artists, and references</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Past Events */}
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Past Events
            </h4>
            {pastEvents && pastEvents.length > 0 ? (
              <div className="space-y-3">
                {pastEvents.map((event, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{event.name || event.title || `Event ${i + 1}`}</p>
                        {event.date && (
                          <p className="text-xs text-muted-foreground mt-0.5">{event.date}</p>
                        )}
                      </div>
                      {event.estimatedAttendance && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {event.estimatedAttendance} attendees
                        </Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    {event.pressCoverage && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Press Coverage</p>
                        <p className="text-sm">{event.pressCoverage}</p>
                      </div>
                    )}
                    {event.photos && event.photos.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <Image className="h-3 w-3" /> Photos ({event.photos.length})
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {event.photos.map((url, pi) => (
                            <a key={pi} href={url} target="_blank" rel="noopener noreferrer" className="block">
                              <img
                                src={url}
                                alt={`Event photo ${pi + 1}`}
                                className="rounded-md border object-cover aspect-square w-full hover:opacity-80 transition-opacity"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {event.videoLinks && event.videoLinks.filter(Boolean).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <Video className="h-3 w-3" /> Videos ({event.videoLinks.filter(Boolean).length})
                        </p>
                        <div className="space-y-1">
                          {event.videoLinks.filter(Boolean).map((url, vi) => (
                            <a
                              key={vi}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyField />
            )}
          </div>

          <Separator />

          {/* Venues */}
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Venues
            </h4>
            {venues && venues.length > 0 ? (
              <div className="space-y-3">
                {venues.map((venue, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm">{venue.name || `Venue ${i + 1}`}</p>
                      {venue.relationship && (
                        <Badge variant="outline" className="text-xs capitalize">{venue.relationship}</Badge>
                      )}
                    </div>
                    {venue.images && venue.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {venue.images.map((url, vi) => (
                          <a key={vi} href={url} target="_blank" rel="noopener noreferrer" className="block">
                            <img
                              src={url}
                              alt={`Venue photo ${vi + 1}`}
                              className="rounded-md border object-cover aspect-video w-full hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyField />
            )}
          </div>

          <Separator />

          {/* Artists & Talent */}
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Music className="h-4 w-4 text-muted-foreground" />
              Artists & Talent
            </h4>
            {artists && (artists.notableArtists || artists.recurringTalent) ? (
              <div className="space-y-4">
                {artists.notableArtists && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notable Artists</p>
                    <p className="text-sm whitespace-pre-wrap">{artists.notableArtists}</p>
                  </div>
                )}
                {artists.recurringTalent && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Recurring Talent</p>
                    <p className="text-sm whitespace-pre-wrap">{artists.recurringTalent}</p>
                  </div>
                )}
              </div>
            ) : (
              <EmptyField />
            )}
          </div>

          <Separator />

          {/* References */}
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              References
            </h4>
            {references && references.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {references.map((ref, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{ref.name || `Reference ${i + 1}`}</p>
                      {ref.type && (
                        <Badge variant="outline" className="text-xs">
                          {referenceTypeLabels[ref.type] || ref.type}
                        </Badge>
                      )}
                    </div>
                    {ref.company && <p className="text-xs text-muted-foreground">{ref.company}</p>}
                    {ref.contact && <p className="text-xs text-muted-foreground">{ref.contact}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyField />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Identity Verification */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
            <CardTitle className="text-base">Identity Verification</CardTitle>
          </div>
          <CardDescription>Government ID and selfie verification</CardDescription>
        </CardHeader>
        <CardContent>
          {hasIdentityDocs ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DocImage label="Government ID" url={application.governmentIdUrl} required />
              <DocImage label="Selfie with ID" url={application.selfieWithIdUrl} required />
              <DocImage label="Business ID" url={application.businessIdUrl} />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No identity documents uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Agreements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>
            <CardTitle className="text-base">Agreements & Compliance</CardTitle>
          </div>
          <CardDescription>Platform terms and policy acknowledgements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ComplianceItem label="Terms of Service" accepted={application.tosAccepted} />
            <ComplianceItem label="Organizer Agreement" accepted={application.organizerAgreementAccepted} />
            <ComplianceItem label="Privacy Policy" accepted={application.privacyPolicyAccepted} />
            <ComplianceItem label="Community Guidelines" accepted={application.communityGuidelinesAccepted} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
