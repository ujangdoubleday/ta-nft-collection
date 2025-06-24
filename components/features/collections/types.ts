export type CollectionItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  /**
   * @deprecated Use NextImage with placeholderType instead
   * The blurhash field is maintained for backwards compatibility
   * but will contain a data URL for a color-based placeholder
   */
  blurhash?: string;
  /**
   * Data URL for the image placeholder
   * This can be used with NextImage component's blurDataURL prop
   */
  placeholder?: string;
  /**
   * The contract address of the NFT collection
   */
  contractAddress?: string;
  /**
   * The token ID of the NFT
   */
  tokenId?: string;
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
  [x: string]: string | undefined;
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
