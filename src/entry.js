import { ex } from './exchange'
import { cdp } from './cdp'
import { eth, tk, dao } from './eth'
import { utils } from './utility'

const log = utils.log('CON')
const die = utils.die('CON')

////////////////////////////////////////
// End User Function
////////////////////////////////////////

const mk = {}

// amt = Amount in ether
mk.load = (amt) => {
    var wei = eth.toWad(amt)
    // TODO: open CDP if not already open
    return ex.ethToWeth(wei).then(() => {
        return ex.wethToPeth(wei).then((peth) => {
            return cdp.lockPeth(peth)
        }).catch(die)
    }).catch(die)
}

mk.unload = (wei) => {
    //var wei = eth.toWad(amt)
    // TODO: safeFree
    return cdp.freePeth(wei).then(() => {
        return ex.pethToWeth(wei).then((weth) => {
            return ex.wethToEth(weth)
        }).catch(die)
    }).catch(die)
}

// c = (cdp.ink * price)/tlr
// c = amt of dai-wei to draw
//     tlr = target liquidity ration to maintain 
mk.wind = (wei) => {
    return cdp.drawDai(wei).then(() => {
        return ex.daiToWeth(wei).then((weth) => {
            return ex.wethToPeth(weth).then((peth) => {
                return cdp.lockPeth(peth)
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

// peth in wei
mk.unwind = (peth) => {
    return cdp.freePeth(peth).then(() => {
        return ex.pethToWeth(peth).then((weth) => {
            return ex.wethToDai(weth).then((dai) => {
                return cdp.wipeDai(dai)
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

mk.wind_to_lp = (lp) => {
    cdp.get_draw_amt(eth.toWad(lp)).then(toDraw => {
        log('Drawing: ' + toDraw.toString())
        mk.wind(toDraw)
    })
}

mk.unwind_to_lp = (lp) => {
    cdp.get_free_amt((lp)).then(toFree => {
        log('Freeing: ' + toFree.toString())
        mk.unwind(toFree)
    })
}

global.cdp = cdp
global.ex = ex
global.eth = eth
global.tk = tk
global.dao = dao

export default mk
