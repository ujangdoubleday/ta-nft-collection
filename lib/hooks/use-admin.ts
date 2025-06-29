'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { publicClient } from '@/lib/blockchain/viem';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';
import { NFT_FACTORY_ABI } from '@/lib/blockchain/abi';

// List of admin addresses (should be moved to environment variables)
const ADMIN_ADDRESSES = ['0x19191984DF6Ce7749B786b9a2BB869B4b735eC31'];

export function useAdmin() {
  const { data: session } = useSession();
  const [contractOwner, setContractOwner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userAddress = session?.user?.address?.toLowerCase();

  // Check if user is in admin list
  const isInAdminList = userAddress
    ? ADMIN_ADDRESSES.map((addr) => addr.toLowerCase()).includes(userAddress)
    : false;

  // Check if user is contract owner
  const isContractOwner =
    userAddress && contractOwner
      ? userAddress.toLowerCase() === contractOwner.toLowerCase()
      : false;

  // User is admin if they are in admin list OR they are contract owner
  const isAdmin = isInAdminList || isContractOwner;

  useEffect(() => {
    async function fetchContractOwner() {
      try {
        setIsLoading(true);
        const owner = await publicClient.readContract({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'owner',
        });
        setContractOwner(owner as string);
      } catch (error) {
        console.error('Error fetching contract owner:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContractOwner();
  }, []);

  return {
    isAdmin,
    isContractOwner,
    isInAdminList,
    userAddress: session?.user?.address,
    contractOwner,
    isLoading,
  };
}
