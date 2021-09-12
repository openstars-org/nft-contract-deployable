// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "./OpenStars.sol";

contract OpenStarsUpgradeTest is OpenStars {
    function upgrade() public onlyRole(UPGRADER_ROLE) {
        premintedAddress = address(0);
    }

    function test() public pure returns (string memory) {
        return "hello world";
    }
}
