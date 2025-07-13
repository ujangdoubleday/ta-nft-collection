'use client';

import { useEffect, useState } from 'react';
import { useCollectionCreation } from './hooks';
import {
  AuthRequired,
  CollectionDetails,
  CreationFeeInfo,
  CreationTimeline,
  FormSubmitButton,
  ImageUploader,
  ConfirmationDialog,
} from './components';
import { useRouter } from 'next/navigation';

interface NewCollectionFormProps {
  /**
   * The route prefix to use for redirects after collection creation
   * @example 'admin' for admin routes, 'user' for user routes
   */
  routePrefix: string;
}

export function NewCollectionForm({ routePrefix }: NewCollectionFormProps) {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    name,
    setName,
    symbol,
    setSymbol,
    description,
    setDescription,
    maxSupply,
    setMaxSupply,
    imagePreview,
    isCreating,
    createSuccess,
    createdAddress,
    errorMessage,
    processingStep,
    address,
    isConnected,
    isAuthenticated,
    creationFeeData,
    handleImageChange,
    handleConnect,
    handleCreate,
  } = useCollectionCreation();

  // Wrapper function to call handleCreate without arguments
  const handleConfirmCreate = () => {
    // Create a synthetic event
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    handleCreate(syntheticEvent);
  };

  // Redirect to collections page when creation is successful
  useEffect(() => {
    if (createSuccess && createdAddress) {
      // Short delay to ensure the user sees the "Complete" step
      setTimeout(() => {
        router.push(`/${routePrefix}/collections`);
      }, 1500);
    }
  }, [createSuccess, createdAddress, router, routePrefix]);

  // Add navigation warning when collection creation is in progress or completed but not yet redirected
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isCreating || createSuccess) {
        // Standard way to show a confirmation dialog before leaving
        const message = isCreating
          ? 'Collection creation is in progress. Are you sure you want to leave?'
          : 'Collection created successfully. Please wait for redirect. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = message; // Required for Chrome
        return message; // For other browsers
      }
    };

    // Add event listener for page unload/refresh
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Clean up event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isCreating, createSuccess]);

  // Display a connect wallet message if not connected or authenticated
  if (!isConnected || !isAuthenticated) {
    return <AuthRequired isConnected={isConnected} onConnect={handleConnect} />;
  }

  const isFormValid = !!(name && symbol && description && imagePreview);

  // Handle form submission to show confirmation dialog
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setShowConfirmDialog(true);
  };

  return (
    <>
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmCreate}
        name={name}
        symbol={symbol}
        description={description}
        maxSupply={maxSupply}
        imagePreview={imagePreview}
        fee={creationFeeData?.fee}
      />

      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Image Upload */}
            <div className="w-full lg:w-1/3">
              <ImageUploader imagePreview={imagePreview} onImageChange={handleImageChange} />
            </div>

            {/* Right Column - Collection Details */}
            <div className="w-full lg:w-2/3">
              <CollectionDetails
                name={name}
                setName={setName}
                symbol={symbol}
                setSymbol={setSymbol}
                maxSupply={maxSupply}
                setMaxSupply={setMaxSupply}
                description={description}
                setDescription={setDescription}
              />

              {/* Creation fee info */}
              <CreationFeeInfo address={address} fee={creationFeeData?.fee} />

              <FormSubmitButton
                isCreating={isCreating}
                isDisabled={!isFormValid}
                createSuccess={createSuccess}
              />
            </div>
          </div>
        </form>
      </div>
      <div className="max-w-full">
        {/* Using the updated timeline component */}
        <CreationTimeline processingStep={processingStep} isCreating={isCreating} />

        {/* Simple error message display */}
        {errorMessage && (
          <>
            <h3 className="mt-4 text-white text-sm font-medium mb-2">Error:</h3>
            <div className="p-4 bg-black/50 border border-zinc-800 rounded-md">
              <p className="text-white text-sm break-words">{errorMessage}</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
