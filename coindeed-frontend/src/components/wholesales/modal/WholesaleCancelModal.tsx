import { Dispatch, SetStateAction, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type WholesaleCancelProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const WholesaleCancelModal = ({ open, setOpen }: WholesaleCancelProps) => {
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
              <div className='text-white px-16'>
                <div className='mt-3 text-center'>
                  <Dialog.Title as='h1' className='text-2xl leading-6 font-medium text-white'>
                    Cancel Wholesale
                  </Dialog.Title>
                  <hr className='border-white-extraLight mt-8' />

                  <div className='mt-8 text-center text-sm'>
                    <div className='italic text-white font-light mb-4'>
                      Canceling this wholesale will result in your tokens being returned to your wallet.
                    </div>
                    <div className='italic text-white font-light mb-4'>
                      Are you sure you want to cancel this wholesale?
                    </div>
                    <div className='mt-8 text-center flex justify-center'>
                      <button
                        type='button'
                        className='ml-4 px-6 py-2 text-xs border-2 border-white rounded-md'
                        onClick={() => setOpen(false)}
                      >
                        No, keep
                      </button>
                      <button
                        type='button'
                        className='ml-4 px-6 py-2 text-xs border-2 bg-white border-white text-black rounded-md'
                        onClick={() => setOpen(false)}
                      >
                        Yes, cancel
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
