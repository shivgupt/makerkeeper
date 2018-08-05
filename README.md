# MakerDAO Tools

## Motivation

MakerDAO is an amazing project which provides a base for bringing various financial applications - such as loan, insurance and leveraging to the blockchain. Current dashboard provided by the makerDAO team can get a bit confusing and requires a lot of atomic steps. If a new user wants to take loan against ether by opening a CDP, he would have to go through a series of steps and signing each transaction individually:

   1. Approve appropriate permissions to various smart contract
   2. Convert eth to weth
   3. Convert weth to peth
   4. Open CDP if it does not already exist
   5. Lock Peth into CDP
   6. Draw Dai

In this project I have tried to provide tools that would provide a simpler way of accomplishing the same thing in a in fewer steps. So far I have created the backend which provides high level functions consolidating several transactions and others do the math required to reach a specific state. Next I will use react and IPFS to provide a dashboard frontend that even non technical users can use.

## Getting started
- git clone https://github.com/shivgupt/makerkeeper.git
- Setup environment variables `ETH_ADDRESS` and `remotessh` to the ethereum account address and the server hostname of your server respectively.
- Import an account to ethprovider serving the makerkeeper. If using an account created on MetaMask, import the private key into ethprovider using the personal_importRawKey RPC method and then add it to docker secret : `echo '{"jsonrpc":"2.0","method":"personal_importRawKey","params":["secretKey","secretPassword"],"id":1}' | sudo nc -U /var/lib/docker/volumes/ethprovider_ipc/_data/geth.ipc`
- make deploy-bot
- make deploy-console
- You are all set to play with the makerkeeper-console

# MakerDAO Cheat Sheet

## Oasis: [0x14FBCA95be7e99C15Cc2996c6C9d841e54B79425](https://etherscan.io/address/0x14fbca95be7e99c15cc2996c6c9d841e54b79425)

Oasis: decentralized exchange 

### Calls/Reads:
**`_best`**`(address, address) => uint256`: best offer to sell ERC20 token at address 1 to buy ERC20 token at address 2, **`offers`**`(uint256) => uint256, address, uint256, address, address, uint64`: pay_amt of token address 1 to get buy_amt of token address 2 offered by address 3 owner at timestamp

### Sends/Writes:
**`buy`**`(uint256, uint256)`: from offer ID buy 

## WETH: [0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2](https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)

Wrapped ETH; an ERC20 token that is exchangeable 1:1 with Ether. Only exists to provide standard ERC20 methods to Ethereum's native currency.

### Calls/Reads:
**`name`**`() => string`, **`totalSupply`**`() => uint256`, **`decimals`**`() => uint8`, **`symbol`**`() => string`, **`balanceOf`**`(address) => uint256`, **`allowance`**`(address,address) => uint256`: how many tokens owned by address 1 can be spent by address 2

### Sends/Writes:
**`approve`**`(address guy, uint wad) => bool`: permit `guy` to spend up to `wad` of the sender's WETH balance, **`deposit`**`() => null`: send ETH to this method to receive the equivalent amount of WETH, **`transfer`**`(address dst, uint wad) => bool`: transfer `wad` WETH from the sender's account to `dst`, **`transferFrom`**`(address src, address dst, uint wad) => bool`: transfer `wad` WETH from `src` to `dst`, **`withdraw`**`(uint wad) => null`: destroy `wad` WETH and receive the equivalent amount of ETH

### Events
**`Approval`**`(address indexed src, address indexed guy, uint256 wad)`, **`Transfer`**`(address indexed src, address indexed dst, uint256 wad)`, **`Deposit`**`(address indexed dst, uint256 wad)`, **`Withdrawal`**`(address indexed src, uint256 wad)`



## PETH: [0xf53ad2c6851052a81b42133467480961b2321c09](https://etherscan.io/address/0xf53ad2c6851052a81b42133467480961b2321c09)

Pooled ETH; an ERC20 token that's exchangeable 1:1 with WETH. This is the collateral that can be locked up in a MakerDAO CDP.

### Calls/Reads:
**`allowance`**`(address,address) => uint256`: how many tokens owned by arg1 address are allowed to be spent by arg2 address, **`authority`**`() => address`, **`balanceOf`**`(address) => uint256`, **`decimals`**`() => uint256`, **`name`**`() => bytes32`, **`owner`**`() => address`, **`stopped`**`() => bool`, **`symbol`**`() => bytes32`, **`totalSupply`**`() => uint256`

