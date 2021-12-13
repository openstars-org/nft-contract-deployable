const { getProxyFactory } = require('@openzeppelin/hardhat-upgrades/dist/utils/factories');

const nftContractName = "OpenStars";
const minterContractName = "OpenStarsMinter";

function _log(silent, ...args) {
    if(!silent) console.log.apply(console, args);
}

exports.implementationContract = async (silent = false) => {
    _log(silent, 'loading contract', nftContractName);
    const nftContract = await ethers.getContractFactory(nftContractName);
    
    _log(silent, 'deploying implementation contract');
    let nftContractTx = await nftContract.deploy();
    _log(silent, "contract broadcasted:", nftContractTx.deployTransaction.hash);
    await nftContractTx.deployed();
    _log(silent, 'implementation deployed at', nftContractTx.address)
    return nftContractTx.address;
}

exports.proxyContract = async (nftContractAddress, silent = false) => {
    const nftContract = await ethers.getContractFactory(nftContractName);
    
    _log(silent, 'deploying proxy contract using implementation at', nftContractAddress);
    const proxyContract = await getProxyFactory(hre, nftContract.signer);
    const proxyContractTx = await proxyContract.deploy(nftContractAddress, []);
    _log(silent, "contract broadcasted:", proxyContractTx.deployTransaction.hash);
    await proxyContractTx.deployed();
    
    _log(silent, 'proxy deployed at', proxyContractTx.address);
    
    return proxyContractTx.address;
}

exports.initialize = async (proxyAddress, premintedAddress, silent = false) => {
    const nftContract = await ethers.getContractFactory(nftContractName);
    const proxyContract = await nftContract.attach(proxyAddress);
    
    _log(silent, "initialize contract using proxy");
    const initializeTx = await proxyContract.initialize(premintedAddress);
    await initializeTx.wait();
    _log(silent, "contract initialized at", initializeTx.hash);
    return proxyContract;
}

exports.premint = async (proxyAddress, premintedAddress, silent = false) => {
    const nftContract = await ethers.getContractFactory(nftContractName);
    const proxyContract = await nftContract.attach(proxyAddress);
    
    _log(silent, "premint assets from 0 to 999 for", premintedAddress);
    const premintTx = await proxyContract.premint(premintedAddress, 0, 999);
    await premintTx.wait();
    _log(silent, "premint assets at", premintTx.hash);
    return proxyContract;
}

exports.minter = async (proxyAddress, starPrice, minId, maxId, silent = false) => {
    _log(silent, 'loading contract', nftContractName);
    const minterContract = await ethers.getContractFactory(minterContractName);
    
    _log(silent, 'deploying implementation contract');
    let minterContractTx = await minterContract.deploy(proxyAddress, starPrice, minId, maxId);
    _log(silent, "contract broadcasted:", minterContractTx.deployTransaction.hash);
    await minterContractTx.deployed();
    _log(silent, 'implementation deployed at', minterContractTx.address)
    return minterContractTx.address;
}