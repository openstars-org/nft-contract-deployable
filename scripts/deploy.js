// npx hardhat run scripts/deploy.js

const zeroAddress = "0x0000000000000000000000000000000000000000";
const premintedAddress = "0xdb93C1AAee36C00F2b220b4e11718b3710d34806";
const contractName = 'OpenStars';
console.log('start first upgradable deploy of', contractName);

async function main() {
  const deployerAddress = (await ethers.getSigner()).address;
  console.log('using deployer account', deployerAddress);

  console.log('loading contract', contractName);
  const nftContract = await ethers.getContractFactory(contractName);

  console.log('broadcasting contract tx');
  const proxyTx = await upgrades.deployProxy(nftContract, [premintedAddress], { kind: 'uups'});

  console.log("contract broadcasted:", proxyTx.deployTransaction.hash);
  await proxyTx.deployed();

  console.log("contract deployed at", proxyTx.address);
  console.log("premint assets from 0 to 999");
  const premintTx = await proxyTx.premint(zeroAddress, premintedAddress, 0, 999);
  console.log("premint assets at", premintTx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
