import { Dispatch, SetStateAction } from 'react';
import { DeedContractAddressInfo, ModalHorizontalRule, ModalMainHeader } from './modalComponents';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';
import { Modal } from 'antd';
import { message as mes } from '../../../global/antd/Message';
import { handleWithDrawTotalStake } from '../../../../blockchain/services/DeedService';
import CloseModal from '../../../../images/icons/CloseModal.svg';

type ClaimModalProps = {
  deed: any;
  isOpenClaimStakingModal: boolean;
  toggleClaimStakingModal: any;
  setIsOpenPendingModal: Dispatch<SetStateAction<boolean>>;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  setTxId: Dispatch<SetStateAction<string>>;
  amountStaked: any;
  queryDeed: any;
};

export default function ClaimStakingModal({
  deed,
  isOpenClaimStakingModal,
  toggleClaimStakingModal,
  setIsOpenPendingModal,
  setIsConfirm,
  setTxId,
  amountStaked,
  queryDeed,
}: ClaimModalProps) {
  const handleClaimBalance = async () => {
    setIsOpenPendingModal(true);

    const [result, error]: any = await handleWithDrawTotalStake(deed?.deedAddress);
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
    toggleClaimStakingModal();
    queryDeed();
    mes('success', 'You have successfully claimed Dtoken!');
  };

  return (
    <Modal
      className='claim'
      centered
      visible={isOpenClaimStakingModal}
      onOk={toggleClaimStakingModal}
      onCancel={toggleClaimStakingModal}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      closeIcon={
        <img
          className='absolute top-40px right-40px'
          onClick={toggleClaimStakingModal}
          src={CloseModal}
          alt='exit'
          width='12px'
          height='12px'
        />
      }
    >
      <ModalMainHeader title='Claim Staking' />
      <ModalHorizontalRule />
      <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg p-20px mb-20px'>
        <DeedContractAddressInfo deedContractAddress={deed?.deedAddress} />
      </div>
      <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg py-20px px-60px mb-20px'>
        <div className='box-container'>
          <div className='title'>Total Staking</div>
          <div className='content'> {amountStaked + ' Dtoken'}</div>
        </div>
        <div className='box-container mt-6'>
          <div className='supper-title'>You will receive:</div>
        </div>
        <div className='box-container mt-2'>
          <div className='title'>Amount</div>
          <div className='content'> {amountStaked + ' Dtoken'}</div>
        </div>
      </div>

      <ModalHorizontalRule />
      <div className='m-auto w-400px'>
        <ApproveStepsModal isApproveToken={true} title2={'Claim DToken'} />
      </div>
      <div className='mt-4 button-group'>
        <button
          className='text-white text-modal-button w-87px h-37px bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue  w-87px rounded-lg font-semibold'
          onClick={handleClaimBalance}
        >
          Claim
        </button>
      </div>
    </Modal>
  );
}
