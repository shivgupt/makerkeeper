import fs from 'fs'
import BN from 'bn.js'

global.BN = BN

global.l = console.log
global.lj = x => console.log(JSON.stringify(x, null, 2))

////////////////////////////////////////
// Exported object methods
////////////////////////////////////////

// utils for utility
const utils = {}

// print one last message with our dying breath and then exit
utils.die = (tag) => {
    return ((msg) => {
        console.error(`${new Date().toISOString()} [${tag}] Fatal: ${msg}`)
        if (msg.stack) console.error(`${new Date().toISOString()} [${tag}] ${msg.stack}`)
        process.exit(1)
    })
}

utils.log = (tag) => {
    return ((msg) => {
        console.log(`${new Date().toISOString()} [${tag}]: ${msg}`)
    })
}

const ray = new BN('1' + '0'.repeat(27))
const wad = new BN('1' + '0'.repeat(18))
const big2 = new BN(2)

utils.rmul = (a,b) => {
    return (((new BN(a)).mul(new BN(b))).add(ray.div(big2))).div(ray)
}

utils.wmul = (a,b) => {
    return (((new BN(a)).mul(new BN(b))).add(wad.div(big2))).div(wad)
}

utils.wdiv = (a,b) => {
    return (((new BN(a)).mul(wad)).add((new BN(b)).div(big2))).div(new BN(b))
}

utils.rdiv = (a,b) => {
    return (((new BN(a)).mul(ray)).add((new BN(b)).div(big2))).div(new BN(b))
}

export { utils }
