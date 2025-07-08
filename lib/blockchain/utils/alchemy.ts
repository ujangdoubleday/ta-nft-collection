import { alchemy } from '@/lib/blockchain/alchemy';
import { keccak256, toBytes } from 'viem';
import { BASE_URL_ALCHEMY_API } from '@/lib/blockchain/alchemy/config';
import { connectWebSocket, disconnectWebSocket } from '@/lib/blockchain/alchemy/config';
import { BASE_URL_ALCHEMY_RPC } from '../alchemy/config';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';
import { NFT_FACTORY_ABI } from '@/lib/blockchain/abi';
import { ethers } from 'ethers';

// Type for query parameters
type QueryParams = Record<string, string | number | boolean>;

export const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

/**
 * Make a request to the Alchemy API
 * @param endpoint The API endpoint
 * @param queryParams Optional query parameters
 * @returns The API response
 */
export async function alchemyRequest<T>(endpoint: string, queryParams?: QueryParams): Promise<T> {
  const url = new URL(`https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/${endpoint}`);

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) =>
      url.searchParams.append(key, value.toString()),
    );
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Alchemy API error: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Create a topic hash from an event signature
 * @param eventSignature The event signature (e.g. "Transfer(address,address,uint256)")
 * @returns The topic hash
 */
function createTopicHash(eventSignature: string): string {
  // Convert the event signature to bytes
  const bytes = new TextEncoder().encode(eventSignature);
  // Calculate keccak256 hash
  const hash = keccak256(bytes);
  // Return as hex string
  return hash;
}

/**
 * Subscribe to contract events using Alchemy
 * @param contractAddress The contract address to listen to
 * @param eventSignature Optional event signature (e.g. "Transfer(address,address,uint256)")
 * @param callback The callback function to call when an event is detected
 * @returns A function to unsubscribe from the event
 */
