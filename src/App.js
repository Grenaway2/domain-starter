import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import {ethers} from "ethers";
import  Domains from './utils/Domains.json';

// Constants
const TWITTER_HANDLE = 'WhitneyGrenaway';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = '.poly';
const CONTRACT_ADDRESS = '0xdFD249D7c7Be8B4d755455F911eD5104bf3a2C1E';

const App = () => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [domain, setDomain] = useState('');
    const [record, setRecord] = useState('');

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }
            
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.log('Make sure you have metamask!');
            return;
        } else {
            console.log('We have the ethereum object', ethereum);
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log('Found an authorized account:', account);
            setCurrentAccount(account);
        } else {
            console.log('No authorized account found');
        }
    };

    const mintDomain = async () => {
        if (!domain) { return }
        if (domain.length < 3) {
            alert('Domain must be at least 3 characters long');
            return;
        }
        const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
        console.log("Minting domain", domain, "with price", price);
      try {
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, Domains.abi, signer);
    
            console.log("Going to pop wallet now to pay gas...")
          let tx = await contract.register(domain, {value: ethers.utils.parseEther(price)});
          const receipt = await tx.wait();
    
            if (receipt.status === 1) {
                console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
                
                tx = await contract.setRecord(domain, record);
                await tx.wait();

                console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
                
                setRecord('');
                setDomain('');
            }
            else {
                alert("Transaction failed! Please try again");
            }
        }
      }
      catch(error){
        console.log(error);
      }
    }

    const renderNotConnectedContainer = () => (
        <div className="connect-wallet-container">
            <img src="https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif" alt="Ninja donut gif" />
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
                Connect Wallet
            </button>
        </div>
    );
    
    const renderInputForm = () =>{
        return (
            <div className="form-container">
                <div className="first-row">
                    <input
                        type="text"
                        value={domain}
                        placeholder='domain'
                        onChange={e => setDomain(e.target.value)}
                    />
                    <p className='tld'> {tld} </p>
                </div>

                <input
                    type="text"
                    value={record}
                    placeholder='Description'
                    onChange={e => setRecord(e.target.value)}
                />

                <div className="button-container">
                    <button className='cta-button mint-button' onClick={mintDomain}>
                        Mint
                    </button>  
                </div>

            </div>
        );
    }
  
    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <header>
                        <div className="left">
                            <p className="title">Poly Minting Service</p>
                            <p className="subtitle">Mint A Domain on the Polygon test network!</p>
                        </div>
                    </header>
                </div>
                
                {!currentAccount && renderNotConnectedContainer()}
                {currentAccount && renderInputForm()}
                
                <div className="footer-container">
                    <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
                    <a
                        className="footer-text"
                        href={TWITTER_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >{`@${TWITTER_HANDLE}`}</a>
                </div>
            </div>
        </div>
    );
};

export default App;

