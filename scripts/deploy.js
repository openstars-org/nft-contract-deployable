// npx hardhat run scripts/deploy.js

const contractName = 'OpenStars';
console.log('start first upgradable deploy of', contractName);

async function main() {
  console.log('using account', (await ethers.getSigner()).address);
  console.log('loading contract');
  const nftContract = await ethers.getContractFactory(contractName);
  console.log('broadcasting contract tx');
  const proxyTx = await upgrades.deployProxy(nftContract, { kind: 'uups' });
  console.log("contract broadcasted:", proxyTx.deployTransaction.hash);
  await proxyTx.deployed();
  console.log("contract deployed at", proxyTx.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
