'use client';

interface FormSubmitButtonProps {
  isCreating: boolean;
  isDisabled: boolean;
}

export function FormSubmitButton({ isCreating, isDisabled }: FormSubmitButtonProps) {
  return (
    <div className="flex justify-end">
      <button
        type="submit"
        disabled={isCreating || isDisabled}
        className={`bg-white text-black hover:bg-zinc-200 py-2 px-6 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ${
          (isCreating || isDisabled) && 'opacity-50 cursor-not-allowed'
        }`}
      >
        {isCreating ? (
          <>
            <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
            Creating...
          </>
        ) : (
          'Create Collection'
        )}
      </button>
    </div>
  );
}
