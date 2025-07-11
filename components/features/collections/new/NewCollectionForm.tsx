'use client';

import { useCollectionCreation } from './hooks';
import {
  AuthRequired,
  CollectionDetails,
  CreationFeeInfo,
  FormSubmitButton,
  ImageUploader,
  StatusMessages,
  SuccessState,
} from './components';

interface NewCollectionFormProps {
  /**
   * The route prefix to use for redirects after collection creation
   * @example 'admin' for admin routes, 'user' for user routes
   */
  routePrefix: string;
}

export function NewCollectionForm({ routePrefix }: NewCollectionFormProps) {
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

  if (createSuccess) {
    return <SuccessState routePrefix={routePrefix} collectionAddress={createdAddress} />;
  }

  // Display a connect wallet message if not connected or authenticated
  if (!isConnected || !isAuthenticated) {
    return <AuthRequired isConnected={isConnected} onConnect={handleConnect} />;
  }

  const isFormValid = !!(name && symbol && description && imagePreview);

  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
      <form onSubmit={handleCreate}>
        <StatusMessages errorMessage={errorMessage} processingStep={processingStep} />

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

            <FormSubmitButton isCreating={isCreating} isDisabled={!isFormValid} />
          </div>
        </div>
      </form>
    </div>
  );
}
