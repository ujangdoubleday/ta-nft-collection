// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NFTFactory
 * @dev Enhanced factory contract to create new NFT collections with fee system and blocklist functionality
 * @author https://github.com/ujangbedog
 * @notice This contract allows users to create NFT collections with customizable parameters
 */

import "./NFTCollection.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract NFTFactory is Ownable, ReentrancyGuard, Pausable {
    
    // Struct to store collection information
    struct CollectionInfo {
        address collectionAddress;
        string contractURI;
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 createdAt;
    }
    
    // State variables
    uint256 public creationFee;
    uint256 public totalCollections;
    uint256 public totalFeesCollected;
    address[] public allCollections;
    mapping(address => bool) public isValidCollection;
    
    // Mapping to store collection information
    mapping(address => CollectionInfo) public collectionInfo;
    mapping(address => CollectionInfo[]) public creatorToCollectionInfo;
    
    // Blocklist functionality
    mapping(address => bool) private _blocklist;
    address[] private _blocklistAddresses;
    
    // Events
    event CollectionCreated(
        address indexed collectionAddress,
        string name,
        string symbol,
        address indexed creator,
        uint256 totalSupply,
        uint256 indexed collectionId,
        uint256 feesPaid
    );
    
    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event FeePaymentReceived(address indexed from, uint256 amount);
    event AddressBlocked(address indexed blockedAddress);
    event AddressUnblocked(address indexed unblockedAddress);
    
    // Custom errors
    error InsufficientPayment();
    error InvalidParameters();
    error CollectionNotFound();
    error WithdrawalFailed();
    error ZeroAddress();
    error AddressIsBlocked();
    error AddressNotBlocked();
    error AddressAlreadyBlocked();
    
    // Modifier to check if address is not blocked
    modifier notBlocked(address account) {
        if (_blocklist[account]) {
            revert AddressIsBlocked();
        }
        _;
    }

    /**
     * @dev Constructor to initialize the factory
     * @param initialOwner Address of the initial owner (factory owner)
     * @param _creationFee Fee required to create a collection (in wei)
     */
    constructor(address initialOwner, uint256 _creationFee) Ownable(initialOwner) {
        if (initialOwner == address(0)) {
            revert ZeroAddress();
        }
        creationFee = _creationFee;
    }

    /**
     * @dev Create a new NFT collection
     * @param name Name of the collection
     * @param symbol Token symbol (3-5 characters recommended)
     * @param contractURI URI for collection metadata
     * @param totalSupply Maximum total supply of the collection (must be > 0)
     * @return collectionAddress Address of the new collection contract
     */
    function createCollection(
        string memory name,
        string memory symbol,
        string memory contractURI,
        uint256 totalSupply
    ) external payable nonReentrant whenNotPaused notBlocked(msg.sender) returns (address collectionAddress) {
        // Validate input parameters
        if (bytes(name).length == 0 || bytes(symbol).length == 0 || totalSupply == 0) {
            revert InvalidParameters();
        }
        
        // Check if payment is sufficient
        if (msg.value < creationFee) {
            revert InsufficientPayment();
        }
        
        // Create new collection contract
        NFTCollection newCollection = new NFTCollection(
            name,
            symbol,
            msg.sender,      // creator becomes owner
            contractURI,
            totalSupply
        );
        
        collectionAddress = address(newCollection);
        
        // Create collection info struct
        CollectionInfo memory newCollectionInfo = CollectionInfo({
            collectionAddress: collectionAddress,
            contractURI: contractURI,
            name: name,
            symbol: symbol,
            totalSupply: totalSupply,
            createdAt: block.timestamp
        });
        
        // Update state variables
        totalCollections++;
        totalFeesCollected += creationFee;
        allCollections.push(collectionAddress);
        isValidCollection[collectionAddress] = true;
        
        // Store collection information
        collectionInfo[collectionAddress] = newCollectionInfo;
        creatorToCollectionInfo[msg.sender].push(newCollectionInfo);
        
        // Emit events
        emit FeePaymentReceived(msg.sender, creationFee);
        emit CollectionCreated(
            collectionAddress,
            name,
            symbol,
            msg.sender,
            totalSupply,
            totalCollections,
            creationFee
        );
        
        // Refund excess payment if any
        if (msg.value > creationFee) {
            uint256 refundAmount = msg.value - creationFee;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund failed");
        }
    }
    
    // ========== BLOCKLIST FUNCTIONS ==========
    
    /**
     * @dev Add an address to the blocklist (only owner)
     * @param account Address to block from creating collections
     */
    function addToBlocklist(address account) external onlyOwner {
        if (account == address(0)) {
            revert ZeroAddress();
        }
        if (_blocklist[account]) {
            revert AddressAlreadyBlocked();
        }
        
        _blocklist[account] = true;
        _blocklistAddresses.push(account);
        
        emit AddressBlocked(account);
    }
    
    /**
     * @dev Remove an address from the blocklist (only owner)
     * @param account Address to unblock
     */
    function removeFromBlocklist(address account) external onlyOwner {
        if (!_blocklist[account]) {
            revert AddressNotBlocked();
        }
        
        _blocklist[account] = false;
        
        // Remove from blocklist array
        for (uint256 i = 0; i < _blocklistAddresses.length; i++) {
            if (_blocklistAddresses[i] == account) {
                _blocklistAddresses[i] = _blocklistAddresses[_blocklistAddresses.length - 1];
                _blocklistAddresses.pop();
                break;
            }
        }
        
        emit AddressUnblocked(account);
    }
    
    /**
     * @dev Batch add multiple addresses to blocklist (only owner)
     * @param accounts Array of addresses to block
     */
    function batchAddToBlocklist(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            if (account != address(0) && !_blocklist[account]) {
                _blocklist[account] = true;
                _blocklistAddresses.push(account);
                emit AddressBlocked(account);
            }
        }
    }
    
    /**
     * @dev Batch remove multiple addresses from blocklist (only owner)
     * @param accounts Array of addresses to unblock
     */
    function batchRemoveFromBlocklist(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            if (_blocklist[account]) {
                _blocklist[account] = false;
                
                // Remove from blocklist array
                for (uint256 j = 0; j < _blocklistAddresses.length; j++) {
                    if (_blocklistAddresses[j] == account) {
                        _blocklistAddresses[j] = _blocklistAddresses[_blocklistAddresses.length - 1];
                        _blocklistAddresses.pop();
                        break;
                    }
                }
                
                emit AddressUnblocked(account);
            }
        }
    }
    
    /**
     * @dev Check if an address is blocked
     * @param account Address to check
     * @return True if address is blocked, false otherwise
     */
    function isBlocked(address account) external view returns (bool) {
        return _blocklist[account];
    }
    
    /**
     * @dev Get all blocked addresses
     * @return Array of all blocked addresses
     */
    function getBlocklist() external view returns (address[] memory) {
        return _blocklistAddresses;
    }
    
    /**
     * @dev Get total number of blocked addresses
     * @return Total count of blocked addresses
     */
    function getBlocklistCount() external view returns (uint256) {
        return _blocklistAddresses.length;
    }
    
    /**
     * @dev Get blocked addresses with pagination
     * @param offset Starting index for pagination
     * @param limit Maximum number of addresses to return
     * @return addresses Array of blocked addresses
     * @return total Total number of blocked addresses
     */
    function getBlocklistPaginated(uint256 offset, uint256 limit) 
        external 
        view 
        returns (address[] memory addresses, uint256 total) 
    {
        total = _blocklistAddresses.length;
        
        if (offset >= total) {
            return (new address[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        addresses = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            addresses[i - offset] = _blocklistAddresses[i];
        }
    }
    
    // ========== COLLECTION QUERY FUNCTIONS ==========
    
    /**
     * @dev Get all collection addresses created by this factory
     * @return Array of all collection addresses
     */
    function getAllCollections() external view returns (address[] memory) {
        return allCollections;
    }
    
    /**
     * @dev Get detailed collection information by creator address
     * @param creator Address of the collection creator
     * @return Array of CollectionInfo structs created by the address
     */
    function getCollectionInfoByCreator(address creator) external view returns (CollectionInfo[] memory) {
        return creatorToCollectionInfo[creator];
    }
    
    /**
     * @dev Get single collection information by collection address
     * @param collectionAddress Address of the collection contract
     * @return CollectionInfo struct containing collection details
     */
    function getCollectionInfo(address collectionAddress) external view returns (CollectionInfo memory) {
        if (!isValidCollection[collectionAddress]) {
            revert CollectionNotFound();
        }
        return collectionInfo[collectionAddress];
    }
    
    /**
     * @dev Get comprehensive factory statistics
     * @return totalCollections Total number of collections created
     * @return totalFeesCollected Total fees collected by factory
     * @return currentCreationFee Current fee to create collection
     * @return contractBalance Current contract balance
     */
    function getFactoryStats() external view returns (
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        return (
            totalCollections,
            totalFeesCollected,
            creationFee,
            address(this).balance
        );
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Update the creation fee (only owner)
     * @param _newFee New creation fee in wei
     */
    function setCreationFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = creationFee;
        creationFee = _newFee;
        emit CreationFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Withdraw accumulated fees (only owner)
     * @param to Address to receive the fees
     * @param amount Amount to withdraw (0 = withdraw all available balance)
     */
    function withdrawFees(address payable to, uint256 amount) external onlyOwner {
        if (to == address(0)) {
            revert ZeroAddress();
        }
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "Insufficient balance");
        
        (bool success, ) = to.call{value: withdrawAmount}("");
        if (!success) {
            revert WithdrawalFailed();
        }
        
        emit FeesWithdrawn(to, withdrawAmount);
    }
    
    /**
     * @dev Emergency withdraw all funds (only owner)
     * @param to Address to receive all funds
     */
    function emergencyWithdraw(address payable to) external onlyOwner {
        if (to == address(0)) {
            revert ZeroAddress();
        }
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = to.call{value: balance}("");
        if (!success) {
            revert WithdrawalFailed();
        }
        
        emit FeesWithdrawn(to, balance);
    }
    
    /**
     * @dev Pause the contract to prevent new collection creation (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract to allow collection creation (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Check if an address is a valid collection created by this factory
     * @param collection Address to check
     * @return True if the address is a valid collection from this factory
     */
    function isCollectionValid(address collection) external view returns (bool) {
        return isValidCollection[collection];
    }
}