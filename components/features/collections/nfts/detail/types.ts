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

export type HistoryItem = {
  type: string;
  from: string;
  to: string;
  date: string;
  price?: string;
  transactionHash?: string;
  txHash?: string;
};
