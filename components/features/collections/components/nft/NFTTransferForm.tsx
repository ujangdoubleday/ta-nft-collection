"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface NFTTransferFormProps {
  // props here
}

export function NFTTransferForm({}: NFTTransferFormProps) {
  const [recipientAddress, setRecipientAddress] = useState("");

  const handleTransfer = () => {
    if (!recipientAddress) {
      alert("Please enter a recipient address");
      return;
    }
    alert(`NFT would be transferred to ${recipientAddress}`);
  };

  return (
    <div className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
      <div className="win98-bar h-6 flex items-center px-2 mb-3">
        <span className="text-white text-xs font-semibold tracking-tight">
          Transfer NFT
        </span>
      </div>
      <p className="text-black text-xs mb-3">
        Transfer this NFT to another wallet address.
      </p>
      <div className="mb-3">
        <label className="text-black text-xs block mb-1">
          Recipient Address
        </label>
        <Input
          placeholder="Enter recipient wallet address"
          className="hover:border-[#0000ff] focus:border-[#0000ff]"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button
          className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset]"
          onClick={handleTransfer}
        >
          Transfer NFT
        </Button>
      </div>
    </div>
  );
}
