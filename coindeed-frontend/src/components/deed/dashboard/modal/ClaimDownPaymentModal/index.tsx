import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Modal } from 'antd';
import './style.css';
import { message as mes } from '../../../../global/antd/Message';
import { claimBalance, getAmountDownPayTokenUserJoined } from '../../../../../blockchain/services/DeedService';
import CustomButton from '../../../../global/antd/CustomButton';
import { DeedContractAddressInfo } from '../modalComponents';
import ApproveStepsModal from '../../../../global/modal/ApproveStepsModal';

type ClaimDownPaymentModalProps = {
  isOpenClaimDownPaymentModal: boolean;
  toggleClaimDownPaymentModal: any;
  setIsOpenPendingModal: Dispatch<SetStateAction<boolean>>;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  setTxId: Dispatch<SetStateAction<string>>;
  deedAddress: string;
  deed: any;
  queryDeed: any;
};

export default function ClaimDownPaymentModal({
  isOpenClaimDownPaymentModal,
  toggleClaimDownPaymentModal,
  setIsOpenPendingModal,
  setIsConfirm,
  setTxId,
  deedAddress,
  deed,
  queryDeed,
}: ClaimDownPaymentModalProps) {
  const [amountUserJoined, setAmountUserJoined] = useState(0);

  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const [authorized] = useState(true);

  const handleClaimBalance = async () => {
    setIsOpenPendingModal(true);

    const [result, error]: any = await claimBalance(deedAddress);

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
    toggleClaimDownPaymentModal();
    queryDeed();
    mes('success', 'You have successfully claimed balance!');
  };

  useEffect(() => {
    const showAmountUserJoined = async () => {
      const [result]: any = await getAmountDownPayTokenUserJoined(deedAddress, userAddress, deed?.coinA);
      setAmountUserJoined(result);
    };
    showAmountUserJoined();
    // checkUserApproveERC20Token(deedAddress);
  }, [deedAddress, deed?.coinA, userAddress]);

  return (
    <Modal
      className='cancel-modal'
      centered
      visible={isOpenClaimDownPaymentModal}
      onOk={toggleClaimDownPaymentModal}
      onCancel={toggleClaimDownPaymentModal}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      maskStyle={{ background: '#6b7280bf' }}
      closeIcon={
        <button
          type='button'
          className='mt-7 mr-4 px-2 py-1 rounded-md text-gray-400 hover:text-red-500 focus:outline-none'
          onClick={toggleClaimDownPaymentModal}
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
      <div className='sm:items-start text-white justify-center'>
        <div className='mb-8'>
          <div className='text-2xl leading-6 font-semibold text-white'>Claim Down Payment</div>
        </div>
        <div className='mb-7 hr-line'></div>
        <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg p-20px mb-20px'>
          <DeedContractAddressInfo deedContractAddress={deed?.deedAddress} />
        </div>
        <div
          className='text-center bg-background-2 rounded-lg border border-opacity-20'
          style={{ padding: '20px 60px' }}
        >
          <div className='box-container mb-6'>
            <div className='title'>Total Down Payment</div>
            <div className='content'>{`${amountUserJoined} ${deed?.coinAName}`}</div>
          </div>
          <div className='flex items-center text-xs font-semibold'>
            <p className='mb-0 w-max'>You will receive:</p>
            <p className='mb-0 flex-1 text-right'>{`${amountUserJoined} ${deed?.coinAName}`}</p>
          </div>
        </div>
        <div className='mt-7 hr-line'></div>
        <div className='px-16'>
          <ApproveStepsModal isApproveToken={authorized} title1='Approve' title2='Claim Down Payment' />
        </div>
        <div className='flex justify-center items-center mt-5'>
          <CustomButton customType='OkButton' onClick={handleClaimBalance}>
            Claim
          </CustomButton>
        </div>
      </div>
    </Modal>
  );
}
