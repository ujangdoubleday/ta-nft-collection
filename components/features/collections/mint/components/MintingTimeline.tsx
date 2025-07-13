'use client';

import React from 'react';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { Check } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

interface MintingTimelineProps {
  processingStep: string;
  isMinting: boolean;
  mintSuccess: boolean;
}

export function MintingTimeline({ processingStep, isMinting, mintSuccess }: MintingTimelineProps) {
  // Define the steps in the minting process
  const steps = [
    {
      id: 1,
      label: 'Upload to IPFS',
      match: ['Uploading NFT to IPFS'],
    },
    {
      id: 2,
      label: 'Mint NFT',
      match: ['Minting NFT on blockchain'],
    },
    {
      id: 3,
      label: 'Wait for Confirmation',
      match: ['Transaction submitted', 'Waiting for blockchain confirmation'],
    },
    {
      id: 4,
      label: 'Refresh Metadata',
      match: ['Refreshing NFT metadata'],
    },
    {
      id: 5,
      label: 'Complete',
      match: ['NFT minted successfully'],
    },
  ];

  // Determine current step based on processing message
  const getCurrentStep = (): number => {
    if (!isMinting && !mintSuccess) return 0;
    if (mintSuccess) return 5; // Complete step

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

  // Don't show timeline if not minting and not success
  if (currentStep === 0) return null;

  return (
    <div className="mt-4 mb-4">
      <div className="p-4 rounded-lg overflow-hidden">
        <Timeline className="px-2 py-1">
          {steps.map((step) => (
            <TimelineItem
              key={step.id}
              label={step.label}
              isActive={currentStep === step.id}
              isLoading={isMinting && currentStep === step.id}
              isCompleted={currentStep > step.id || (currentStep === step.id && mintSuccess)}
              statusIcon={
                isMinting && currentStep === step.id ? (
                  <Spinner size="sm" color="white" />
                ) : currentStep >= step.id && (mintSuccess || currentStep > step.id) ? (
                  <Check className="h-3.5 w-3.5 text-white" />
                ) : null
              }
            />
          ))}
        </Timeline>
      </div>
    </div>
  );
}
