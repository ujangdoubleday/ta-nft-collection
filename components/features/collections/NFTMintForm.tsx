"use client";

import { Win98Window } from "@/components/ui/win98";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  NFTFormFields,
  NFTFormActions,
  NFTFormNote,
  NFTPreview,
} from "./components/nft";
import { NFTFormData } from "./components/nft/NFTFormFields";

interface NFTMintFormProps {
  collectionId: string;
  collectionName: string;
}

export function NFTMintForm({
  collectionId,
  collectionName,
}: NFTMintFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<NFTFormData>({
    title: "",
    description: "",
    externalUrl: "",
    file: null,
    properties: [
      { name: "Rarity", value: "Common" },
      { name: "Type", value: "Pixel Art" },
    ],
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    propertyIndex: number | null = null,
    field: string | null = null
  ) => {
    if (propertyIndex !== null && field !== null) {
      // Update property
      const updatedProperties = [...formData.properties];
      updatedProperties[propertyIndex] = {
        ...updatedProperties[propertyIndex],
        [field]: e.target.value,
      };

      setFormData({
        ...formData,
        properties: updatedProperties,
      });
    } else {
      // Update regular field
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAddProperty = () => {
    setFormData({
      ...formData,
      properties: [...formData.properties, { name: "", value: "" }],
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    alert("NFT created successfully!");
    router.push(`/collections/${collectionId}`);
  };

  const handleCancel = () => {
    router.push(`/collections/${collectionId}`);
  };

  // Placeholder image for preview
  const previewImage = formData.file
    ? URL.createObjectURL(formData.file)
    : "/assets/images/nfts/placeholder.svg";

  return (
    <Win98Window
      title={`Create NFT - ${collectionName}`}
      className="max-w-6xl mx-auto"
      icon="/assets/icons/windows.png"
    >
      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <NFTFormFields
              formData={formData}
              handleChange={handleChange}
              handleAddProperty={handleAddProperty}
            />

            <NFTFormNote />

            <NFTFormActions onCancel={handleCancel} />
          </div>

          <div className="md:col-span-1">
            <NFTPreview
              name={formData.title || "New NFT"}
              description={
                formData.description || "Your NFT description will appear here"
              }
              image={previewImage}
            />
          </div>
        </div>
      </form>
    </Win98Window>
  );
}
