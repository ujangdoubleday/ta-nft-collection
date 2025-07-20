'use client';

import React from 'react';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { Check } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

interface CreationTimelineProps {
  processingStep: string;
  isCreating: boolean;
}

export function CreationTimeline({ processingStep, isCreating }: CreationTimelineProps) {
  // Define the steps of the collection creation process
  const steps = [
    {
      id: 1,
      label: 'Upload to IPFS',
      match: ['Creating IPFS folder', 'Uploading metadata to IPFS'],
    },
    {
      id: 2,
      label: 'Create Collection',
      match: ['Creating collection on blockchain'],
    },
    {
      id: 3,
      label: 'Wait for Confirmation',
      match: ['Waiting for transaction confirmation'],
    },
    {
      id: 4,
      label: 'Revalidate Collections',
      match: ['Revalidating collections', 'Refreshing data'],
    },
    {
      id: 5,
      label: 'Complete',
      match: ['Collection created successfully'],
    },
  ];

  // Determine current step based on processing message
  const getCurrentStep = (): number => {
    if (!isCreating) return 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (Array.isArray(step.match)) {
        if (step.match.some((pattern) => pattern && processingStep.includes(pattern))) {
          return step.id;
        }
      }
    }

    return 1; // Default to first step if no match
  };

  const currentStep = getCurrentStep();

  // Don't show timeline if not creating
  if (currentStep === 0) return null;

  return (
    <div className="mt-3 sm:mt-4 mb-3 sm:mb-4">
      <div className="p-3 sm:p-4 rounded-lg overflow-hidden overflow-x-auto">
        <Timeline className="px-1 sm:px-2 py-1 min-w-[300px]">
          {steps.map((step) => (
            <TimelineItem
              key={step.id}
              label={step.label}
              isActive={currentStep === step.id}
              isLoading={isCreating && currentStep === step.id}
              isCompleted={currentStep > step.id}
              statusIcon={
                isCreating && currentStep === step.id ? (
                  <Spinner size="sm" color="white" />
                ) : currentStep > step.id ? (
                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                ) : null
              }
              className="text-xs sm:text-sm"
            />
          ))}
        </Timeline>
      </div>
    </div>
  );
}
