
# MakerDAO Cheat Sheet

## WETH: [0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2](https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)

### Calls/Reads/Properties:
**`name() => string`**: ie Wrapped Ether, **`totalSupply() => utin256`**: eg 79125209199163249042502, **`decimals() => uint8`**: ie 18, **`symbol() => string`**: ie WETH, **`balanceOf(address) => uint256`**: WETH owned by given address, **`allowance(address,address) => utin256`**: how many tokens address **2** is allowed to spend from the balance controlled by address **1**

## PETH: [0xf53ad2c6851052a81b42133467480961b2321c09](https://etherscan.io/address/0xf53ad2c6851052a81b42133467480961b2321c09)

### Calls/Reads/Properties:
**`name() => bytes32`**: ie `0x506f6f...`, **`totalSupply() => utin256`**: eg 71451293553973233226396, **`decimals() => uint256`**: ie 18, **`stopped() => bool`**: ie false, **`owner() => address`**: ie `0x00000...`, **`symbol() => bytes32`**: ie `0x5045544800..`, **`authority() => address`**: ie `0x315cbb88...`, **`balanceOf(address) => uint256`**: ie PETH owned by given address, **`allowance(address,address) => utin256`**: how many tokens address **2** is allowed to spend from the balance controlled by address **1**

## MKR: [0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2](https://etherscan.io/address/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2)

### Calls/Reads/Properties:
**`name() => bytes32`**: ie `0x4d616b...`, **`totalSupply() => utin256`**: eg 1000000000000000000000000, **`decimals() => uint256`**: ie 18, **`stopped() => bool`**: ie false, **`owner() => address`**: ie `0x7bb0b0...`, **`symbol() => bytes32`**: ie `0x4d4b5200...`, **`authority() => address`**: ie `0x000000...`, **`balanceOf(address) => uint256`**: ie MKR owned by given address, **`allowance(address,address) => utin256`**: idk

## DAI: [0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359](https://etherscan.io/address/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359)

### Calls/Reads/Properties:
**`name() => bytes32`**: ie `0x446169...`, **`totalSupply() => utin256`**: eg 17667203999011429735037281, **`decimals() => uint256`**: ie 18, **`stopped() => bool`**: ie false, **`owner() => address`**: ie `0x00000...`, **`symbol() => bytes32`**: ie `0x444149000..`, **`authority() => address`**: ie `0x315cbb88...`, **`balanceOf(address) => uint256`**: ie DAI owned by given address, **`allowance(address,address) => utin256`**: idk

## Eth Medianizer: [0x729d19f657bd0614b4985cf1d82531c67569197b](https://etherscan.io/address/0x729d19f657bd0614b4985cf1d82531c67569197b)

## MKR Medianizer: [0x99041f808d598b782d5a3e498681c2452a31da08](https://etherscan.io/address/0x99041f808d598b782d5a3e498681c2452a31da08)


## Tap: [0xbda109309f9fafa6dd6a9cb9f1df4085b27ee8ef](https://etherscan.io/address/0xbda109309f9fafa6dd6a9cb9f1df4085b27ee8ef)

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
 