### Sends/Writes:
**`approve`**`(address) => bool`: allow some address to spend the message sender's PETH, **`approve`**`(address,uint256) => bool`: allow some address to spend up to uint256 of the message sender's PETH, **`move`**`(address,address,uint256) => null`: alias for transferFrom, **`pull`**`(address,uint256) => null`: transfer uint256 PETH from some address to the message sender, **`push`**`(address,uint256) => null`: alias for transfer, **`transfer`**`(address,uint256) => bool`: transfer uint256 PETH from the message sender to some address, **`transferFrom`**`(address,address,uint256) => bool`: transfer uint256 PETH from arg1 address to arg2 address

### Events
**`Approval`**`(address indexed src, address indexed guy, uint256 wad)`, **`Burn`**`(address indexed guy, uint256 wad)`, **`LogNote`**`(bytes4 indexed sig, address indexed guy, bytes32 indexed foo, bytes32 indexed bar, uint256 wad, bytes fax)`, **`Mint`**`(address indexed guy, uint wad)`, **`Transfer`**`(address indexed src, address indexed dst, uint256 wad)`



## MKR: [0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2](https://etherscan.io/address/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2)

MakerDAO governance token; an ERC20 token that's used to pay the MakerDAO stability/governance fees. Holders may also have voting rights in some decisions eg setting the stability fee.

### Calls/Reads:
**`allowance`**`(address,address) => uint256`: how many tokens owned by arg1 address are allowed to be spent by arg2 address, **`authority`**`() => address`, **`balanceOf`**`(address) => uint256`, **`decimals`**`() => uint256`, **`name`**`() => bytes32`, **`owner`**`() => address`, **`stopped`**`() => bool`, **`symbol`**`() => bytes32`, **`totalSupply`**`() => uint256`

### Sends/Writes:
**`approve`**`(address) => bool`: allow some address to spend the message sender's MKR, **`approve`**`(address,uint256) => bool`: allow some address to spend up to uint256 of the message sender's MKR, **`move`**`(address,address,uint256) => null`: alias for transferFrom, **`pull`**`(address,uint256) => null`: transfer uint256 MKR from some address to the message sender, **`push`**`(address,uint256) => null`: alias for transfer, **`transfer`**`(address,uint256) => bool`: transfer uint256 MKR from the message sender to some address, **`transferFrom`**`(address,address,uint256) => bool`: transfer uint256 MKR from arg1 address to arg2 address

### Events
**`Approval`**`(address indexed owner, address indexed guy, uint256 wad)`, **`Burn`**`(address indexed guy, uint256 wad)`, **`LogNote`**`(bytes4 indexed sig, address indexed guy, bytes32 indexed foo, bytes32 indexed bar, uint256 wad, bytes fax)`, **`Mint`**`(address indexed guy, uint wad)`, **`Transfer`**`(address indexed owner, address indexed dst, uint256 wad)`



## DAI: [0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359](https://etherscan.io/address/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359)

DAI stable coin; an ERC20 token that's pegged to the USD. Can be minted/borrowed after locking up sufficient collateral, used to pay off debt & unlock collateral.

### Calls/Reads:
**`allowance`**`(address,address) => uint256`: how many tokens owned by arg1 address are allowed to be spent by arg2 address, **`authority`**`() => address`, **`balanceOf`**`(address) => uint256`, **`decimals`**`() => uint256`, **`name`**`() => bytes32`, **`owner`**`() => address`, **`stopped`**`() => bool`, **`symbol`**`() => bytes32`, **`totalSupply`**`() => uint256`

### Sends/Writes:
**`approve`**`(address) => bool`: allow some address to spend the message sender's DAI, **`approve`**`(address,uint256) => bool`: allow some address to spend up to uint256 of the message sender's DAI, **`move`**`(address,address,uint256) => null`: alias for transferFrom, **`pull`**`(address,uint256) => null`: transfer uint256 DAI from some address to the message sender, **`push`**`(address,uint256) => null`: alias for transfer, **`transfer`**`(address,uint256) => bool`: transfer uint256 DAI from the message sender to some address, **`transferFrom`**`(address,address,uint256) => bool`: transfer uint256 DAI from arg1 address to arg2 address

### Events
**`Approval`**`(address indexed src, address indexed guy, uint256 wad)`, **`Burn`**`(address indexed guy, uint256 wad)`, **`LogNote`**`(bytes4 indexed sig, address indexed guy, bytes32 indexed foo, bytes32 indexed bar, uint256 wad, bytes fax)`, **`Mint`**`(address indexed guy, uint wad)`, **`Transfer`**`(address indexed src, address indexed dst, uint256 wad)`


## Eth Medianizer: [0x729d19f657bd0614b4985cf1d82531c67569197b](https://etherscan.io/address/0x729d19f657bd0614b4985cf1d82531c67569197b)

Saves a list of ETH market prices & calculates their median.

