import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import copyGradient15x15 from '../../../images/CopyGradient15x15.svg';
import openPageGradient12x12 from '../../../images/OpenPageGradient12x12.svg';
import { useWeb3React } from '@web3-react/core';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { shrinkAddressX } from '../../../utils/Formatters';

type WalletDisconnectProps = {
  onDisconnected: () => void;
};

export default function WalletDisconnect({ onDisconnected }: WalletDisconnectProps) {
  // eslint-disable-next-line
  const [transaction, setTransaction] = useState();
  const { deactivate, account } = useWeb3React();
  const isModalWalletDisconnect = useSelector((state: any) => state.wallet.isModalWalletDisconnect);
  const dispatch = useDispatch();

  const clickDisconnectHandler = () => {
    deactivate();
    onDisconnected();
    closeModal();
  };

  const closeModal = () => {
    dispatch({ type: 'SET_MODAL_WALLET_DISCONNECT', payload: false });
  };

  return (
    <Transition.Root show={isModalWalletDisconnect} as={Fragment}>
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
            <div
              className='w-full inline-block align-bottom bg-background text-white rounded-lg p-10 text-left overflow-hidden shadow-xl transform transition-all'
              style={{ width: '400px' }}
            >
              <div className='absolute top-0 right-0 pt-10 pr-7'>
                <button type='button' className='rounded-md text-white' onClick={() => closeModal()}>
                  <span className='sr-only'>Close</span>
                  <XIcon className='h-6 w-6' aria-hidden='true' />
                </button>
              </div>

              <div className='flex flex-col'>
                <h1 className='font-semibold text-white text-lg lh-22 pb-4 border-b border-white-twoXLight mb-7'>
                  Wallet
                </h1>
                <div className='flex flex-col p-4 border border-white-twoXLight rounded-lg bg-background-2'>
                  <div className='flex mb-25 lh-15'>
                    Connected with MetaMask
                    <div
                      className='italic cursor-pointer ml-auto text-turquoise'
                      onClick={() => clickDisconnectHandler()}
                    >
                      Disconnect
                    </div>
                  </div>
                  <div className='mb-25'>
                    <button
                      className='w-full text-left relative rounded-md shadow-sm border border-white-twoXLight py-2-5 px-15'
                      onClick={() => {
                        if (account) {
                          navigator.clipboard.writeText(account);
                          message.success('Copy successful');
                        }
                      }}
                    >
                      <div className='truncate pr-4'>{shrinkAddressX(`${account}`, 22, 3) || ''}</div>
                      <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                        <img src={copyGradient15x15} alt='copy' />
                      </div>
                    </button>
                  </div>
                  <a
                    href={`https://rinkeby.etherscan.io/address/${account}`}
                    className='flex lh-15 cursor-pointer w-max'
                  >
                    <img src={openPageGradient12x12} alt='open' />
                    <div className='ml-4 text-moneyBlue'>View on Etherscan</div>
                  </a>
                </div>
                {/* <div className='flex flex-col p-4 border border-white-twoXLight rounded-md bg-background-2'>
                  <div className='flex mb-25 lh-15'>
                    Recent Transaction
                    <div
                      className='italic cursor-pointer ml-auto text-turquoise'
                      onClick={() => clickDisconnectHandler()}
                    >
                      Clear all
                    </div>
                  </div>
                  <div className='text-xs text-white-light lh-15'>
                    {transaction ? transaction : 'No transaction to show.'}
                  </div>
                </div> */}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
