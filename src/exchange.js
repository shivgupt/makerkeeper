import { mk, tk, web3 } from './web3'
import { utils } from './utility'

////////////////////////////////////////
// Iternal Utility function
////////////////////////////////////////

const BN = web3.utils.BN

const log = utils.log('EX')

const die = utils.die('EX')

// Get best offer from market 
// sell (string): address of ERC20 token contract
// buy (string): address of ERC20 token contract
const getOffer = (sell, buy) => {
    return (tk.oasis.methods._best(sell, buy).call().then((offerID) => {
        return (tk.oasis.methods.offers(offerID).call().then((offer) => {

            offer.id = offerID
            return (offer)

        }).catch(die))
    }).catch(die))
}

// buy (string): name of token being purchased 
// pay (string): name of token being exchanged
// amt (BN): units being purcahsed
const exchange = (buy, pay, amt) => {

    return (getOffer(tk[buy].options.address, tk[pay].options.address).then((offer) => {
        log(JSON.stringify(offer))
        const quantity = (new BN(offer.pay_amt)).mul(new BN(amt)).div(new BN(offer.buy_amt))
        log(quantity)
        return (utils.sendTx({
            to: tk.oasis.options.address,
            data: tk.oasis.methods.buy(offer.id, quantity).encodeABI()
        }))
    }).catch(die))
}

////////////////////////////////////////
// Exported object methods
////////////////////////////////////////

// ex for exchange
const ex = {}

// amt (BN): units of eth being converted
ex.ethToWeth = (amt) => {
    return utils.sendTx({
        to: tk.weth.options.address,
        value: amt,
        data: tk.weth.methods.deposit().encodeABI()
    })
}

// amt (BN): units of weth being converted
ex.wethToeth = (amt) => {
    return utils.sendTx({
        to: tk.weth.options.address,
        data: tk.weth.methods.withdraw(amt).encodeABI()
    })
}

// amt (BN): units of dai being converted
ex.daiToWeth = (dai) => {

    return (utils.approveSpending(tk.oasis, tk.dai).then(() => {
        return exchange('weth', 'dai', dai)
    }).catch(die))
}

// amt (BN): units of weth being converted
ex.wethToDai = (weth) => {

    return (utils.approveSpending(tk.oasis, tk.weth).then(() => {
        return exchange('dai', 'weth', weth)
    }).catch(die))
}

// amt (BN): units of weth being converted
ex.wethToPeth = (amt) => {
    return utils.approveSpending(mk.tub, tk.weth).then(() => {
        return utils.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.join(amt).encodeABI()
        })
    }).catch(die)
}

// amt (BN): units of peth being converted
ex.pethToWeth = (amt) => {
    return utils.approveSpending(mk.tub, tk.peth).then(() => {
        return utils.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.exit(amt).encodeABI()
        })
    }).catch(die)
}

export { ex }
