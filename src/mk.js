import { mk, web3} from "./web3.js"
import fs from "fs"

const BN = web3.utils.BN
const maxINT = new BN( "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 16)

/*
mk.tub.methods.cups(web3.utils.padLeft(web3.utils.toHex(736), 64)).call({},(err,res)=>{
  if (err) console.error(err)
  console.log(JSON.stringify(res))    
})
*/

////////////////////////////////////////
// Utility Function

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
    }))
}

const sendTx = (tx) => {
    tx.from = process.env.ETH_ADDRESS

    return (web3.eth.personal.unlockAccount(tx.from, fs.readFileSync(`/run/secrets/${tx.from}`, "utf8")).then( (result) => {
        console.log(JSON.stringify(tx))

        const sentTx = web3.eth.sendTransaction(tx)

        sentTx.on('transactionHash', (hash) => {
            console.log(`sent transaction: ${hash}`)
        })

        sentTx.on('receipt', (receipt) => {
            console.log(`transaction confirmed: ${JSON.stringify(receipt)}`)
        })

        sentTx.on('error', (err) => {
            console.error(err)
        })
        return (sentTx)
    }))

}

const getEthPrice = () => {
    return (mk.tub.methods.tag().call({}).then((result) => {
        console.log(JSON,stringify(result))
        return (result)
    }).catch(console.error))
}

// Get best offer from market 
const getOffer = (sell, buy) => {
    return (mk.oasis.methods._best(sell, buy).call({}).then((offerID) => {
        
        return (mk.oasis.methods.offers(offerID).call({}).then((offer) => {

            offer.ID = offerID
            return (offer)

        }).catch(console.error))
    }).catch(console.error))
}


////////////////////////////////////////
// Exchange Functions

const ethToWeth = (amt) => {
    const tx = {
        to: mk.weth.options.address,
        value: amt,
        data: mk.weth.methods.deposit().encodeABI()
    }
    sendTx(tx)

}

const wethToPeth = (amt) => {
    approveSpending('tub', 'weth').then(() => {
        sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.join(amt).encodeABI()
        })
    })
}

// TODO

const pethToWeth = (amt) => {}

const openCDP = () => {}

const lockPeth = (peth) => {}
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

const wind = () => {}
const unwind = () => {}

//wethToPeth(web3.utils.toWei("0.001", 'ether'))
//ethToWeth( web3.utils.toWei('0.01', "ether"))
