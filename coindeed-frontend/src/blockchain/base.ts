import { ethers, providers } from 'ethers';
import { keyWalletInfo } from '../components/global/wallet/WalletButton';
import { getConnectorByName, injected } from '../services/wallet';

export const getProvider = async () => {
  let provider: any = undefined;

  if (keyWalletInfo in localStorage) {
    const WalletInfo = JSON.parse(localStorage.getItem(keyWalletInfo) || '');
    provider = getConnectorByName(WalletInfo.walletName);
  } else {
    provider = injected;
  }

  if (provider) provider = await provider.getProvider();

  return new providers.Web3Provider(provider);
};

export const getContractInstance = async (contractABI: any, contractAddress: any) => {
  const provider = await getProvider();
  const signer = provider?.getSigner();
  const userAddress = await provider.listAccounts();

  return new ethers.Contract(contractAddress, contractABI, userAddress.length ? signer : provider);
};
