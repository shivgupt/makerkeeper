import fs from 'fs'

////////////////////////////////////////
// Exported object methods
////////////////////////////////////////

// utils for utility
const utils = {}

// print one last message with our dying breath and then exit
utils.die = (tag) => {
    return ((msg) => {
        console.error(`${new Date().toISOString()} [${tag}] Fatal: ${msg}`)
        process.exit(1)
    })
}

utils.log = (tag) => {
    return ((msg) => {
        console.log(`${new Date().toISOString()} [${tag}]: ${msg}`)
    })
}

const log = utils.log('UTIL')
const die = utils.die('UTIL')

export { utils }
