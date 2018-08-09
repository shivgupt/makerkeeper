import { ex } from './exchange'
import { cdp } from './cdp'
import { eth, tk, mk } from './eth'
import { utils } from './utility'

const log = utils.log('CON')

const die = utils.die('CON')

////////////////////////////////////////
// End User Function
////////////////////////////////////////

const t = {}

// Amount in ether
t.load = (amt) => {
    var wei = eth.toWad(amt)
    return ex.ethToWeth(wei).then(() => {
        return ex.wethToPeth(wei).then((peth) => {
            return cdp.lockPeth(peth)
        }).catch(die)
    }).catch(die)
}

// c = (cdp.ink * price)/tlr
// c = amt of dai-wei to draw
//     tlr = target liquidity ration to maintain 
t.wind = (wei) => {
    return cdp.drawDai(wei).then(() => {
        return ex.daiToWeth(wei).then((weth) => {
            return ex.wethToPeth(weth).then((peth) => {
                return cdp.lockPeth(peth)
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

t.unwind = () => {}
t.init = () => {}

t.wind_to_lp = (dai) => {
    cdp.get_draw_amt(eth.toWad(dai)).then(toDraw => {
        log('Drawing: ' + toDraw.toString())
        t.wind(toDraw)
    })
}

t.cdp = cdp
t.ex = ex
t.eth = eth
t.tk = tk
t.mk = mk

export default t
