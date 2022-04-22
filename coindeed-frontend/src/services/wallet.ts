import { ethers } from 'ethers';
import Web3 from 'web3';
import { getProvider } from '../blockchain/base';
import { UnsupportedChainIdError } from '@web3-react/core';
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import {
  WalletConnectConnector,
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
} from '@web3-react/walletconnect-connector';
import { LIST_WALLET } from '../utils/Constants';

export const addTokenToMetaMask = async (
  address: any,
  symbol: string,
  decimals: number,
  image: string,
  silent = false,
) => {
  if (!window.ethereum) {
    return undefined;
  }
  const provider = new Web3(Web3.givenProvider);
  await provider.givenProvider.request({
    method: 'metamask_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address,
        symbol,
        decimals,
        // image,
      },
    },
    id: 20,
  });
};

export async function connectWallet(silent = false) {
  if (!window.ethereum) {
    return undefined;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  if (!silent) {
    // Prompt user for account connections
    // await provider.send('eth_requestAccounts', []);
  }

  return provider;
}

export async function disconnectWallet(silent = false) {
  const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  if (!window.ethereum) {
    return undefined;
  }
  if (!silent) {
    // Prompt user for account connections
    await provider.send('eth_requestAccounts', []);
  }

  return provider;
}

// export async function test(silent = false) {
//   const provider = await connectWallet(silent);
//   if (!provider) {
//     return undefined;
//   }
//   const signer = provider.getSigner();
//   if (!signer) return { connected: false };
//   const address = await signer.getAddress();
//   const blockNumber = await provider.getBlockNumber();
//   const balance = await provider.getBalance('ethers.eth');

//   return { address, blockNumber, balance };
// }

export async function listAccounts() {
  const provider = await connectWallet(true);
  if (!provider) {
    return [];
  }
  const accounts = await provider.listAccounts();
  return accounts;
}

/*  */

// Connecting with MetaMask
export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });

const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213',
  4: 'https://rinkeby.infura.io/v3/84842078b09946638c03157f83405213',
};
export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  qrcode: true,
});

/*  */

export function getConnectorByName(name: string) {
  if (name === LIST_WALLET.Metamask.name) return injected;
  if (name === LIST_WALLET.WalletConnect.name) return walletconnect;
  return undefined;
}

export async function getListAccounts() {
  const provider = await getProvider();
  return provider?.listAccounts();
}

export function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop.';
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return 'Please authorize this website to access your Ethereum account.';
  } else {
    console.error(error);
    return 'An unknown error occurred. Check the console for more details.';
  }
}

export async function loginRequired() {
  const provider = await getProvider();
  if (window.ethereum) return await provider.send('eth_requestAccounts', []);
  return;
}
