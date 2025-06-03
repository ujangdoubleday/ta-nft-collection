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

// NFT hooks
export function useNFTs() {
  return trpc.nft.getAll.useQuery();
}

export function useUserNFTs(ownerAddress: string | undefined) {
  return trpc.nft.getByOwnerAddress.useQuery(
    { ownerAddress: ownerAddress! },
    {
      enabled: !!ownerAddress,
    },
  );
}

export function useNFTByTokenId(tokenId: string | undefined, contractAddress: string | undefined) {
  return trpc.nft.getByTokenId.useQuery(
    { tokenId: tokenId!, contractAddress: contractAddress! },
    { enabled: !!tokenId && !!contractAddress },
  );
}

export function useCreateNFT() {
  return trpc.nft.create.useMutation();
}

// Collection hooks
export function useCollections() {
  return trpc.collection.getAll.useQuery();
}

export function useCollectionByContractAddress(contractAddress: string | undefined) {
  return trpc.collection.getByContractAddress.useQuery(
    { contractAddress: contractAddress! },
    { enabled: !!contractAddress },
  );
}

export function useCreateCollection() {
  return trpc.collection.create.useMutation();
}
