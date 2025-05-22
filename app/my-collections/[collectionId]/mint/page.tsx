"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Win98Window } from "@/components/ui/win98";
import { FileUp, Eraser, Save, X } from "lucide-react";
import { useState, useEffect } from "react";

// Sample collections data for header display
const collections = {
  "pixel-art": {
    name: "Pixel Art",
    description:
      "Classic pixel art celebrating the golden age of digital creativity",
  },
  "3d-voxel": {
    name: "3D Voxel",
    description: "Three-dimensional voxel art with depth and personality",
  },
  "retro-computing": {
    name: "Retro Computing",
    description: "Digital artifacts celebrating the history of computing",
  },
  "windows-98-icons": {
    name: "Classic Icons",
    description:
      "Nostalgic digital iconography from the dawn of the internet age",
  },
};

export default function CreateNFTPage({
  params,
}: {
  params: { collectionId: string };
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const collectionId = unwrappedParams.collectionId;
  const collection = collections[collectionId as keyof typeof collections];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    externalUrl: "",
    file: null,
    properties: [
      { name: "", value: "" },
      { name: "", value: "" },
    ],
  });

  // Add effect to listen for resetMintForm event
  useEffect(() => {
    const handleResetFormEvent = () => {
      handleResetForm();
    };

    window.addEventListener("resetMintForm", handleResetFormEvent);

    return () => {
      window.removeEventListener("resetMintForm", handleResetFormEvent);
    };
  }, []);

  const handleChange = (e, propertyIndex = null, field = null) => {
    if (propertyIndex !== null && field !== null) {
      // Update property fields
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
      // Update regular fields
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleAddProperty = () => {
    setFormData({
      ...formData,
      properties: [...formData.properties, { name: "", value: "" }],
    });
  };

  const handleResetForm = () => {
    setFormData({
      title: "",
      description: "",
      externalUrl: "",
      file: null,
      properties: [
        { name: "", value: "" },
        { name: "", value: "" },
      ],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("NFT created successfully!");
    router.push(`/my-collections/${collectionId}`);
  };

  const handleCancel = () => {
    router.push(`/my-collections/${collectionId}`);
  };

  // Handle case where collection doesn't exist
  if (!collection) {
    return (
      <main className="py-4">
        <Container>
          <Win98Window
            title="Error - Collection Not Found"
            className="max-w-4xl mx-auto"
            onClose={() => router.push("/my-collections")}
            icon="/assets/icons/windows.png"
          >
            <div className="p-4">
              <div className="flex items-center mb-4 p-3 border border-[#808080] bg-[#fffbf0]">
                <svg
                  className="w-8 h-8 mr-3 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-black">
                  The collection you're looking for doesn't exist.
                </p>
              </div>
              <Button
                className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                onClick={() => router.push("/my-collections")}
              >
                Back to Your Gallery
              </Button>
            </div>
          </Win98Window>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-4">
      <Container>
        <Win98Window
          title={`Create New NFT - ${collection.name}`}
          className="max-w-6xl mx-auto"
          icon="/assets/icons/windows.png"
        >
          <div className="p-4">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4 mb-6">
                    <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
                      <label className="text-black text-xs font-bold block mb-1">
                        NFT Title <span className="text-red-600">*</span>
                      </label>
                      <Input
                        placeholder="Enter NFT title"
                        required
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="hover:border-[#0000ff] focus:border-[#0000ff]"
                      />
                    </div>

                    <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
                      <label className="text-black text-xs font-bold block mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 text-sm h-24 hover:border-[#0000ff] focus:border-[#0000ff] focus:outline-none"
                        placeholder="Tell the story behind your NFT"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
                      <label className="text-black text-xs font-bold block mb-1">
                        External URL
                      </label>
                      <Input
                        placeholder="https://"
                        name="externalUrl"
                        value={formData.externalUrl}
                        onChange={handleChange}
                        className="hover:border-[#0000ff] focus:border-[#0000ff]"
                      />
                      <p className="text-xs text-[#808080] mt-1">
                        Link to additional content (optional)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
                    <div className="win98-bar h-6 flex items-center px-2 mb-3">
                      <span className="text-white text-xs font-semibold tracking-tight">
                        NFT File Upload
                      </span>
                    </div>

                    <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white h-40 w-full bg-white p-2 flex flex-col items-center justify-center">
                      <div className="text-center mb-2">
                        <div className="w-16 h-16 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center mx-auto mb-2 hover:bg-[#d0d0d0] cursor-pointer">
                          <span className="text-black text-2xl">+</span>
                        </div>
                        <p className="text-xs text-black">
                          Upload your NFT file
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="text-xs hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                      >
                        Browse Files...
                      </Button>
                    </div>
                    <p className="text-xs text-[#808080] mt-1">
                      Supported formats: PNG, JPG, GIF, MP4 (max 30MB)
                    </p>
                  </div>

                  <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
                    <div className="win98-bar h-6 flex items-center px-2 mb-3">
                      <span className="text-white text-xs font-semibold tracking-tight">
                        Properties
                      </span>
                    </div>

                    <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 bg-white">
                      {formData.properties.map((prop, index) => (
                        <div className="flex mb-2" key={index}>
                          <Input
                            placeholder="Property name"
                            className="mr-2 hover:border-[#0000ff] focus:border-[#0000ff]"
                            value={prop.name}
                            onChange={(e) => handleChange(e, index, "name")}
                          />
                          <Input
                            placeholder="Value"
                            className="hover:border-[#0000ff] focus:border-[#0000ff]"
                            value={prop.value}
                            onChange={(e) => handleChange(e, index, "value")}
                          />
                        </div>
                      ))}
                      <Button
                        size="sm"
                        className="w-full text-xs mt-1 hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                        type="button"
                        onClick={handleAddProperty}
                      >
                        + Add Property
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white mt-6 p-3 bg-white">
                <p className="text-xs mb-2">
                  <span className="font-bold text-[#0000ff]">Note:</span>{" "}
                  Creating an NFT will preserve your creative rights and store
                  it securely in your collection.
                </p>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex items-center hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Create NFT
                </Button>
              </div>
            </form>
          </div>
        </Win98Window>
      </Container>
    </main>
  );
}
