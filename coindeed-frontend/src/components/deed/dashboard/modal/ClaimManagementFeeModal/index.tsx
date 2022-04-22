import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { Modal } from 'antd';
import './style.css';
import { message as mes } from '../../../../global/antd/Message';
import { handleWithDrawTotalStake } from '../../../../../blockchain/services/DeedService';
import CustomButton from '../../../../global/antd/CustomButton';
import { genDaoContract, genDeedContract, genDeedFactoryContract } from '../../../../../blockchain/instance';
import {
  convertBigNumberValueToNumber,
  convertPriceToBigDecimals,
  getTokenDecimalsV2,
} from '../../../../../blockchain/utils';
import { TOKEN_TYPES } from '../../../../../utils/Constants';
import { DeedContractAddressInfo } from '../modalComponents';
import ApproveStepsModal from '../../../../global/modal/ApproveStepsModal';

type ClaimManagementFeeModalProps = {
  isOpenClaimManagementFeeModal: boolean;
  toggleClaimManagementFeeModal: any;
  setIsOpenPendingModal: Dispatch<SetStateAction<boolean>>;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  setTxId: Dispatch<SetStateAction<string>>;
  deedAddress: string;
  currentDtokenStaked: any;
  totalAmountCurrentlyStaking: any;
  downpaymentToken: string;
  queryDeed: any;
};

export default function ClaimManagementFeeModal({
  isOpenClaimManagementFeeModal,
  toggleClaimManagementFeeModal,
  setIsOpenPendingModal,
  setIsConfirm,
  setTxId,
  deedAddress,
  currentDtokenStaked,
  totalAmountCurrentlyStaking,
  downpaymentToken,
  queryDeed,
}: ClaimManagementFeeModalProps) {
  const [managementFeeEarned, setManagementFeeEarned] = useState(0);
  const [authorized] = useState(true);

  useEffect(() => {
    const calculateManagemeneFeeEarned = async () => {
      const rateDtokenStaked = currentDtokenStaked / totalAmountCurrentlyStaking;

      const deedInstance = await genDeedContract(deedAddress);
      const totalFee = await deedInstance.totalFee();

      const [downpaymentTokenDecimal]: any = await getTokenDecimalsV2(downpaymentToken);

      const formatedTotalFee = convertBigNumberValueToNumber(totalFee, Number(downpaymentTokenDecimal));

      const deedFactoryInstance = await genDeedFactoryContract();
      let platformFee = await deedFactoryInstance.platformFee();
      platformFee = Number(platformFee) / 10000;

      const amountFeeDownPaymentToken = rateDtokenStaked * formatedTotalFee;
      const roundNumberAmountFeeDownPaymentToken = amountFeeDownPaymentToken.toFixed(4);

      const formatedValue = convertPriceToBigDecimals(
        Number(roundNumberAmountFeeDownPaymentToken),
        Number(downpaymentTokenDecimal),
      );

      const daoInstance = await genDaoContract();
      const result = await daoInstance.getCoinDeedManagementFee(downpaymentToken, formatedValue);
      const formattedResult = convertBigNumberValueToNumber(result, TOKEN_TYPES.DTOKEN.decimal);

      const amountPlatFormFee = formattedResult * platformFee;
      const managementFeeEarnValue = formattedResult - amountPlatFormFee;

      setManagementFeeEarned(Number(managementFeeEarnValue.toFixed(6)));
    };

    if (currentDtokenStaked && totalAmountCurrentlyStaking) {
      calculateManagemeneFeeEarned();
    }
  }, [currentDtokenStaked, deedAddress, downpaymentToken, totalAmountCurrentlyStaking]);
  const handleClaimBalance = async () => {
    setIsOpenPendingModal(true);

    const [result, error]: any = await handleWithDrawTotalStake(deedAddress);
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
    toggleClaimManagementFeeModal();
    queryDeed();
    mes('success', 'You have successfully claimed management fee!');
  };

  return (
    <Modal
      className='cancel-modal'
      centered
      visible={isOpenClaimManagementFeeModal}
      onOk={toggleClaimManagementFeeModal}
      onCancel={toggleClaimManagementFeeModal}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      maskStyle={{ background: '#6b7280bf' }}
      closeIcon={
        <button
          type='button'
          className='mt-7 mr-4 px-2 py-1 rounded-md text-gray-400 hover:text-red-500 focus:outline-none'
          onClick={toggleClaimManagementFeeModal}
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
          <div className='text-2xl leading-6 font-semibold text-white'>Claim Management Fee</div>
        </div>
        <div className='mb-7 hr-line'></div>
        <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg p-20px mb-20px'>
          <DeedContractAddressInfo deedContractAddress={deedAddress} />
        </div>
        <div
          className='text-center bg-background-2 rounded-lg border border-opacity-20'
          style={{ padding: '20px 60px' }}
        >
          <div className='box-container mb-2'>
            <div className='title'>Staking Amount</div>
            <div className='content'>{`${currentDtokenStaked} DToken`}</div>
          </div>
          <div className='box-container mb-6'>
            <div className='title'>Management Fee Earned</div>
            <div className='content'>{`${managementFeeEarned} Dtoken`}</div>
          </div>
          <div className='flex items-center text-xs font-semibold'>
            <p className='mb-0 w-max'>You will receive:</p>
            <p className='mb-0 flex-1 text-right'>{currentDtokenStaked + managementFeeEarned + ' Dtoken'}</p>
          </div>
        </div>
        <div className='mt-7 hr-line'></div>
        <div className='px-16'>
          <ApproveStepsModal isApproveToken={authorized} title1='Approve' title2='Claim Management Fee' />
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
