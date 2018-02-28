import { mk, web3} from './web3.js'
import fs from 'fs'

const BN = web3.utils.BN
const maxINT = new BN( 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)

/*
mk.tub.methods.cups(web3.utils.padLeft(web3.utils.toHex(736), 64)).call({},(err,res)=>{
  if (err) console.error(err)
  console.log(JSON.stringify(res))    
})
*/

////////////////////////////////////////
// Utility Function
const findMyCDP = () => {

    return (mk.tub.methods.cupi().call({}).then((totalCDP) => {
        const cdpPromises = []
        for (let i = 0; i <= totalCDP; i++){
                cdpPromises.push( mk.tub.methods.cups(web3.utils.padLeft(web3.utils.toHex(i),64)).call({}))
        }
        return (Promise.all(cdpPromises).then((cdps) => {
            for (let i = 0; i <= totalCDP; i++){
//                console.log(JSON.stringify(cdps[i]))
                if ( cdps[i].lad.toLowerCase() === process.env.ETH_ADDRESS.toLowerCase()){
                    cdps[i].ID = i
                    return cdps[i]
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
            const tx = {
                to: mk[toSpend].options.address,
                data: mk[toSpend].methods.approve(mk[spender].options.address, maxINT).encodeABI()
            }
            console.log(`Approving ${spender} to spend ${toSpend}: ${JSON.stringify(tx)}`)
            return (sendTx(tx))
        } else {
            return (true)
        }
    }).catch(die))
}

const sendTx = (tx) => {

    tx.from = process.env.ETH_ADDRESS.toLowerCase()

    return (web3.eth.estimateGas(tx).then(gas=>{
        tx.gas = gas

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
    sendTx({
        to: mk.tub.options.address,
        data: mk.tub.methods.open().encodeABI()
    })
}

const lockPeth = (peth) => {
    if (new BN(peth).lt(new BN(web3.utils.toWei('0.005','ether'))))
    {
        console.log('Insufficient amount')
    }
    return (findMyCDP().then((cdp) => {
        console.log(JSON.stringify(cdp))
        sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.lock(web3.utils.padLeft(web3.utils.toHex(cdp.ID), 64), peth ).encodeABI()
        })
    }))
}
// pc = percent colateralization
const drawDai = (pc) => {}

const daiToWeth = (dai) => {
    getOffer(mk.dai.options.address, mk.weth.options.address).then( (offer) => {
    
        console.log(JSON.stringify(offer))
        const exchangeRate = (new BN(offer.buy_amt).mul(dai)).div(new BN(offer.pay_amt)).toString()
        console.log(exchangeRate)
    })
}

const wethToDai = (weth) => {
    const offer = getOffer(mk.weth.options.address, mk.dai.options.address)
    console.log(JSON.stringify(offer))
}

const freePeth = (peth) => {}
const wipeDai = (pc) => {}

////////////////////////////////////////
// End User Function
////////////////////////////////////////

const load = (amt) => {
    console.log('About to convert eth to weth')
    ethToWeth(amt).then(()=> {
        console.log('About to convert weth to peth')
        wethToPeth(amt)
    })
    //lockPeth( web3.utils.toWei('0.001','ether'))
}

const wind = () => {}
const unwind = () => {}

load(web3.utils.toWei('0.005', 'ether'))
