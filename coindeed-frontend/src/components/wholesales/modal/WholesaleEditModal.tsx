import { Dispatch, SetStateAction, Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { WholesaleCreateRadio } from './create/WholesaleCreateRadio';
import { Wholesale } from '../dashboard/WholesaleTable';
import { parse } from 'date-fns';
import { DateSelect } from '../../deed/dashboard/modal/modalComponents';
import ApproveStepsModal from '../../global/modal/ApproveStepsModal';

type WholesaleEditModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  wholesale: Wholesale;
};

export const WholesaleEditModal = ({ open, setOpen, wholesale }: WholesaleEditModalProps) => {
  const [authorized, setAuthorized] = useState<boolean>(false);

  // inputs
  const [priv, setPriv] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [deedAddress, setDeedAddress] = useState<string | undefined>();
  const [minimumReq, setMinimumReq] = useState<number | undefined>();

  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }

  const authorize = () => {
    console.log(endDate, deedAddress, minimumReq);
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
            <div className='inline-block align-bottom bg-modal rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6'>
              <div className='hidden sm:block absolute top-0 right-0 pt-4 pr-4'>
                <button
                  type='button'
                  className='bg-modal px-2 py-1 text-gray-400 hover:text-red-500'
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
                    Edit Wholesale
                  </Dialog.Title>

                  <hr className='border-white-extraLight mt-8' />

                  <div className='mt-8'>
                    <div className='mt-4 flex flex-col'>
                      <label htmlFor='price' className='mb-2 block text-sm text-left font-xs text-white'>
                        End Date
                      </label>
                      <div className='mr-auto'>
                        <DateSelect
                          valid={true}
                          initialDate={endDate}
                          handleSelectMenuChange={(event: Date) => {
                            setEndDate(event);
                          }}
                          value='mm-dd-yyyy'
                        />
                      </div>

                      {/* <div className='mt-1 relative rounded-md shadow-sm'>
                          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <span className='text-gray-500 sm:text-sm'>$</span>
                          </div>
                          <input
                            type='text'
                            name='price'
                            id='price'
                            className='text-gray   block w-full pl-7 pr-12  border-gray-300 rounded-md'
                            placeholder='0.00'
                            aria-describedby='price-currency'
                            value={`${wholesaleEndDate.getDay()}/${wholesaleEndDate.getMonth()}/${wholesaleEndDate.getFullYear()}`}
                            onChange={event => setEndDate(new Date(event.target.value))}
                          />
                          <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                            <span className='text-gray-500 sm:text-sm' id='price-currency'>
                              USD
                            </span>
                          </div>
                        </div> */}
                    </div>
                    <div className='label text-left mt-8'>Wholesale Type</div>
                    <div className='flex flex-col md:flex-row items-start md:items-center justify-center mb-6'>
                      <WholesaleCreateRadio priv={priv} setPriv={setPriv} />
                      {wholesale.reservedTo && (
                        <div className='w-full'>
                          <div className='relative rounded-md shadow-sm'>
                            <input
                              type='text'
                              name='price'
                              id='price'
                              className='text-gray block w-full pl-4 pr-12  border-gray-300 rounded-md'
                              placeholder='Deed Address'
                              aria-describedby='price-currency'
                              value={wholesale.offeredBy}
                              onChange={event => setDeedAddress(event.target.value)}
                            />
                            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                              <span className='text-gray-500 sm:text-sm' id='price-currency'>
                                Required
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className='grid grid-cols-1 mb-8 sm:grid-cols-2'>
                      <div className='text-xs truncate flex items-center'>Minimum Deed Requirement</div>
                      <div>
                        <div className='relative rounded-md shadow-sm'>
                          <input
                            type='email'
                            name='email'
                            id='email'
                            className='flex block w-full pr-10 text-black sm:text-sm rounded-md'
                            placeholder='0'
                            value={'123'}
                            onChange={event => setMinimumReq(parseInt(event.target.value))}
                          />

                          <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                            <span className='text-gray-500 sm:text-sm' id='price-currency'>
                              {wholesale.tokenOffered}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className='border-white' />
                    <ApproveStepsModal isApproveToken={authorized} title1='Approve' title2='Edit  Wholesale' />
                    <hr className='border-white' />
                    <div className='mt-8 text-center'>
                      <button
                        type='button'
                        className={classNames(
                          'text-gray',
                          'px-4 py-2 text-sm font-medium bg-white border border-transparent rounded-md',
                        )}
                        onClick={authorize}
                      >
                        {!authorized ? <>Update</> : <>Update Wholesale</>}
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
