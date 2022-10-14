const { ethers } = require('hardhat');
const { expect } = require("chai");

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', () => {
	let token, accounts, deployer, receiver, exchange
	
	beforeEach(async ()=> {
//Fetch Token from Blockchain
	const Token = await ethers.getContractFactory('Token')
	token = await Token.deploy('Dapp University', 'DAPP', '1000000')
	accounts = await ethers.getSigners()
	deployer = accounts[0]
	receiver = accounts[1]
	exchange = accounts[2] 
	})

describe('Deployment', () => {
	const name = 'Dapp University'
	const symbol = 'DAPP'
	const decimals = '18'
	const totalSupply = tokens('1000000')

	it('has the correct name', async () => {
		expect(await token.name()).to.equal(name)
	})

	it('has the correct symbol', async () => {
		expect(await token.symbol()).to.equal(symbol)
	})

	it('has the correct decimals', async () => {
		expect(await token.decimals()).to.equal(decimals)
	})

	it('has the correcttotal supply', async () => {
		expect(await token.totalSupply()).to.equal(totalSupply)
	})
	
	it('assigns total supply to deployer', async () => {
		expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
	})
})

describe('Sending Tokens', () => {
	let amount, transactions, result

	describe('Success', () =>{
		beforeEach(async () => {
		amount = tokens(100)

		})
		it('transfers token balances', async () => {
			//log balance before transfer
			//console.log("deployer balance before transfer", await token.balanceOf(deployer.address))
			//console.log("receiver balance before transfer", await token.balanceOf(receiver.address))

			//transfer tokens
		
			transaction = await token.connect(deployer).transfer(receiver.address, amount)
			result = await transaction.wait()

			expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
			expect(await token.balanceOf(receiver.address)).to.equal(amount)

			//log balance after transfer
			//console.log("deployer balance after transfer", await token.balanceOf(deployer.address))
			//console.log("receiver balance after transfer", await token.balanceOf(receiver.address))
			//Ensure that tokens were transferred (balance changed)
		})

		it('emits a Transfer Event', async () => {
			const event = result.events[0]
			//console.log(event)
			expect(event.event).to.equal('Transfer')

			const args = event.args
			expect(args.from).to.equal(deployer.address)
			expect(args.to).to.equal(receiver.address)
			expect(args.value).to.equal(amount)

		})

	})
	
	describe('Failure', () => {
		it('rejects insufficient balances', async () => {
			//transfer more tokens than deployer has
			const invalidAmount = tokens(100000000);
			await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
		})
		
		it('rejects invalid recipient', async () => {
			const amount = tokens(100)
        	await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
		})

	
	})

describe('Approving Tokens', () => {
	let amount, transactions, result

	beforeEach(async () => {
		amount = tokens(100)
		transaction = await token.connect(deployer).approve(exchange.address, amount)
		result = await transaction.wait()
	})

	describe('Success', () => { 
			it('allocated an allowance for delegated taken spending', async () =>{
			  expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
			})
			
			it('emits a Approval Event', async () => {
			const event = result.events[0]
			//console.log(event)
			expect(event.event).to.equal('Approval')

			const args = event.args
			expect(args.owner).to.equal(deployer.address)
			expect(args.spender).to.equal(exchange.address)
			expect(args.value).to.equal(amount)

			})

	})

	describe('Failure', () =>{

		it('rejects invalid spenders', async () => {
			await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
		})

		})
	})
})

})

