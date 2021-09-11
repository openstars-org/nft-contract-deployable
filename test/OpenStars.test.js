// test/OpenStars.test.js

const { ethers, upgrades } = require('hardhat');
const { expect } = require("chai");
const test_constants = require("./constants/index.js");
const _0x_addr = "0x0000000000000000000000000000000000000000";

describe('OpenStars', function () {
  let deployer, user0, opensea, premintedAddress = null;
  let OpenStars, OpenStarsFactory = null;

  before( async function() {
    [ deployer, user0, opensea, premintedAddress ] = await ethers.getSigners();
    OpenStarsFactory = await ethers.getContractFactory('OpenStars');
    OpenStars = await upgrades.deployProxy(OpenStarsFactory, [premintedAddress.address], { kind: 'uups' });
  });

  it('deploys and initilizes correctly', async function () {
    describe("Initialized values are correct", async () => {
      it("should have correct owner", async () => {
        expect(await OpenStars.owner()).to.equal(premintedAddress.address);
      });      
      it("should have correct name", async () => {
        expect(await OpenStars.name()).to.equal("OpenStars");
      });
      it("should have correct symbol", async () => {
        expect(await OpenStars.symbol()).to.equal("💫");
      });
      it("should have correct uri for token0", async () => {
        expect(await OpenStars.tokenURI(0)).to.deep.equal(test_constants.token0_uri);
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
    describe("Preminted address is equal to the the  premintedAddress", async () => {
      it("preminted should be correct", async () => {
        expect(await OpenStars.premintedAddress()).to.equal(premintedAddress.address);
      });
    });
  });

  it('Only account with minter role can premint', async () => {
    describe("Account without minter role fails to premint", async () => {
      it("user0 should fail to premint", async () => {
        await expect(OpenStars.connect(user0).premint(_0x_addr, user0.address, 0, 999))
          .to.be.revertedWith(`AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`);
      });
    });    
    describe("Account without minter role fails to premint", async () => {
      it("premintedAddress should fail to premint", async () => {
        await expect(OpenStars.connect(premintedAddress).premint(_0x_addr, premintedAddress.address, 0, 999))
          .to.be.revertedWith(`AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`);
      });
    });
    describe("Deployer should succeed to premint 0-999 tokens", async () => {
      it("deployer should success to premint", async () => {
        await expect(OpenStars.connect(deployer).premint(_0x_addr, premintedAddress.address, 0, 999))
          .to.emit(OpenStars, 'ConsecutiveTransfer')
          .withArgs(0, 999, _0x_addr, premintedAddress.address);
      });
    });
  });

  it("approves and transfers correctly", async () => {
    describe("premintedAddress approves opensea to transfer nfts", async () => {
      it("premintedAddress approves all tokens to opensea", async () => {
        await expect(OpenStars.connect(premintedAddress).setApprovalForAll(opensea.address, true))
          .to.emit(OpenStars, "ApprovalForAll")
          .withArgs(premintedAddress.address, opensea.address, true);
      })
    });
    describe("Opensea transfers token70 to user0", async () => {
      it("opensea should transfer token70 to user0", async () => {
        let safeTransferFrom = OpenStars.connect(opensea)['safeTransferFrom(address,address,uint256)'];
        await expect(safeTransferFrom(premintedAddress.address, user0.address, 70))
          .to.emit(OpenStars, "Transfer")
          .withArgs(premintedAddress.address, user0.address, 70);
      });      
      it("user0 should own token70", async () => {
        expect(await OpenStars.tokenOfOwnerByIndex(user0.address, 0)).to.be.equal(70);
        expect(await OpenStars.ownerOf(70)).to.be.equal(user0.address);
      });
    });
  });

  it('mints and only deployer can mint');
  it('transfers and only deployer can transfer');

  it('upgrade proxy', function() {
    // upgrade here
    // and then repeat tests
    describe('after upgrade...', function() {
      it('is owned by deployer');
      it('ownership of previously minted tokens persists');

      // and finally repeat previous tests
      it('premints and only deployer can premint');
      it('mints and only deployer can mint');
      it('transfers and only deployer can transfer');
    });
  })
});
