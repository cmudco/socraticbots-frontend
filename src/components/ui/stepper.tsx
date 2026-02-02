import React from 'react';

import { Check, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  completedSteps?: number[];
  orientation?: 'horizontal' | 'vertical';
  allowClickAhead?: boolean;
  className?: string;
}

type StepStatus = 'completed' | 'current' | 'upcoming' | 'error';

interface StepIndicatorProps {
  stepNumber: number;
  status: StepStatus;
  icon?: React.ReactNode;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ stepNumber, status, icon }) => {
  const baseClasses =
    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200';

  const statusClasses: Record<StepStatus, string> = {
    completed: 'bg-primary text-primary-foreground',
    current: 'bg-primary text-primary-foreground ring-4 ring-primary/20',
    upcoming: 'bg-muted text-muted-foreground border-2 border-muted-foreground/20',
    error: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className={cn(baseClasses, statusClasses[status])}>
      {status === 'completed' ? <Check className="h-5 w-5" /> : icon || stepNumber}
    </div>
  );
};

interface StepConnectorProps {
  isCompleted: boolean;
  orientation: 'horizontal' | 'vertical';
}

const StepConnector: React.FC<StepConnectorProps> = ({ isCompleted, orientation }) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'ml-5 h-8 w-0.5 transition-colors duration-200',
          isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
        )}
      />
    );
  }

  return (
    <div className="flex flex-1 items-center px-4">
      <div
        className={cn(
          'h-0.5 w-full transition-colors duration-200',
          isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
        )}
      />
    </div>
  );
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
  orientation = 'horizontal',
  allowClickAhead = false,
  className,
}) => {
  const getStepStatus = (index: number): StepStatus => {
    if (completedSteps.includes(index)) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const isStepClickable = (index: number): boolean => {
    if (!onStepClick) return false;
    if (allowClickAhead) return true;
    // Can click on completed steps or current step
    return completedSteps.includes(index) || index === currentStep || index < currentStep;
  };

  const handleStepClick = (index: number) => {
    if (isStepClickable(index) && onStepClick) {
      onStepClick(index);
    }
  };

  if (orientation === 'vertical') {
    return (
      <nav className={cn('flex flex-col', className)} aria-label="Progress">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const clickable = isStepClickable(index);
          const isLastStep = index === steps.length - 1;

          return (
            <div key={step.id}>
              <button
                onClick={() => handleStepClick(index)}
                disabled={!clickable}
                className={cn(
                  'flex w-full items-start gap-4 rounded-lg p-3 text-left transition-colors',
                  clickable && 'hover:bg-muted cursor-pointer',
                  !clickable && 'cursor-default',
                  status === 'current' && 'bg-muted'
                )}
              >
                <StepIndicator stepNumber={index + 1} status={status} icon={step.icon} />
                <div className="flex flex-col pt-1">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                    )}
                  >
                    {step.title}
                    {step.optional && (
                      <span className="text-muted-foreground ml-1 text-xs">(Optional)</span>
                    )}
                  </span>
                  {step.description && (
                    <span className="text-muted-foreground mt-0.5 text-xs">{step.description}</span>
                  )}
                </div>
              </button>
              {!isLastStep && (
                <StepConnector
                  isCompleted={completedSteps.includes(index)}
                  orientation="vertical"
                />
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  // Horizontal orientation
  return (
    <nav className={cn('w-full', className)} aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const clickable = isStepClickable(index);
          const isLastStep = index === steps.length - 1;

          return (
            <li key={step.id} className={cn('flex items-center', !isLastStep && 'flex-1')}>
              <button
                onClick={() => handleStepClick(index)}
                disabled={!clickable}
                className={cn(
                  'group flex flex-col items-center gap-2',
                  clickable && 'cursor-pointer',
                  !clickable && 'cursor-default'
                )}
              >
                <StepIndicator stepNumber={index + 1} status={status} icon={step.icon} />
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors',
                      status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                      clickable && 'group-hover:text-primary'
                    )}
                  >
                    {step.title}
                  </span>
                  {step.optional && <span className="text-muted-foreground text-xs">Optional</span>}
                </div>
              </button>
              {!isLastStep && (
                <StepConnector
                  isCompleted={completedSteps.includes(index)}
                  orientation="horizontal"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Compact Mobile Stepper - shows current step with arrows
interface MobileStepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  completedSteps?: number[];
  className?: string;
}

export const MobileStepper: React.FC<MobileStepperProps> = ({
  steps,
  currentStep,
  onStepChange,
  completedSteps = [],
  className,
}) => {
  const currentStepData = steps[currentStep];
  const canGoBack = currentStep > 0;
  const canGoForward = currentStep < steps.length - 1 && completedSteps.includes(currentStep);

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <button
        onClick={() => onStepChange(currentStep - 1)}
        disabled={!canGoBack}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
          canGoBack ? 'bg-muted hover:bg-muted/80 text-foreground' : 'text-muted-foreground/40'
        )}
      >
        <ChevronRight className="h-5 w-5 rotate-180" />
      </button>

      <div className="flex flex-1 flex-col items-center">
        <span className="text-muted-foreground text-xs">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-foreground font-medium">{currentStepData?.title}</span>
        {/* Progress dots */}
        <div className="mt-2 flex gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                index === currentStep
                  ? 'bg-primary w-4'
                  : completedSteps.includes(index)
                    ? 'bg-primary/60'
                    : 'bg-muted-foreground/20'
              )}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => onStepChange(currentStep + 1)}
        disabled={!canGoForward}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
          canGoForward ? 'bg-muted hover:bg-muted/80 text-foreground' : 'text-muted-foreground/40'
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Stepper;
