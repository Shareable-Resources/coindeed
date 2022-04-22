import { Dispatch, SetStateAction, useState } from 'react';
import PendingModal from '../../../global/modal/PendingModal';
import { Modal } from 'antd';
import './style.css';
import CustomButton from '../../../global/antd/CustomButton';
import { message } from '../../../global/antd/Message';
import { cancelWholesale } from '../../../../blockchain/services/WholesaleService';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';
import { useDispatch } from 'react-redux';
import { WHOLESALE_CANCELLED } from '../../../../utils/Constants';
// import { WholesalePayWith } from './WholesalePayWith';

type CancelWholesaleModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  saleId: string;
};

export const CancelWholesaleModal = ({ open, setOpen, saleId }: CancelWholesaleModalProps) => {
  const dispatch = useDispatch();
  const [isOpenPendingModal, setIsOpenPendingModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isConfirm, setIsConfirm] = useState(true);
  const [txId, setTxId] = useState<string>('');

  const handleCancel = async () => {
    setIsOpenPendingModal(true);
    const [result, error]: any = await cancelWholesale(saleId);
    if (error) {
      setIsCanceling(false);
      setIsOpenPendingModal(false);

      // show error message from blockchain
      if (error?.error?.message) {
        return message('error', JSON.stringify(error.error.message), Number(JSON.stringify(error.error.code)));
      }

      return message('error', '', error?.code);
    }
    setIsConfirm(false);
    setTxId(result.hash);
    await result.wait(1);
    dispatch({ type: 'SET_WHOLESALE_STATE', payload: WHOLESALE_CANCELLED });
    message('success', 'You have successfully canceled this wholesale.');
    setIsOpenPendingModal(false);
    setIsConfirm(true);
    setIsCanceling(false);
    setOpen(false);
  };

  return (
    <Modal
      className='cancel-wholesale'
      centered
      visible={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      footer={null}
      width={600}
      zIndex={4}
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
          <div className='text-2xl leading-6 font-medium text-white'>Cancel Wholesale</div>
          <div className='hr-tag-fake' />

          <div className='box-cancel mt-5'>
            <p className='first-message'>
              Canceling this wholesale will result in your tokens being returned to account for you to claim.
            </p>
            <p className='second-message mt-6'>Are you sure you want to cancel this wholesale?</p>
          </div>
          <div>
            <ApproveStepsModal isApproveToken={true} title1='Approve' title2='Create Wholesale' />
          </div>
          <div className='mt-8 text-center group-button'>
            <CustomButton customType='cancelButton' onClick={() => setOpen(false)}>
              No, keep
            </CustomButton>
            <CustomButton customType='OkButton' onClick={handleCancel} disabled={isCanceling}>
              {isCanceling ? 'Canceling' : 'Yes, cancel'}
            </CustomButton>
          </div>
        </div>
        {isOpenPendingModal && (
          <PendingModal open={isOpenPendingModal} setOpen={setIsOpenPendingModal} isConfirm={isConfirm} txId={txId} />
        )}
      </div>
    </Modal>
  );
};
