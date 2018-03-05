import { mk, tk, web3 } from './web3'
import fs from 'fs'
import https from 'https'

////////////////////////////////////////
// Internal global variables
////////////////////////////////////////

var CDP_ID = null
var ethGasStation = 'https://ethgasstation.info/json/ethgasAPI.json'

////////////////////////////////////////
// Iternal Utility function
////////////////////////////////////////

// Return gas price in wei
const getGasPrice = () => {
    return new Promise( (resolve, reject) => {
        https.get(ethGasStation, (res) => {
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

const BN = web3.utils.BN

////////////////////////////////////////
// Exported object methods
////////////////////////////////////////

// utils for utility
const utils = {}

// print one last message with our dying breath and then exit
utils.die = (tag) => {
    return ((msg) => {
        console.error(`${new Date().toISOString()} [${tag}] Fatal: ${msg}`)
        process.exit(1)
    })
}

utils.log = (tag) => {
    return ((msg) => {
        console.log(`${new Date().toISOString()} [${tag}]: ${msg}`)
    })
}

const log = utils.log('UTIL')

const die = utils.die('UTIL')

// find CDP owned by ETH_ADDRESS env var
utils.findMyCDP = () => {
    if (CDP_ID !== null){
        log('Found CDP in cache')
        return (mk.tub.methods.cups(web3.utils.padLeft(web3.utils.toHex(CDP_ID),64)).call().then((cdp) => {
            cdp.id = CDP_ID
            return (cdp)
        }).catch(die))
    }

    return (mk.tub.methods.cupi().call().then((totalCDP) => {
        const cdpPromises = []
        for (let i = 0; i <= totalCDP; i++){
                cdpPromises.push( mk.tub.methods.cups(web3.utils.padLeft(web3.utils.toHex(i),64)).call())
        }
        return (Promise.all(cdpPromises).then((cdps) => {
            for (let i = 0; i <= totalCDP; i++){
                if ( cdps[i].lad.toLowerCase() === process.env.ETH_ADDRESS.toLowerCase()){
                    cdps[i].id = i
                    CDP_ID = i
                    return (cdps[i])
                }
            }
        }).catch(die))
    }).catch(die))
}

utils.sendTx = (tx) => {

    tx.from = process.env.ETH_ADDRESS.toLowerCase()
    return (getGasPrice().then((gasPrice) => {
        tx.gasPrice = gasPrice

        return (web3.eth.estimateGas(tx).then(gas=>{
            tx.gas = gas * 2
/*
            // short circuit & don't actually send a transaction
            return(new Promise((resolve, reject) => {
                log('ping')
                resolve(tx)
            }))
*/
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

utils.getEthPrice = () => {
    return (mk.tub.methods.tag().call().then((result) => {
        log(JSON.stringify(result))
        return (result)
    }).catch(die))
}

// spender & toSpend are both contract object  eg mk.tub and tk.peth
utils.approveSpending = (spender, toSpend) => {
    return (toSpend.methods.allowance(process.env.ETH_ADDRESS, spender.options.address).call().then((allowance) => {
        if (Number(allowance) === 0) {
            log(`Approving ${spender.options.address} to spend ${toSpend.options.address}`)
            return (sendTx({
                to: toSpend.options.address,
                data: toSpend.methods.approve(spender.options.address, maxINT).encodeABI()
            }))
        } else {
            return (true)
        }
    }).catch(die))
}

export { utils }
