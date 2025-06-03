export type CollectionItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  attributes: {
    rarity?: string;
    pixels?: string;
    dimensions?: string;
    complexity?: string;
    era?: string;
    style?: string;
    category?: string;
    resolution?: string;
  };
};

export type Collection = {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
};

export type HistoryItem = {
  type: string;
  from: string;
  to: string;
  date: string;
  price?: string;
};

export type NFTItem = {
  name: string;
  description: string;
  type: string;
  creator: string;
  owner: string;
  mintDate: string;
  tokenId: string;
  blockchain: string;
  image: string;
  attributes: Record<string, string>;
  history?: HistoryItem[];
};
