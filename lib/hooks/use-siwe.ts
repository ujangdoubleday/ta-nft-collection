'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { createSiweMessage, signInWithEthereum } from '@/lib/auth/siwe';

export function useSiwe() {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login with Ethereum wallet
   */
  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!address) {
        throw new Error('No wallet address connected');
      }

      // Create the SIWE message
      const messageToSign = await createSiweMessage(
        address,
        'Sign in with Ethereum to authenticate',
      );

      // Sign the message
      const signature = await signMessageAsync({ message: messageToSign });

      // Verify signature and sign in
      const result = await signInWithEthereum(messageToSign, signature);

      if (!result.success) {
        throw new Error(result.error || 'Failed to authenticate');
      }

      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Authentication failed';
      setError(errorMessage);
      console.error('SIWE error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout and disconnect wallet
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Sign out from NextAuth
      await signOut({ redirect: false });

      // Disconnect wallet
      disconnect();

      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Logout failed';
      setError(errorMessage);
      console.error('Logout error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    isLoading,
    error,
    isLoggedIn: !!session?.user,
    user: session?.user,
    isConnected,
    address,
  };
}
