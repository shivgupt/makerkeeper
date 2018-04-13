import { ex } from './exchange'
import { cdp } from './cdp'

////////////////////////////////////////
// End User Function
////////////////////////////////////////

const t = {}

const load = (amt) => {
    return ex.ethToWeth(amt).then(() => {
        return ex.wethToPeth(amt).then((peth) => {
            return cdp.lockPeth(peth)
        }).catch(die)
    }).catch(die)
}

// c = (cdp.ink * price)/tlr
// c = amt of dai to draw; tlr = target liquidity ration to maintain 
const wind = (amt) => {
    return drawDai(amt).then(() => {
        return ex.daiToWeth(amt).then((weth) => {
            return ex.wethToPeth(weth).then((peth) => {
                return cdp.lockPeth(peth)
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

const unwind = () => {}

const init = () => {}

t.cdp = cdp

export default t
