import { Dispatch, SetStateAction, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useHistory } from 'react-router-dom';

type DeedBrokersModalProps = { open: boolean; setOpen: Dispatch<SetStateAction<boolean>>; brokers: string[] };
export const DeedBrokersModal = ({ open, setOpen, brokers }: DeedBrokersModalProps) => {
  const history = useHistory();
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
            <div className='bg-modal w-auto inline-block px-10 py-10 overflow-y-auto text-left align-middle transition-all transform  shadow-xl rounded-2xl'>
              <div className='sm:flex sm:items-start text-white'>
                <div>
                  <div className='flex'>
                    <Dialog.Title as='h1' className='text-2xl leading-6 font-medium text-white text-left'>
                      Brokers
                    </Dialog.Title>
                    <button
                      type='button'
                      className='bg-modal -mt-2 px-2 pb-1 ml-auto mb-auto rounded-md text-gray-400 hover:text-red-500'
                      onClick={() => setOpen(false)}
                    >
                      <span className='sr-only'>Close</span>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6 text-white flex'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </button>
                  </div>
                  <hr className='border-white-extraLight mt-4 mb-7' />

                  <div className='border border-white-twoXLight rounded-md py-5 pr-5'>
                    <div
                      className=' px-5 slim-scroll-modal overflow-y-auto scrolling-auto'
                      style={{ maxHeight: '120px' }}
                    >
                      {brokers.map(broker => (
                        <div
                          onClick={() => history.push(`/brokers/:${broker}`)}
                          className='text-xs lh-15 mb-2-5 border-b border-white cursor-pointer'
                          title='Click to Copy'
                        >
                          {broker}
                        </div>
                      ))}
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
