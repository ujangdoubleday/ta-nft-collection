'use client';

import { useCallback, useEffect, useState } from 'react';
import { verifyMessage } from 'viem';
import {
    useAccount,
    useChainId,
    useConnect,
    useDisconnect,
    useSignMessage,
    useWalletClient,
} from 'wagmi';
import { injected } from 'wagmi/connectors';

// Local storage keys
const DISCONNECTED_KEY = 'wallet_disconnected';
const AUTHENTICATED_KEY = 'wallet_authenticated';

// Helper to check if code is running in browser
const isBrowser = typeof window !== 'undefined';

// Safe localStorage access
const getFromStorage = (key: string): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(key);
};

const setToStorage = (key: string, value: string): void => {
  if (!isBrowser) return;
  localStorage.setItem(key, value);
};

const removeFromStorage = (key: string): void => {
  if (!isBrowser) return;
  localStorage.removeItem(key);
};

export type WalletState = {
  address: string | null;
  chainId: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  manuallyDisconnected: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
};

export function useWalletWagmi() {
  // Initialize state with dummy values for SSR
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    isConnected: false,
    error: null,
    manuallyDisconnected: false,
    isAuthenticated: false,
    isAuthenticating: false,
  });

  // Update state with localStorage values after mount
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      manuallyDisconnected: getFromStorage(DISCONNECTED_KEY) === 'true',
      isAuthenticated: getFromStorage(AUTHENTICATED_KEY) === 'true',
    }));
  }, []);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectAsync, isPending: isConnectPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const { signMessageAsync, isPending: isSignPending } = useSignMessage();

  // Update state when account changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      address: address || null,
      chainId: chainId ? chainId.toString() : null,
      isConnected,
      isConnecting: isConnectPending,
      isAuthenticating: isSignPending,
      // Reset authenticated state if disconnected
      isAuthenticated: isConnected ? prev.isAuthenticated : false,
    }));
  }, [address, isConnected, chainId, isConnectPending, isSignPending]);

  // Update localStorage when manual disconnect changes
  useEffect(() => {
    if (!isBrowser) return;

    if (state.manuallyDisconnected) {
      setToStorage(DISCONNECTED_KEY, 'true');
    } else {
      removeFromStorage(DISCONNECTED_KEY);
    }
  }, [state.manuallyDisconnected]);

  // Update localStorage when authenticated changes
  useEffect(() => {
    if (!isBrowser) return;

    if (state.isAuthenticated) {
      setToStorage(AUTHENTICATED_KEY, 'true');
    } else {
      removeFromStorage(AUTHENTICATED_KEY);
    }
  }, [state.isAuthenticated]);

  /**
   * Connect to the wallet
   */
  const connect = useCallback(async () => {
    if (!isBrowser) {
      return false;
    }

    try {
      setState((prev) => ({
        ...prev,
        isConnecting: true,
        error: null,
        manuallyDisconnected: false,
      }));

      // Remove the disconnected flag from localStorage
      removeFromStorage(DISCONNECTED_KEY);

      const result = await connectAsync({
        connector: injected(),
      });

      if (!result?.accounts || result.accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }

      setState((prev) => ({
        ...prev,
        address: result.accounts[0],
        chainId: result.chainId.toString(),
        isConnected: true,
        isConnecting: false,
        isAuthenticated: false, // Always reset authentication state on connect
        error: null,
      }));

      // Remove authenticated status from localstorage
      removeFromStorage(AUTHENTICATED_KEY);

      return true;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);

      // Check for user rejected error
      const errorMessage = error?.message || String(error);
      const isUserRejected =
        errorMessage.includes('rejected') ||
        errorMessage.includes('denied') ||
        errorMessage.includes('canceled') ||
        errorMessage.includes('cancelled') ||
        errorMessage.includes('User rejected');

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        error: isUserRejected
          ? 'Connection was rejected by user'
          : `Error connecting: ${errorMessage}`,
      }));

      return false;
    }
  }, [connectAsync]);

  /**
   * Disconnect from the wallet
   */
  const disconnect = useCallback(async () => {
    try {
      await disconnectAsync();
    } catch (err) {
      console.error('Error disconnecting:', err);
    }

    setState((prev) => ({
      ...prev,
      address: null,
      chainId: null,
      isConnected: false,
      isAuthenticated: false,
      manuallyDisconnected: true,
      error: null,
    }));

    // Store disconnected state to prevent auto-reconnect
    setToStorage(DISCONNECTED_KEY, 'true');
    // Remove authenticated status
    removeFromStorage(AUTHENTICATED_KEY);
  }, [disconnectAsync]);

  /**
   * Authenticate the connected wallet
   */
  const authenticate = useCallback(async () => {
    if (!isBrowser) {
      console.error('Window is not defined, cannot authenticate');
      return false;
    }

    if (!walletClient || !address) {
      setState((prev) => ({
        ...prev,
        error: 'Connect wallet before authenticating',
        isAuthenticating: false,
      }));
      return false;
    }

    try {
      setState((prev) => ({
        ...prev,
        isAuthenticating: true,
        error: null,
      }));

      console.log('Starting authentication process');

      // Create signature message
      const message = `Welcome to MyNFTs.exe!\n\nThis signature verifies your wallet ownership.\nIt does not cost any gas or initiate a transaction.\n\nWallet: ${address}\nDate: ${new Date().toISOString()}`;

      console.log('Requesting signature using wagmi signMessage');

      try {
        // Sign the message
        const signature = await signMessageAsync({ message });
        console.log('Signature received:', !!signature);

        // Verify the signature
        const verified = await verifyMessage({
          address,
          message,
          signature,
        });

        console.log('Verification result:', verified);

        // Check if the verification succeeded
        if (verified) {
          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            isAuthenticating: false,
            error: null,
          }));

          // Store authentication state in localStorage
          setToStorage(AUTHENTICATED_KEY, 'true');
          return true;
        } else {
          throw new Error('Signature verification failed');
        }
      } catch (innerError: any) {
        console.error('Error in signature process:', innerError);
        throw innerError;
      }
    } catch (error: any) {
      console.error('Authentication error:', error);

      // Check for user rejected signatures
      const errorMessage = error?.message || String(error);
      const isUserRejected =
        errorMessage.includes('rejected') ||
        errorMessage.includes('denied') ||
        errorMessage.includes('canceled') ||
        errorMessage.includes('cancelled') ||
        errorMessage.includes('User rejected');

      setState((prev) => ({
        ...prev,
        isAuthenticating: false,
        error: isUserRejected ? 'Signature was rejected by user' : `Error signing: ${errorMessage}`,
      }));
      return false;
    }
  }, [walletClient, address, signMessageAsync]);

  return {
    address: state.address,
    chainId: state.chainId,
    isConnecting: state.isConnecting,
    isConnected: state.isConnected,
    isAuthenticated: state.isAuthenticated,
    isAuthenticating: state.isAuthenticating,
    error: state.error,
    connect,
    disconnect,
    authenticate,
  };
}
