// Define type for NFT history item
export type HistoryItem = {
  type: string;
  from: string;
  to: string;
  date: string;
  price?: string;
  transactionHash?: string;
  txHash?: string;
};

// Define type for NFT item
export type NFTItem = {
  id: string;
  tokenId: string;
  tokenType: string;
  name: string;
  description: string;
  imageUrl: string;
  owner: string;
  creator: string;
  mintedAt: string;
  attributes: { trait_type: string; value: string }[];
};
