// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NFTCollection.sol";

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