'use client';

import { useState, useCallback } from 'react';
import { signIn, signOut, useSession, getCsrfToken } from 'next-auth/react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useChainId } from 'wagmi';
import { SiweMessage } from 'siwe';
import { trpc } from '@/lib/api/trpc/client';
import { sepolia } from 'wagmi/chains';

export function useSiwe() {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { mutateAsync: setUserData } = trpc.redis.set.useMutation();
  const { data: storedUserData, refetch: refetchUserData } = trpc.redis.get.useQuery(
    { key: address ? `user:${address.toLowerCase()}` : '' },
    { enabled: !!address },
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSiweMessage = useCallback(
    async (nonce: string) => {
      if (!address) return null;
      if (chainId !== sepolia.id) {
        throw new Error('Please switch to Sepolia network');
      }

      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: address.toLowerCase(),
        statement: 'Sign in with Ethereum to access NFT Platform.',
        uri: window.location.origin,
        version: '1',
        chainId: sepolia.id,
        nonce,
        issuedAt: new Date().toISOString(),
      });

      return siweMessage;
    },
    [address, chainId],
  );

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!address) {
        throw new Error('No wallet address connected');
      }

      if (chainId !== sepolia.id) {
        throw new Error('Please switch to Sepolia network');
      }

      const csrfToken = await getCsrfToken();
      if (!csrfToken) throw new Error('Failed to get CSRF token');

      const siweMessage = await createSiweMessage(csrfToken);
      if (!siweMessage) return false;

      const preparedMessage = siweMessage.prepareMessage();
      console.log('Prepared message:', preparedMessage);

      const signature = await signMessageAsync({
        message: preparedMessage,
      });
      console.log('Signature:', signature);

      // Store user data in Redis
      const userKey = `user:${address.toLowerCase()}`;
      const userData = {
        address: address.toLowerCase(),
        nonce: csrfToken,
        chainId: sepolia.id,
      };

      console.log('Storing user data in Redis:', { userKey, userData });

      const redisResult = await setUserData({
        key: userKey,
        value: userData,
        expireInSeconds: 24 * 60 * 60, // 24 hours
      });

      console.log('Redis storage result:', redisResult);

      if (!redisResult) {
        console.error('Failed to store user data in Redis');
      }

      // Send the message as a JSON string
      const messageToSend = {
        domain: siweMessage.domain,
        address: siweMessage.address,
        statement: siweMessage.statement,
        uri: siweMessage.uri,
        version: siweMessage.version,
        chainId: siweMessage.chainId,
        nonce: siweMessage.nonce,
        issuedAt: siweMessage.issuedAt,
        resources: siweMessage.resources,
      };

      console.log('Sending to server:', {
        message: messageToSend,
        signature,
      });

      const response = await signIn('credentials', {
        message: JSON.stringify(messageToSend),
        signature,
        redirect: false,
        callbackUrl: '/',
      });

      console.log('SignIn response:', response);

      if (!response?.ok) {
        throw new Error(response?.error || 'Failed to authenticate');
      }

      // Refresh stored user data
      await refetchUserData();

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

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signOut({ redirect: false });
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
    isSepoliaNetwork: chainId === sepolia.id,
    storedUserData,
  };
}
