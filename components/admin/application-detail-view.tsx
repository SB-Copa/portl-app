'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Application } from './application-detail/types';
import { OverviewTab } from './application-detail/overview-tab';
import { SubmissionTab } from './application-detail/submission-tab';
import { NotesTab } from './application-detail/notes-tab';
import { ActionsSidebar } from './application-detail/actions-sidebar';

export type { Application };

interface ApplicationDetailViewProps {
  application: Application;
}

export function ApplicationDetailView({ application }: ApplicationDetailViewProps) {
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

          <TabsContent value="overview">
            <OverviewTab application={application} />
          </TabsContent>

          <TabsContent value="submission">
            <SubmissionTab application={application} />
          </TabsContent>

          <TabsContent value="notes">
            <NotesTab application={application} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <ActionsSidebar application={application} />
    </div>
  );
}
