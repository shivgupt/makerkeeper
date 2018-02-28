import Web3 from 'web3'
import net from 'net'
import daiData from '../contracts/dai'
import topData from '../contracts/top'
import tubData from '../contracts/tub'
import tapData from '../contracts/tap'
import voxData from '../contracts/vox'
import oasisData from '../contracts/oasis'
import wethData from '../contracts/weth'
import pethData from '../contracts/peth'
import fs from 'fs'

const web3 = new Web3(new Web3.providers.IpcProvider(
    process.env.ETH_PROVIDER,
    new net.Socket()
))

const mk = {}
mk.dai = new web3.eth.Contract(daiData.abi, daiData.address)
mk.top = new web3.eth.Contract(topData.abi, topData.address)
mk.tub = new web3.eth.Contract(tubData.abi, tubData.address)
mk.tap = new web3.eth.Contract(tapData.abi, tapData.address)
mk.vox = new web3.eth.Contract(voxData.abi, voxData.address)
mk.oasis = new web3.eth.Contract(oasisData.abi, oasisData.address)
mk.weth = new web3.eth.Contract(wethData.abi, wethData.address)
mk.peth = new web3.eth.Contract(pethData.abi, pethData.address)

export { mk, web3 }
