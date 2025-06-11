// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './utils/Counters.sol';

/**
 * @title NFTCollection
 * @dev ERC721 token collection with URI storage and ownership
 */
contract NFTCollection is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // Collection metadata
  string public collectionURI;

  /**
   * @dev Constructor for creating a new NFT collection
   * @param name Name of the collection
   * @param symbol Token symbol
   * @param initialOwner Address of the initial owner
   * @param _collectionURI URI for collection metadata
   */
  constructor(
    string memory name,
    string memory symbol,
    address initialOwner,
    string memory _collectionURI
  ) ERC721(name, symbol) Ownable(initialOwner) {
    collectionURI = _collectionURI;
  }

  /**
   * @dev Mint a new NFT to a recipient
   * @param recipient Address to receive the NFT
   * @param tokenURI Metadata URI for the token
   * @return ID of the minted token
   */
  function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();

    _mint(recipient, newItemId);
    _setTokenURI(newItemId, tokenURI);

    return newItemId;
  }

  /**
   * @dev Update the collection's metadata URI
   * @param _collectionURI New URI for collection metadata
   */
  function setCollectionURI(string memory _collectionURI) public onlyOwner {
    collectionURI = _collectionURI;
  }
}
