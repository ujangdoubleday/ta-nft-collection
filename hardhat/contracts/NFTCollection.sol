// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NFTCollection
 * @dev ERC721 token collection for artists to mint their artworks
 * @author https://github.com/ujangbedog
 * @notice This contract represents an individual NFT collection with customizable metadata and minting capabilities
 */

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTCollection is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Collection metadata and configuration
    string public contractURI;           // URI for collection-level metadata
    string public baseTokenURI;          // Base URI for token metadata
    uint256 public maxSupply;            // Maximum number of tokens that can be minted
    uint256 public totalSupply;          // Current number of minted tokens
    address public factory;              // Address of the factory that created this collection
    uint256 public createdAt;            // Timestamp when collection was created
    
    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event BaseURIUpdated(string newBaseURI);
    event ContractURIUpdated(string newContractURI);
    
    // Custom errors
    error ExceedsMaxSupply();
    error InvalidParameters();
    error TokenNotExists();
    error NotAuthorized();

    /**
     * @dev Constructor for creating a new NFT collection
     * @param name Name of the collection (e.g., "My Art Collection")
     * @param symbol Token symbol (e.g., "MAC")
     * @param initialOwner Address of the initial owner (usually the artist/creator)
     * @param _contractURI URI pointing to collection-level metadata (JSON)
     * @param _maxSupply Maximum number of NFTs that can be minted in this collection
     */
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        string memory _contractURI,
        uint256 _maxSupply
    ) ERC721(name, symbol) Ownable(initialOwner) {
        if (_maxSupply == 0 || initialOwner == address(0)) {
            revert InvalidParameters();
        }
        
        contractURI = _contractURI;
        maxSupply = _maxSupply;
        factory = msg.sender;
        createdAt = block.timestamp;
    }

    /**
     * @dev Mint a single NFT artwork with specific metadata (only collection owner)
     * @param recipient Address to receive the NFT (can be artist or buyer)
     * @param _tokenURI Metadata URI for the specific artwork
     * @return tokenId ID of the newly minted token
     */
    function mintArtwork(address recipient, string memory _tokenURI) 
        external 
        onlyOwner
        nonReentrant 
        returns (uint256 tokenId) 
    {
        if (bytes(_tokenURI).length == 0 || recipient == address(0)) {
            revert InvalidParameters();
        }
        
        tokenId = _mintSingle(recipient, _tokenURI);
        emit TokenMinted(recipient, tokenId, _tokenURI);
    }

    /**
     * @dev Batch mint multiple NFTs to a single recipient (simplified version)
     * @param recipient Address to receive all the NFTs
     * @param quantity Number of NFTs to mint
     * @notice This function mints tokens without individual URIs - use setTokenURI later if needed
     */
    function batchMint(address recipient, uint256 quantity) 
        external 
        onlyOwner
        nonReentrant 
    {
        if (recipient == address(0) || quantity == 0) {
            revert InvalidParameters();
        }
        
        if (totalSupply + quantity > maxSupply) {
            revert ExceedsMaxSupply();
        }
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = totalSupply + 1;
            totalSupply++;
            _mint(recipient, tokenId);
            emit TokenMinted(recipient, tokenId, "");
        }
    }

    /**
     * @dev Internal function to mint a single NFT with metadata
     * @param recipient Address to receive the NFT
     * @param _tokenURI Metadata URI for the token
     * @return tokenId ID of the minted token
     */
    function _mintSingle(address recipient, string memory _tokenURI) internal returns (uint256) {
        if (totalSupply >= maxSupply) {
            revert ExceedsMaxSupply();
        }
        
        uint256 tokenId = totalSupply + 1;
        totalSupply++;
        
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        return tokenId;
    }

    /**
     * @dev Set base URI for tokens (only owner)
     * @param _baseTokenURI New base URI that will be used for tokens without individual URIs
     * @notice Tokens will use: baseURI + tokenId for their metadata if no specific URI is set
     */
    function setBaseURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
        emit BaseURIUpdated(_baseTokenURI);
    }

    /**
     * @dev Update contract metadata URI (only owner)
     * @param _contractURI New contract URI pointing to collection-level metadata
     */
    function setContractURI(string memory _contractURI) external onlyOwner {
        contractURI = _contractURI;
        emit ContractURIUpdated(_contractURI);
    }

    /**
     * @dev Get basic collection information
     * @return collectionName Name of the collection
     * @return collectionSymbol Symbol of the collection
     * @return currentSupply Current number of minted tokens
     * @return supplyCap Maximum number of tokens that can be minted
     */
    function getCollectionInfo() external view returns (
        string memory collectionName,
        string memory collectionSymbol,
        uint256 currentSupply,
        uint256 supplyCap
    ) {
        return (name(), symbol(), totalSupply, maxSupply);
    }

    /**
     * @dev Get all token IDs owned by a specific address
     * @param owner Address to query for owned tokens
     * @return tokenIds Array of token IDs owned by the address
     * @notice This function may be gas-intensive for large collections
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory tokenIds) {
        uint256 tokenCount = balanceOf(owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        }
        
        tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        // Iterate through all tokens to find ones owned by the specified address
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_ownerOf(i) != address(0) && ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
                if (currentIndex == tokenCount) break;
            }
        }
    }

    /**
     * @dev Check if a token with given ID exists
     * @param tokenId Token ID to check
     * @return True if token exists (has been minted and not burned)
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Override tokenURI to support both individual and base URI patterns
     * @param tokenId Token ID to get URI for
     * @return URI string for the token metadata
     * @notice Priority: Individual tokenURI > baseURI + tokenId > empty string
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenNotExists();
        }

        // Get the specific token URI first (set via _setTokenURI)
        string memory _tokenURI = super.tokenURI(tokenId);
        
        // If specific tokenURI is set, return it
        if (bytes(_tokenURI).length > 0) {
            return _tokenURI;
        }

        // If no specific tokenURI, check if baseURI is set
        string memory base = _baseURI();
        if (bytes(base).length > 0) {
            // Ensure baseURI ends with '/' for proper concatenation
            string memory separator = bytes(base)[bytes(base).length - 1] == bytes('/')[0] ? "" : "/";
            return string(abi.encodePacked(base, separator, tokenId.toString()));
        }

        // If neither specific tokenURI nor baseURI is set, return empty string
        return "";
    }

    /**
     * @dev Internal function to get base URI
     * @return Base URI string used for token metadata
     */
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    /**
     * @dev Public getter for the base URI
     * @return Current base URI
     */
    function getBaseURI() external view returns (string memory) {
        return baseTokenURI;
    }

    /**
     * @dev Override supportsInterface to declare supported interfaces
     * @param interfaceId Interface identifier to check
     * @return True if interface is supported
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }

    // Note: Token burning functionality is inherited from ERC721URIStorage
    // The _burn function automatically handles URI cleanup when tokens are burned
}