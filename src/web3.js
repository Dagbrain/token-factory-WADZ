// src/web3.js
import Web3 from 'web3';

const CHAIN_ID = 71117;
const RPC_URL = 'https://rpc-testnet.wadzchain.io';
const CURRENCY_SYMBOL = 'WCO';

let web3;

// Check if user is on the correct network
const switchNetwork = async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: Web3.utils.toHex(CHAIN_ID) }]
            });
        } catch (switchError) {
            // Network has not been added, so add it
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: Web3.utils.toHex(CHAIN_ID),
                            chainName: 'WadzChain Testnet',
                            nativeCurrency: {
                                name: 'Wadz Testnet Token',
                                symbol: CURRENCY_SYMBOL,
                                decimals: 18
                            },
                            rpcUrls: [RPC_URL],
                            blockExplorerUrls: ['https://scan-testnet.wadzchain.io']
                        }
                    ]
                });
            }
        }
        web3 = new Web3(window.ethereum);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
    }
};

await switchNetwork();
export default web3;
