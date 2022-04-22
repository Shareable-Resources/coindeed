import { useState, Dispatch, SetStateAction } from 'react';
import { DeedContractAddressInfo, ModalHorizontalRule, ModalMainHeader } from './modalComponents';
import { Modal } from 'antd';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';

import CloseModal from '../../../../images/icons/CloseModal.svg';
import { triggerDeedToOpenStatus } from '../../../../blockchain/services/DeedService';
import { message } from '../../../global/antd/Message';
import { BLOCKCHAIN_ERROR_MESSAGE } from '../../../../utils/Constants';

type ExecuteDeedModalProps = {
  deed: any;
  isOpenExecuteDeedModal: boolean;
  toggleExecuteDeedModal: any;
  setIsOpenPendingModal: any;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  isOpenPendingModal: boolean;
  setTxId: Dispatch<SetStateAction<string>>;
  queryDeed: any;
};
export const ExecuteDeedModal = ({
  deed,
  isOpenExecuteDeedModal,
  toggleExecuteDeedModal,
  setIsOpenPendingModal,
  setIsConfirm,
  setTxId,
  queryDeed,
}: ExecuteDeedModalProps) => {
  const [authorize] = useState(true);

  const handleTriggerDeed = async () => {
    setIsOpenPendingModal(true);
    const [result, error]: any = await triggerDeedToOpenStatus(deed?.deedAddress);
    if (error) {
      setIsOpenPendingModal(false);
      // show error message from blockchain
      if (error?.error?.message) {
        let messageError = error?.error?.message;
        if (messageError === BLOCKCHAIN_ERROR_MESSAGE.NOT_ENOUGH_BUY_IN.blockChainError) {
          messageError = BLOCKCHAIN_ERROR_MESSAGE.NOT_ENOUGH_BUY_IN.message;
        }
        if (messageError === BLOCKCHAIN_ERROR_MESSAGE.NOT_ENOUGH_LIQUIDITY.blockChainError) {
          messageError = BLOCKCHAIN_ERROR_MESSAGE.NOT_ENOUGH_LIQUIDITY.message;
        }
        return message('error', messageError || error?.message);
      }
      return message('error', '', error?.code);
    }

    setIsConfirm(false);
    setTxId(result?.hash);
    await result?.wait(1);
    setIsConfirm(true);
    setIsOpenPendingModal(false);
    toggleExecuteDeedModal();
    queryDeed();

    message('success', 'You have successfully triggered deed to OPEN state!');
  };
  return (
    <Modal
      className='close-escrow'
      centered
      visible={isOpenExecuteDeedModal}
      onOk={toggleExecuteDeedModal}
      onCancel={toggleExecuteDeedModal}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      maskStyle={{ background: '#6b7280bf' }}
      closeIcon={
        <img
          className='absolute top-40px right-40px'
          onClick={toggleExecuteDeedModal}
          src={CloseModal}
          alt='close'
          width='12px'
          height='12px'
        />
      }
    >
      <ModalMainHeader title='Execute Deed' />
      <ModalHorizontalRule />

      <div className='bg-background-2 flex flex-col border border-opacity-20 rounded-lg p-20px mb-20px'>
        <DeedContractAddressInfo deedContractAddress={deed?.deedAddress} />
      </div>

      <p className='bg-background-2 text-center flex justify-center text-modal-message text-white border border-opacity-20 rounded-lg py-20px px-60px mb-20px '>
        You are executing this Deed from Escrow to Open earlier than it is configured to end.
        <br /> &nbsp; <br />
        Are you sure you want to execute this Deed?
      </p>
      <ModalHorizontalRule />
      <div className='m-auto w-400px'>
        <ApproveStepsModal isApproveToken={authorize} title2='Execute Deed' />
      </div>

      <div className='mt-4 text-center'>
        <button
          type='button'
          className='text-white text-modal-button px-4 py-2 text-sm font-medium bg-primary-3 w-120px h-37px rounded-lg'
          onClick={toggleExecuteDeedModal}
        >
          No, cancel
        </button>
        <button
          type='button'
          className='text-white text-modal-button px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue ml-16px w-120px h-37px rounded-lg font-semibold'
          onClick={handleTriggerDeed}
        >
          Yes, execute
        </button>
      </div>
    </Modal>
  );
};
