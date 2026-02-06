'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStepsProps {
  currentStep: number;
  steps: { title: string; description?: string }[];
}

export function CheckoutSteps({ currentStep, steps }: CheckoutStepsProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <li key={step.title} className="flex items-center">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'border-2 border-primary text-primary'
                      : 'border-2 border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </span>
                <span
                  className={cn(
                    'hidden sm:block text-sm font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'ml-2 sm:ml-4 h-0.5 w-8 sm:w-16',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