export function subscribeToContractEvents(
  contractAddress: string,
  eventSignature?: string,
  callback?: (log: any, event: any) => void,
) {
  try {
    console.log(`Setting up subscription for contract: ${contractAddress}`);

    // Ensure WebSocket is connected before setting up listeners
    connectWebSocket();

    // Create filter
    const filter: any = {
      address: contractAddress,
    };

    // Add topics if event signature is provided
    if (eventSignature) {
      // Convert event signature to topic hash
      const topicHash = createTopicHash(eventSignature);
      console.log(`Listening for event: ${eventSignature} (${topicHash})`);
      filter.topics = [topicHash];
    }

    // Set up the event listener
    const handleLog = (log: any, event: any) => {
      console.log('Alchemy event detected:', log);
      if (callback) callback(log, event);
    };

    // Subscribe to the event
    alchemy.ws.on(filter, handleLog);

    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribing from contract: ${contractAddress}`);
      alchemy.ws.removeAllListeners(filter);
    };
  } catch (error) {
    console.error('Error setting up contract event subscription:', error);
    return () => {}; // Return empty cleanup function
  }
}

/**
 * Get logs for a specific transaction
 * @param txHash The transaction hash
 * @param contractAddress The contract address
 * @returns The logs for the transaction
 */
export async function getLogsForTransaction(txHash: string, contractAddress: string) {
  try {
    // Get transaction receipt
    const receipt = await alchemy.core.getTransactionReceipt(txHash);

    if (!receipt) {
      throw new Error(`Transaction receipt not found for hash: ${txHash}`);
    }

    // Filter logs by contract address
    const contractLogs = receipt.logs.filter(
      (log) => log.address.toLowerCase() === contractAddress.toLowerCase(),
    );

    return {
      receipt,
      logs: contractLogs,
    };
  } catch (error) {
    console.error('Error getting logs for transaction:', error);
    throw error;
  }
}

/**
 * Setup a listener for contract events using Alchemy WebSocket
 * @param contractAddress The contract address to listen for
 * @param callback Function to call when an event is received
 */
export function setupContractEventListener(
  contractAddress: string,
  callback: (log: any, event: any) => void,
) {
  try {
    // console.log(`Setting up event listener for contract: ${contractAddress}`);

    // Create filter for the contract address
    const filter = {
      address: contractAddress,
    };

    // Listen for events on the contract using WebSocket
    alchemy.ws.on(filter, callback);

    // Return a function to remove the listener
    return () => {
      // console.log(`Removing listener for contract: ${contractAddress}`);
      alchemy.ws.removeAllListeners(filter);
    };
  } catch (error) {
    console.error('Error setting up contract event listener:', error);
    return () => {}; // Return empty cleanup function
  }
}

/**
 * Fetch NFTs for a specific contract address
 * @param contractAddress The contract address to fetch NFTs for
 * @param withMetadata Whether to include metadata in the response
 * @returns The NFTs for the contract
 */
export async function getNFTsForContract(contractAddress: string, withMetadata: boolean = true) {
  try {
    const endpoint = 'getNFTsForContract';
    const queryParams = {
      contractAddress,
      withMetadata,
    };

    const response = await alchemyRequest(endpoint, queryParams);
    return response;
  } catch (error) {
    console.error('Error fetching NFTs for contract:', error);
    throw error;
  }
}

/**
 * Fetch a specific NFT by contract address and token ID
 * @param contractAddress The contract address of the NFT
 * @param tokenId The token ID of the NFT
 * @returns The NFT data
 */
export async function getNFTMetadata(contractAddress: string, tokenId: string) {
  try {
    const endpoint = 'getNFTMetadata';
    const queryParams = {
      contractAddress,
      tokenId,
    };

    const response = await alchemyRequest(endpoint, queryParams);
    return response;
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    throw error;
  }
}

// Define types for Alchemy API response
export interface AlchemyNFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface AlchemyNFT {
  contract: {
    address: string;
    name: string | null;
    symbol: string | null;
    totalSupply: string | null;
    tokenType: string;
  };
  tokenId: string;
  tokenType: string;
  name: string;
  description: string;
  tokenUri: string;
  image: {
    cachedUrl: string | null;
    thumbnailUrl: string | null;
    pngUrl: string | null;
    originalUrl: string | null;
  };
  raw: {
    tokenUri: string;
    metadata: AlchemyNFTMetadata;
    error: string | null;
  };
  timeLastUpdated: string;
}

export interface AlchemyNFTResponse {
  nfts: AlchemyNFT[];
  pageKey: string | null;
}

/**
 * Fetches NFTs for a specific contract address using Alchemy API
 * @param contractAddress The contract address to fetch NFTs for
 * @returns Promise with the NFTs data
 */
export const fetchNFTsForContract = async (
  contractAddress: string,
): Promise<AlchemyNFTResponse> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!apiKey) {
      throw new Error('Alchemy API key not found');
    }

    const url = `https://eth-sepolia.g.alchemy.com/nft/v3/${apiKey}/getNFTsForContract?contractAddress=${contractAddress}&withMetadata=true`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: { tags: ['collections'] },
    });

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status} ${response.statusText}`);
    }

    const data: AlchemyNFTResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching NFTs from Alchemy:', error);
    return { nfts: [], pageKey: null };
  }
};

/**
 * Refresh NFT metadata on Alchemy
 * @param contractAddress The NFT contract address
 * @param tokenId The token ID to refresh
 * @returns Response from the Alchemy API
 */
export const refreshNFTMetadata = async (
  contractAddress: string,
  tokenId: string,
): Promise<any> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!apiKey) {
      throw new Error('Alchemy API key not found');
    }

    const url = `https://eth-sepolia.g.alchemy.com/nft/v3/${apiKey}/refreshNftMetadata`;

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractAddress,
        tokenId,
      }),
      next: { tags: ['refresh-nft-metadata'] },
    };

    const response = await fetch(url, options);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error refreshing NFT metadata:', error);
    return { success: false, error };
  }
};

/**
 * Get the owner of an NFT
 * @param contractAddress The contract address of the NFT
 * @param tokenId The token ID of the NFT
 * @returns The owner address of the NFT
 */
export async function getNFTOwner(
  contractAddress: string,
  tokenId: string,
): Promise<string | null> {
  try {
    const endpoint = 'getOwnersForNFT';
    const queryParams = {
      contractAddress,
      tokenId,
    };

    const response = await alchemyRequest<{ owners: string[] }>(endpoint, queryParams);
    return response.owners && response.owners.length > 0 ? response.owners[0] : null;
  } catch (error) {
    console.error('Error fetching NFT owner:', error);
    return null;
  }
}

/**
 * Fetch a single NFT by contract address and token ID using Alchemy API
 * @param contractAddress The contract address of the NFT
 * @param tokenId The token ID of the NFT
 * @returns Promise with the NFT data
 */
