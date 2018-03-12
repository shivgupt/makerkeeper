import { mk, tk, eth } from './eth'
import { utils } from './utility'
import { ex } from './exchange'
import fs from 'fs'

////////////////////////////////////////
// Internal utility functions
////////////////////////////////////////

const log = utils.log('MK')

const die = utils.die('MK')

// find CDP owned by ETH_ADDRESS env var
findMyCDP = () => {
    if (CDP_ID !== null){
        log('Found CDP in cache')
        return (mk.tub.methods.cups(eth.encodeCDP(CDP_ID)).call().then((cdp) => {
            cdp.id = CDP_ID
            return (cdp)
        }).catch(die))
    }

    return (mk.tub.methods.cupi().call().then((totalCDP) => {
        const cdpPromises = []
        for (let i = 0; i <= totalCDP; i++){
                cdpPromises.push( mk.tub.methods.cups(eth.encodeCDP(i)).call())
        }
        return (Promise.all(cdpPromises).then((cdps) => {
            for (let i = 0; i <= totalCDP; i++){
                if ( cdps[i].lad.toLowerCase() === process.env.ETH_ADDRESS.toLowerCase()){
                    cdps[i].id = i
                    CDP_ID = i
                    return (cdps[i])
                }
            }
        }).catch(die))
    }).catch(die))
}

////////////////////////////////////////
// Export object
////////////////////////////////////////

cdp.openCDP = () => {
    return (eth.sendTx({
        to: mk.tub.options.address,
        data: mk.tub.methods.open().encodeABI()
    }))
}

const cdp = {}

// peth (BN) units of peth to lock-up as collateral in our CDP
cdp.lockPeth = (peth) => {
    if (new BN(peth).lte(eth.wad('0.005')))
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
cdp.wipeDai = (pc) => {}

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
                return ((new BN(cdp.ink)).mul(eth.wad(ethPrice)).div(new BN(tlr)).div(new BN(ray)) - (new BN(cdp.art)))
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

export { cdp }
