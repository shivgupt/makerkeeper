import { mk, web3} from "./web3.js"
import fs from "fs"

const BN = web3.utils.BN

/*
mk.tub.methods.cups(web3.utils.padLeft(web3.utils.toHex(736), 64)).call({},(err,res)=>{
  if (err) console.error(err)
  console.log(JSON.stringify(res))    
})
*/

// Utility Function
const sendTx = (tx) => {
    tx.from = process.env.ETH_ADDRESS

    web3.eth.personal.unlockAccount(tx.from, fs.readFileSync(`/run/secrets/${tx.from}`, "utf8")).then( (result) => {
        console.log(JSON.stringify(tx),result)
        web3.eth.sendTransaction(tx)
        .on('transactionHash', (hash) => {
            console.log(`sent transaction: ${hash}`)
        })
        .on('receipt', (receipt) => {
            console.log(`transaction confirmed: ${JSON.stringify(receipt)}`)
        })
        .on('error', (err) => {
            console.error(err)
        })
    })

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


// Exchange Functions

const ethToWeth = (amt) => {
    const tx = {
        to: mk.weth.options.address,
        value: amt,
        data: mk.weth.methods.deposit().encodeABI()
    }
    sendTx(tx)

}


// TODO

const setAllowances = () => {}
const openCDP = () => {}

const wethToPeth = (amt) => {}
const pethToWeth = (amt) => {}

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

ethToWeth( web3.utils.toWei('0.01', "ether"))
