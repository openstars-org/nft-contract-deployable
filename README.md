# OpenStars.org NFT Contract

Mainnet OFFICIAL release @ `0xD389927d33AC5a4C437Ce27DdA0b1F17cb9eC8D9`

https://openstars.og/

Address List
---
`0xD389927d33AC5a4C437Ce27DdA0b1F17cb9eC8D9`  
*Proxy Deployment on Mainnet (NFT protocol address)*

`0xA6615D2b7F1E813aa297Ed5eBB4AE6986E90535c`  
*Implementation V1 Deployment on Mainnet (NFT logic address - NOT FOR USE)*

`0x1337046a58E3a30aC040bC38333C6d9735540d44`  
*Preminted DAO address on Mainnet (Used to list first sale on OpenSea)*

Deployer Script
---
This repository contains an automated deployer, it can be used by the community to deploy upgradable contracts in separate steps (openzeppelin/hardhat upgrades only allow to do this in one call).

Premintable Contract
---
We propose a new ERC721 standard that uses a novel mechanism to securely premint tokens to an address, and allow a marketplace like OpenSea to finalize the minting process when selling an NFT.

License
---
MIT - OpenStars.org, HardHat, OpenZeppelin