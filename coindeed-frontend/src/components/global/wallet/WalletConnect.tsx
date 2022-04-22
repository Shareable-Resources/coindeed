import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import WalletConnectType from './WalletConnectType';
import Loader from '../../../images/loader.svg';
import LogoDeedToken from '../../../images/LogoDeedToken.png';
import ImgChecked from '../../../images/Check.svg';
import { getConnectorByName } from '../../../services/wallet';
import { typeWalletInfo } from './WalletButton';
import { LIST_WALLET } from '../../../utils/Constants';
import { useWeb3React } from '@web3-react/core';
import { useDispatch, useSelector } from 'react-redux';

type WalletConnectProps = {
  onConnected: any;
};

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false);
  const [connectedToWallet, setConnectedToWallet] = useState(false);
  const [connectInfo, setConnectInfo] = useState<typeWalletInfo>({ walletName: '', walletIcon: '' });
  const { activate, error } = useWeb3React();
  const listWallet = (() => Object.keys(LIST_WALLET).map((key: string) => (LIST_WALLET as any)[key]))();
  const isModalWalletConnect = useSelector((state: any) => state.wallet.isModalWalletConnect);
  const dispatch = useDispatch();

  const connectWallet = async (data: typeWalletInfo) => {
    try {
      if (connecting) return;

      setConnecting(true);
      setConnectInfo(data);
      const connector = getConnectorByName(data.walletName);
      if (connector) await activate(connector);

      setTimeout(() => {
        setConnectedToWallet(true);
        onConnected(data);
      }, 500);
      setTimeout(() => {
        closeModal();
      }, 2500);
    } catch (error) {
      setConnecting(false);
    }
  };

  const closeModal = () => {
    dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: false });
  };

  /*  */

  useEffect(() => {
    if (!isModalWalletConnect) {
      setTimeout(() => {
        setConnecting(false);
        setConnectedToWallet(false);
        setConnectInfo({ walletName: '', walletIcon: '' });
      }, 1000);
    }
  }, [isModalWalletConnect]);

  useEffect(() => {
    if (error) {
      // message('error', getErrorMessage(error));
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <Transition.Root show={isModalWalletConnect} as={Fragment}>
      <Dialog as='div' className='fixed z-10 inset-0 overflow-y-auto' onClose={() => closeModal()}>
        <div className='flex justify-center items-center min-h-screen pt-4 px-4 text-center'>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Dialog.Overlay className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            enterTo='opacity-100 translate-y-0 sm:scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 translate-y-0 sm:scale-100'
            leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          >
            <div className='w-full md:w-1/2 xl:w-1/3  inline-block align-bottom bg-background rounded-lg p-10 text-left overflow-hidden shadow-xl transform transition-all'>
              <div className='flex items-center justify-between mb-8 text-white'>
                <h1 className='text-current font-semibold text-2xl mb-0'>
                  {connectedToWallet ? 'Success!' : 'Connect a Wallet'}
                </h1>

                <button type='button' className='bg-transparent rounded-md text-current' onClick={() => closeModal()}>
                  <span className='sr-only'>Close</span>
                  <XIcon className='h-6 w-6' aria-hidden='true' />
                </button>
              </div>

              <hr className='border-opacity-20 mb-7' />

              <div className='px-14 pt-10 pb-7 bg-background-2 rounded-lg border border-white border-opacity-20'>
                {!connecting ? (
                  listWallet.map(wallet => (
                    <WalletConnectType name={wallet.name} img={wallet.icon} connect={connectWallet} />
                  ))
                ) : (
                  <>
                    {connectedToWallet ? (
                      <div className='flex flex-row justify-center items-center space-x-2'>
                        <div className='bg-transparent p-2 rounded-2xl w-20 h-20 mr-3'>
                          <img src={LogoDeedToken} className='w-full' draggable='false' loading='lazy' alt='' />
                        </div>
                        <span className='w-5 h-1 bg-white rounded' />
                        <span className='w-5 h-1 bg-white rounded' />
                        <span className='w-5 h-1 bg-white rounded' />
                        <img src={ImgChecked} className='w-12 h-12 mx-3' draggable='false' loading='lazy' alt='' />
                        <span className='w-5 h-1 bg-white rounded' />
                        <span className='w-5 h-1 bg-white rounded' />
                        <span className='w-5 h-1 bg-white rounded' />
                        <div className='bg-transparent p-2 rounded-2xl w-20 h-20 ml-3'>
                          <img
                            src={connectInfo.walletIcon}
                            className='w-full h-full'
                            draggable='false'
                            loading='lazy'
                            alt=''
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className='flex items-center border border-white border-opacity-20 rounded-lg text-sm text-white py-2 px-6 mb-6'>
                          <img className='animate-spin mr-4' src={Loader} alt='loading' />
                          <div className='flex-1'>Initializing....</div>
                        </div>
                        <WalletConnectType
                          name={connectInfo.walletName}
                          img={connectInfo.walletIcon}
                          connect={() => {}}
                        />
                      </>
                    )}
                  </>
                )}
                <div className='text-center text-white text-sm mt-8'>
                  {connectedToWallet ? (
                    'Your wallet is now connected.'
                  ) : (
                    <>
                      By connecting your wallet, you agree to
                      <br /> Coindeed's{' '}
                      <a className='text-blue-500' href='https://coindeed.io/terms' target='_blank' rel="noreferrer">
                        Terms of Services.
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
