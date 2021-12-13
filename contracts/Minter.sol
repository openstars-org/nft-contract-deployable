// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./OpenStars.sol";

contract OpenStarsMinter is Ownable {
    using SafeMath for uint256;
    OpenStars public nftContract;
    uint256 public starPrice;
    uint256 public minId;
    uint256 public maxId;
    uint256 public mintingLimit;


    constructor(address OSNFT_, uint256 starPrice_, uint256 minId_, uint256 maxId_, uint256 mintingLimit_) {
        setStarPrice(starPrice_);
        nftContract = OpenStars(OSNFT_);
        minId = minId_;
        maxId =  maxId_;
        mintingLimit = mintingLimit_;
    }

    function mintStars(uint256[] memory starIds) external payable {
        uint256 amount = starIds.length;
        require(amount > 0 && amount <= mintingLimit, "minting amout out of range");
        uint256 toPay = starPrice.mul(amount);
        require(toPay <= msg.value, "not enough ETH sent");
        for (uint i=0; i < amount; i++) {
            require(starIds[i] >= minId && starIds[i] <= maxId, "id out of range");
            nftContract.safeMint(msg.sender, starIds[i]);
        }
    }

    // onlyOwner methods.
    function setOSNFTAddress(address OSNFT_) public onlyOwner {
        nftContract = OpenStars(OSNFT_);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function setStarPrice(uint256 starPrice_) public onlyOwner {
        require(starPrice_ > 0, "The new price cannot be 0");
        starPrice = starPrice_;
    }

    function setRange(uint256 minId_, uint256 maxId_) public onlyOwner {  
        minId = minId_;
        maxId =  maxId_;
    }

    function setMintingLimit(uint256 mintingLimit_) public onlyOwner {  
        mintingLimit = mintingLimit_;
    }
}