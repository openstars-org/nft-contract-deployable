// npx hardhat test --network hardhat

const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const testConstants = require("./constants/index.js");
const deploy = require("../scripts/deploy.helpers");

context("OpenStars", () => {
  let deployer, user0, opensea, preminted;
  let OpenStars, OpenStarsFactory;

  before(async () => {
    [ deployer, user0, opensea, preminted ] = await ethers.getSigners();
  });

  describe("Contract and proxy deployment", async () => {
    it('loads contract factory using hardhat', async () => { // only for testing
      OpenStarsFactory = await ethers.getContractFactory("OpenStars");
    });
    it('deploys contract and proxy using openzeppelin upgrades', async () => { // only for testing
      await upgrades.deployProxy(OpenStarsFactory, [preminted.address], { kind: "uups" });
    });
    it("deploys smart contract using deployer", async () => { // we use this as it's more atomic
      const implementationAddress = await deploy.implementationContract(true);
      const proxyContractAddress = await deploy.proxyContract(implementationAddress, true);
      OpenStars = await deploy.initialize(proxyContractAddress, preminted.address, true);
    })
  });

  describe("Initialized values are correct", async () => {
    it("should have correct owner", async () => {
      expect(await OpenStars.owner()).to.equal(preminted.address);
    });      
    it("should have correct name", async () => {
      expect(await OpenStars.name()).to.equal("OpenStars");
    });
    it("should have correct symbol", async () => {
      expect(await OpenStars.symbol()).to.equal("✨");
    });
    it("should have correct uri for token0", async () => {
      expect(await OpenStars.tokenURI(0)).to.deep.equal(testConstants.token0URI);
    });
  });

  describe("Deployer roles are correct", async () => {
    it("deployer should have admin role", async () => {
      expect(await OpenStars.hasRole("0x0000000000000000000000000000000000000000000000000000000000000000", deployer.address)).to.equal(true);
    });
    it("deployer should have pauser role", async () => {
      expect(await OpenStars.hasRole("0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a", deployer.address)).to.equal(true);
    });
    it("deployer should have minter role", async () => {
      expect(await OpenStars.hasRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", deployer.address)).to.equal(true);     
    });
    it("deployer should have upgrader role", async () => {
      expect(await OpenStars.hasRole("0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3", deployer.address)).to.equal(true); 
    });
  });
  describe("Preminted address is equal to the the preminted address", async () => {
    it("preminted should be correct", async () => {
      expect(await OpenStars.premintedAddress()).to.equal(preminted.address);
    });
  });

  describe("Only account with minter role can premint", async () => {
    describe("Account without minter role fails to premint", async () => {
      it("user0 should fail to premint", async () => {
        await expect(OpenStars.connect(user0).premint(user0.address, 0, 999))
          .to.be.revertedWith(`AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`);
      });
    });    
    describe("Account without minter role fails to premint", async () => {
      it("preminted address should fail to premint", async () => {
        await expect(OpenStars.connect(preminted).premint(preminted.address, 0, 999))
          .to.be.revertedWith(`AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`);
      });
    });
    describe("Deployer should succeed to premint 0-999 tokens", async () => {
      it("deployer should success to premint", async () => {
        await expect(OpenStars.connect(deployer).premint(preminted.address, 0, 999))
          .to.emit(OpenStars, "ConsecutiveTransfer")
          .withArgs(0, 999, testConstants.zeroAddress, preminted.address);
      });
    });
  });

  describe("Approves and transfers correctly", async () => {
    let safeTransferSignature, openSeaSafeTransfer, premintedSafeTransfer, deployerSafeTransfer, user0SafeTransfer;

    before(async () => {
      safeTransferSignature = testConstants.safeTransferFromABI;
      openSeaSafeTransfer = OpenStars.connect(opensea)[safeTransferSignature];
      premintedSafeTransfer = OpenStars.connect(preminted)[safeTransferSignature];
      deployerSafeTransfer = OpenStars.connect(deployer)[safeTransferSignature];
      user0SafeTransfer = OpenStars.connect(user0)[safeTransferSignature];
    });

    describe("OpenSea transfers", async () => {
      it("preminted address approves all tokens to opensea", async () => {
        await expect(OpenStars.connect(preminted).setApprovalForAll(opensea.address, true))
          .to.emit(OpenStars, "ApprovalForAll")
          .withArgs(preminted.address, opensea.address, true);
      });
      it("opensea should transfer token70 to user0", async () => {
        await expect(openSeaSafeTransfer(preminted.address, user0.address, 70))
          .to.emit(OpenStars, "Transfer")
          .withArgs(preminted.address, user0.address, 70);
      });      
      it("user0 should own token70", async () => {
        expect(await OpenStars.tokenOfOwnerByIndex(user0.address, 0)).to.be.equal(70);
        expect(await OpenStars.ownerOf(70)).to.be.equal(user0.address);
      });
    });
    describe("Preminted address cannot receive tokens", async () => { // as it cannot emit Transfer event out
      it("preminted address cannot send token101 to itself", async () => { // self test
        await expect(premintedSafeTransfer(preminted.address, preminted.address, 101))
          .to.be.revertedWith('OpenStars: transfer to the preminted address');
      });
      it("opensea address cannot send token102 to preminted address", async () => { // approved test
        await expect(openSeaSafeTransfer(preminted.address, preminted.address, 102))
          .to.be.revertedWith('OpenStars: transfer to the preminted address');
      });
      it("deployer address cannot send token103 to preminted address", async () => { // minter role test
        // here we mint instead of transfering from opensea, to test safeMint
        await expect(OpenStars.safeMint(deployer.address, 103))
          .to.emit(OpenStars, "Transfer")
          .withArgs(testConstants.zeroAddress, deployer.address, 103);
        await expect(deployerSafeTransfer(deployer.address, preminted.address, 103))
          .to.be.revertedWith('OpenStars: transfer to the preminted address');
      });
      it("user0 address cannot send token104 to preminted address", async () => { // outsider test
        // here we transfer from opensea, to simulate a token purchase
        await openSeaSafeTransfer(preminted.address, user0.address, 104);
        await expect(user0SafeTransfer(user0.address, preminted.address, 104))
          .to.be.revertedWith('OpenStars: transfer to the preminted address');
      });
    });
    describe("Non-existent tokens", async () => {
      it("preminted address can send non-existent token105 to user0", async () => {
        await expect(premintedSafeTransfer(preminted.address, user0.address, 105))
          .to.emit(OpenStars, "Transfer")
          .withArgs(preminted.address, user0.address, 105);
      });
      it("deployer address cannot send non-existent tokens", async () => {
        await expect(deployerSafeTransfer(preminted.address, user0.address, 106))
          .to.be.revertedWith('ERC721: transfer caller is not owner nor approved');
      });
    });
  });

  describe("Proxy upgrade and state persists correctly", async () => {
    let OpenStarsV2, OpenStarsV2Factory;

    describe("Proxy upgrade", async () => {
      it("loads contract factory", async () => {
        OpenStarsV2Factory = await ethers.getContractFactory("OpenStarsUpgradeTest");
      });
      it("upgrades implementation correctly", async () => {
        OpenStarsV2 = await upgrades.upgradeProxy(OpenStars.address, OpenStarsV2Factory);
        await expect(OpenStarsV2.upgrade());
      });
    });
    describe("State checks", async () => {
      it("runs new method and values", async () => {
        expect(await OpenStarsV2.test()).to.equal("hello world");
      });
      it("is still owned by preminted address", async () => {
        expect(await OpenStarsV2.owner()).to.equal(preminted.address);
      });
      it("ownership of previously minted tokens persists", async () => {
        expect(await OpenStarsV2.ownerOf(70)).to.be.equal(user0.address);
        expect(await OpenStarsV2.ownerOf(105)).to.be.equal(user0.address);
      });
      // note that upgrade method changes preminted address to zero
      it("still mints", async () => {
        await expect(OpenStarsV2.safeMint(user0.address, 999))
          .to.emit(OpenStarsV2, "Transfer")
          .withArgs(testConstants.zeroAddress, user0.address, 999); // now from zero addres, not preminted
        expect(await OpenStarsV2.ownerOf(999)).to.be.equal(user0.address);
      });
    });
  })
});
