import { Dispatch, SetStateAction, Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import ApproveStepsModal from '../../global/modal/ApproveStepsModal';

type WholesaleClaimProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};
export const WholesaleClaimModal = ({ open, setOpen }: WholesaleClaimProps) => {
  const [authorized, setAuthorized] = useState<boolean>(true);

  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }

  // const authorize = () => {
  //   setAuthorized(false);
  // };

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
                    Claim Wholesale
                  </Dialog.Title>
                  <hr className='border-white-extraLight mt-8' />

                  <div className='mt-8 w-full'>
                    <div className='text-left'>You will Receive:</div>
                    <div className='flex text-gray-400'>
                      <div className=''>Amount</div>
                      <div className='ml-auto'>Asset B</div>
                    </div>

                    <hr className='border-white mt-8' />
                    <ApproveStepsModal isApproveToken={authorized} title1='Approve' title2='Create Wholesale' />
                    <hr className='border-white' />
                    <div className='mt-8 text-center'>
                      <button
                        type='button'
                        onClick={() => setAuthorized(true)}
                        className={classNames(
                          'text-gray',
                          'px-4 py-2 text-sm font-medium bg-white border border-transparent rounded-md',
                        )}
                      >
                        Claim Wholesale
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
