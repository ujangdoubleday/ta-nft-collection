/**
 * Utilities for interacting with Ethereum smart contracts
 */
import { ethers } from 'ethers';
import { z } from 'zod';

// ABI for ERC-721 standard
export const erc721ABI = [
  // Main ERC-721 functions
  'function balanceOf(address owner) view returns (uint256 balance)',
  'function ownerOf(uint256 tokenId) view returns (address owner)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address operator)',
  'function setApprovalForAll(address operator, bool _approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',

  // ERC-721 Metadata Extension
  'function name() view returns (string memory)',
  'function symbol() view returns (string memory)',
  'function tokenURI(uint256 tokenId) view returns (string memory)',
  'function totalSupply() view returns (uint256)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
];

// ABI for ERC-1155 standard
export const erc1155ABI = [
  // Main ERC-1155 functions
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) view returns (uint256[] memory)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data)',

  // ERC-1155 Metadata Extension
  'function uri(uint256 id) view returns (string memory)',

  // Events
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
  'event ApprovalForAll(address indexed account, address indexed operator, bool approved)',
  'event URI(string value, uint256 indexed id)',
];

/**
 * Validate and format Ethereum address
 * @param address Ethereum address to validate
 * @returns Checksum address if valid
 * @throws Error if address is invalid
 */
export function validateAddress(address: string): string {
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
  return ethers.getAddress(address); // Returns checksum address
}

/**
 * Transaction input validator schema
 */
export const transactionSchema = z.object({
  contractAddress: z
    .string()
    .refine((addr) => ethers.isAddress(addr), { message: 'Invalid contract address' }),
  tokenId: z.union([
    z.string().min(1, 'Token ID is required'),
    z.number().int().nonnegative('Token ID must be a non-negative integer'),
  ]),
  to: z
    .string()
    .refine((addr) => ethers.isAddress(addr), { message: 'Invalid recipient address' })
    .optional(),
  amount: z
    .union([
      z.string().min(1, 'Amount is required'),
      z.number().positive('Amount must be positive'),
    ])
    .optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

/**
 * Get contract interface type based on functions
 * @param contractAddress Contract address to check
 * @param provider Ethereum provider
 * @returns 'ERC721' or 'ERC1155' or 'unknown'
 */
export async function detectContractType(
  contractAddress: string,
  provider: any,
): Promise<'ERC721' | 'ERC1155' | 'unknown'> {
  try {
    // Try to access ERC-721 function
    const erc721Contract = new ethers.Contract(
      contractAddress,
      ['function supportsInterface(bytes4) view returns (bool)'],
      provider,
    );
    const supportsERC721 = await erc721Contract.supportsInterface('0x80ac58cd'); // ERC-721 interface ID

    if (supportsERC721) {
      return 'ERC721';
    }

    // Try to access ERC-1155 function
    const supportsERC1155 = await erc721Contract.supportsInterface('0xd9b67a26'); // ERC-1155 interface ID

    if (supportsERC1155) {
      return 'ERC1155';
    }

    return 'unknown';
  } catch (error) {
    console.error('Error detecting contract type:', error);
    return 'unknown';
  }
}

/**
 * Create properly formatted contract parameters for wagmi
 * @param contractAddress Contract address
 * @param abi Contract ABI
 * @returns Contract parameters
 */
export function createContractConfig(contractAddress: string, abi: any[]) {
  return {
    address: validateAddress(contractAddress),
    abi,
  };
}
