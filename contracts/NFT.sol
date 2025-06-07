// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    // Custom events for MetaMask Activity
    event TokenCreated(
        address indexed creator,
        uint256 indexed tokenId,
        string tokenURI,
        string activityType
    );

    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string message
    );

    constructor(address marketplaceAddress) ERC721("Metaverse", "MTVS") {
        contractAddress = marketplaceAddress;
    }

    function createToken(string memory tokenURI) public returns (uint) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);

        // Emit custom events for better MetaMask Activity display
        emit TokenCreated(msg.sender, newItemId, tokenURI, "Create Token");
        emit NFTMinted(msg.sender, newItemId, "NFT Created Successfully");

        return newItemId;
    }
    
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }
} 