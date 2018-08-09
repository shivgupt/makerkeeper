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

mk.unwind = () => {}
mk.unload = () => {}

mk.wind_to_lp = (dai) => {
    cdp.get_draw_amt(eth.toWad(dai)).then(toDraw => {
        log('Drawing: ' + toDraw.toString())
        t.wind(toDraw)
    })
}

mk.cdp = cdp
mk.ex = ex
mk.eth = eth
mk.tk = tk
mk.dao = dao

export default mk
