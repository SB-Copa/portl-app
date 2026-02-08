'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';
import {
  approveApplicationAction,
  rejectApplicationAction,
  updateApplicationStatusAction,
  addApplicationNoteAction,
  updateApplicationNoteAction,
  deleteApplicationNoteAction,
} from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trash2,
  Edit2,
  Check,
  X,
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  Image,
  Video,
  Users,
  MapPin,
  Music,
  UserCheck,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { OrganizerApplication, Prisma } from '@/prisma/generated/prisma/client';

type Application = OrganizerApplication & Prisma.OrganizerApplicationGetPayload<{
  include: {
    tenant: {
      include: {
        owner: {
          select: {
            id: true;
            email: true;
            firstName: true;
            lastName: true;
          };
        };
      };
    };
    notes: {
      include: {
        user: {
          select: {
            id: true;
            email: true;
            firstName: true;
            lastName: true;
          };
        };
      };
    };
  };
}>;

interface ApplicationDetailViewProps {
  application: Application;
}

const statusConfig = {
  NOT_STARTED: { color: 'bg-muted text-muted-foreground', label: 'Not Started', dot: 'bg-muted-foreground' },
  IN_PROGRESS: { color: 'bg-blue-500/15 text-blue-500 border-blue-500/20', label: 'In Progress', dot: 'bg-blue-500' },
  SUBMITTED: { color: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20', label: 'Submitted', dot: 'bg-yellow-500' },
  APPROVED: { color: 'bg-green-500/15 text-green-500 border-green-500/20', label: 'Approved', dot: 'bg-green-500' },
  REJECTED: { color: 'bg-red-500/15 text-red-500 border-red-500/20', label: 'Rejected', dot: 'bg-red-500' },
};

// Safely parse JSON fields from the application
function parseJson<T>(value: unknown): T | null {
  if (!value) return null;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value as T;
  } catch {
    return null;
  }
}

interface PastEvent {
  name?: string;
  title?: string;
  date?: string;
  photos?: string[];
  videoLinks?: string[];
  estimatedAttendance?: string;
  pressCoverage?: string;
  description?: string;
  attendees?: string;
}

interface Venue {
  name?: string;
  relationship?: string;
  images?: string[];
}

interface ArtistsTalent {
  notableArtists?: string;
  recurringTalent?: string;
}

interface Reference {
  name?: string;
  company?: string;
  contact?: string;
  type?: string;
}

