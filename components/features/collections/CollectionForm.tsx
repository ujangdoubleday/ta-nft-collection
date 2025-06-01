'use client';

import { Win98Window } from "@/components/ui/organisms/Win98Window";
import { trpc } from '@/lib/api/trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  CollectionFormActions,
  CollectionFormFields,
} from '@/components/features/collections/components/collection';
import { CollectionFormData } from '@/components/features/collections/components/collection/CollectionFormFields';

interface CollectionFormProps {
  // Props dapat ditambahkan jika perlu
}

export function CollectionForm({}: CollectionFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    symbol: '',
    description: '',
    coverImage: null,
    storage: 'Ethereum',
    ownerAddress: '',
  });
  const [showConsole, setShowConsole] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the create collection mutation
  const createCollectionMutation = trpc.collection.create.useMutation({
    onSuccess: () => {
      router.push('/collections');
      router.refresh();
    },
  });

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: file,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!showConsole) {
      // Show console first time button is clicked
      setShowConsole(true);
      return;
    }

    // Validate owner address
    if (!formData.ownerAddress) {
      alert('Owner address is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a mock contract address (in a real app, this would come from blockchain)
      const contractAddress = `0x${Math.random().toString(16).slice(2, 42)}`;

      // For mock contractURI - in reality this would come from IPFS or another decentralized storage
      let contractURI = null;
      if (formData.coverImage) {
        // In a real app, you would upload this to IPFS and get a URI
        contractURI = `/uploads/collections/${contractAddress}/metadata.json`;
      }

      // Use tRPC to create collection
      await createCollectionMutation.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        contractURI: contractURI || undefined,
        contractAddress,
        ownerAddress: formData.ownerAddress,
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/collections');
  };

  return (
    <Win98Window
      title="Create Collection - NFT Creator Wizard"
      className="max-w-6xl mx-auto"
      icon="/assets/icons/window/gallery-create.png"
    >
      <form onSubmit={handleSubmit} className="p-4 bg-[#c0c0c0]">
        <CollectionFormFields
          formData={formData}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
        />

        {/* Console Style Note - appears above buttons */}
        {showConsole && (
          <div className="mt-6 mb-4 bg-black text-[#00FF00] p-3 font-mono text-sm border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white">
            <div className="bg-[#000080] text-white px-2 py-1 -mt-3 -mx-3 mb-2 flex items-center">
              <span className="text-xs font-bold">Console</span>
            </div>
            <p className="mb-1">{'> Processing data...'}</p>
            <p className="mb-1 text-yellow-400">
              {
                '> Note: Creating a collection is the first step to bringing your digital artwork to life.'
              }
            </p>
            <p className="text-white">{`> Owner: ${formData.ownerAddress || 'Not specified'}`}</p>
            <p className="text-white">{"> Click 'Create Collection' again to confirm."}</p>
          </div>
        )}

        <CollectionFormActions
          onCancel={handleCancel}
          showConfirmation={showConsole}
          isSubmitting={isSubmitting}
        />
      </form>
    </Win98Window>
  );
}

