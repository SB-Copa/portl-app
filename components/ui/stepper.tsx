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
                  ? 'border-blue-600 hover:border-blue-800'
                  : step.status === 'in_progress'
                    ? 'border-blue-600'
                    : 'border-gray-200',
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
                      ? 'bg-blue-600'
                      : step.status === 'in_progress'
                        ? 'border-2 border-blue-600 bg-white'
                        : 'border-2 border-gray-300 bg-white'
                  )}
                >
                  {step.status === 'completed' ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        step.status === 'in_progress'
                          ? 'text-blue-600'
                          : 'text-gray-500'
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
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-sm text-gray-500">{step.description}</span>
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
