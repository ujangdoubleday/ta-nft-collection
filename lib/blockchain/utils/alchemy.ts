import { Alchemy, Network, AlchemySubscription, Wallet } from 'alchemy-sdk';
import { keccak256, toHex } from 'viem';

// Get Alchemy configuration from environment variables
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const BASE_URL = `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;
const ALCHEMY_WEBSOCKET = `wss://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// Configure Alchemy SDK
const settings = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};

// Create Alchemy instance
export const alchemy = new Alchemy(settings);

// Type for query parameters
type QueryParams = Record<string, string | number | boolean>;

/**
 * Make a request to the Alchemy API
 * @param endpoint The API endpoint
 * @param queryParams Optional query parameters
 * @returns The API response
 */
export async function alchemyRequest<T>(endpoint: string, queryParams?: QueryParams): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`);

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
    console.log(`Setting up event listener for contract: ${contractAddress}`);

    // Create filter for the contract address
    const filter = {
      address: contractAddress,
    };

    // Listen for events on the contract using WebSocket
    alchemy.ws.on(filter, callback);

    // Return a function to remove the listener
    return () => {
      console.log(`Removing listener for contract: ${contractAddress}`);
      alchemy.ws.removeAllListeners(filter);
    };
  } catch (error) {
    console.error('Error setting up contract event listener:', error);
    return () => {}; // Return empty cleanup function
  }
}
