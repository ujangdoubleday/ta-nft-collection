// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./lib/token/ERC721/extensions/ERC721URIStorage.sol";
import "./lib/access/Ownable.sol";
import "./lib/security/ReentrancyGuard.sol";
import "./lib/utils/Strings.sol";

/**
 * @title NFTCollection
 * @dev ERC721 token collection for artists to mint their artworks (royalty removed)
 */
contract NFTCollection is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Collection metadata
    string public contractURI;
    string public baseTokenURI;
    uint256 public maxSupply;
    uint256 public totalSupply;
    address public factory;
    uint256 public createdAt;
    
    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event BaseURIUpdated(string newBaseURI);
    event ContractURIUpdated(string newContractURI);
    
    // Errors
    error ExceedsMaxSupply();
    error InvalidParameters();
    error TokenNotExists();
    error NotAuthorized();

    /**
     * @dev Constructor for creating a new NFT collection (royalty parameters removed)
     * @param name Name of the collection
     * @param symbol Token symbol
     * @param initialOwner Address of the initial owner (artist)
     * @param _contractURI URI for collection metadata
     * @param _maxSupply Maximum number of NFTs that can be minted
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
     * @dev Mint a single NFT artwork (only collection owner/artist)
     * @param recipient Address to receive the NFT (can be artist or buyer)
     * @param _tokenURI Metadata URI for the artwork
     * @return tokenId ID of the minted token
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
     * @dev Batch mint multiple artworks (simplified version)
     * @param recipient Address to receive the NFTs
     * @param quantity Number of NFTs to mint
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
     * @dev Internal function to mint a single NFT
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
     * @param _baseTokenURI New base URI
     */
    function setBaseURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
        emit BaseURIUpdated(_baseTokenURI);
    }

    /**
     * @dev Update contract metadata URI (only owner)
     * @param _contractURI New contract URI
     */
    function setContractURI(string memory _contractURI) external onlyOwner {
        contractURI = _contractURI;
        emit ContractURIUpdated(_contractURI);
    }

    /**
     * @dev Get basic collection info
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
     * @dev Get all token IDs owned by an address
     * @param owner Address to check
     * @return tokenIds Array of token IDs owned by the address
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory tokenIds) {
        uint256 tokenCount = balanceOf(owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        }
        
        tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_ownerOf(i) != address(0) && ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
                if (currentIndex == tokenCount) break;
            }
        }
    }

    /**
     * @dev Check if a token exists
     * @param tokenId Token ID to check
     * @return True if token exists
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Override tokenURI to support base URI - FIXED VERSION
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenNotExists();
        }

        // Get the specific token URI first
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
     * @dev Override _baseURI
     */
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    /**
     * @dev Get the base URI (public getter)
     */
    function getBaseURI() external view returns (string memory) {
        return baseTokenURI;
    }

    /**
     * @dev Override supportsInterface
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }

    // Note: _burn is handled automatically by ERC721URIStorage
    // No need to override since ERC721URIStorage already handles URI cleanup
}