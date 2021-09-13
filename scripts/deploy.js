// npx hardhat run scripts/deploy.js
const deploy = require("./deploy.helpers");
const premintedAddress = "0x1337046a58E3a30aC040bC38333C6d9735540d44"; // @ Mainnet

main = async () => {
  const deployerAddress = (await ethers.getSigner()).address;
  console.log('using deployer account', deployerAddress);

  // 0xA6615D2b7F1E813aa297Ed5eBB4AE6986E90535c @ Mainnet
  const implementationAddress = await deploy.implementationContract();
  // 0xD389927d33AC5a4C437Ce27DdA0b1F17cb9eC8D9 @ Mainnet
  const proxyContractAddress = await deploy.proxyContract(implementationAddress); 
  await deploy.initialize(proxyContractAddress, premintedAddress);
  await deploy.premint(proxyContractAddress, premintedAddress);  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
