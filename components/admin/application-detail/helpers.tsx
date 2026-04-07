import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle } from 'lucide-react';

export function StepIndicator({ step, label, completed, current, hasData }: {
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

export function TimelineEntry({ label, date, highlight, variant }: {
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

export function DocImage({ label, url, required }: { label: string; url: string | null; required?: boolean }) {
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

export function ComplianceItem({ label, accepted }: { label: string; accepted: boolean }) {
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

export function EmptyField() {
  return (
    <p className="text-sm text-muted-foreground italic py-2">No data provided</p>
  );
}
