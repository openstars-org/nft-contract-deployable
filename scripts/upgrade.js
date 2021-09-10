// npx hardhat run scripts/upgrade.js

const oldAddress = '0x134fd8f6BeB5A1F1176EAD58584e3aD5F9564bfE';
const newContractName = 'OpenStarsV2';

console.log('start upgrade for', oldAddress);

async function main() {
  console.log('loading new contract');
  const newContract = await ethers.getContractFactory(newContractName);
  console.log('broadcasting new contract tx');
  upgradeTx = await upgrades.upgradeProxy(oldAddress, newContract);
  console.log('new contract upgraded', upgradeTx);
  await proxyTx.deployed();
  console.log("contract deployed at", upgradeTx.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
