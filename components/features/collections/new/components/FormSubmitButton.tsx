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
        className={`bg-white text-black hover:bg-zinc-200 py-2 px-6 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ${
          (isLoading || isDisabled) && 'opacity-50 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" color="black" />
            {createSuccess ? 'Redirecting...' : 'Creating...'}
          </>
        ) : (
          'Create Collection'
        )}
      </button>
    </div>
  );
}
