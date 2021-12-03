/**
 * SPDX-License-Identifier: MIT
**/

pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@nomiclabs/buidler/console.sol";
import "../../AppStorage.sol";
import "../../../interfaces/IBean.sol";
import "../FieldFacet/FieldFacet.sol";

/**
 * @author bemyFREN
 * @title TODO
**/

contract MarketplaceFacet {

    AppStorage internal s;

    using SafeMath for uint256;

    event CreateListing(
      address indexed seller,
      uint indexed index,
      uint amount,
      bool inEth,
      uint price,
      uint expiry
    );

    event BuyListing(
      address indexed buyer,
      address indexed seller,
      uint index
    );

    function list(uint index, uint _amount, bool inEth, uint price, uint expiry) public {
        uint amount = s.a[msg.sender].field.plots[index];
        require(amount > 0, "Field: Plot not owned by user.");
        require(_amount > 0, "Marketplace: Must list atleast one pod from the plot.");
        require(amount >= _amount, "Marketplace: Cannot list more pods than in the plot.");
        require(price > 0, "Marketplace: Cannot list for a value of 0.");
        //if (s.listings[index].amount > amount-_amount) revert("Marketplace: Plot is already listed.");
        //require(s.listings[index].amount <= amount-_amount, "Marketplace: Plot already listed for sale.");

        // EXPIRY LOGIC
        // index - currentHarvestableIndex = place in queue.
        // expiry - index = place in queue listing is terminated.
        // => expiry - currentHarvestableIndex = 0 means expired.
        uint currentHarvestableIndex = s.f.harvestable;
        uint latestHarvestableIndex = s.f.pods;

        require(expiry >= index-currentHarvestableIndex, "Marketplace: Expiration too short.");
        require(expiry <= latestHarvestableIndex, "Marketplace: Expiration too long.");

        s.listings[index].expiry = expiry;
        s.listings[index].amount = _amount;
        s.listings[index].inEth = inEth;
        s.listings[index].price = price;

        emit CreateListing(msg.sender, index, _amount, inEth, price, expiry);
    }

    function listing (uint256 index) public view returns (Storage.Listing memory) {
       return s.listings[index];
    }

    function clearListings (uint256 index) public {
      delete s.listings[index];
    }

    function buyListing(uint index, address payable seller) public payable {
        Storage.Listing storage listing = s.listings[index];

        uint totalPods = s.a[seller].field.plots[index];
        uint currentHarvestableIndex = s.f.harvestable;

        require(msg.sender != address(0), "Marketplace: Transfer plot from 0 address.");
        require(seller != address(0), "Marketplace: Transfer plot to 0 address.");
        require(totalPods > 0, "Marketplace: Seller does not own this plot");
        require(currentHarvestableIndex <= listing.expiry, "Marketplace: Listing has expired");

        uint price = listing.price;

        if (listing.inEth) {
          require(msg.value >= price, "Marketplace: Value sent too low");
          (bool success, ) = seller.call{value: price}("");
          require(success, "WETH: ETH transfer failed");
        }
        else {
          bool success = bean().transferFrom(msg.sender, seller, price);
          require(success, "BEAN: Bean transfer failed");
        }

        FieldFacet(address(this)).transferPlot(seller, msg.sender, index, 0, listing.amount);

        delete s.listings[index];

        emit BuyListing(msg.sender, seller, index);
    }

    /**
     * Shed
    **/

    function bean() internal view returns (IBean) {
      return IBean(s.c.bean);
    }
}