export const fetchNFTByTokenId = async (
  contractAddress: string,
  tokenId: string,
): Promise<AlchemyNFT | null> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!apiKey) {
      throw new Error('Alchemy API key not found');
    }

    const url = `https://eth-sepolia.g.alchemy.com/nft/v3/${apiKey}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}&refreshCache=false`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: { tags: ['nft'] },
    });

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status} ${response.statusText}`);
    }

    const data: AlchemyNFT = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching NFT from Alchemy:', error);
    return null;
  }
};

/**
 * Get transfer history for a specific NFT token
 * @param contractAddress The contract address of the NFT
 * @param tokenId The token ID of the NFT
 * @returns Array of transfer events
 */
export async function getTransferHistory(contractAddress: string, tokenId: string) {
  try {
    console.log(`Fetching transfer history for NFT: ${contractAddress} Token ID: ${tokenId}`);

    // Convert tokenId to numeric for comparison if not in hex format
    const numericTokenId = tokenId.startsWith('0x')
      ? tokenId
      : `0x${parseInt(tokenId).toString(16).padStart(64, '0')}`;
    console.log(`Looking for token ID: ${tokenId} (hex: ${numericTokenId})`);

    // Build request body
    const requestBody = {
      jsonrpc: '2.0',
      method: 'alchemy_getAssetTransfers',
      params: [
        {
          fromBlock: '0x0',
          toBlock: 'latest',
          contractAddresses: [contractAddress],
          category: ['erc721'],
          withMetadata: true,
          excludeZeroValue: false,
          maxCount: '0x64', // 100 in hex
          order: 'asc',
        },
      ],
      id: 1,
    };

    console.log('Alchemy API request:', JSON.stringify(requestBody, null, 2));

    // Using the proper Alchemy JSON-RPC API endpoint
    const response = await fetch(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alchemy API HTTP error:', response.status, errorText);
      throw new Error(`Failed to fetch transfer history: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Alchemy API response:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('Alchemy API returned error:', data.error);
      throw new Error(`Alchemy API error: ${data.error.message}`);
    }

    // Extract transfers from the result
    const transfers = data.result?.transfers || [];
    console.log(`Found ${transfers.length} total transfers for contract`);

    // Filter for the specific token ID
    const filteredTransfers = transfers
      .filter((transfer: any) => {
        // Check erc721TokenId first (this is the proper field to use)
        if (transfer.erc721TokenId) {
          // Convert both to lowercase for case-insensitive comparison
          const transferTokenIdLower = transfer.erc721TokenId.toLowerCase();
          const numericTokenIdLower = numericTokenId.toLowerCase();

          // Compare with our token ID
          const isMatch = transferTokenIdLower === numericTokenIdLower;
          console.log(
            `Comparing: Transfer tokenId: ${transferTokenIdLower}, Looking for: ${numericTokenIdLower}, Match: ${isMatch}`,
          );

          return isMatch;
        }

        // Fallback to tokenId field if erc721TokenId is not available
        if (transfer.tokenId) {
          const transferTokenIdLower = transfer.tokenId.toLowerCase();
          const numericTokenIdLower = numericTokenId.toLowerCase();

          const isMatch = transferTokenIdLower === numericTokenIdLower;
          console.log(
            `Fallback - Comparing TokenId: ${transferTokenIdLower}, Looking for: ${numericTokenIdLower}, Match: ${isMatch}`,
          );

          return isMatch;
        }

        return false;
      })
      .map((transfer: any) => {
        return {
          from: transfer.from,
          to: transfer.to,
          tokenId,
          timestamp: new Date(transfer.metadata.blockTimestamp).getTime() / 1000, // Convert to unix timestamp
          transactionHash: transfer.hash,
        };
      });

    console.log(`Found ${filteredTransfers.length} transfers for token ${tokenId}`);
    return filteredTransfers;
  } catch (error) {
    console.error('Error getting transfer history:', error);
    return [];
  }
}

/**
 * Check if the NFT Factory contract is paused
 * @returns Promise resolving to boolean indicating if contract is paused
 */
export async function checkContractPaused(): Promise<boolean> {
  try {
    // Create a provider using Alchemy
    const provider = new ethers.JsonRpcProvider(BASE_URL_ALCHEMY_RPC);

    // Create contract instance
    const contract = new ethers.Contract(NFT_FACTORY_ADDRESS, NFT_FACTORY_ABI, provider);

    // Call the paused function
    const isPaused = await contract.paused();
    return isPaused;
  } catch (error) {
    console.error('Error checking if contract is paused:', error);
    return false; // Default to false if there's an error
  }
}

/**
 * Get the contract balance
 * @returns Promise resolving to contract balance in ETH
 */
export async function getContractBalance(): Promise<number> {
  try {
    // Create a provider using Alchemy
    const provider = new ethers.JsonRpcProvider(BASE_URL_ALCHEMY_RPC);

    // Get balance
    const balanceWei = await provider.getBalance(NFT_FACTORY_ADDRESS);

    // Convert from wei to ETH
    const balanceEth = parseFloat(ethers.formatEther(balanceWei));

    return balanceEth;
  } catch (error) {
    console.error('Error getting contract balance:', error);
    return 0; // Default to 0 if there's an error
  }
}
