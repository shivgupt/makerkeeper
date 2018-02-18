import Web3 from 'web3'
import net from 'net'
import daiData from '../contracts/dai'
import topData from '../contracts/top'
import tubData from '../contracts/tub'
import tapData from '../contracts/tap'
import voxData from '../contracts/vox'

const web3 = new Web3(new Web3.providers.IpcProvider(
    '/tmp/ipc/geth.ipc',
    new net.Socket()
))

const mk = {}
mk.dai = new web3.eth.Contract(daiData.abi, daiData.address)
mk.top = new web3.eth.Contract(topData.abi, topData.address)
mk.tub = new web3.eth.Contract(tubData.abi, tubData.address)
mk.tap = new web3.eth.Contract(tapData.abi, tapData.address)
mk.vox = new web3.eth.Contract(voxData.abi, voxData.address)

console.log("*************************************************************************")
for (let prop in mk.dai.methods) { console.log(prop) }
console.log("*************************************************************************")
for (let prop in mk.top.methods) { console.log(prop) }
console.log("*************************************************************************")
for (let prop in mk.tub.methods) { console.log(prop) }
console.log("*************************************************************************")
for (let prop in mk.tap.methods) { console.log(prop) }
console.log("*************************************************************************")
for (let prop in mk.vox.methods) { console.log(prop) }
console.log("*************************************************************************")
