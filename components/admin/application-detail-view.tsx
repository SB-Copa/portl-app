'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Briefcase,
  Award
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

const statusColors = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const statusLabels = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

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

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    setIsAddingNote(true);
    const result = await addApplicationNoteAction(application.id, newNote);
    setIsAddingNote(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Note added successfully');
      setNewNote('');
      router.refresh();
    }
  };

  const handleEditNote = (note: typeof application.notes[0]) => {
    setEditingNoteId(note.id);
    setEditNoteText(note.note);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editNoteText.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    setIsLoading(true);
    const result = await updateApplicationNoteAction(noteId, editNoteText);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Note updated successfully');
      setEditingNoteId(null);
      setEditNoteText('');
      router.refresh();
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteText('');
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setIsLoading(true);
    const result = await deleteApplicationNoteAction(noteId);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Note deleted successfully');
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
      toast.success('Application approved successfully');
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
      selectedStatus as any,
      reviewNotes
    );
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Application status updated');
      router.refresh();
      setReviewNotes('');
      setSelectedStatus('');
    }
  };

  const formatUserName = (user: typeof application.notes[0]['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  // Helper to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'SUBMITTED':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  // Helper to parse event portfolio
  const renderEventPortfolio = () => {
    if (!application.pastEvents) {
      return <p className="text-sm text-gray-500">No events provided</p>;
    }

    try {
      const portfolio = typeof application.pastEvents === 'string'
        ? JSON.parse(application.pastEvents)
        : application.pastEvents;

      if (Array.isArray(portfolio) && portfolio.length > 0) {
        return (
          <div className="space-y-3">
            {portfolio.map((event: any, index: number) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
              >
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  {event.name || event.title || `Event ${index + 1}`}
                </h4>
                {event.date && (
                  <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {event.date}
                  </p>
                )}
                {event.description && (
                  <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                )}
                {event.attendees && (
                  <p className="text-xs text-gray-600 mt-2">
                    <span className="font-medium">Attendees:</span> {event.attendees}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      }
    } catch (e) {
      // Fallback to raw display
    }

    return (
      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border border-gray-200">
        {JSON.stringify(application.pastEvents, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Header with Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusIcon(application.status)}
                  <span className="text-lg font-semibold text-gray-900">
                    {statusLabels[application.status as keyof typeof statusLabels]}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Organizer Type</p>
                <div className="flex items-center gap-2 mt-2">
                  <Briefcase className="h-5 w-5 text-gray-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    N/A
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <div className="flex items-center gap-2 mt-2">
                  <Award className="h-5 w-5 text-gray-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    {application.status === 'SUBMITTED' ||
                    application.status === 'APPROVED' ||
                    application.status === 'REJECTED'
                      ? 'Complete'
                      : `Step ${application.currentStep}/3`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    {application.submittedAt
                      ? formatDistanceToNow(new Date(application.submittedAt), {
                          addSuffix: true,
                        })
                      : 'Not yet'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Info */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle>Organization Information</CardTitle>
                  <CardDescription>Tenant and owner details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Subdomain
                      </p>
                      <p className="mt-1 font-mono text-sm font-semibold">
                        {application.tenant.subdomain}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Organization Name
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {application.tenant.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Business Email
                      </p>
                      <p className="mt-1 text-sm">{application.tenant.businessEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Business Phone
                      </p>
                      <p className="mt-1 text-sm">{application.tenant.businessPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Owner
                      </p>
                      <p className="mt-1 text-sm font-semibold">{ownerName}</p>
                      <p className="text-xs text-gray-600">
                        {application.tenant.owner.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tenant Status
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {application.tenant.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle>Application Details</CardTitle>
                  <CardDescription>Organizer application information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Portfolio
                </Label>
                <div className="mt-2">{renderEventPortfolio()}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Compliance
                  </Label>
                  <div className="mt-2">
                    {application.tosAccepted && application.organizerAgreementAccepted && application.privacyPolicyAccepted && application.communityGuidelinesAccepted ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3 w-3" />
                        Acknowledged
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1 w-fit">
                        <XCircle className="h-3 w-3" />
                        Not Acknowledged
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Application Progress
                  </Label>
                  <p className="mt-2 text-sm font-medium">
                    Step {application.currentStep} of 3
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-700 h-2 rounded-full transition-all"
                      style={{ width: `${(application.currentStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle>Timeline</CardTitle>
                  <CardDescription>Important dates and milestones</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-24 pt-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Created
                    </span>
                  </div>
                  <div className="flex-1 border-l-2 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(application.createdAt), 'PPP')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(application.createdAt), 'p')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-24 pt-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Updated
                    </span>
                  </div>
                  <div className="flex-1 border-l-2 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(application.updatedAt), 'PPP')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(application.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                {application.submittedAt && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-24 pt-1">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Submitted
                      </span>
                    </div>
                    <div className="flex-1 border-l-2 border-gray-300 pl-4">
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(application.submittedAt), 'PPP')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(application.submittedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {application.reviewedAt && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-24 pt-1">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Reviewed
                      </span>
                    </div>
                    <div className="flex-1 border-l-2 border-gray-300 pl-4">
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(application.reviewedAt), 'PPP')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(application.reviewedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {application.reviewNotes && (
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <CardTitle>Review Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border">
                  {application.reviewNotes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes Section */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>
                    Track progress, issues, or important information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Add New Note */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                <Label htmlFor="new-note" className="text-sm font-semibold">
                  Add New Note
                </Label>
                <Textarea
                  id="new-note"
                  placeholder="Add a note about this application..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="bg-white"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={isAddingNote || !newNote.trim()}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {isAddingNote ? 'Adding...' : 'Add Note'}
                </Button>
              </div>

              {/* Notes List */}
              <div className="space-y-3 mt-6">
                {application.notes.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      No notes yet. Add your first note above.
                    </p>
                  </div>
                ) : (
                  application.notes.map((note) => (
                    <div
                      key={note.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      {editingNoteId === note.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editNoteText}
                            onChange={(e) => setEditNoteText(e.target.value)}
                            rows={4}
                            className="bg-gray-50"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(note.id)}
                              disabled={isLoading}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
                                {note.user.firstName
                                  ? note.user.firstName[0].toUpperCase()
                                  : note.user.email[0].toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {formatUserName(note.user)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(note.createdAt), 'PPp')}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditNote(note)}
                                    disabled={isLoading}
                                  >
                                    <Edit2 className="h-4 w-4 text-gray-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteNote(note.id)}
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {note.note}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column (1/3 width) */}
        <div className="space-y-6 h-fit sticky top-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gray-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Review and update application status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 bg-gray-50 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Status</span>
                  {getStatusIcon(application.status)}
                </div>
                <Badge className={`${statusColors[application.status as keyof typeof statusColors]} text-sm px-3 py-1`}>
                  {statusLabels[application.status as keyof typeof statusLabels]}
                </Badge>
              </div>

              {application.status === 'SUBMITTED' && !selectedStatus && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium text-amber-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Pending Review
                      </p>
                      <div className="space-y-2">
                        <Button
                          onClick={handleApprove}
                          disabled={isLoading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve Application
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={isLoading}
                          className="w-full"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Application
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="quick-review-notes" className="text-xs font-semibold">
                        Review Notes (Optional)
                      </Label>
                      <Textarea
                        id="quick-review-notes"
                        placeholder="Add notes about your decision..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="status-change-sidebar" className="text-sm font-semibold">
                  Change Status 
                </Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status-change-sidebar">
                    <SelectValue placeholder="Select new status" />
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
                  <>
                    <div>
                      <Label htmlFor="status-review-notes" className="text-xs font-semibold">
                        Status Change Notes
                      </Label>
                      <Textarea
                        id="status-review-notes"
                        placeholder="Add notes about status change..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={handleStatusChange}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm">Application Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Application ID</span>
                <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {application.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tenant ID</span>
                <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {application.tenant.id.slice(0, 8)}...
                </span>
              </div>
              {application.reviewedBy && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Reviewed By</span>
                  <span className="text-xs text-gray-900">{application.reviewedBy}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
