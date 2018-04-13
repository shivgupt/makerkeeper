import { mk, tk, eth } from './eth'
import { utils } from './utility'
import { ex } from './exchange'
import fs from 'fs'

////////////////////////////////////////
// Internal utility functions
////////////////////////////////////////

const log = utils.log('MK')

const die = utils.die('MK')

var CDP_ID = null

// find CDP owned by ETH_ADDRESS env var
const findMyCDP = () => {
    let cdp = findCDP(process.env.ETH_ADDRESS.toLowerCase())
    CDP_ID = cdp.id
    return cdp
}

const findCDP = (address) => {
    log(address)
    if (CDP_ID !== null && process.env.ETH_ADDRESS.toLowerCase() === address) {
        return (mk.tub.methods.cups(eth.encodeCDP(CDP_ID)).call().then((cdp) => {
            log('Found CDP in cache')
            cdp.id = CDP_ID
            return (cdp)
        }).catch(die))
    } else {
        return (mk.tub.methods.cupi().call().then((totalCDP) => {
            const cdpPromises = []
            for (let i = 0; i <= totalCDP; i++){
                    cdpPromises.push( mk.tub.methods.cups(eth.encodeCDP(i)).call())
            }
            return (Promise.all(cdpPromises).then((cdps) => {
                for (let i = 0; i <= totalCDP; i++){
                    if ( cdps[i].lad.toLowerCase() === address){
                        cdps[i].id = i
                        return (cdps[i])
                    }
                }
            }).catch(die))
        }).catch(die))
    }
}

const getBalance = (token, account) => {
    return token.methods.balanceOf(account).call().then(t => { return (new eth.BN(p))}).catch(die)
}

////////////////////////////////////////
// Export object
////////////////////////////////////////

const cdp = {}

cdp.openCDP = () => {
    return (eth.sendTx({
        to: mk.tub.options.address,
        data: mk.tub.methods.open().encodeABI()
    }))
}

// peth (BN) units of peth to lock-up as collateral in our CDP
cdp.lockPeth = (peth) => {
    if (new eth.BN(peth).lte(eth.wad('0.005')))
    {
        log('Please lock up more than 0.005 PETH at a time')
        return (null)
    }
    log(`About to lock ${peth} peth in CDP`)
    return (findMyCDP().then((cdp) => {
        return (eth.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.lock(eth.encodeCDP(cdp.id), peth ).encodeABI()
        }))
    }).catch(die))
}

// Returns current position in DAI of an account
cdp.score = (account, price ) => {
    // eth + weth + peth - debt + dai
    const cdp = findCDP(account)
    const e = eth.getBalance(account)
    log (e)
    const ep = price
    log(ep)
    const w = getBalance(tk.weth, account)
    log(w)
    const p = getBalance(tk.peth, account)
    log(p)
    const d = getBalance(tk.dai, account)
    const debt = new eth.BN(cdp.art)
    const c = new eth.BN(cdp.ink)

    return e.mul(ep) + w.mul(ep) + p.mul(ep) + c.mul(ep) + d - debt
}

cdp.drawDai = (dai) => {
    log(`About to draw ${dai} dai from CDP`)
    return (findMyCDP().then( (cdp) => {
        //TODO check safe low ratio
        return (eth.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.draw(eth.encodeCDP(cdp.id), dai).encodeABI()
        }))
    }).catch(die))
}

// rap: gived governance debt of cdp 
// amt of mkr required to clear all debt = rap(cdp)/peek(val)
cdp.wipeDai = (dai) => {
    log(`About to wipe ${dai} debt`)
    return (findMyCDP().then ( (cdp) => {
        return (eth.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.wipe(eth.encodeCDP(cdp.id), dai).encodeABI()
        }))
    }).catch(die))
}

cdp.freePeth = (peth) => {
    log(`About to free ${peth} peth from CDP`)
    return (findMyCDP().then( (cdp) => {
        //TODO check safe low ratio
        return (eth.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.free(eth.encodeCDP(cdp.id), peth).encodeABI()
        }))
    }).catch(die))
}

// return unit of dai that can be drawn while maintaining tlr
// tlr = target liquidity ratio
cdp.safeDraw = (tlr) => {
    return findMyCDP().then((cdp) => {
        return mk.tub.methods.tag().call().then((ethPrice) => {
            return mk.tub.methods.per().call().then((ray) => {
                return ((new eth.BN(cdp.ink)).mul(eth.wad(ethPrice)).div(new eth.BN(tlr)).div(new eth.BN(ray)) - (new eth.BN(cdp.art)))
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

export { cdp }
