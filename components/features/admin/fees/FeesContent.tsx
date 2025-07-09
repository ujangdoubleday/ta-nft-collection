'use client';

import React from 'react';
import { FeesHeader } from './FeesHeader';
import { NFTCreationFee } from './NFTCreationFee';
import { ContractBalance } from './ContractBalance';
import { WithdrawFees } from './WithdrawFees';

export function FeesContent() {
  return (
    <div className="animate-fade-in">
      <FeesHeader />

      <div className="flex flex-col gap-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* NFT Creation Fee */}
          <NFTCreationFee />

          {/* Contract Balance */}
          <ContractBalance />

          {/* Withdraw Fees */}
          <WithdrawFees />
        </div>
      </div>
    </div>
  );
}
