import { Dispatch, SetStateAction, Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import ApproveStepsModal from '../../global/modal/ApproveStepsModal';
type WholesaleReserveProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};
const baseInputClass: string = 'block w-full pr-10 py-2 pl-4 text-black rounded-md border border-black';
export const WholesaleReserveModal = ({ open, setOpen }: WholesaleReserveProps) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [inputClass, setInputClass] = useState<string>(baseInputClass);

  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }

  const authorize = () => {
    setAuthorized(false);
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
            <div className='inline-block align-bottom bg-modal rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6'>
              <div className='hidden sm:block absolute top-0 right-0 pt-4 pr-4'>
                <button
                  type='button'
                  className='bg-modal px-2 py-1 text-white hover:text-red-500'
                  onClick={() => setOpen(false)}
                >
                  <span className='sr-only'>Close</span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
              <div className='sm:flex sm:items-start text-white px-16'>
                <div className='mt-3 text-center'>
                  <Dialog.Title as='h1' className='text-2xl leading-6 font-medium text-white'>
                    Reserve Wholesale
                  </Dialog.Title>

                  <hr className='border-white-extraLight mt-8' />

                  <div className='mt-8'>
                    <div className='text-center mt-8'>Please enter your deed address to reserve this wholesale</div>
                    <div className='mt-8'>
                      <div className='mt-1 relative rounded-md shadow-sm'>
                        <input
                          type='address'
                          name='address'
                          id='address'
                          className={classNames(
                            inputClass,
                            authorized !== null ? (authorized ? '' : 'border-red-500') : '',
                          )}
                          placeholder='Deed Address'
                          aria-invalid='true'
                        />
                        <div className='absolute inset-y-0 right-0 pr-3 flex text-black items-center pointer-events-none'>
                          {authorized !== null ? (
                            <>
                              {authorized ? (
                                <svg
                                  width='20'
                                  height='20'
                                  viewBox='0 0 20 20'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <rect x='0.5' y='0.5' width='19' height='19' rx='9.5' fill='#00AA00' />
                                  <path
                                    d='M8.17794 12.3117L5.80728 9.82401L5 10.6652L8.17794 14L15 6.84116L14.1984 6L8.17794 12.3117Z'
                                    fill='white'
                                  />
                                  <rect x='0.5' y='0.5' width='19' height='19' rx='9.5' stroke='#00AA00' />
                                </svg>
                              ) : (
                                <svg
                                  width='20'
                                  height='20'
                                  viewBox='0 0 20 20'
                                  fill='red'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z'
                                    fill='#D10B0B'
                                  />
                                </svg>
                              )}
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                      {authorized === null ? (
                        <div className='italic text-center text-xs mt-2'>
                          Dont have a Deed set up? Click{' '}
                          <a href='/' className='underline'>
                            here
                          </a>{' '}
                          to create a Deed now.
                        </div>
                      ) : (
                        <div className=''>
                          {authorized ? (
                            <div className='italic text-center text-xs mt-2'>
                              Success! This wholesale is now ready to be reserved for your Deed.
                            </div>
                          ) : (
                            <>
                              <div className='italic text-center text-xs mt-2 mb-8'>
                                Your Deed does not meet the minimum deed amount requirement. Click{' '}
                                <a href='/' className='underline text-white'>
                                  here
                                </a>{' '}
                                to create a new Deed.
                              </div>
                              <div>
                                <div className='text-left italic'>Minimum Deed Requirement</div>
                                <div className='flex text-gray-400'>
                                  <div className=''>Amount</div>
                                  <div className='ml-auto'>DToken</div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <hr className='border-white mt-8' />
                    <ApproveStepsModal
                      isApproveToken={authorized === null ? false : authorized}
                      title1='Approve'
                      title2='Create Wholesale'
                    />
                    <hr className='border-white mb-8' />

                    <div className='mt-8 text-center'>
                      <button
                        type='button'
                        className={classNames(
                          !authorized ? 'bg-white-extraLight' : 'bg-white',
                          'text-gray',
                          'px-4 py-2 text-sm font-medium bg-white border border-transparent rounded-md',
                        )}
                        onClick={authorize}
                      >
                        Reserve
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
};
