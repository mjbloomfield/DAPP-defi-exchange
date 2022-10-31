const { ethers } = require('hardhat')
const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

async function main() {
    // Fetch accounts from wallet - these are unlocked
    const accounts = await ethers.getSigners()

    // Fetch network
    const { chainId } = await ethers.provider.getNetwork()
    console.log("Using chainId:",chainId)

    //Fetch the deployed tokens
    const Dapp = await ethers.getContractAt('Token', config[chainId].Dapp.address)
    console.log(`Token fetched: ${Dapp.address}\n`)

    const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
    console.log(`Token fetched: ${mETH.address}\n`)

    const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
    console.log(`Token fetched: ${mDAI.address}\n`)

    //Fetch the deployed exchange
    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
    console.log(`Exchange fetched: ${exchange.address}\n`)

    // Give tokens to account[1]
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = tokens(10000)

    // user1 transfers 10,000 mETH
    let transaction, result
    transaction = await mETH.connect(sender).transfer(receiver.address, amount)
    console.log(`Transfer ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

    //Set up exchange users
    const user1 = accounts[0]
    const user2 = accounts[1]
    amount = tokens(10000)

    //user1 approves 10,000 Dapp
    transaction = await Dapp.connect(user1).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user1.address}`)
    
    transaction = await exchange.connect(user1).depositToken(Dapp.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} Dapp from ${user1.address}\n`)

    //user2 approves 10,000 mETH
    
    transaction = await mETH.connect(user2).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user1.address}`)
   
    // User 2 deposits mETh
    transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} mETH from ${user1.address}\n`)
    
    //-----------------------
    // Seed a Cancelled Order

    // User 1 makes order to get tokens

    let orderId 
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Dapp.address, tokens(5))
    result = await transaction.wait()
    console.log(`Order placed by ${user1.address}\n`)

    // User 1 cancels order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancelled order from ${user1.address}\n`)

    //Wait 1 Second
    await wait(1)
    
    //------------------
    // Seed Filled orders

    // User1 makes order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Dapp.address, tokens(10))
    result = await transaction.wait()
    console.log(`Order placed by ${user1.address}\n`)

    // User2 fills order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Order filled by ${user2.address}\n`)    

     //Wait 1 Second
     await wait(1)

    // User1 makes second order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), Dapp.address, tokens(15))
    result = await transaction.wait()
    console.log(`Order placed by ${user1.address}\n`)

    // User2 fills second order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Order filled by ${user2.address}\n`)    

     //Wait 1 Second
     await wait(1)

      // User1 makes final order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), Dapp.address, tokens(20))
    result = await transaction.wait()
    console.log(`Order placed by ${user1.address}\n`)

    // User2 fills final order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Order filled by ${user2.address}\n`)    

     //Wait 1 Second
     await wait(1)
//------------------------
// Seed Open Orders
//
    // User 1 makes 10 orders

    for(let i = 1; i <=10; i++) {
      transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10*i), Dapp.address, tokens(10))
      result = await transaction.wait()
      console.log(`Order placed by ${user1.address}\n`)

      //Wait 1 Second
     await wait(1)
    
    }
   
   // User 2 makes 10 orders

   for(let i = 1; i <=10; i++) {
    transaction = await exchange.connect(user2).makeOrder( Dapp.address, tokens(10), mETH.address, tokens(10*i))
    result = await transaction.wait()
    console.log(`Order placed by ${user2.address}\n`)

    //Wait 1 Second
   await wait(1)
  
  }
 


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });