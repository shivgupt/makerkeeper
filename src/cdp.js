import { dao, tk, eth } from './eth'
import { utils } from './utility'
import { ex } from './exchange'
import fs from 'fs'

////////////////////////////////////////
// Internal utility functions
////////////////////////////////////////

const log = utils.log('CDP')

const die = utils.die('CDP')

var CDP_ID = null

// find CDP owned by ETH_ADDRESS env var
const findMyCDP = () => {
    return findCDP(process.env.ETH_ADDRESS.toLowerCase()).then((Mycdp) => {
        log(`CDP: ${JSON.stringify(Mycdp, null, 2)}`)
        CDP_ID = Mycdp.id
        return Mycdp
    })
}

const findCDP = (address) => {
    if (CDP_ID && process.env.ETH_ADDRESS.toLowerCase() === address.toLowerCase()) {
        return (dao.tub.methods.cups(eth.encodeCDP(CDP_ID)).call().then((Mycdp) => {
            log(`Found CDP in cache : ${CDP_ID}`)
            Mycdp.id = CDP_ID
            return (Mycdp)
        }).catch(die))
    } else {
        return (dao.tub.methods.cupi().call().then((totalCDP) => {
            const cdpPromises = []
            for (let i = 0; i <= totalCDP; i++){
                    cdpPromises.push( dao.tub.methods.cups(eth.encodeCDP(i)).call())
            }
            return (Promise.all(cdpPromises).then((cdps) => {
                log(`Length = ${cdps.length}`)
                for (let i = 0; i <= totalCDP; i++){
                    if ( cdps[i].lad.toLowerCase() === address.toLowerCase()){
                        cdps[i].id = i
                        return (cdps[i])
                    }
                }
            }).catch(die))
        }).catch(die))
    }
}

const getBalance = (token, account) => {
    return token.methods.balanceOf(account).call().then(t => { return (new eth.BN(t))}).catch(die)
}

////////////////////////////////////////
// Export object
////////////////////////////////////////

const cdp = {}

cdp.openCDP = () => {
    return (sendTx({
        to: dao.tub.options.address,
        data: dao.tub.methods.open().encodeABI()
    }))
}

// peth (BN) units of peth to lock-up as collateral in our CDP
cdp.lockPeth = (peth) => {
    
    var wad = eth.toWad('0.005')
    if (new eth.BN(peth).lt(wad))
    {
        log(`Please lock up more than 0.005 PETH at a time (${peth} < ${wad})`)
        return (null)
    }
    log(`About to lock ${peth} peth in CDP`)
    return (findMyCDP().then((Mycdp) => {
        return (sendTx({
            to: dao.tub.options.address,
            data: dao.tub.methods.lock(eth.encodeCDP(Mycdp.id), peth ).encodeABI()
        }))
    }).catch(die))
}


// Returns current position in DAI of an account
cdp.score = (account, price ) => {
    // eth + weth + peth - debt + dai
    return findCDP(account).then((Mycdp) => {

        const e = eth.getBalance(account)
        const w = getBalance(tk.weth, account)
        const p = getBalance(tk.peth, account)
        const d = getBalance(tk.dai, account)

        return Promise.all([e, w, p, d]).then((res) => {
            const debt = new eth.BN(Mycdp.art)
            const c = new eth.BN(Mycdp.ink)
            const ep = new eth.BN(price)
            return (new eth.BN(res[0])).mul(ep) + (new eth.BN(res[1])).mul(ep) + (new eth.BN(res[2])).mul(ep) + c.mul(ep) + (new eth.BN(res[3])) - debt
        }).catch(die)
    }).catch(die)
}

cdp.drawDai = (dai) => {
    log(`About to draw ${dai} dai from CDP`)
    return (findMyCDP().then( (Mycdp) => {
        //TODO check safe low ratio
        return (sendTx({
            to: dao.tub.options.address,
            data: dao.tub.methods.draw(eth.encodeCDP(Mycdp.id), dai).encodeABI()
        }))
    }).catch(die))
}

// rap: gived governance debt of cdp 
// amt of mkr required to clear all debt = rap(cdp)/peek(val)
cdp.wipeDai = (dai) => {
    log(`About to wipe ${dai} debt`)
    return (findMyCDP().then ( (Mycdp) => {
        return (sendTx({
            to: dao.tub.options.address,
            data: dao.tub.methods.wipe(eth.encodeCDP(Mycdp.id), dai).encodeABI()
        }))
    }).catch(die))
}

cdp.freePeth = (peth) => {
    log(`About to free ${peth} peth from CDP`)
    return (findMyCDP().then( (Mycdp) => {
        //TODO check safe low ratio
        return (sendTx({
            to: dao.tub.options.address,
            data: dao.tub.methods.free(eth.encodeCDP(Mycdp.id), peth).encodeABI()
        }))
    }).catch(die))
}

cdp.get_draw_amt = (liq_price) => {

    var BN = eth.BN
    var rmul = utils.rmul
    var wmul = utils.wmul

    return Promise.all([
        findMyCDP(),
        dao.vox.methods.par().call(),
        dao.tub.methods.mat().call(),
        dao.tub.methods.per().call(),
        dao.tub.methods.chi().call(),
        dao.tub.methods.tag().call()
    ]).then(res=>{

        const mycdp = res[0]
        const ink = new BN(mycdp.ink) // wad
        const art = new BN(mycdp.art) // wad

        const par = new BN(res[1]) // ray
        const mat = new BN(res[2]) // ray
        const per = new BN(res[3]) // ray
        const chi = new BN(res[4]) // ray
        const tag = new BN(res[5]) // ray?!

        log(`ink=${ink.toString()} art=${art.toString()} par=${par.toString()} mat=${mat.toString()} per=${per.toString()} tag=${tag.toString()} chi=${chi.toString()}`)
        const debt = rmul(rmul(rmul(par,mat),chi),art)
        const col = rmul(per,ink)

        log(utils.wdiv(debt,col).toString())
        const LP = rmul(liq_price, per) // wad

        const liq_ratio = rmul( rmul( par, chi), mat) // ray

        const numerator = rmul( tag, rmul(liq_ratio, art).sub( wmul(LP, ink) )) // wad

        const denominator = LP.sub( rmul(liq_ratio, tag).div(new BN('1000000000')) ) // wad

        
        return utils.wdiv(numerator, denominator).toString() // wad

    }).catch(die)
}

// return unit of dai that can be drawn while maintaining tlr
// tlr = target liquidity ratio
// mat = liquidation ratio
// par = tartet price of DAI
// tab = debt * tax rates
// tag = abstracted collateral price
// min = (target price * debt * tax rates) * liquidation ratio
//
cdp.safeDraw = (tlr) => {
    return findMyCDP().then((Mycdp) => {
        return dao.tub.methods.tag().call().then((ethPrice) => {
            return dao.tub.methods.per().call().then((per) => {
                return ((new eth.BN(Mycdp.ink)).mul(eth.wad(ethPrice)).div(new eth.BN(tlr)).div(new eth.BN(per)) - (new eth.BN(Mycdp.art)))
            }).catch(die)
        }).catch(die)
    }).catch(die)
}

export { cdp }
