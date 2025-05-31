'use client';

import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Win98Spinner } from '@/components/ui/win98';
import { MetaMaskIcon } from '@/components/ui/MetaMaskIcon';
import { Copy, Check, LogOut } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { LogMessage } from './useWalletModal';

interface WalletModalContentProps {
  step: 'connect' | 'sign' | 'checking' | 'details';
  address: string | null;
  chainId: string | null;
  isConnecting: boolean;
  isAuthenticating: boolean;
  copied: boolean;
  getNetworkName: (chainId: string | null) => string;
  onConnect: () => Promise<void>;
  onAuthenticate: () => Promise<void>;
  onCopyAddress: () => Promise<void>;
  onDisconnect: () => void;
  onCancelSign: () => void;
  logMessages: LogMessage[];
}

export function WalletModalContent({
  step,
  address,
  chainId,
  isConnecting,
  isAuthenticating,
  copied,
  getNetworkName,
  onConnect,
  onAuthenticate,
  onCopyAddress,
  onDisconnect,
  onCancelSign,
  logMessages,
}: WalletModalContentProps) {
  const safeFormatAddress = (addr: string | null): string => {
    if (!addr) return '0x...';
    try {
      return formatAddress(addr);
    } catch (error) {
      return '0x...';
    }
  };

  const renderLogMessage = (log: LogMessage) => {
    const colors = {
      info: 'win98-console-info',
      success: 'win98-console-success',
      warning: 'win98-console-warning',
      error: 'win98-console-error',
    };

    return (
      <div key={log.id.toString()} className="flex items-start py-0.5">
        <span className={`win98-console-text ${colors[log.type]}`}>{log.message}</span>
      </div>
    );
  };

  switch (step) {
    case 'connect':
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-black">Connect Wallet</DialogTitle>
            <DialogDescription className="pt-2 text-xs text-[#555]">
              Connect your wallet to access your NFT collections and create new digital assets.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4 space-y-4">
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex items-center justify-center gap-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-3 text-black text-sm press-effect"
            >
              {isConnecting ? (
                <>
                  <Win98Spinner />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <MetaMaskIcon className="w-5 h-5" />
                  <span>Connect with MetaMask</span>
                </>
              )}
            </button>
          </div>
        </>
      );

    case 'sign':
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-black">Authenticate</DialogTitle>
            <DialogDescription className="pt-2 text-xs text-[#555]">
              Sign a message with your wallet to verify ownership and access your collections.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4">
            <div className="p-3 mb-4 bg-[#c0c0c0] border-[1px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-xs">
              <p className="mb-2">
                <strong>Wallet:</strong>{' '}
                <span className="font-mono">{safeFormatAddress(address)}</span>
              </p>
              <p className="mb-2">
                <strong>Network:</strong> <span>{getNetworkName(chainId)}</span>
              </p>
              <p>
                <strong>Message:</strong> Sign in to MyNFTs.exe with your Ethereum account. This
                signature doesn&apos;t cost gas and securely identifies you.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onAuthenticate}
                disabled={isAuthenticating}
                className="flex-1 flex items-center justify-center gap-2 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-2 text-black text-sm press-effect"
              >
                {isAuthenticating ? (
                  <>
                    <Win98Spinner />
                    <span>Signing...</span>
                  </>
                ) : (
                  <>
                    <span>Sign Message</span>
                  </>
                )}
              </button>
              <button
                onClick={onCancelSign}
                disabled={isAuthenticating}
                className="bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-2 text-black text-sm press-effect"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      );

    case 'checking':
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-black">Wallet Verification</DialogTitle>
            <DialogDescription className="pt-2 text-xs text-[#555]">
              Checking wallet and creating account...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4">
            <div className="mb-4 border-[2px] border-[#c0c0c0] border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#808080] border-b-[#808080]">
              <div className="win98-console p-2 h-52 overflow-y-auto win98-scrollbar">
                <div className="win98-console-prompt mb-2">
                  <span className="win98-console-text">
                    Verify Wallet {address ? safeFormatAddress(address).substring(0, 10) : '0x...'}
                    ...
                  </span>
                </div>

                {logMessages.length === 0 ? (
                  <div className="win98-console-info">
                    Initializing wallet verification protocol...
                    <span className="win98-cursor"></span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {logMessages.map(renderLogMessage)}
                    <span className="win98-cursor"></span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center bg-[#c0c0c0] px-2 py-1 border-t-[1px] border-[#808080]">
                <div className="flex items-center gap-2 text-[10px]">
                  <Win98Spinner size="small" />
                  <span>Processing</span>
                </div>
                <div className="w-32 h-2 bg-white border-[1px] border-[#808080] overflow-hidden">
                  <div className="win98-progress-bar h-full"></div>
                </div>
              </div>
            </div>
          </div>
        </>
      );

    case 'details':
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-black">Wallet Details</DialogTitle>
            <DialogDescription className="pt-2 text-xs text-[#555]">
              Your wallet is connected and authenticated
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4">
            <div className="p-3 mb-4 bg-[#c0c0c0] border-[1px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">
                  <strong>Address:</strong>
                </span>
                <div className="flex items-center">
                  <span className="font-mono text-xs mr-2">{safeFormatAddress(address)}</span>
                  <button
                    onClick={onCopyAddress}
                    className="bg-[#c0c0c0] border-[1px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1 hover-active press-effect"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">
                  <strong>Network:</strong>
                </span>
                <span className="text-xs">{getNetworkName(chainId)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">
                  <strong>Status:</strong>
                </span>
                <span className="text-xs flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  Connected
                </span>
              </div>
            </div>

            <button
              onClick={onDisconnect}
              className="w-full bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-2 text-black text-sm press-effect"
            >
              <span className="flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Disconnect Wallet
              </span>
            </button>
          </div>
        </>
      );

    default:
      return null;
  }
}
