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
import { createSiweMessage, signInWithEthereum } from '@/lib/auth/siwe';
import { useSession, signOut } from 'next-auth/react';

// Local storage keys
const DISCONNECTED_KEY = 'wallet_disconnected';

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

// Wallet state interface
interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  manuallyDisconnected: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
}

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
    }));
  }, []);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectAsync, isPending: isConnectPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const { signMessageAsync, isPending: isSignPending } = useSignMessage();

  // Next Auth session
  const { data: session, status } = useSession();

  // Update state when account or session changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      address: address || null,
      chainId: chainId ? chainId.toString() : null,
      isConnected,
      isConnecting: isConnectPending,
      isAuthenticating: isSignPending,
      // Set authenticated based on NextAuth session
      isAuthenticated: status === 'authenticated',
    }));
  }, [address, isConnected, chainId, isConnectPending, isSignPending, status]);

  // Update localStorage when manual disconnect changes
  useEffect(() => {
    if (!isBrowser) return;

    if (state.manuallyDisconnected) {
      setToStorage(DISCONNECTED_KEY, 'true');
    } else {
      removeFromStorage(DISCONNECTED_KEY);
    }
  }, [state.manuallyDisconnected]);

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

      // Sign out from NextAuth
      await signOut({ redirect: false });
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
  }, [disconnectAsync]);

  /**
   * Authenticate the connected wallet using SIWE and NextAuth
   */
  const authenticate = useCallback(
    async (onSignComplete?: () => void) => {
      if (!isBrowser) {
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

        // Create SIWE message with address in the statement
        const statement = `Sign in to MyNFTs.exe with your Ethereum account ${address}.\nThis signature doesn't cost gas and securely identifies you.`;

        try {
          const message = await createSiweMessage(address, statement);

          // Sign the message
          const signature = await signMessageAsync({ message });

          // Verify the signature on the client side
          const verified = await verifyMessage({
            address,
            message,
            signature,
          });

          if (!verified) {
            throw new Error('Client-side signature verification failed');
          }

          // Call the callback to indicate signing is complete
          // This is where we'll show the account creation modal
          if (onSignComplete) {
            onSignComplete();
          }

          // Call Next Auth to verify and create session
          const { success, error } = await signInWithEthereum(message, signature);

          if (!success) {
            throw new Error(error || 'Sign-in failed');
          }

          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            isAuthenticating: false,
            error: null,
          }));

          return true;
        } catch (innerError) {
          throw innerError;
        }
      } catch (error: any) {
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
          error: isUserRejected
            ? 'Signature was rejected by user'
            : `Error signing: ${errorMessage}`,
        }));
        return false;
      }
    },
    [walletClient, address, signMessageAsync],
  );

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
    session,
  };
}
