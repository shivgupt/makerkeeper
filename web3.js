import Web3 from 'web3'
import net from 'net'

const web3 = new Web3(new Web3.providers.IpcProvider(
    '/tmp/ipc/geth.ipc',
    new net.Socket()
))

web3.eth.getAccounts(console.log)
