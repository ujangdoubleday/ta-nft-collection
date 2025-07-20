'use client';

import Spinner from '@/components/ui/spinner';

interface FormSubmitButtonProps {
  isCreating: boolean;
  isDisabled: boolean;
  createSuccess: boolean;
}

export function FormSubmitButton({ isCreating, isDisabled, createSuccess }: FormSubmitButtonProps) {
  // Button should show loading state during creation OR after success (until redirect)
  const isLoading = isCreating || createSuccess;

  return (
    <div className="flex justify-end">
      <button
        type="submit"
        disabled={isLoading || isDisabled}
        className={`bg-white text-black hover:bg-zinc-200 py-1.5 sm:py-2 px-4 sm:px-6 rounded-md transition-colors text-xs sm:text-sm font-medium flex items-center gap-2 ${
          (isLoading || isDisabled) && 'opacity-50 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" color="black" />
            <span>{createSuccess ? 'Redirecting...' : 'Creating...'}</span>
          </>
        ) : (
          'Create Collection'
        )}
      </button>
    </div>
  );
}
