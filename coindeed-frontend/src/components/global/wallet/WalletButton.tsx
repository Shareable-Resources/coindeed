import { useEffect, useState } from 'react';
import WalletConnect from './WalletConnect';
import WalletDisconnect from './WalletDisconnect';
import { getConnectorByName } from '../../../services/wallet';
import { useWeb3React } from '@web3-react/core';
import { useDispatch } from 'react-redux';
import WalletChainNetwork from './WalletChainNetwork';

export type typeWalletInfo = {
  walletName: string;
  walletIcon: string;
};

export const keyWalletInfo = 'walletInfo';
export const keyAccount = 'account';

export const WalletButton = () => {
  const { account, active, activate } = useWeb3React();
  const [iconWallet, setIconWallet] = useState('');
  const dispatch = useDispatch();

  /*  */

  const formatAccount = (account: string) => {
    return `${account.substr(0, 5)}...${account.substr(-3)}`;
  };

  const setShowConnectModal = (value: boolean) => {
    dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: value });
  };
  const setShowDisconnectModal = (value: boolean) => {
    dispatch({ type: 'SET_MODAL_WALLET_DISCONNECT', payload: value });
  };

  /*  */

  const walletConnected = (data: typeWalletInfo) => {
    setIconWallet(data.walletIcon);
    localStorage.setItem(keyWalletInfo, JSON.stringify({ ...data }));
  };

  const walletDisconnected = () => {
    localStorage.removeItem(keyAccount);
    localStorage.removeItem(keyWalletInfo);
  };

  /*  */

  useEffect(() => {
    const localWalletInfo = localStorage.getItem(keyWalletInfo);
    if (!localWalletInfo) return;
    const walletInfo = JSON.parse(localWalletInfo) as typeWalletInfo;

    setIconWallet(walletInfo.walletIcon);
    const connector = getConnectorByName(walletInfo.walletName);
    if (connector) activate(connector);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: 'SET_USER_ADDRESS', payload: account });

    if (account) {
      localStorage.setItem(keyAccount, account);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <>
      <button
        className='inline-flex bg-secondary bg-opacity-30 items-center px-3  text-sm leading-4 font-medium rounded-lg shadow-sm text-white w-auto md:w-40'
        style={{ padding: '6px 10px', height: 'fit-content' }}
        onClick={() => {
          !active && !account ? setShowConnectModal(true) : setShowDisconnectModal(true);
        }}
      >
        <div className='flex items-center w-full'>
          {active && account && <img className='h-6 w-6' src={iconWallet} alt='' />}

          {active && account ? (
            <div className='text-center w-full'>{formatAccount(account)}</div>
          ) : (
            <div className='px-3 py-1 w-full text-center'>Connect Wallet</div>
          )}
        </div>
      </button>

      <WalletConnect onConnected={walletConnected} />

      <WalletDisconnect onDisconnected={walletDisconnected} />

      <WalletChainNetwork />
    </>
  );
};
