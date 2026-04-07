import { OrganizerApplication, Prisma } from '@/prisma/generated/prisma/client';

export type Application = OrganizerApplication & Prisma.OrganizerApplicationGetPayload<{
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

export interface PastEvent {
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

export interface Venue {
  name?: string;
  relationship?: string;
  images?: string[];
}

export interface ArtistsTalent {
  notableArtists?: string;
  recurringTalent?: string;
}

export interface Reference {
  name?: string;
  company?: string;
  contact?: string;
  type?: string;
}

export const statusConfig = {
  NOT_STARTED: { color: 'bg-muted text-muted-foreground', label: 'Not Started', dot: 'bg-muted-foreground' },
  IN_PROGRESS: { color: 'bg-blue-500/15 text-blue-500 border-blue-500/20', label: 'In Progress', dot: 'bg-blue-500' },
  SUBMITTED: { color: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20', label: 'Submitted', dot: 'bg-yellow-500' },
  APPROVED: { color: 'bg-green-500/15 text-green-500 border-green-500/20', label: 'Approved', dot: 'bg-green-500' },
  REJECTED: { color: 'bg-red-500/15 text-red-500 border-red-500/20', label: 'Rejected', dot: 'bg-red-500' },
};

export function parseJson<T>(value: unknown): T | null {
  if (!value) return null;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value as T;
  } catch {
    return null;
  }
}

export const referenceTypeLabels: Record<string, string> = {
  client_testimonial: 'Client Testimonial',
  partner: 'Partner',
  industry: 'Industry Reference',
};

export function formatUserName(user: { firstName: string | null; lastName: string | null; email: string }) {
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  return user.email;
}
