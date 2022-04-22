import { Dispatch, SetStateAction } from 'react';
import { Modal } from 'antd';
import './style/style.css';
import CustomButton from '../antd/CustomButton';

type PendingModalProps = {
  open: boolean;
  isConfirm: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  txId?: string;
};

export default function PendingModal({ open, isConfirm, setOpen, txId }: PendingModalProps) {
  return (
    <Modal
      centered
      visible={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      footer={null}
      width={600}
      maskClosable={false}
      zIndex={5}
      bodyStyle={{ padding: 0 }}
      closeIcon={
        <div
          className='px-2 py-1 rounded-md text-gray-400 hover:text-red-500 focus:outline-none relative top-7'
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
        </div>
      }
    >
      <div className='text-white p-10 bg-background rounded-lg'>
        <div className='text-2xl leading-6 font-medium text-white'>
          {isConfirm ? 'Pending Confirmation' : 'Transaction Pending'}
        </div>

        <hr className='opacity-20 mt-8 mb-7' />

        <div className='text-center'>
          <div className='bg-background-2 border border-white border-opacity-20 rounded-lg p-8'>
            <div className='lds-default'>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className='mt-11'>
              {isConfirm ? 'Please confirm your transaction.' : 'Your transaction is being processed.'}
            </div>
          </div>

          {!isConfirm ? (
            <>
              <hr className='opacity-20 my-5' />
              <a href={`https://rinkeby.etherscan.io/tx/${txId}`} target='_blank' rel='noreferrer'>
                <CustomButton customType='OkButton'>View on Etherscan</CustomButton>
              </a>
            </>
          ) : (
            ''
          )}
        </div>
      </div>
    </Modal>
  );
}
