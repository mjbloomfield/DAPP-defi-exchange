
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import config from '../config.json';
import { loadProvider,
        loadNetwork,
        loadAccount,
        loadTokens,
        loadExchange

       } from '../store/interactions';


function App() {

    const dispatch = useDispatch()

    const loadBlockchainData = async () => {
        
      // Connect Ethers to blockchain
      const provider = loadProvider(dispatch)

      //Fetch current nework's chainId (e.g. hardhat: 31337, kovan: 42)
      const chainId = await loadNetwork(provider, dispatch)

      //Fetch current account & balance from Metamask
      const account = await loadAccount(provider, dispatch)
      console.log('account address = ' + account)
          
      // Load Token Smart Contract
      const Dapp = config[chainId].Dapp
      const mETH = config[chainId].mETH
      await loadTokens(provider, [Dapp.address, mETH.address], dispatch)
      
    // Load exchange contract
      const exchangeConfig = config[chainId].exchange
      await loadExchange(provider, exchangeConfig.address, dispatch)

    }

    useEffect(() => {
      loadBlockchainData()
    })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
