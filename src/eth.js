import fs from 'fs'
import https from 'https'
import net from 'net'

import Web3 from 'web3'

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


const web3 = new Web3(new Web3.providers.IpcProvider(
    process.env.ETH_PROVIDER,
    new net.Socket()
))

const BN = web3.utils.BN

// Return gas price in wei
const getGasPrice = () => {
    return new Promise( (resolve, reject) => {
        https.get('https://ethgasstation.info/json/ethgasAPI.json', (res) => {
            res.setEncoding('utf8')
            var data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', () => {
                // Div by 10 because API returns 10x high value
                return resolve(web3.utils.toWei(String(JSON.parse(data).average/10), 'gwei'))
            })
            res.on('error', (err) => {
                return reject(err)
            })
        })
    })
}

////////////////////////////////////////
// Defined Exported Objects
////////////////////////////////////////

// mk for makerkeeper
const mk = {}
mk.top = new web3.eth.Contract(topData.abi, topData.address)
mk.tub = new web3.eth.Contract(tubData.abi, tubData.address)
mk.tap = new web3.eth.Contract(tapData.abi, tapData.address)
mk.vox = new web3.eth.Contract(voxData.abi, voxData.address)

// tk for token
const tk = {}
tk.oasis = new web3.eth.Contract(oasisData.abi, oasisData.address)
tk.dai = new web3.eth.Contract(daiData.abi, daiData.address)
tk.weth = new web3.eth.Contract(wethData.abi, wethData.address)
tk.peth = new web3.eth.Contract(pethData.abi, pethData.address)
tk.mkr = new web3.eth.Contract(mkrData.abi, mkrData.address)

// eth for Ethereum utilites
const eth = {}

eth.price = () => {
    return (mk.tub.methods.tag().call().then((result) => {
        log(JSON.stringify(result))
        return (result)
    }).catch(die))
}

eth.sendTx = (tx) => {

    tx.from = process.env.ETH_ADDRESS.toLowerCase()
    return (getGasPrice().then((gasPrice) => {
        tx.gasPrice = gasPrice

        return (web3.eth.estimateGas(tx).then(gas=>{
            tx.gas = gas * 2

            return (web3.eth.personal.unlockAccount(tx.from, fs.readFileSync(`/run/secrets/${tx.from}`, 'utf8')).then( (result) => {
                log(`Sending transaction: ${JSON.stringify(tx)}`)

                // send the transaction
                return web3.eth.sendTransaction(tx)
                .once('transactionHash', (hash) => { log(`Transaction Sent: ${hash}`) })
                .once('receipt', (reciept) => { log(`Transaction Receipt: ${JSON.stringify(receipt)}`) })
                

            }).catch(die)) 

        }).catch(die))
    }).catch(die))

}

eth.encodeCDP = (id) => {
    return web3.utils.padLeft(web3.utils.toHex(id),64)
} 

// Num => BN( wad )
eth.wad = (num) => {
    return (new BN(web3.utils.toWei(String(num), 'ether')))
}

// spender & toSpend are both contract object  eg mk.tub and tk.peth
eth.approveSpending = (spender, toSpend) => {
    const maxINT = new BN( 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
    return (toSpend.methods.allowance(process.env.ETH_ADDRESS, spender.options.address).call().then((allowance) => {
        if (Number(allowance) === 0) {
            log(`Approving ${spender.options.address} to spend ${toSpend.options.address}`)
            return (eth.sendTx({
                to: toSpend.options.address,
                data: toSpend.methods.approve(spender.options.address, maxINT).encodeABI()
            }))
        } else {
            return (true)
        }
    }).catch(die))
}

eth.BN = BN

export { mk, tk, eth }
