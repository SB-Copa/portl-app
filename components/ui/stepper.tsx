'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step.id} className="md:flex-1">
            <button
              onClick={() => onStepClick?.(step.id)}
              disabled={step.status === 'not_started' && step.id > currentStep}
              className={cn(
                'group flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4',
                'transition-colors duration-200',
                step.status === 'completed'
                  ? 'border-primary hover:border-primary/80'
                  : step.status === 'in_progress'
                    ? 'border-primary'
                    : 'border-muted-foreground/25',
                step.status === 'not_started' &&
                  step.id > currentStep &&
                  'cursor-not-allowed opacity-50'
              )}
            >
              <div className="flex items-center">
                <span
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                    step.status === 'completed'
                      ? 'bg-primary'
                      : step.status === 'in_progress'
                        ? 'border-2 border-primary bg-background'
                        : 'border-2 border-muted-foreground/25 bg-background'
                  )}
                >
                  {step.status === 'completed' ? (
                    <Check className="h-6 w-6 text-primary-foreground" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        step.status === 'in_progress'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </span>
                <div className="ml-4 flex min-w-0 flex-col">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      step.status === 'completed' || step.status === 'in_progress'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-sm text-muted-foreground">{step.description}</span>
                  )}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
