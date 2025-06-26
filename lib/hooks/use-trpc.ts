'use client';

import { trpc } from '@/lib/api/trpc/client';

/**
 * A hook that provides access to the tRPC client
 * This is useful for cases where you want to access the trpc client outside of a component
 */
export function useTrpc() {
  return trpc;
}

/**
 * Example hooks for common tRPC operations
 */

// User hooks
export function useUser(address: string | undefined) {
  return trpc.user.getByAddress.useQuery(
    { address: address! },
    {
      enabled: !!address,
    },
  );
}

export function useCreateUser() {
  return trpc.user.create.useMutation();
}

export function useUpdateUser() {
  return trpc.user.update.useMutation();
}

export function useNFTByTokenId(tokenId: string | undefined, contractAddress: string | undefined) {
  return trpc.nft.getByTokenId.useQuery(
    { tokenId: tokenId!, contractAddress: contractAddress! },
    { enabled: !!tokenId && !!contractAddress },
  );
}
