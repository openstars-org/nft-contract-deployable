//  npx hardhat test

require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "frame",
    networks: {
        frame: { // requires https://github.com/floating/frame
            url: "http://localhost:1248",
            timeout: 30000,
            httpHeaders: {
                origin: 'OpenStars-Hardhat'
            },
                
        },
    },
    solidity: {
        version: "0.8.7",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    mocha: {
        timeout: 30000,
    }
};
