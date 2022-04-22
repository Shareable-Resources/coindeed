import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import PendingModal from '../../../global/modal/PendingModal';
import { Modal } from 'antd';
import './style.css';
import CustomButton from '../../../global/antd/CustomButton';
import { cancelWholesale, claimWholesale } from '../../../../blockchain/services/WholesaleService';
import { message } from '../../../global/antd/Message';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';
import { convertBigNumberValueToNumber, getTokenDecimalsV2, getTokenSymbol } from '../../../../blockchain/utils';
import _ from 'lodash';

type ClaimWholesaleModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  wholesale: any;
};

export const ClaimWholesaleModal = ({ open, setOpen, wholesale }: ClaimWholesaleModalProps) => {
  const dispatch = useDispatch();
  const [isOpenPendingModal, setIsOpenPendingModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState<any>('--');
  const [amountUsed, setAmountUsed] = useState<any>('--');
  const [willReceive, setWillReceive] = useState<any>('--');
  const [symbolOffer, setSymbolOffer] = useState<any>('--');
  const [isClaiming, setIsClaiming] = useState(false);
  const [isConfirm, setIsConfirm] = useState(true);
  const [txId, setTxId] = useState<string>('');
  const endDate = moment.unix(wholesale.deadline);
  const diffTime = moment().diff(endDate) * -1;

  const handleClaim = async () => {
    setIsOpenPendingModal(true);
    const [result, error]: any = await claimWholesale(wholesale.saleId);
    if (error) {
      setIsClaiming(false);
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
    dispatch({ type: 'SET_WHOLESALE_STATE', payload: wholesale.status + 1 });
    message('success', 'You have successfully claimed this wholesale.');
    setIsOpenPendingModal(false);
    setIsConfirm(true);
    setIsClaiming(false);
    setOpen(false);
  };

  const handleCancel = async () => {
    setIsOpenPendingModal(true);
    const [result, error]: any = await cancelWholesale(wholesale.saleId);
    if (error) {
      setIsClaiming(false);
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
    message('success', 'You have successfully claimed this wholesale.');
    setIsOpenPendingModal(false);
    setIsConfirm(true);
    setIsClaiming(false);
    setOpen(false);
  };

  useEffect(() => {
    const processData = async () => {
      const [decimalTokenOffer]: any = await getTokenDecimalsV2(wholesale?.tokenOffered);
      const [decimalRequest]: any = await getTokenDecimalsV2(wholesale?.tokenRequested);
      const receivedAmount = convertBigNumberValueToNumber(wholesale?.receivedAmount, decimalRequest);
      const wholesaleToken = convertBigNumberValueToNumber(wholesale?.offeredAmount, decimalTokenOffer);
      const requestToken = convertBigNumberValueToNumber(wholesale?.requestedAmount, decimalRequest);
      const pricePer = requestToken / wholesaleToken;
      const receiveTokenOffer = wholesaleToken - receivedAmount / pricePer;
      const [tokenOffer] = await getTokenSymbol(wholesale?.tokenOffered);
      const [tokenRequest] = await getTokenSymbol(wholesale?.tokenRequested);
      setTotalAmount(wholesaleToken);
      setAmountUsed(receivedAmount / pricePer);
      setWillReceive(
        `${
          receiveTokenOffer === 0 ? '' : receiveTokenOffer + ' ' + tokenOffer + ' /'
        } ${receivedAmount} ${tokenRequest}`,
      );
      setSymbolOffer(tokenOffer);
    };
    if (!_.isEmpty(wholesale)) processData();
  }, [wholesale]);

  return (
    <Modal
      className='claim-wholesale'
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
          <div className='text-2xl leading-6 font-medium text-white'>Claim Wholesale</div>
          <div className='hr-tag-fake' />

          <div className={`box-claim mt-5 ${diffTime < 0 ? 'height-normal' : ''}`}>
            <div className='content-line'>
              <p className='content-title'>Total Wholesale Amount</p>
              <p className='content-amount'>
                {totalAmount} {symbolOffer}
              </p>
            </div>
            {diffTime > 0 && (
              <div className='content-line'>
                <p className='content-title'>Total Amount Used</p>
                <p className='content-amount'>{amountUsed}</p>
              </div>
            )}
            <div className='content-line mt-3'>
              <p className='content-amount'>You will receive:</p>
              <p className='content-amount'>{willReceive}</p>
            </div>
          </div>
          <div>
            <ApproveStepsModal isApproveToken={true} title1='Approve' title2='Create Wholesale' />
          </div>
          <div className='mt-8 text-center'>
            <CustomButton customType='OkButton' onClick={diffTime > 0 ? handleClaim : handleCancel}>
              {isClaiming ? 'Claiming' : 'Claim'}
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
