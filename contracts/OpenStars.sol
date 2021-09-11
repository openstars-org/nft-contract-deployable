// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "./ERC721PremintUpgradeable.sol";
import "./ERC721PremintEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract OpenStars is
    Initializable,
    ERC721PremintUpgradeable,
    ERC721PremintEnumerableUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable 
{
    string baseURI;
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    event ConsecutiveTransfer(uint256 indexed fromTokenId, uint256 toTokenId, address indexed fromAddress, address indexed toAddress);

    function initialize(address premintedAddress_) initializer public {
        __ERC721_init("OpenStars", unicode"✨");
        __ERC721Enumerable_init();
        __Pausable_init();
        __AccessControl_init();
        __Ownable_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(UPGRADER_ROLE, msg.sender);

        _setPremintedAddress(premintedAddress_);
        transferOwnership(premintedAddress_);

        baseURI = "https://raw.githubusercontent.com/openstars-org/stars-database/main/jsons/";
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory baseURI_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        baseURI = baseURI_;
    }
    
   function premint(address to, uint256 tokenIdFrom, uint256 tokenIdTo) public onlyRole(MINTER_ROLE) {
        emit ConsecutiveTransfer(tokenIdFrom, tokenIdTo, address(0), address(to));
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function safeMint(address to, uint256 tokenId) public onlyRole(MINTER_ROLE) {
        _safeMint(to, tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        // override
        override(ERC721PremintUpgradeable, ERC721PremintEnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        // override(ERC721PremintUpgradeable, AccessControlUpgradeable)
        override(ERC721PremintUpgradeable, ERC721PremintEnumerableUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}