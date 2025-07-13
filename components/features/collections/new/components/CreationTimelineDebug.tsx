'use client';

import React, { useState, useEffect } from 'react';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { Check } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

export function CreationTimelineDebug() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

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
      label: 'Confirm Transaction',
      match: ['Waiting for transaction confirmation'],
    },
    {
      id: 4,
      label: 'Complete',
      match: [''],
    },
  ];

  // Auto-advance through steps every 5 seconds
  useEffect(() => {
    if (!isProcessing) return;

    const timer = setTimeout(() => {
      if (currentStep < steps.length) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setIsProcessing(false); // Stop when we reach the end
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentStep, isProcessing, steps.length]);

  // Start function for testing
  const handleStart = () => {
    setCurrentStep(1);
    setIsProcessing(true);
  };

  // Reset function for testing
  const handleReset = () => {
    setCurrentStep(0);
    setIsProcessing(false);
  };

  return (
    <div className="mt-4 mb-4">
      <div className="p-4 rounded-lg overflow-hidden">
        <Timeline className="px-2 py-1">
          {steps.map((step, index) => (
            <TimelineItem
              key={step.id}
              label={step.label}
              isActive={currentStep === step.id}
              isLoading={isProcessing && currentStep === step.id}
              isCompleted={currentStep > step.id}
              statusIcon={
                isProcessing && currentStep === step.id ? (
                  <Spinner size="sm" color="white" />
                ) : currentStep > step.id ? (
                  <Check className="h-3.5 w-3.5 text-white" />
                ) : null
              }
            />
          ))}
        </Timeline>
      </div>

      {/* Debug controls */}
      <div className="flex justify-center mt-4">
        {!isProcessing ? (
          <button
            onClick={handleStart}
            className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium"
          >
            Start Timeline
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium"
          >
            Reset Timeline
          </button>
        )}
        <div className="ml-4 bg-black/20 px-4 py-2 rounded-md text-white">
          Current Step: {currentStep} / {steps.length}
        </div>
      </div>
    </div>
  );
}
