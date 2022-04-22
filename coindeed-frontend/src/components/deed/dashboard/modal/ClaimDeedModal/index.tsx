import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Modal } from 'antd';
import './style.css';
import { message as mes } from '../../../../global/antd/Message';
import {
  claimBalance,
  getAmountDownPayTokenUserJoined,
  getBalanceOfTokenB,
  getTotalJoinedDownPayment,
} from '../../../../../blockchain/services/DeedService';
import CustomButton from '../../../../global/antd/CustomButton';
import { DeedContractAddressInfo } from '../modalComponents';
import ApproveStepsModal from '../../../../global/modal/ApproveStepsModal';
import { convertBigNumberValueToNumber, getTokenDecimalsV2 } from '../../../../../blockchain/utils';
import { genDeedContract } from '../../../../../blockchain/instance';

type ClaimDeedModalProps = {
  isOpenClaimDeedModal: boolean;
  toggleClaimDeedModal: any;
  setIsOpenPendingModal: Dispatch<SetStateAction<boolean>>;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  setTxId: Dispatch<SetStateAction<string>>;
  deedAddress: string;
  deed: any;
  queryDeed: any;
  supplyAmount: number; // current user supplied
};

export default function ClaimDeedModal({
  isOpenClaimDeedModal,
  toggleClaimDeedModal,
  setIsOpenPendingModal,
  setIsConfirm,
  setTxId,
  deedAddress,
  deed,
  queryDeed,
  supplyAmount, // current user supplied
}: ClaimDeedModalProps) {
  // eslint-disable-next-line
  const [amountUserJoined, setAmountUserJoined] = useState(0);
  const [totalSupply, setTotalSupply] = useState<any>();
  const [tokenAAmount, setTokenAAmount] = useState<any>(0);

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
    toggleClaimDeedModal();
    queryDeed();
    mes('success', 'You have successfully claimed balance!');
  };

  useEffect(() => {
    const showAmountUserJoined = async () => {
      const [result]: any = await getAmountDownPayTokenUserJoined(deedAddress, userAddress, deed?.coinA);
      setAmountUserJoined(result);
    };

    const getTotalSup = async () => {
      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);
      const [response]: any = await getTotalJoinedDownPayment(deed.deedAddress);
      if (response !== null && typeof response === 'object' && parseFloat(response?.toString()) > 0) {
        return setTotalSupply(convertBigNumberValueToNumber(response, decimalA));
      }
    };

    const checkBalanceOfTokenA = async () => {
      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);
      const [response]: any = await getBalanceOfTokenB(deed.deedAddress, deed.coinA);

      if (response !== null && typeof response === 'object' && parseFloat(response?.toString()) > 0) {
        setTokenAAmount(convertBigNumberValueToNumber(response, decimalA));
      }
    };

    showAmountUserJoined();
    getTotalSup();
    checkBalanceOfTokenA();
    // checkUserApproveERC20Token(deedAddress);
    //eslint-disable-next-line
  }, [deedAddress, deed?.coinA, userAddress]);

  const [currentValueState, setCurrentValueState] = useState<any>(0);
  const [managementFeeState, setManagementFeeState] = useState<any>(0);
  const [willReceive, setWillReceive] = useState<any>(0);

  useEffect(() => {
    const processData = async () => {
      const deedInstance = await genDeedContract(deedAddress);
      const totalFee = await deedInstance.totalFee();
      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);

      const managementFee = (supplyAmount * deed?.managementFee) / 100;
      const currentValue = supplyAmount - managementFee;
      const percentJoin = supplyAmount / totalSupply;
      const totalA = (tokenAAmount - convertBigNumberValueToNumber(totalFee, decimalA)) * percentJoin;
      const youWillReceive = totalA.toString();
      const splitData = youWillReceive.split('.');

      setCurrentValueState(currentValue);
      setManagementFeeState(managementFee);
      if (splitData.length > 1 && splitData[1].length > 2) {
        setWillReceive(splitData[0] + '.' + splitData[1].slice(0, 2));
      } else setWillReceive(youWillReceive);
    };
    processData();
    // eslint-disable-next-line
  }, [tokenAAmount, deed, totalSupply, isOpenClaimDeedModal]);

  return (
    <Modal
      className='cancel-modal'
      centered
      visible={isOpenClaimDeedModal}
      onOk={toggleClaimDeedModal}
      onCancel={toggleClaimDeedModal}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      maskStyle={{ background: '#6b7280bf' }}
      closeIcon={
        <button
          type='button'
          className='mt-7 mr-4 px-2 py-1 rounded-md text-gray-400 hover:text-red-500 focus:outline-none'
          onClick={toggleClaimDeedModal}
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
          <div className='text-2xl leading-6 font-semibold text-white'>Claim Deed</div>
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
            <div className='title'>Current Value of Initial Payment</div>
            <div className='content'>{`${currentValueState} ${deed?.coinAName}`}</div>
          </div>
          <div className='box-container mb-6'>
            <div className='title'>Management Fee</div>
            <div className='content'>{`${managementFeeState} ${deed?.coinAName}`}</div>
          </div>
          <div className='flex items-center text-xs font-semibold'>
            <p className='mb-0 w-max'>You will receive:</p>
            <p className='mb-0 flex-1 text-right'>{`${willReceive} ${deed?.coinAName}`}</p>
          </div>
        </div>
        <div className='mt-7 hr-line'></div>
        <div className='px-16'>
          <ApproveStepsModal isApproveToken={authorized} title1='Approve' title2='Claim Deed' />
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
