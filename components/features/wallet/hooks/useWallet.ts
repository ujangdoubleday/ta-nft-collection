'use client';

import { useCallback, useEffect, useState } from 'react';
import { verifyMessage } from 'viem';
import { useAccount, useChainId, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { createSiweMessage, signInWithEthereum } from '@/lib/auth/siwe';
import { useSession, signOut, getCsrfToken } from 'next-auth/react';
import { sepolia } from 'wagmi/chains';
import { trpc } from '@/lib/api/trpc/client';

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
  chainId: number | null;
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
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  // Next Auth session
  const { data: session, status } = useSession();

  // Add Redis mutation
  const { mutateAsync: setUserData } = trpc.redis.set.useMutation();
  const { data: storedUserData, refetch: refetchUserData } = trpc.redis.get.useQuery(
    { key: address ? `user:${address.toLowerCase()}` : '' },
    { enabled: !!address },
  );

  // Update state when account or session changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      address: address || null,
      chainId: chainId || null,
      isConnected,
      isAuthenticated: status === 'authenticated',
    }));
  }, [address, isConnected, chainId, status]);

  // Connect to wallet
  const connect = useCallback(async () => {
    if (!isBrowser) return false;

    try {
      setState((prev) => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));

      removeFromStorage(DISCONNECTED_KEY);

      const result = await connectAsync({
        connector: injected(),
      });

      if (!result?.accounts?.[0]) {
        throw new Error('No account returned from wallet');
      }

      if (result.chainId !== sepolia.id) {
        throw new Error('Please switch to Sepolia network');
      }

      setState((prev) => ({
        ...prev,
        address: result.accounts[0],
        chainId: result.chainId,
        isConnected: true,
        isConnecting: false,
        error: null,
      }));

      return true;
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [connectAsync]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await disconnectAsync();
      await signOut({ redirect: false });

      setState((prev) => ({
        ...prev,
        address: null,
        chainId: null,
        isConnected: false,
        isAuthenticated: false,
        manuallyDisconnected: true,
        error: null,
      }));

      setToStorage(DISCONNECTED_KEY, 'true');
    } catch (error: any) {
      console.error('Error disconnecting:', error);
    }
  }, [disconnectAsync]);

  // Authenticate
  const authenticate = useCallback(async () => {
    if (!address || !isConnected) {
      setState((prev) => ({
        ...prev,
        error: 'Please connect your wallet first',
      }));
      return false;
    }

    try {
      setState((prev) => ({
        ...prev,
        isAuthenticating: true,
        error: null,
      }));

      const csrfToken = await getCsrfToken();
      if (!csrfToken) throw new Error('Failed to get CSRF token');

      const statement = `Sign in to MyNFTs.exe with your Ethereum account.\nThis signature doesn't cost gas and securely identifies you.`;
      const message = await createSiweMessage(address, statement);
      const signature = await signMessageAsync({ message });

      // Verify signature client-side
      const isValid = await verifyMessage({
        address,
        message,
        signature,
      });

      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // Store user data in Redis
      const userKey = `user:${address.toLowerCase()}`;
      const userData = {
        address: address.toLowerCase(),
        nonce: csrfToken,
        chainId: sepolia.id,
        lastAuthenticated: new Date().toISOString(),
      };

      const redisResult = await setUserData({
        key: userKey,
        value: userData,
        expireInSeconds: 24 * 60 * 60, // 24 hours
      });

      if (!redisResult) {
        console.warn('Failed to store user data in Redis, but continuing authentication');
      }

      console.log('Attempting to sign in with Ethereum...');
      const callbackUrl = '/my';
      const { success, error, response } = await signInWithEthereum(
        message,
        signature,
        callbackUrl,
      );

      console.log('Sign-in response:', { success, error, response });

      if (!success) {
        throw new Error(error || 'Authentication failed');
      }

      // In production, don't return immediately - the page will reload via window.location
      if (process.env.NODE_ENV === 'production') {
        console.log('Authentication successful, page will reload.');
        return true;
      }

      // Refresh stored user data
      await refetchUserData();

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        isAuthenticating: false,
        error: null,
      }));

      return true;
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      console.error('Authentication error:', errorMessage);
      setState((prev) => ({
        ...prev,
        isAuthenticating: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [address, isConnected, signMessageAsync, setUserData, refetchUserData]);

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
    storedUserData,
  };
}
