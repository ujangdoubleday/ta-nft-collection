"use client";

import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

interface AddNewButtonProps {
  onClick: () => void;
}

export function AddNewButton({ onClick }: AddNewButtonProps) {
  return (
    <div className="flex items-center justify-end mt-4">
      <Button
        className="flex items-center hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
        onClick={onClick}
      >
        <FileUp className="h-4 w-4 mr-1" />
        Add New NFT
      </Button>
    </div>
  );
}
