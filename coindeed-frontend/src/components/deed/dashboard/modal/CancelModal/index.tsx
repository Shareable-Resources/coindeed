import { Dispatch, SetStateAction } from 'react';
import { DeedContractAddressInfo, ModalHorizontalRule, ModalMainHeader } from '../modalComponents';
import { Modal } from 'antd';
import './style.css';
import { cancelDeed } from '../../../../../blockchain/services/DeedService';
import { message as mes } from '../../../../global/antd/Message';
import ApproveStepsModal from '../../../../global/modal/ApproveStepsModal';

type CancelModalProps = {
  deed: any;
  isOpenCancelModal: boolean;
  toggleCancelModal: any;
  setIsOpenPendingModal: Dispatch<SetStateAction<boolean>>;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  setTxId: Dispatch<SetStateAction<string>>;
  currentDtokenStaked: any;
  queryDeed: any;
};

export default function CancelModal({
  deed,
  isOpenCancelModal,
  toggleCancelModal,
  setIsOpenPendingModal,
  setIsConfirm,
  setTxId,
  currentDtokenStaked,
  queryDeed,
}: CancelModalProps) {
  const handleCancelDeed = async () => {
    setIsOpenPendingModal(true);

    const [result, error]: any = await cancelDeed(deed?.deedAddress);
    if (error) {
      mes('error', '', error?.code);
      setIsOpenPendingModal(false);
      return;
    }
    setIsConfirm(false);
    setTxId(result.hash);
    await result.wait(1);
    setIsConfirm(true);
    setIsOpenPendingModal(false);
    toggleCancelModal();
    queryDeed();
    mes('success', 'You have successfully canceled deed');
  };

  return (
    <Modal
      className='cancel-modal'
      centered
      visible={isOpenCancelModal}
      onOk={toggleCancelModal}
      onCancel={toggleCancelModal}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      maskStyle={{ background: '#6b7280bf' }}
      closeIcon={
        <button
          type='button'
          className='px-2 py-1 rounded-md text-gray-400 hover:text-red-500 focus:outline-none'
          onClick={toggleCancelModal}
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
      <ModalMainHeader title='Cancel Deed' />

      <ModalHorizontalRule />

      <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg p-20px mb-20px'>
        <DeedContractAddressInfo deedContractAddress={deed?.deedAddress} />
      </div>

      {currentDtokenStaked > 0 ? (
        <p className='bg-background-2 text-center flex justify-center text-modal-message text-white border border-opacity-20 rounded-lg py-20px px-60px mb-20px'>
          {currentDtokenStaked > 0 && 'Once you cancel this Deed, your staking can be claimed from your account.'}
          <br /> &nbsp; <br />
          Are you sure you want to cancel this deed?
        </p>
      ) : (
        <p className='bg-background-2 text-center flex justify-center text-modal-message text-white border border-opacity-20 rounded-lg py-20px px-60px mb-20px'>
          Are you sure you want to cancel this deed?
        </p>
      )}

      <ModalHorizontalRule />

      <div className='m-auto w-400px'>
        <ApproveStepsModal isApproveToken={true} title2={'Cancel Deed'} />
      </div>

      <div className='mt-4 text-center'>
        <div>
          <button
            className='text-white text-modal-button w-120px h-37px text-modal-button px-4 py-2 text-sm font-medium bg-primary-3 rounded-lg'
            onClick={toggleCancelModal}
          >
            No, Keep
          </button>
          <button
            className='text-white text-modal-button w-120px h-37px text-modal-button  py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue mx-16px rounded-lg'
            onClick={handleCancelDeed}
          >
            Yes, cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
