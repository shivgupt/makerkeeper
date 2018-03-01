import { mk, web3} from './web3.js'
import fs from 'fs'

const BN = web3.utils.BN
const maxINT = new BN( 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
const daiUnit = new BN(10).pow(new BN('18'))
var CDP_ID = null

/*
mk.tub.methods.cups(web3.utils.padLeft(web3.utils.toHex(736), 64)).call({},(err,res)=>{
  if (err) console.error(err)
  console.log(JSON.stringify(res))    
})
*/

////////////////////////////////////////
// Utility Function
const findMyCDP = () => {
    if (CDP_ID !== null){
        console.log('Found CDP in cache')
        return (mk.tub.methods.cups(web3.utils.padLeft(web3.utils.toHex(CDP_ID),64)).call({}).then((cdp) => {
            cdp.ID = CDP_ID
            return (cdp)
        }))
    }

    return (mk.tub.methods.cupi().call({}).then((totalCDP) => {
        const cdpPromises = []
        for (let i = 0; i <= totalCDP; i++){
                cdpPromises.push( mk.tub.methods.cups(web3.utils.padLeft(web3.utils.toHex(i),64)).call({}))
        }
        return (Promise.all(cdpPromises).then((cdps) => {
            for (let i = 0; i <= totalCDP; i++){
                if ( cdps[i].lad.toLowerCase() === process.env.ETH_ADDRESS.toLowerCase()){
                    cdps[i].ID = i
                    CDP_ID = i
                    return (cdps[i])
                }
            }
        }))
    }))
}

// print one last message with our dying breath and then exit
const die = (msg) => {
    console.error(`${new Date().toISOString()} Fatal: ${msg}`)
    process.exit(1)
}

// spender & toSpend are both strings eg 'tub' and 'peth'
const approveSpending = (spender, toSpend) => {
    return (mk[toSpend].methods.allowance(process.env.ETH_ADDRESS, mk[spender].options.address).call({}).then((allowance) => {
        if (Number(allowance) === 0) {
            //console.log(`Approving ${spender} to spend ${toSpend}: ${JSON.stringify(tx)}`)
            return (sendTx({
                to: mk[toSpend].options.address,
                data: mk[toSpend].methods.approve(mk[spender].options.address, maxINT).encodeABI()
            }))
        } else {
            return (true)
        }
    }).catch(die))
}

const sendTx = (tx) => {

    console.log(JSON.stringify(tx))
    tx.from = process.env.ETH_ADDRESS.toLowerCase()
    tx.gasPrice = web3.utils.toWei('3', 'Gwei')
    
    return (web3.eth.estimateGas(tx).then(gas=>{
        tx.gas = gas * 2
        console.log(JSON.stringify(tx))
/*
        return (web3.eth.personal.unlockAccount(tx.from, fs.readFileSync(`/run/secrets/${tx.from}`, 'utf8')).then( (result) => {
            console.log(`${new Date().toISOString()} Sending transaction: ${JSON.stringify(tx)}`)

            // send the transaction
            return web3.eth.sendTransaction(tx)
            .once('transactionHash', (hash) => { console.log(`${new Date().toISOString()} Transaction Sent: ${hash}`) })
            .once('receipt', (reciept) => { console.log(`${new Date().toISOString()} Transaction Receipt: ${JSON.stringify(receipt)}`) })
            .on('error', die)
            .then((receipt) => {
              return (receipt)
            })

        }).catch(die)) 
  */    
    }).catch(die))
}

const getEthPrice = () => {
    return (mk.tub.methods.tag().call({}).then((result) => {
        console.log(JSON,stringify(result))
        return (result)
    }).catch(die))
}

// Get best offer from market 
const getOffer = (sell, buy) => {
    return (mk.oasis.methods._best(sell, buy).call({}).then((offerID) => {
        
        return (mk.oasis.methods.offers(offerID).call({}).then((offer) => {

            offer.ID = offerID
            return (offer)

        }).catch(die))
    }).catch(die))
}


////////////////////////////////////////
// Exchange Functions

const ethToWeth = (amt) => {
    return sendTx({
        to: mk.weth.options.address,
        value: amt,
        data: mk.weth.methods.deposit().encodeABI()
    })

}

const wethToPeth = (amt) => {
    return approveSpending('tub', 'weth').then(() => {
        return sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.join(amt).encodeABI()
        })
    })
}

// TODO

const pethToWeth = (amt) => {}

const openCDP = () => {
    return (sendTx({
        to: mk.tub.options.address,
        data: mk.tub.methods.open().encodeABI()
    }))
}

const lockPeth = (peth) => {
    if (new BN(peth).lte(new BN(web3.utils.toWei('0.005','ether'))))
    {
        console.log('Insufficient amount')
        return (null)
    }
    return (findMyCDP().then((cdp) => {
        console.log(JSON.stringify(cdp))
        return (sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.lock(web3.utils.padLeft(web3.utils.toHex(cdp.ID), 64), peth ).encodeABI()
        }))
    }))
}
// TODO finish callculaion of pc to withdraw
// pc = percent colateralization
const drawDai = (dai) => {
    return (findMyCDP().then( (cdp) => {
        return (sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.draw(web3.utils.padLeft(web3.utils.toHex(cdp.ID), 64), (new BN(dai).mul(daiUnit))).encodeABI()
        }))
    }))
}

// Handle decimal walue for weth 
const exchange = (buy, pay, amt) => {
    let quantity = new BN()

    return (getOffer(mk[buy].options.address, mk[pay].options.address).then((offer) => {
        console.log(JSON.stringify(offer))
        quantity = (new BN(offer.pay_amt)).mul(new BN(amt).mul(daiUnit)).div(new BN(offer.buy_amt)).toString()
        console.log(quantity)
        return (sendTx({
            to: mk.oasis.options.address,
            data: mk.oasis.methods.buy(offer.ID, quantity).encodeABI()
        }))
    }))
}

const daiToWeth = (dai) => {

    return (approveSpending('oasis', 'dai').then(() => {
        return exchange('weth', 'dai', dai)
    }))
}

// TODO Test and fix buy if needed
const wethToDai = (weth) => {

    return (approveSpending('oasis', 'weth').then(() => {
        return exchange('dai', 'weth', weth)
    }))
}

const freePeth = (peth) => {}
const wipeDai = (pc) => {}

////////////////////////////////////////
// End User Function
////////////////////////////////////////

const load = (amt) => {
    console.log('About to convert eth to weth')
    return ethToWeth(amt).then(()=> {
        console.log('About to convert weth to peth')
        return wethToPeth(amt).then(() => {
            console.log('About to lock peth in CDP')
            return lockPeth(amt)
        })
    })
}

// TODO Calulate percent colateral to draw
const wind = (amt) => {
    return (load(amt).then(() => {
        console.log(`Successfully Loaded $(amt) in CDP`)
    }))
}

const unwind = () => {}


findMyCDP().then( (cdp) => {
    console.log(JSON.stringify(cdp))
})

//drawDai('10')
daiToWeth('1').then(()=>{
wethToDai('0.17')})
//wind(web3.utils.toWei('0.025', 'ether'))
