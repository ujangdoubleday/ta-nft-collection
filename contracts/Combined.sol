// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

// Counters library implementation
library Counters {
    struct Counter {
        uint256 _value; // default: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value = value - 1;
        }
    }

    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}

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

/**
 * @title NFTFactory
 * @dev Factory contract to create new NFT collections
 */
contract NFTFactory {
  /**
   * @dev Event emitted when a new collection is created
   * @param collectionAddress Address of the new collection contract
   * @param name Name of the collection
   * @param symbol Token symbol
   * @param owner Owner of the collection
   */
  event CollectionCreated(
    address collectionAddress,
    string name,
    string symbol,
    address owner
  );

  /**
   * @dev Create a new NFT collection
   * @param name Name of the collection
   * @param symbol Token symbol
   * @param collectionURI URI for collection metadata
   * @return Address of the new collection contract
   */
  function createCollection(
    string memory name,
    string memory symbol,
    string memory collectionURI
  ) public returns (address) {
    // Create a new NFT collection contract
    NFTCollection newCollection = new NFTCollection(
      name,
      symbol,
      msg.sender,
      collectionURI
    );

    // Emit an event with the collection info
    emit CollectionCreated(
      address(newCollection),
      name,
      symbol,
      msg.sender
    );

    // Return the address of the newly created collection
    return address(newCollection);
  }
}
