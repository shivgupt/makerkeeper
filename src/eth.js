import fs from 'fs'
import https from 'https'
import net from 'net'

import daiData from '../contracts/dai'
import topData from '../contracts/top'
import tubData from '../contracts/tub'
import tapData from '../contracts/tap'
import voxData from '../contracts/vox'
import oasisData from '../contracts/oasis'
import wethData from '../contracts/weth'
import pethData from '../contracts/peth'
import mkrData from '../contracts/mkr'

import { utils } from './utility'

////////////////////////////////////////
// Iternal Utility function
////////////////////////////////////////

const log = utils.log('ETH')
const die = utils.die('ETH')

const BN = web3.utils.BN

////////////////////////////////////////
// Defined Exported Objects
////////////////////////////////////////

// dao for makerdao
const dao = {}
dao.top = new web3.eth.Contract(topData.abi, topData.address)
dao.tub = new web3.eth.Contract(tubData.abi, tubData.address)
dao.tap = new web3.eth.Contract(tapData.abi, tapData.address)
dao.vox = new web3.eth.Contract(voxData.abi, voxData.address)

// tk for token
const tk = {}
tk.oasis = new web3.eth.Contract(oasisData.abi, oasisData.address)
tk.dai = new web3.eth.Contract(daiData.abi, daiData.address)
tk.weth = new web3.eth.Contract(wethData.abi, wethData.address)
tk.peth = new web3.eth.Contract(pethData.abi, pethData.address)
tk.mkr = new web3.eth.Contract(mkrData.abi, mkrData.address)

// eth for Ethereum utilites
const eth = {}

eth.getTokenBalance = (token, account) => {
    return (tk[token].methods.balanceOf(account).call())
}

eth.getBalance = (account) => {
    return (web3.eth.getBalance(account).then(e => new BN(e)).catch(die))
}

eth.price = () => {
    return (dao.tub.methods.tag().call().then((result) => {
        log(JSON.stringify(result))
        return (result)
    }).catch(die))
}

eth.encodeCDP = (id) => {
    return web3.utils.padLeft(web3.utils.toHex(id),64)
} 

// Num => BN( wad )
eth.toWad = (num) => {
    return (new BN(web3.utils.toWei(String(num), 'ether')))
}

// spender & toSpend are both contract object  eg dao.tub and tk.peth
eth.approveSpending = (spender, toSpend) => {
    const maxINT = new BN( 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
    return (toSpend.methods.allowance(process.env.ETH_ADDRESS, spender.options.address).call().then((allowance) => {
        if (Number(allowance) === 0) {
            log(`Approving ${spender.options.address} to spend ${toSpend.options.address}`)
            return (sendTx({
                to: toSpend.options.address,
                data: toSpend.methods.approve(spender.options.address, maxINT).encodeABI()
            }))
        } else {
            console.log(`${spender} already approved to spend ${toSpend}`)
            return (true)
        }
    }).catch(die))
}

eth.BN = BN

export { dao, tk, eth, web3 }
