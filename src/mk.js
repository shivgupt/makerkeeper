import { mk, tk, web3} from './web3'
import { utils } from './utility'
import { ex } from './exchange'
import fs from 'fs'

////////////////////////////////////////
// Internal global variables
////////////////////////////////////////

const BN = web3.utils.BN
const maxINT = new BN( 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)

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
    return (utils.findMyCDP().then((cdp) => {
        log(JSON.stringify(cdp))
        return (utils.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.lock(web3.utils.padLeft(web3.utils.toHex(cdp.id), 64), peth ).encodeABI()
        }))
    }).catch(die))
}

const drawDai = (dai) => {
    return (utils.findMyCDP().then( (cdp) => {
        return (utils.sendTx({
            to: mk.tub.options.address,
            data: mk.tub.methods.draw(web3.utils.padLeft(web3.utils.toHex(cdp.id), 64), (new BN(dai).mul(daiUnit))).encodeABI()
        }))
    }).catch(die))
}

const wipeDai = (pc) => {}

const freePeth = (peth) => {}

////////////////////////////////////////
// End User Function
////////////////////////////////////////

const load = (amt) => {
    log('About to convert eth to weth')
    return ex.ethToWeth(amt).then(()=> {
        log('About to convert weth to peth')
        return ex.wethToPeth(amt).then(() => {
            log('About to lock peth in CDP')
            return lockPeth(amt)
        }).catch(die)
    }).catch(die)
}

// TODO Calulate percent colateral to draw 
// c = (cdp.ink * price)/tlr
// c = amt of dai to draw; tlr = target liquidity ration to maintain 
const wind = (amt) => {
    return (load(amt).then(() => {
        log(`Successfully Loaded $(amt) in CDP`)
    }).catch(die))
}

const unwind = () => {}

const targetSeeker = (tlr) => {
    findMyCDP
}

load(web3.utils.toWei('0.06', 'ether'))
//wind(web3.utils.toWei('0.025', 'ether'))
