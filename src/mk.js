import { mk, tk, web3} from './web3'
import { utils } from './utility'
import { ex } from './exchange'
import fs from 'fs'
import roots from 'durand-kerner'

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

// return unit of dai that can be drawn while maintaining tlr
// tlr = target liquidity ratio
const safeDraw = (tlr) => {
    return utils.findMyCDP().then((cdp) => {
        return mk.tub.methods.tag().call().then((ethPrice) => {
            return mk.tub.methods.per().call().then((ray) => {
                return ((new BN(cdp.ink)).mul(new BN(ethPrice)).mul(unit).div(new BN(tlr)).div(new BN(ray)) - (new BN(cdp.art)))
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

// return object containing number of steps and step ratio (higher than slr) to hit tlr
// tlr = target liquidity ratio
// slr = safe low ratio
const findStep = (slr, tlr) => {
    const result = {
        step: 1,
        ratio: slr
    }
    var poly = [(tlr - 1), -1]
    for ( let i = 1; i < 6; i++){
        var r = roots(poly)[0]
        r.sort(function(a, b){return a - b})
        for (let j = 0; j < r.length; j++){
            if ( r[j] >= slr ) {
                result.step = i
                result.ratio = r[j]
                return result
            }
        }
        poly.unshift(tlr - 1)
    }
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

const targetSeeker = (tlr) => {
}

//safeDraw(web3.utils.toWei('2.20', 'ether')).then(log)
// rap: gived governance debt of cdp 
// amt of mkr required to clear all debt = rap(cdp)/peek(val)
utils.findMyCDP().then((cdp) => {
    mk.tub.methods.rap(web3.utils.padLeft(web3.utils.toHex(cdp.id), 64)).call().then((gd) => {
        mk.tub.methods.chi().call().then((chi) => {
            log(chi)
            log(new BN(gd))
        })
    })
})

/*
load(web3.utils.toWei('0.01', 'ether')).then(() => {
    wind(web3.utils.toWei('5', 'ether'))
})
*/
