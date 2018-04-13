import { ex } from './exchange'
import { cdp } from './cdp'
import { utils } from './utility'
import { web3 } from './eth'

const log = utils.log('CON')

const die = utils.die('CON')

////////////////////////////////////////
// End User Function
////////////////////////////////////////

const t = {}

t.load = (amt) => {
    var wei = web3.utils.toWei(amt, 'ether')
    return ex.ethToWeth(wei).then(() => {
        return ex.wethToPeth(wei).then((peth) => {
            return cdp.lockPeth(peth)
        }).catch(die)
    }).catch(die)
}

// c = (cdp.ink * price)/tlr
// c = amt of dai to draw; tlr = target liquidity ration to maintain 
t.wind = (amt) => {
    var wei = web3.utils.toWei(amt, 'ether')
    return drawDai(wei).then(() => {
        return ex.daiToWeth(wei).then((weth) => {
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
