'use client';

interface StatusMessagesProps {
  errorMessage: string | null;
  processingStep: string;
}

export function StatusMessages({ errorMessage, processingStep }: StatusMessagesProps) {
  return (
    <>
      {errorMessage && (
        <div className="bg-red-900/40 border border-red-700 text-red-100 p-3 rounded-md mb-6">
          <p>{errorMessage}</p>
        </div>
      )}

      {processingStep && (
        <div className="bg-blue-900/40 border border-blue-700 text-blue-100 p-3 rounded-md mb-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p>{processingStep}</p>
          </div>
        </div>
      )}
    </>
  );
}
