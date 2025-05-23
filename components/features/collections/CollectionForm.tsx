"use client";

import { Win98Window } from "@/components/ui/win98";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CollectionFormFields,
  CollectionFormActions,
} from "./components/collection";
import { CollectionFormData } from "./components/collection/CollectionFormFields";

interface CollectionFormProps {
  // Props dapat ditambahkan jika perlu
}

export function CollectionForm({}: CollectionFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CollectionFormData>({
    name: "",
    symbol: "",
    description: "",
    coverImage: null,
    storage: "Ethereum",
  });

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Would handle actual form submission here
    alert("Collection created successfully!");
    router.push("/collections");
  };

  const handleCancel = () => {
    router.push("/collections");
  };

  return (
    <Win98Window
      title="Create Collection - NFT Creator Wizard"
      className="max-w-6xl mx-auto"
      icon="/assets/icons/window/gallery-create.png"
    >
      <form onSubmit={handleSubmit} className="p-2">
        <CollectionFormFields formData={formData} handleChange={handleChange} />

        <CollectionFormActions onCancel={handleCancel} />
      </form>
    </Win98Window>
  );
}