export function ApplicationDetailView({ application }: ApplicationDetailViewProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const ownerName = application.tenant.owner.firstName && application.tenant.owner.lastName
    ? `${application.tenant.owner.firstName} ${application.tenant.owner.lastName}`
    : application.tenant.owner.email;

  // Parse all submission data
  const pastEvents = parseJson<PastEvent[]>(application.pastEvents);
  const venues = parseJson<Venue[]>(application.venuesWorkedWith);
  const artists = parseJson<ArtistsTalent>(application.artistsTalent);
  const references = parseJson<Reference[]>(application.references);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    const result = await addApplicationNoteAction(application.id, newNote);
    setIsAddingNote(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Note added');
      setNewNote('');
      router.refresh();
    }
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editNoteText.trim()) return;
    setIsLoading(true);
    const result = await updateApplicationNoteAction(noteId, editNoteText);
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Note updated');
      setEditingNoteId(null);
      setEditNoteText('');
      router.refresh();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    setIsLoading(true);
    const result = await deleteApplicationNoteAction(noteId);
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Note deleted');
      router.refresh();
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    const result = await approveApplicationAction(application.id, reviewNotes);
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Application approved');
      router.refresh();
      setReviewNotes('');
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    const result = await rejectApplicationAction(application.id, reviewNotes);
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.error('Application rejected');
      router.refresh();
      setReviewNotes('');
    }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    setIsLoading(true);
    const result = await updateApplicationStatusAction(
      application.id,
      selectedStatus as 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED',
      reviewNotes
    );
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Status updated');
      router.refresh();
      setReviewNotes('');
      setSelectedStatus('');
    }
  };

  const formatUserName = (user: { firstName: string | null; lastName: string | null; email: string }) => {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    return user.email;
  };

  const referenceTypeLabels: Record<string, string> = {
    client_testimonial: 'Client Testimonial',
    partner: 'Partner',
    industry: 'Industry Reference',
  };

  const status = application.status as keyof typeof statusConfig;
  const config = statusConfig[status];

  const allComplianceAccepted = application.tosAccepted
    && application.organizerAgreementAccepted
    && application.privacyPolicyAccepted
    && application.communityGuidelinesAccepted;

  const hasPortfolioData = pastEvents?.length || venues?.length || artists?.notableArtists || artists?.recurringTalent || references?.length;
  const hasIdentityDocs = application.governmentIdUrl || application.selfieWithIdUrl || application.businessIdUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
            <TabsTrigger value="notes">
              Notes {application.notes.length > 0 && `(${application.notes.length})`}
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4" />
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Business Name</p>
                    <p className="text-sm font-medium">{application.tenant.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Subdomain</p>
                    <p className="text-sm font-mono">{application.tenant.subdomain}.portl.com</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Business Email</p>
                    <p className="text-sm">{application.tenant.businessEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Business Phone</p>
                    <p className="text-sm">{application.tenant.businessPhone}</p>
                  </div>
                  {application.tenant.contactEmail && !application.tenant.sameAsBusinessContact && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Contact Email</p>
                      <p className="text-sm">{application.tenant.contactEmail}</p>
                    </div>
                  )}
                  {application.tenant.contactPhone && !application.tenant.sameAsBusinessContact && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Contact Phone</p>
                      <p className="text-sm">{application.tenant.contactPhone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Owner</p>
                    <p className="text-sm font-medium">{ownerName}</p>
                    <p className="text-xs text-muted-foreground">{application.tenant.owner.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tenant Type</p>
                    <Badge variant="outline" className="capitalize">
                      {application.tenant.type.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Application Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <StepIndicator
                    step={1}
                    label="Event Portfolio"
                    completed={application.currentStep > 1 || status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED'}
                    current={application.currentStep === 1 && status !== 'SUBMITTED' && status !== 'APPROVED' && status !== 'REJECTED'}
                    hasData={!!hasPortfolioData}
                  />
                  <StepIndicator
                    step={2}
                    label="Identity Verification"
                    completed={application.currentStep > 2 || status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED'}
                    current={application.currentStep === 2 && status !== 'SUBMITTED' && status !== 'APPROVED' && status !== 'REJECTED'}
                    hasData={!!hasIdentityDocs}
                  />
                  <StepIndicator
                    step={3}
                    label="Agreements"
                    completed={status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED'}
                    current={application.currentStep === 3 && status !== 'SUBMITTED' && status !== 'APPROVED' && status !== 'REJECTED'}
                    hasData={allComplianceAccepted}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-0">
                  <TimelineEntry
                    label="Created"
                    date={application.createdAt}
                    isFirst
                  />
                  <TimelineEntry
                    label="Last Updated"
                    date={application.updatedAt}
                  />
                  {application.submittedAt && (
                    <TimelineEntry
                      label="Submitted"
                      date={application.submittedAt}
                      highlight
                    />
                  )}
                  {application.reviewStartedAt && (
                    <TimelineEntry
                      label="Review Started"
                      date={application.reviewStartedAt}
                    />
                  )}
                  {application.reviewedAt && (
                    <TimelineEntry
                      label={status === 'APPROVED' ? 'Approved' : status === 'REJECTED' ? 'Rejected' : 'Reviewed'}
                      date={application.reviewedAt}
                      highlight
                      variant={status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'destructive' : 'default'}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Review Notes (if any) */}
            {application.reviewNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Review Decision Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                    {application.reviewNotes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SUBMISSION TAB */}
          <TabsContent value="submission" className="space-y-6">
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
                    <DocImage
                      label="Government ID"
                      url={application.governmentIdUrl}
                      required
                    />
                    <DocImage
                      label="Selfie with ID"
                      url={application.selfieWithIdUrl}
                      required
                    />
                    <DocImage
                      label="Business ID"
                      url={application.businessIdUrl}
                    />
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
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" />
                  Internal Notes
                </CardTitle>
                <CardDescription>Private notes visible only to admins</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Note */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={isAddingNote || !newNote.trim()}
                    size="sm"
                  >
                    {isAddingNote ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>

                <Separator />

                {/* Notes List */}
                {application.notes.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notes yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {application.notes.map((note) => (
                      <div key={note.id} className="rounded-lg border p-4">
                        {editingNoteId === note.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editNoteText}
                              onChange={(e) => setEditNoteText(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveEdit(note.id)} disabled={isLoading}>
                                <Check className="h-3 w-3 mr-1" /> Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setEditingNoteId(null); setEditNoteText(''); }} disabled={isLoading}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium">{formatUserName(note.user)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(note.createdAt), 'MMM d, yyyy')} at {format(new Date(note.createdAt), 'h:mm a')}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => { setEditingNoteId(note.id); setEditNoteText(note.note); }}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteNote(note.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="space-y-4 lg:sticky lg:top-6 h-fit">
        {/* Actions Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={config.color}>{config.label}</Badge>
            </div>

            {/* Approve/Reject for SUBMITTED */}
            {application.status === 'SUBMITTED' && !selectedStatus && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                    <p className="text-xs font-medium text-yellow-500 flex items-center gap-1.5 mb-3">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Awaiting Review
                    </p>
                    <div className="space-y-2">
                      <Button
                        onClick={handleApprove}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isLoading}
                        className="w-full"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Decision notes (optional)</Label>
                    <Textarea
                      placeholder="Reason for decision..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={2}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Status Override */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Change Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Override status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {selectedStatus && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Notes for status change..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleStatusChange} disabled={isLoading} size="sm" className="flex-1">
                      Update
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedStatus(''); setReviewNotes(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meta Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application ID</span>
              <span className="font-mono text-xs">{application.id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tenant</span>
              <span className="font-mono text-xs">{application.tenant.id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tenant Status</span>
              <Badge variant="outline" className="text-xs">{application.tenant.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-xs">
                {status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED'
                  ? 'Complete'
                  : `Step ${application.currentStep}/3`}
              </span>
            </div>
            {application.reviewedBy && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviewed By</span>
                <span className="text-xs">{application.reviewedBy.slice(0, 12)}...</span>
              </div>
            )}
            {application.submittedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span className="text-xs">{format(new Date(application.submittedAt), 'MMM d, yyyy')}</span>
              </div>
            )}
            {application.reviewedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviewed</span>
                <span className="text-xs">{format(new Date(application.reviewedAt), 'MMM d, yyyy')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StepIndicator({ step, label, completed, current, hasData }: {
  step: number;
  label: string;
  completed: boolean;
  current: boolean;
  hasData: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 text-center ${current ? 'border-primary bg-primary/5' : completed ? 'border-green-500/30 bg-green-500/5' : ''}`}>
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold mb-1.5 ${
        completed ? 'bg-green-500/20 text-green-500' : current ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
      }`}>
        {completed ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {completed ? 'Completed' : hasData ? 'In progress' : 'Not started'}
      </p>
    </div>
  );
}

function TimelineEntry({ label, date, isFirst, highlight, variant }: {
  label: string;
  date: Date | string;
  isFirst?: boolean;
  highlight?: boolean;
  variant?: 'default' | 'success' | 'destructive';
}) {
  const d = new Date(date);
  const dotColor = variant === 'success' ? 'bg-green-500' : variant === 'destructive' ? 'bg-red-500' : highlight ? 'bg-primary' : 'bg-muted-foreground/50';

  return (
    <div className="flex gap-3 pb-4 last:pb-0">
      <div className="flex flex-col items-center">
        <div className={`h-2.5 w-2.5 rounded-full mt-1.5 ${dotColor}`} />
        <div className="w-px flex-1 bg-border last:hidden" />
      </div>
      <div className="flex-1 pb-1">
        <p className={`text-sm ${highlight ? 'font-medium' : ''}`}>{label}</p>
        <p className="text-xs text-muted-foreground">
          {format(d, 'MMM d, yyyy')} at {format(d, 'h:mm a')} &middot; {formatDistanceToNow(d, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

function DocImage({ label, url, required }: { label: string; url: string | null; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        {label} {required && !url && <span className="text-destructive">*</span>}
      </p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={url}
            alt={label}
            className="rounded-lg border object-cover aspect-[3/4] w-full hover:opacity-80 transition-opacity"
          />
        </a>
      ) : (
        <div className="rounded-lg border border-dashed flex items-center justify-center aspect-[3/4] bg-muted/50">
          <p className="text-xs text-muted-foreground">Not uploaded</p>
        </div>
      )}
    </div>
  );
}

function ComplianceItem({ label, accepted }: { label: string; accepted: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md border">
      <span className="text-sm">{label}</span>
      {accepted ? (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Accepted
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
          <XCircle className="h-3 w-3 mr-1" /> Not accepted
        </Badge>
      )}
    </div>
  );
}

function EmptyField() {
  return (
    <p className="text-sm text-muted-foreground italic py-2">No data provided</p>
  );
}