### Calls/Reads:
**`authority`**`() => address`, **`compute`**`() => [bytes32,bool]`: compute a new median based on saved values, **`indexes`**`(address) => bytes12`: to find out which price some authorized address submitted, **`min`**`() => uint96`, **`next`**`() => bytes12`, **`owner`**`() => address`, **`peek`**`() => [byes32,bool]`: return the last saved computation and whether or not it's still set, **`read`**`() => bytes32`: returns the latest market price if it's been set, **`values`**`(bytes12) => address`

### Sends/Writes:
**`poke`**`() => null`, **`poke`**`(bytes32) => null`, compute and save a new median based on prices set my authorized addresses, **`set`**`(address) => null` **`set`**`(bytes,address) => null`, **`unset`**`(address) => null` **`unset`**`(bytes12) => null`

### Events
**`LogNote`**`(bytes4 indexed sig, address indexed guy, bytes32 indexed foo, bytes32 indexed bar, uint wad, bytes fax)`

## MKR Medianizer: [0x99041f808d598b782d5a3e498681c2452a31da08](https://etherscan.io/address/0x99041f808d598b782d5a3e498681c2452a31da08)

Saves a list of MKR market prices & calculates their median.

### Calls/Reads:
**`authority`**`() => address`, **`compute`**`() => [bytes32,bool]`: compute a new median based on saved values, **`indexes`**`(address) => bytes12`: to find out which price some authorized address submitted, **`min`**`() => uint96`, **`next`**`() => bytes12`, **`owner`**`() => address`, **`peek`**`() => [byes32,bool]`: return the last saved computation and whether or not it's still set, **`read`**`() => bytes32`: returns the latest market price if it's been set, **`values`**`(bytes12) => address`

### Sends/Writes:
**`poke`**`() => null`, **`poke`**`(bytes32) => null`, compute and save a new median based on prices set my authorized addresses, **`set`**`(address) => null` **`set`**`(bytes,address) => null`, **`unset`**`(address) => null` **`unset`**`(bytes12) => null`

### Events
**`LogNote`**`(bytes4 indexed sig, address indexed guy, bytes32 indexed foo, bytes32 indexed bar, uint wad, bytes fax)`
**`LogValue`**`(bytes32 val)`

## Tap: [0xbda109309f9fafa6dd6a9cb9f1df4085b27ee8ef](https://etherscan.io/address/0xbda109309f9fafa6dd6a9cb9f1df4085b27ee8ef)

## Calls/Reads:
**`authority`**`() => address`
**`fix`**`() => uint256`
**`joy`**`() => uint256`
**`owner`**`() => uint256`
**`sai`**`() => address`
**`sin`**`() => address`
**`skr`**`() => address`
**`tub`**`() => address`
**`woe`**`() => uint256`

## Sends/Writes:
**`ask`**`(uint256) => uint256`
**`bid`**`(uint256) => uint256`
**`boom`**`(uint256) => null`
**`bust`**`(uint256) => null`
**`cage`**`(uint256) => null`
**`cash`**`(uint256) => null`
**`heal`**`() => null`
**`mock`**`(uint256) => null`
**`mold`**`(bytes32) => null`
**`s2s`**`() => uint256`
**`vent`**`() => null`



## Top: [0x9b0ccf7c8994e19f39b2b4cf708e0a7df65fa8a3](https://etherscan.io/address/0x9b0ccf7c8994e19f39b2b4cf708e0a7df65fa8a3)

## Tub: [0x448a5065aebb8e423f0896e6c5d525c040f59af3](https://etherscan.io/address/0x448a5065aebb8e423f0896e6c5d525c040f59af3)

### Calls/Reads/Properties:
**`safe(bytes32 ) => bool`**, **`tag() => uint`**: collateral price ref per skr, **`ask(uint wad) => uint`**: collateral token per skr

### Sends/Writes:
**`lock(bytes32 , uint )`**: transfers collateral from owner to system, **`draw(bytes32 , uint )`**: mints new DAI for owner of CDP, **`free(bytes32 , uint )`**: reclaim collateral, **`wipe(bytes32 , uint )`**: return DAI and reduce debt issued, **`shut(bytes32 )`**: closes the CDP account, **`bite(bytes32 )**`: trigger liquidation 

### Events:
**`Mint(address indexed , uint )`**, **`Burn(address indexed , uint )`**, **`LogNewCup(address indexed , bytes32 )`**, **`event LogNewCup(address indexed , bytes32 )`**: creates new cdp

## Vox: [0x9b0f70df76165442ca6092939132bbaea77f2d7a](https://etherscan.io/address/0x9b0f70df76165442ca6092939132bbaea77f2d7a)

## Glossary
 - Urn: Data record for CDP
 - Ilk: Data record for CDP type
 
