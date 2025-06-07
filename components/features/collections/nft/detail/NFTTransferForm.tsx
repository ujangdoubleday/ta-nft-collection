'use client';

import { Button, Input } from '@/components/ui/atoms';
import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { useState } from 'react';

interface NFTTransferFormProps {
  // props here
}

export function NFTTransferForm({}: NFTTransferFormProps) {
  const [recipientAddress, setRecipientAddress] = useState('');

  const handleTransfer = () => {
    if (!recipientAddress) {
      alert('Please enter a recipient address');
      return;
    }
    alert(`NFT would be transferred to ${recipientAddress}`);
  };

  return (
    <Win98Window title="Transfer NFT" icon="/assets/icons/window/gallery.png" className="mb-3">
      <p className="text-black text-sm mb-2">Transfer this NFT to another wallet address.</p>
      <div className="mb-2">
        <label className="text-black text-sm block mb-1">Recipient Address</label>
        <Input
          placeholder="Enter recipient wallet address"
          className="hover:border-[#0000ff] focus:border-[#0000ff] text-sm h-8 py-0"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button
          className="hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.1)_inset] text-sm py-0 h-8"
          onClick={handleTransfer}
        >
          Transfer NFT
        </Button>
      </div>
    </Win98Window>
  );
}
