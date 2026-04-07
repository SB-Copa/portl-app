'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import {
  approveApplicationAction,
  rejectApplicationAction,
  updateApplicationStatusAction,
} from '@/app/actions/admin';
import { type Application, statusConfig } from './types';

interface ActionsSidebarProps {
  application: Application;
}

export function ActionsSidebar({ application }: ActionsSidebarProps) {
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const status = application.status as keyof typeof statusConfig;
  const config = statusConfig[status];

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

  return (
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
  );
}
