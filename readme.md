# Beanstalk
Beanstalk is a decentralized credit based algorithmic stablecoin protocol that is built on Ethereum.

## Contracts

|Contract                  | Addresss 
|:------------------------|:--------------------------------------------|
|Bean                      |[0xDC59ac4FeFa32293A95889Dc396682858d52e5Db](https://etherscan.io/address/0xDC59ac4FeFa32293A95889Dc396682858d52e5Db)|
|Beanstalk                 |[0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5](https://etherscan.io/address/0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5)|
|UniswapV2 BEAN:ETH Pair   |[0x87898263B6C5BABe34b4ec53F22d98430b91e371](https://etherscan.io/address/0x87898263B6C5BABe34b4ec53F22d98430b91e371)|
|Development Budget 1      |[0x83A758a6a24FE27312C1f8BDa7F3277993b64783](https://etherscan.io/address/0x83A758a6a24FE27312C1f8BDa7F3277993b64783)|
|Marketing Budget 1        |[0xAA420e97534aB55637957e868b658193b112A551](https://etherscan.io/address/0xAA420e97534aB55637957e868b658193b112A551)|
|BeaNFT OpenSea            |[0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79](https://etherscan.io/address/0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79)|

### Beanstalk Contract & EIP-2535
The Beanstalk smart contract is a multi-facet proxy as it implements EIP-2535. Thus, the Beanstalk contract pulls in functions from a variety of different contracts (called facets in the [EIP-2535 documentation](https://eips.ethereum.org/EIPS/eip-2535)) that are all capable of sharing the same state object.

The following are the different facets Beanstalk uses:
|Facet       | Addresss                                                  |
|:----------|:----------------------------------------------------------|
|Season      |[0xE7F0C51d8FaF239a1CF65DB79E5e0fC64d148424](https://etherscan.io/address/0xE7F0C51d8FaF239a1CF65DB79E5e0fC64d148424)|
|Governance  |[0x88540cB124CEeCFd0aE95F86d3EB6670b6035308](https://etherscan.io/address/0x88540cB124CEeCFd0aE95F86d3EB6670b6035308)|
|Silo        |[0x07CBe1273D9A7EB0cfD10463BF1102d2FBBbDe74](https://etherscan.io/address/0x07CBe1273D9A7EB0cfD10463BF1102d2FBBbDe74)|
|Field       |[0x24A30Cc4B8342B8A62DE921cd4038F4645C281eC](https://etherscan.io/address/0x24A30Cc4B8342B8A62DE921cd4038F4645C281eC)|
|Claim       |[0x5ad02aED25fb1fd438CC71fBC5129895b395d4C6](https://etherscan.io/address/0x5ad02aED25fb1fd438CC71fBC5129895b395d4C6)|
|Oracle      |[0xBA95364b0B856231e707a8a053e04FB7ceE71D44](https://etherscan.io/address/0xBA95364b0B856231e707a8a053e04FB7ceE71D44)|

The following facets are part of the [diamond functionality](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2535.md):

|Contract             | Addresss                                         |
|:-------------------|:-------------------------------------------------|
|DiamondCutFacet      |[0xDFeFF7592915bea8D040499E961E332BD453C249](https://etherscan.io/address/0xDFeFF7592915bea8D040499E961E332BD453C249)|
|DiamondLoupeFacet    |[0xB51D5C699B749E0382e257244610039dDB272Da0](https://etherscan.io/address/0xB51D5C699B749E0382e257244610039dDB272Da0)|
|OwnershipFacet       |[0x0176D95fd451353F3543A4542e667C62b673621a](https://etherscan.io/address/0x0176D95fd451353F3543A4542e667C62b673621a)|

## Setup
1. clone the repository
2. run `cd protocol` to enter the protocol repository
3. run `npm install`
5. run `npx hardhat compile`

## Testing
1. make sure you are in the `protocol` repository
1. run `npm test` to run all coverage tests
2. run `npx hardhat coverage` to run all coverage tests and generate a coverage report


## Developing

### Overview
As Beanstalk implements EIP-2535, Beanstalk is upgraded through a `diamondCut` function call.
There are two different ways a `diamondCut` can apply code to Beanstalk:
1. adding/replacing/removing functions
    * Functions being added/replaced are implemented in smart contracts referred to as `facets`. Facets are no different than a normal smart contract with callable functions. In order to share a state, Facets can only define 1 internal state variable: The `AppStorage` struct defined in `AppStorage.sol`.
2. calling the `init` function of a smart contract
    * This is a one time action and will be called when the `diamondCut` is executed. There can be 1 `init` call per `diamondCut`.

### Creating a new facet
For this tutorial, we are going to create a new facet called `SampleFacet`. In your own implementation replace iterations of the word `Sample` with the name of the Facet you want to create. 
1. make sure you are in the `protocol` repository
2. in `protocol/farm/facets/`, create a new folder called `SampleFacet`
3. within the `SampleFacet` folder create a file called `SampleFacet.sol`.
4. implement your faucet. You can use `SampleFacet.sol` in `protocol/samples` as a template for a basis faucet. Note that facets can only have `AppStorage` as an internal state variable or there will be issues with accessing `AppStorage`.
5. modify the `deploy` function in `scripts/deploy` to include your new facet, so that the `faucet` will be deployed with the Beanstalk diamond.

## Versions
Code Version: `1.3.2` <br>
Whitepaper Version `1.3.0`

## License
[MIT](https://github.com/BeanstalkFarms/Beanstalk/blob/master/LICENSE)

