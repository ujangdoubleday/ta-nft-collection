'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';
import { CurrentOwnership } from './CurrentOwnership';
import { TransferOwnership } from './TransferOwnership';
import { RenounceOwnership } from './RenounceOwnership';

interface OwnershipManagementProps {
  isLoading: boolean;
}

export function OwnershipManagement({ isLoading }: OwnershipManagementProps) {
  const [transferTxHash, setTransferTxHash] = useState('');
  const [renounceTxHash, setRenounceTxHash] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Owner Section */}
      <div className="flex flex-col gap-6">
        <CurrentOwnership isLoading={isLoading} />
      </div>

      {/* Transfer Ownership Section */}
      <div className="flex flex-col gap-6">
        <TransferOwnership isLoading={isLoading} />
      </div>

      {/* Renounce Ownership Section */}
      <div className="flex flex-col gap-6">
        <RenounceOwnership isLoading={isLoading} />
      </div>

      {/* Transaction Status */}
      {(transferTxHash || renounceTxHash) && (
        <div className="md:col-span-3">
          {transferTxHash && (
            <Alert className="bg-black/40 border border-zinc-800 mb-2">
              <AlertDescription className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">
                  Transfer ownership transaction processed
                </span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${transferTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  View on Sepolia <ExternalLink size={12} className="ml-1" />
                </a>
              </AlertDescription>
            </Alert>
          )}

          {renounceTxHash && (
            <Alert className="bg-black/40 border border-zinc-800">
              <AlertDescription className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">
                  Renounce ownership transaction processed
                </span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${renounceTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  View on Sepolia <ExternalLink size={12} className="ml-1" />
                </a>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
