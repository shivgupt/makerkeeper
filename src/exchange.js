import { dao, tk, eth, web3 } from './eth'
import { utils } from './utility'

////////////////////////////////////////
// Iternal Utility function
////////////////////////////////////////

const BN = eth.BN

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
// amt (BN): units being exchanged
const exchange = (pay, buy, amt) => {

    return (getOffer(tk[buy].options.address, tk[pay].options.address).then((offer) => {
        log(JSON.stringify(offer))
        const quantity = (new BN(offer.pay_amt)).mul(new BN(amt)).div(new BN(offer.buy_amt))
        log(quantity)
        return (sendTx({
            to: tk.oasis.options.address,
            data: tk.oasis.methods.buy(offer.id, quantity).encodeABI()
        }).then(()=>{
            return (quantity)
        }).catch(die))
    }).catch(die))
}

////////////////////////////////////////
// Exported object methods
////////////////////////////////////////

// ex for exchange
const ex = {}

// ether (BN): units of ether being converted
ex.ethToWeth = (ether) => {
    log(`About to turn ${ether} eth into weth`)
    return sendTx({
        to: tk.weth.options.address,
        value: ether,
        data: tk.weth.methods.deposit().encodeABI()
    })
}

// weth (BN): units of weth being converted
ex.wethToEth = (weth) => {
    log(`About to convert ${weth} weth to eth`)
    return sendTx({
        to: tk.weth.options.address,
        data: tk.weth.methods.withdraw(weth).encodeABI()
    })
}

// dai (BN): units of dai being converted
ex.daiToWeth = (dai) => {
    log(`About to convert ${dai} dai to weth`)
    return (eth.approveSpending(tk.oasis, tk.dai).then(() => {
        return exchange('dai', 'weth', dai)
    }).catch(die))
}

// weth (BN): units of weth being converted
ex.wethToDai = (weth) => {
    log(`About to convert ${weth} weth to dai`)
    return (eth.approveSpending(tk.oasis, tk.weth).then(() => {
        return exchange('weth', 'dai', weth)
    }).catch(die))
}

// weth (BN): units of weth being converted
ex.wethToPeth = (weth) => {
    return dao.tub.methods.ask(web3.utils.toWei('1','ether')).call().then( (ask) => {
        log(`Ask = ${ask}`)
        var peth = (new BN(web3.utils.toWei('1','ether'))).mul( new BN(weth)).div( new BN(ask))
        log(`About to convert ${weth} weth to ${peth} peth`)
                //return peth

        return eth.approveSpending(dao.tub, tk.weth).then(() => {
            return sendTx({
                to: dao.tub.options.address,
                data: dao.tub.methods.join(peth).encodeABI()
            }).then((tx) => {
                return peth
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

// peth (BN): units of peth being converted
ex.pethToWeth = (peth) => {
    log(`About to convert ${peth} peth to weth`)
    return eth.approveSpending(dao.tub, tk.peth).then(() => {
        return sendTx({
            to: dao.tub.options.address,
            data: dao.tub.methods.exit(peth).encodeABI()
        }).then(() => {
            return dao.tub.methods.bid(peth).call()
        }).catch(die)
    }).catch(die)
}

// weth (BN): units of weth being converted to mkr
ex.wethToMkr = (weth) => {
    log(`About to convert ${weth} weth to mkr`)
    return (eth.approveSpending(tk.oasis, tk.weth).then(() => {
        return exchange('weth', 'mkr', weth)
    }).catch(die))
}

export { ex }
