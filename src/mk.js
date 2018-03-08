import { mk, tk, web3} from './web3'
import { utils } from './utility'
import { ex } from './exchange'
import fs from 'fs'

////////////////////////////////////////
// Internal global variables
////////////////////////////////////////

const BN = web3.utils.BN
const maxINT = new BN( 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
const unit = new BN('1000000000000000000')
////////////////////////////////////////
// Internal utility functions
////////////////////////////////////////

const log = utils.log('MK')

const die = utils.die('MK')

const openCDP = () => {
    return (utils.sendTx({
        to: mk.tub.options.address,
        data: mk.tub.methods.open().encodeABI()
    }))
}

// peth (BN) units of peth to lock-up as collateral in our CDP
const lockPeth = (peth) => {
    if (new BN(peth).lte(new BN(web3.utils.toWei('0.005','ether'))))
    {
        log('Please lock up more than 0.005 PETH at a time')
        return (null)
    }
    log(`About to lock ${peth} peth in CDP`)
    return (utils.findMyCDP().then((cdp) => {
        return (utils.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.lock(web3.utils.padLeft(web3.utils.toHex(cdp.id), 64), peth ).encodeABI()
        }))
    }).catch(die))
}

const drawDai = (dai) => {
    log(`About to draw ${dai} dai from CDP`)
    return (utils.findMyCDP().then( (cdp) => {
        //TODO check safe low ratio
        return (utils.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.draw(web3.utils.padLeft(web3.utils.toHex(cdp.id), 64), dai).encodeABI()
        }))
    }).catch(die))
}

const wipeDai = (pc) => {}

const freePeth = (peth) => {
    log(`About to free ${peth} peth from CDP`)
    return (utils.findMyCDP().then( (cdp) => {
        //TODO check safe low ratio
        return (utils.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.free(web3.utils.padLeft(web3.utils.toHex(cdp.id), 64), peth).encodeABI()
        }))
    }).catch(die))
}

////////////////////////////////////////
// End User Function
////////////////////////////////////////

const load = (amt) => {
    return ex.ethToWeth(amt).then(() => {
        return ex.wethToPeth(amt).then((peth) => {
            return lockPeth(peth)
        }).catch(die)
    }).catch(die)
}

// c = (cdp.ink * price)/tlr
// c = amt of dai to draw; tlr = target liquidity ration to maintain 
const wind = (amt) => {
    return drawDai(amt).then(() => {
        return ex.daiToWeth(amt).then((weth) => {
            return ex.wethToPeth(weth).then((peth) => {
                return lockPeth(peth)
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

const unwind = () => {}

// return unit of dai that can be minted while maintaining given ratio
// ratio = target liquidity ratio
const safeDraw = (ratio) => {
    return utils.findMyCDP().then((cdp) => {
        return mk.tub.methods.tag().call().then((ethPrice) => {
            return mk.tub.methods.per().call().then((ray) => {
                return ((new BN(cdp.ink)).mul(new BN(ethPrice)).mul(unit).div(new BN(ratio)).div(new BN(ray)) - (new BN(cdp.art)))
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

const targetSeeker = (tlr) => {
}

// return object containing number of steps and step ratio
const findStep = (slr, tlr) => {
}

safeDraw(web3.utils.toWei('2.20', 'ether')).then(log)
//lockPeth(web3.utils.toWei('0.01', 'ether'))
/*
load(web3.utils.toWei('0.01', 'ether')).then(() => {
    wind(web3.utils.toWei('5', 'ether'))
})
*/
