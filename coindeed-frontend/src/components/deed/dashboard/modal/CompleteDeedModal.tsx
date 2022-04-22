import { Dispatch, SetStateAction } from 'react';
import { DeedContractAddressInfo, ModalHorizontalRule, ModalMainHeader } from './modalComponents';
import { Modal } from 'antd';
import { handleCompleteDeed } from '../../../../blockchain/services/DeedService';
import { message as CustomMessage } from '../../../global/antd/Message';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';

import CloseModal from '../../../../images/icons/CloseModal.svg';

type CompleteDeedModalProps = {
  deed: any;
  isOpenCompleteDeedModal: boolean;
  toggleCompleteDeedModal: any;
  setIsOpenPendingModal: Dispatch<SetStateAction<boolean>>;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  setTxId: Dispatch<SetStateAction<string>>;
  queryDeed: any;
};
export const CompleteDeedModal = ({
  deed,
  isOpenCompleteDeedModal,
  toggleCompleteDeedModal,
  setIsOpenPendingModal,
  setIsConfirm,
  setTxId,
  queryDeed,
}: CompleteDeedModalProps) => {
  const handleDeedManagerCompleteDeed = async () => {
    setIsOpenPendingModal(true);

    const [result, error]: any = await handleCompleteDeed(deed?.deedAddress);

    if (error) {
      CustomMessage('error', '', error?.code);
      setIsOpenPendingModal(false);
      return;
    }
    setIsConfirm(false);
    setTxId(result.hash);
    await result.wait(1);
    setIsConfirm(true);
    setIsOpenPendingModal(false);
    toggleCompleteDeedModal();
    queryDeed();
    CustomMessage('success', 'You have successfully completed this deed');
  };

  return (
    <Modal
      className='complete-deed'
      centered
      visible={isOpenCompleteDeedModal}
      onOk={toggleCompleteDeedModal}
      onCancel={toggleCompleteDeedModal}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      closeIcon={
        <img
          className='absolute top-40px right-40px'
          onClick={toggleCompleteDeedModal}
          src={CloseModal}
          alt='close'
          width='12px'
          height='12px'
        />
      }
    >
      <ModalMainHeader title='Complete Deed' />
      <ModalHorizontalRule />

      <div className='bg-background-2 flex flex-col border border-opacity-20 rounded-lg p-20px mb-20px'>
        <DeedContractAddressInfo deedContractAddress={deed?.deedAddress} />
      </div>

      <p className='bg-background-2 flex justify-center text-modal-message text-white border border-opacity-20 rounded-lg py-20px px-65px mb-20px'>
        Are you sure you want to complete this Deed?
      </p>

      <ModalHorizontalRule />
      <div className='m-auto w-400px'>
        <ApproveStepsModal isApproveToken={true} title2={'Complete Deed'} />
      </div>

      <div className='mt-4 text-center'>
        <button
          type='button'
          className='text-white text-modal-button px-4 py-2 text-sm font-medium bg-primary-3 w-145px h-37px rounded-lg font-semibold'
          onClick={toggleCompleteDeedModal}
        >
          No, cancel
        </button>

        <button
          type='button'
          className='text-white text-modal-button px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue ml-16px w-145px h-37px rounded-lg font-semibold'
          onClick={handleDeedManagerCompleteDeed}
        >
          Yes, complete
        </button>
      </div>
    </Modal>
  );
};
