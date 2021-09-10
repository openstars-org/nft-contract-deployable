// test/OpenStars.test.js

const { ethers, upgrades } = require('hardhat');

describe('OpenStars', function () {
  it('deploys and initilizes correctly', async function () {
    const OpenStars = await ethers.getContractFactory('OpenStars');
    await upgrades.deployProxy(OpenStars, { kind: 'uups' });

    // TODO: check basic stuff
    // assert(OpenStars.name == "OpenStars");
  });

  // TODO: test funcionality
  it('premints and only deployer can premint');
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
