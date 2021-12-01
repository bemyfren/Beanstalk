const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const { expect } = require('chai');
const { deploy } = require('../scripts/deploy.js')
const { BigNumber } = require('bignumber.js')
const { print } = require('./utils/print.js')

let user,user2,owner;
let userAddress, ownerAddress, user2Address;

describe('Marketplace', function () {
  before(async function () {
    [owner,user,user2] = await ethers.getSigners();
    userAddress = user.address;
    user2Address = user2.address;
    const contracts = await deploy("Test", false, true);
    ownerAddress = contracts.account;
    this.diamond = contracts.beanstalkDiamond
    this.field = await ethers.getContractAt('MockFieldFacet', this.diamond.address);
    this.season = await ethers.getContractAt('MockSeasonFacet', this.diamond.address);
    this.marketplace = await ethers.getContractAt('MarketplaceFacet', this.diamond.address);
    this.bean = await ethers.getContractAt('MockToken', contracts.bean);

    await this.bean.mint(userAddress, '1000000000')
    await this.bean.mint(user2Address, '1000000000')
    await this.bean.connect(user).approve(this.field.address, '100000000000')
    await this.bean.connect(user2).approve(this.field.address, '100000000000')
  });

  beforeEach (async function () {
    await this.season.resetAccount(userAddress)
    await this.season.resetAccount(user2Address)
    await this.season.resetAccount(ownerAddress)
    await this.season.resetState()
    await this.season.siloSunrise(0)
  });

  describe("List Plot", async function () {
    beforeEach (async function () {
      await this.field.incrementTotalSoilEE('10000');
      await this.field.connect(user).sowBeans('1000');
      await this.field.connect(user2).sowBeans('1000');
      await this.field.connect(user).sowBeans('1000');
      await this.field.connect(user).sowBeans('1500');
      await this.field.connect(user2).sowBeans('750');

      this.result = await this.marketplace.connect(user).list('0','1000',true,'1','1000');
    });

    it('Emits a List event', async function () {
      expect(this.result).to.emit(this.marketplace, 'CreateListing').withArgs(userAddress, '0', 1000, true, 1, 1000);
    });

    it('Lists the product', async function () {
      const listing = await this.marketplace.listing(0);
      expect(listing.price).to.equal(1);
      expect(listing.amount).to.equal(1000);
      expect(listing.expiry).to.equal(1000);
      expect(listing.inEth).to.equal(true);
    });

    it('Does not list since does not own the plot', async function () {
      await expect(this.marketplace.connect(user2).list('0','1000',true,'1','2000')).to.be.revertedWith("Field: Plot not owned by user.");
    });

    it('Does not list since wants to list zero pods', async function () {
      await expect(this.marketplace.connect(user2).list('1000','0',true,'1','2000')).to.be.revertedWith("Marketplace: Must list atleast one pod from the plot.");
    });

    it('Does not list since wants to list more pods than in the plot', async function () {
      await expect(this.marketplace.connect(user2).list('1000','2000',true,'1','2000')).to.be.revertedWith("Marketplace: Cannot list more pods than in the plot.");
    });

    it('Does not list since the price of listing is 0', async function () {
      await expect(this.marketplace.connect(user2).list('1000','1000', true,'0','2000')).to.be.revertedWith("Marketplace: Cannot list for a value of 0.");
    })

    it('Does not list since expiration too short', async function () {
      await expect(this.marketplace.connect(user2).list('1000','1000',true,'1','0')).to.be.revertedWith("Marketplace: Expiration too short.");
    })

    it('Does not list since expiration too long', async function() {
      await expect(this.marketplace.connect(user2).list('1000','1000', true,'1','4000')).to.be.revertedWith("Marketplace: Expiration too long.");
    });

    it('Emits a second List event', async function () {
      await expect(this.marketplace.connect(user2).list('1000','1000', true,'1','2000')).to.emit(this.marketplace, 'CreateListing').withArgs(user2Address, '1000','1000', true, 1, '2000');
    });

    it('Lists a product from a second wallet', async function () {
      const listing = await this.marketplace.listing(1000);
      expect(listing.price).to.equal(1);
      expect(listing.amount).to.equal(1000);
      expect(listing.expiry).to.equal(2000);
      expect(listing.inEth).to.equal(true);
    });

    it('Lists a product for longer time', async function () {
      await expect(this.marketplace.connect(user).list('3000','750',true,'1','3250')).to.emit(this.marketplace, 'CreateListing').withArgs(userAddress,'2000','750',true,1,'3250');
    })

    it('Emits List event for half a plot', async function() {
      await expect(this.marketplace.connect(user).list('2000','500',true,'1','3000')).to.emit(this.marketplace, 'CreateListing').withArgs(userAddress,'2000','500',true,1,'3000');
    })

    it('Lists the half plot', async function() {
      const listing = await this.marketplace.listing(2000);
      expect(listing.price).to.equal(1);
      expect(listing.amount).to.equal(500);
      expect(listing.expiry).to.equal(3000);
      expect(listing.inEth).to.equal(true);
    })
  });

});
