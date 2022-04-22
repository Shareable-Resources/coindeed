import { useState } from 'react';
import { Fragment, Dispatch, SetStateAction } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';

type LendingCreateModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function LendingCreateModal({ open, setOpen }: LendingCreateModalProps) {
  const [authorized, setAuthorized] = useState(false);

  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }

  const nextStep = () => {
    setAuthorized(true);
  };
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='fixed z-10 inset-0 overflow-y-auto' onClose={setOpen}>
        <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
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
            <div className='inline-block align-bottom bg-modal-custom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 lg:max-w-xl'>
              <div className='hidden sm:block absolute top-0 right-0 pt-4 pr-4'>
                <button
                  type='button'
                  className='px-2 py-1 rounded-md text-gray-400 hover:text-red-500'
                  onClick={() => setOpen(false)}
                >
                  <span className='sr-only'>Close</span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
              <div className='sm:flex sm:items-start text-white px-20'>
                <div className='mt-3 text-center'>
                  <Dialog.Title as='h1' className='text-2xl leading-6 font-medium text-white mt-7 mb-5'>
                    Create a Pool
                  </Dialog.Title>
                  <hr />
                  <div className='mt-12 mb-12'>
                    <p className='text-xs italic mx-auto leading-5' style={{ maxWidth: '260px' }}>
                      By supplying liquidity, you'll earn interest based on your share of the pool.
                    </p>
                  </div>
                  <div className='mt-4'>
                    <h2 className='text-left mb-3 text-sm font-semibold text-white'>Add Liquidity</h2>
                    <div className='grid gap-4 grid-cols-2'>
                      <div>
                        <label
                          htmlFor='location'
                          className='block text-left font-medium opacity-70 mb-1'
                          style={{ fontSize: 10 }}
                        >
                          Token
                        </label>
                        <select
                          id='location'
                          name='location'
                          className='block w-full pr-8 p-3 text-xs text-gray border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                          defaultValue='Canada'
                        >
                          <option>ETH</option>
                          <option>BTC</option>
                          <option>DOGE</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor='price' className='block text-left opacity-70 mb-1' style={{ fontSize: 10 }}>
                          Amount
                        </label>
                        <div className='relative rounded-md shadow-sm'>
                          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <span className='text-gray-500 sm:text-sm'>$</span>
                          </div>
                          <input
                            type='text'
                            name='price'
                            id='price'
                            className='p-3 pl-6 pr-12 text-gray text-xs focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md'
                            placeholder='0.00'
                            aria-describedby='price-currency'
                          />
                          <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                            <span className='text-gray-500 sm:text-sm' id='price-currency'>
                              USD
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='mb-14 mt-3 text-xs text-right'>Wallet Balance: 0 ETH</div>

                    <hr className='border-white' />
                    <ApproveStepsModal isApproveToken={authorized} title1='Approve' title2='Create Pool' />
                    <hr className='border-white' />

                    <div className='mt-12 mb-6 text-center'>
                      <button
                        type='button'
                        className={classNames(
                          'text-gray',
                          'px-4 py-2 text-sm font-medium bg-white border border-transparent rounded-md',
                        )}
                        onClick={nextStep}
                      >
                        {!authorized ? 'Approve' : 'Create Pool'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
