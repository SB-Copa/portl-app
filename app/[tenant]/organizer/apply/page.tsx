'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Stepper, type Step } from '@/components/ui/stepper';
import { OrganizerTypeForm, type OrganizerType } from '@/components/organizer/organizer-type-form';
import { EventPortfolioForm, type EventPortfolioEntry } from '@/components/organizer/event-portfolio-form';
import { ComplianceForm } from '@/components/organizer/compliance-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getTenantAction, getApplicationAction, saveApplicationAction } from '@/app/actions/organizer';

interface Application {
  id: string;
  status: string;
  currentStep: number;
  organizerType?: OrganizerType | null;
  organizerDescription?: string | null;
  eventPortfolio?: EventPortfolioEntry[] | null;
  complianceAcknowledged: boolean;
  tenantId: string;
}

export default function OrganizerApplyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tenant = params.tenant as string;
  
  const [application, setApplication] = useState<Application | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        // Get tenant ID
        const tenantResult = await getTenantAction(tenant);
        if (tenantResult.error || !tenantResult.data) {
          console.error('Error fetching tenant:', tenantResult.error);
          setIsLoading(false);
          return;
        }
        setTenantId(tenantResult.data.id);

        // Get application
        const appResult = await getApplicationAction(tenantResult.data.id);
        if (appResult.error || !appResult.data) {
          console.error('Error fetching application:', appResult.error);
          setIsLoading(false);
          return;
        }
        // Convert Prisma types to Application interface
        const appData = {
          ...appResult.data,
          eventPortfolio: appResult.data.eventPortfolio 
            ? (appResult.data.eventPortfolio as unknown as EventPortfolioEntry[])
            : null,
        };
        setApplication(appData);

        // Set current step from URL or application
        const stepParam = searchParams.get('step');
        setCurrentStep(stepParam ? parseInt(stepParam) : appResult.data.currentStep || 1);
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [tenant, searchParams]);

  const saveApplication = async (step: number, data: any, shouldExit = false) => {
    if (!tenantId) return;

    const result = await saveApplicationAction(tenantId, step, data, shouldExit);

    if (result.error || !result.data) {
      console.error('Error saving application:', result.error);
      alert('Failed to save application. Please try again.');
      return;
    }

    // Convert Prisma types to Application interface
    const appData = {
      ...result.data,
      eventPortfolio: result.data.eventPortfolio 
        ? (result.data.eventPortfolio as unknown as EventPortfolioEntry[])
        : null,
    };
    setApplication(appData);

    if (shouldExit) {
      router.push(`/${tenant}/organizer/dashboard`);
    } else if (step < 3) {
      setCurrentStep(step + 1);
    } else {
      // Application submitted
      router.push(`/${tenant}/organizer/dashboard`);
    }
  };

  const steps: Step[] = [
    {
      id: 1,
      title: 'Organizer Type',
      status: currentStep === 1 ? 'in_progress' : currentStep > 1 ? 'completed' : 'not_started',
    },
    {
      id: 2,
      title: 'Event Portfolio',
      status: currentStep === 2 ? 'in_progress' : currentStep > 2 ? 'completed' : 'not_started',
    },
    {
      id: 3,
      title: 'Compliance',
      status: currentStep === 3 ? 'in_progress' : 'not_started',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/${tenant}/organizer/dashboard`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Organizer Application</h1>
          <p className="text-gray-600">
            Complete all steps to submit your application
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <Stepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={(stepId) => {
                if (stepId <= (application?.currentStep || 1)) {
                  setCurrentStep(stepId);
                }
              }}
            />
          </CardContent>
        </Card>

        {currentStep === 1 && (
          <OrganizerTypeForm
            initialData={{
              organizerType: application?.organizerType ?? undefined,
              organizerDescription: application?.organizerDescription ?? undefined,
            }}
            onSave={async (data) => {
              await saveApplication(1, data, false);
            }}
            onSaveAndExit={async (data) => {
              await saveApplication(1, data, true);
            }}
          />
        )}

        {currentStep === 2 && (
          <EventPortfolioForm
            initialData={application?.eventPortfolio as EventPortfolioEntry[] | undefined}
            onSave={async (data) => {
              await saveApplication(2, data, false);
            }}
            onSaveAndExit={async (data) => {
              await saveApplication(2, data, true);
            }}
          />
        )}

        {currentStep === 3 && (
          <ComplianceForm
            initialData={application?.complianceAcknowledged}
            onSubmit={async () => {
              await saveApplication(3, {}, false);
            }}
          />
        )}
      </div>
    </div>
  );
}
