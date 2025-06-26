import React, { useState, useEffect } from 'react';
import TokenFactoryABI from './TokenFactoryABI.json';
import './App.css';
import WalletConnectProvider from "@walletconnect/web3-provider";
import web3 from './web3'; // Import your custom web3 instance

const TOKEN_FACTORY_ADDRESS = "0xB4720A23EB43487ABe7DE48D205d174D7eA0f4D5";

const App = () => {
    const [account, setAccount] = useState('');
    const [factoryContract, setFactoryContract] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [initialSupply, setInitialSupply] = useState('');

    useEffect(() => {
        const init = async () => {
            // Initialize the factory contract
            const factoryInstance = new web3.eth.Contract(
                TokenFactoryABI,
                TOKEN_FACTORY_ADDRESS
            );
            setFactoryContract(factoryInstance);

            // Automatically get accounts if connected
            if (window.ethereum) {
                const accounts = await web3.eth.getAccounts();
                if (accounts.length > 0) setAccount(accounts[0]);
            }
        };
        init();
    }, []);

    const connectWallet = async () => {
        const provider = new WalletConnectProvider({
            rpc: {
                71117: "https://rpc-testnet.wadzchain.io", // Chain ID and RPC URL
            },
        });

        // Enable session (QR Code modal)
        await provider.enable();

        // Set WalletConnect as the provider for web3
        web3.setProvider(provider);

        // Get accounts
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        // Handle WalletConnect session close
        provider.on("disconnect", () => {
            setAccount(null);
        });
    };

    const createToken = async () => {
        if (!factoryContract || !account) return;

        try {
            await factoryContract.methods
                .createToken(tokenName, tokenSymbol, initialSupply)
                .send({
                    from: account,
                    gasPrice: await web3.eth.getGasPrice(),
                });

            alert("Token created successfully!");
        } catch (error) {
            console.error("Error creating token:", error);
            alert("Token creation failed!");
        }
    };

    const getTokensByOwner = async () => {
        if (!factoryContract) return;

        try {
            const tokensList = await factoryContract.methods.getTokensByOwner(account).call();
            setTokens(tokensList);
        } catch (error) {
            console.error("Error fetching tokens:", error);
        }
    };

    return (
        <div className="app">
            <nav className="navbar">
                <a href="/" className="logo">DagZilla's Token Factory</a>
                <button className="connect-wallet-button" onClick={connectWallet}>
                    {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
                </button>
            </nav>

            <div className="container">
                <h1>Deploy Your Token</h1>
                {account && <p>Connected Wallet: {account.slice(0, 6)}...{account.slice(-4)}</p>}

                <div className="form">
                    <input
                        type="text"
                        placeholder="Token Name"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Token Symbol"
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Initial Supply"
                        value={initialSupply}
                        onChange={(e) => setInitialSupply(e.target.value)}
                    />
                    <button onClick={createToken}>Create Token</button>
                </div>

                <h2>Your Deployed Tokens</h2>
                <button onClick={getTokensByOwner}>Fetch Tokens</button>
                <ul className="token-list">
                    {tokens.map((token, index) => (
                        <li key={index}>
                            <strong>Name:</strong> {token.name}, <strong>Symbol:</strong> {token.symbol},
                            <strong> Contract:</strong>
                            <a href={`https://scan-testnet.wadzchain.io/address/${token.tokenAddress}`} target="_blank" rel="noopener noreferrer">
                                {token.tokenAddress}
                            </a>
                            <button
                                className="copy-button"
                                onClick={() => navigator.clipboard.writeText(token.tokenAddress)}
                            >
                                Copy Address
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default App;

