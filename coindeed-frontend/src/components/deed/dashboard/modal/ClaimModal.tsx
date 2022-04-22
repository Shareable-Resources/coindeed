import { Dispatch, SetStateAction } from 'react';
import { DeedContractAddressInfo, ModalHorizontalRule, ModalMainHeader } from './modalComponents';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';
import { Modal } from 'antd';
import { message as mes } from '../../../global/antd/Message';
import { claimBalance } from '../../../../blockchain/services/DeedService';
import CloseModal from '../../../../images/icons/CloseModal.svg';

type ClaimModalProps = {
  deed: any;
  isClaimModalToggled: boolean;
  toggleClaimModal: any;
  setIsOpenPendingModal: Dispatch<SetStateAction<boolean>>;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  setTxId: Dispatch<SetStateAction<string>>;
};

export default function ClaimModal({
  deed,
  isClaimModalToggled,
  toggleClaimModal,
  setIsOpenPendingModal,
  setIsConfirm,
  setTxId,
}: ClaimModalProps) {
  const handleClaimBalance = async () => {
    setIsOpenPendingModal(true);

    const [result, error]: any = await claimBalance(deed?.deedAddress);
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
    toggleClaimModal();
    mes('success', 'You have successfully claim balance!');
  };

  return (
    <Modal
      className='claim'
      centered
      visible={isClaimModalToggled}
      onOk={toggleClaimModal}
      onCancel={toggleClaimModal}
      footer={null}
      width={600}
      maskClosable={false}
      closeIcon={
        <img
          className='absolute top-40px right-40px'
          onClick={toggleClaimModal}
          src={CloseModal}
          alt='exit'
          width='12px'
          height='12px'
        />
      }
    >
      {deed?.passedEscrow ? (
        <ModalMainHeader title='Claim Management Fee' />
      ) : (
        <ModalMainHeader title='Claim Down Payment' />
      )}

      <ModalHorizontalRule />

      <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg p-20px mb-20px'>
        <DeedContractAddressInfo deedContractAddress={deed?.deedAddress} />
      </div>

      {deed?.passedEscrow ? (
        <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg py-20px px-60px mb-20px'>
          <div className='box-container'>
            <div className='title'>Staking Amount</div>
            <div className='content'>X DToken</div>
          </div>
          <div className='box-container mt-2'>
            <div className='title'>Management Fee Earned</div>
            <div className='content'>X DToken</div>
          </div>
          <div className='box-container mt-6'>
            <div className='supper-title'>You will receive:</div>
          </div>
          <div className='box-container mt-2'>
            <div className='title'>Amount</div>
            <div className='content'>X DToken</div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg py-20px px-60px mb-20px'>
          <div className='box-container'>
            <div className='title'>Total Down Payment</div>
            <div className='content'>X {deed?.coinBName}</div>
          </div>
          <div className='box-container mt-6'>
            <div className='supper-title'>You will receive:</div>
          </div>
          <div className='box-container mt-2'>
            <div className='title'>Amount</div>
            <div className='content'>X {deed?.coinBName}</div>
          </div>
        </div>
      )}
      <ModalHorizontalRule />
      <div className='m-auto w-400px'>
        {deed?.passedEscrow ? (
          <ApproveStepsModal isApproveToken={true} title2={'Claim Fee'} />
        ) : (
          <ApproveStepsModal isApproveToken={true} title2={'Claim Down Payment'} />
        )}
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
