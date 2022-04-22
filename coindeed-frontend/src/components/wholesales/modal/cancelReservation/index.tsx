import { Dispatch, SetStateAction, useState } from 'react';
import { message } from 'antd';
import PendingModal from '../../../global/modal/PendingModal';
import { Modal } from 'antd';
import './style.css';
import { CustomInput } from '../../../global/antd/CustomInput';
import CustomButton from '../../../global/antd/CustomButton';
// import { WholesalePayWith } from './WholesalePayWith';

type CancelReservationModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const CancelReservationModal = ({ open, setOpen }: CancelReservationModalProps) => {
  const [isOpenPendingModal, setIsOpenPendingModal] = useState(false);
  const [isConfirm] = useState(true);
  const [txId] = useState<string>('');

  return (
    <Modal
      className='cancel-reservation'
      centered
      visible={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      footer={null}
      width={600}
      maskClosable={false}
      maskStyle={{ background: '#6b7280bf' }}
      closeIcon={
        <button
          type='button'
          className='px-2 py-1 rounded-md text-gray-400 hover:text-red-500 focus:outline-none'
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
      }
    >
      <div className='hidden sm:block absolute top-0 right-0 pt-4 pr-4'></div>
      <div className='sm:items-start text-white'>
        <div className='mt-3'>
          <div className='text-2xl leading-6 font-medium text-white'>Cancel Reservation</div>
          <div className='hr-tag-fake' />
          <div className='mt-10 text-left box-id'>
            <div className='flex'>
              <div className='left'>
                <CustomInput
                  title='Wholesale Contract ID'
                  type='text'
                  classNameCustom='input-address'
                  placeholder='Wholesale ID'
                  disabled={true}
                />
              </div>
              <div className='right text-right copy-address'>
                <svg
                  className='mt-6 cursor-pointer'
                  width='20'
                  height='21'
                  viewBox='0 0 20 21'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  onClick={() => {
                    navigator.clipboard.writeText('xxxxxx');
                    message.success('Copy successful');
                  }}
                >
                  <path
                    d='M11.9998 20.4988H2.00093C1.46507 20.5175 0.945532 20.3127 0.566391 19.9336C0.18725 19.5545 -0.0174533 19.0349 0.0011681 18.4991V8.50023C-0.0174533 7.96437 0.18725 7.44483 0.566391 7.06569C0.945532 6.68655 1.46507 6.48185 2.00093 6.50047H6.00047V2.50093C5.98185 1.96507 6.18655 1.44553 6.56569 1.06639C6.94483 0.68725 7.46437 0.482547 8.00023 0.501168H17.9991C18.5349 0.482547 19.0545 0.68725 19.4336 1.06639C19.8127 1.44553 20.0175 1.96507 19.9988 2.50093V12.4998C20.0172 13.0355 19.8124 13.5549 19.4333 13.934C19.0542 14.3131 18.5348 14.5179 17.9991 14.4995H13.9995V18.4991C14.0179 19.0348 13.8131 19.5542 13.434 19.9333C13.0549 20.3124 12.5355 20.5172 11.9998 20.4988ZM2.00093 8.50023V18.4991H11.9998V14.4995H8.00023C7.46446 14.5179 6.94509 14.3131 6.56602 13.934C6.18695 13.5549 5.98215 13.0355 6.00047 12.4998V8.50023H2.00093ZM8.00023 2.50093V12.4998H17.9991V2.50093H8.00023Z'
                    fill='url(#paint0_linear_5898_810)'
                  />
                  <defs>
                    <linearGradient
                      id='paint0_linear_5898_810'
                      x1='-8.90529e-07'
                      y1='0.243595'
                      x2='22.6799'
                      y2='3.98103'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stop-color='#00BEDF' />
                      <stop offset='1' stop-color='#0068B3' />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          <div className='box-message-cancel mt-5'>
            <p>Are you sure you want to cancel this Wholesale reservation?</p>
          </div>
          <div className='mt-8 text-center'>
            <CustomButton customType='OkButton'>Cancel Reservation</CustomButton>

            {isOpenPendingModal && (
              <PendingModal
                open={isOpenPendingModal}
                setOpen={setIsOpenPendingModal}
                isConfirm={isConfirm}
                txId={txId}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
