import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, FileText, Clock } from 'lucide-react';
import { type Application, statusConfig, type PastEvent, type Venue, type ArtistsTalent, type Reference, parseJson } from './types';
import { StepIndicator, TimelineEntry } from './helpers';

interface OverviewTabProps {
  application: Application;
}

export function OverviewTab({ application }: OverviewTabProps) {
  const ownerName = application.tenant.owner.firstName && application.tenant.owner.lastName
    ? `${application.tenant.owner.firstName} ${application.tenant.owner.lastName}`
    : application.tenant.owner.email;

  const status = application.status as keyof typeof statusConfig;

  const pastEvents = parseJson<PastEvent[]>(application.pastEvents);
  const venues = parseJson<Venue[]>(application.venuesWorkedWith);
  const artists = parseJson<ArtistsTalent>(application.artistsTalent);
  const references = parseJson<Reference[]>(application.references);

  const allComplianceAccepted = application.tosAccepted
    && application.organizerAgreementAccepted
    && application.privacyPolicyAccepted
    && application.communityGuidelinesAccepted;

  const hasPortfolioData = pastEvents?.length || venues?.length || artists?.notableArtists || artists?.recurringTalent || references?.length;
  const hasIdentityDocs = application.governmentIdUrl || application.selfieWithIdUrl || application.businessIdUrl;

  return (
    <div className="space-y-6">
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
              <p className="text-sm font-mono">{application.tenant.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'portl.com'}</p>
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
            <TimelineEntry label="Created" date={application.createdAt} isFirst />
            <TimelineEntry label="Last Updated" date={application.updatedAt} />
            {application.submittedAt && (
              <TimelineEntry label="Submitted" date={application.submittedAt} highlight />
            )}
            {application.reviewStartedAt && (
              <TimelineEntry label="Review Started" date={application.reviewStartedAt} />
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
    </div>
  );
}
