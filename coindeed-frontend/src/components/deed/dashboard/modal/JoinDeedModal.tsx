import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';

import { DeedContractAddressInfo, ModalHorizontalRule, ModalMainHeader } from './modalComponents';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';
import { message } from '../../../global/antd/Message';
import { Input, Button, Modal } from 'antd';

import { buyInDepositTokenForDeed } from '../../../../blockchain/services/DeedService';
import { BLOCKCHAIN_ERROR_MESSAGE, TOKEN_TYPES } from '../../../../utils/Constants';

import { validateNumber } from './inputValidation';
import {
  convertPriceToBigDecimals,
  handleUserApproveToken,
  isUserApprovedToken,
  getTokenDecimalsV2,
  getBalanceOfUser,
  convertBigNumberValueToNumber,
  getETHBalance,
} from '../../../../blockchain/utils';

import CloseModal from '../../../../images/icons/CloseModal.svg';
import { NumberToFixedFormater } from '../../../../utils/Formatters';

type JoinDeedModalProps = {
  deed: any;
  isOpenJoinDeedModal: boolean;
  toggleJoinDeedModal: any;
  setIsOpenPendingModal: any;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  isOpenPendingModal: boolean;
  setTxId: Dispatch<SetStateAction<string>>;
  queryDeed: any;
};

export const JoinDeedModal = ({
  deed,
  isOpenJoinDeedModal,
  toggleJoinDeedModal,
  isOpenPendingModal,
  setIsOpenPendingModal,
  setIsConfirm,
  setTxId,
  queryDeed,
}: JoinDeedModalProps) => {
  const [isApprovingToken, setIsApprovingToken] = useState(false);
  const [isUserApproveToken, setIsUserApproveToken] = useState(false);

  // Join Deed Data
  const [joinAmount, setJoinAmount] = useState<any>(undefined);

  const [joinAmountValid, setJoinAmountValid] = useState(true);

  const [walletBalance, setWalletBalance] = useState<any>(undefined);

  const userAddress = useSelector((state: any) => state.wallet.userAddress);

  useEffect(() => {
    const checkUserApproveToken = async () => {
      let result = false;
      if (deed?.coinA) {
        result = await isUserApprovedToken(deed?.coinA, deed?.deedAddress);
      }
      setIsUserApproveToken(result);
    };

    checkUserApproveToken();
  }, [deed, isApprovingToken, isUserApproveToken]);

  useEffect(() => {
    const checkWalletBalance = async () => {
      if (deed?.coinA === TOKEN_TYPES.ETH.tokenAddress) {
        const [ethBalance] = await getETHBalance();
        if (ethBalance) {
          setWalletBalance(NumberToFixedFormater(ethBalance));
        }
      } else {
        const [tokenDecimal] = await getTokenDecimalsV2(deed.coinA);
        const [value] = await getBalanceOfUser(deed.coinA, userAddress);
        if (value !== null) {
          setWalletBalance(convertBigNumberValueToNumber((value as any).toString(), Number(tokenDecimal)));
        }
      }
    };
    checkWalletBalance();
    resetState();
    // eslint-disable-next-line
  }, [deed, isOpenJoinDeedModal]);

  useEffect(() => {
    if (joinAmount !== undefined) {
      validateNumber(joinAmount, 0, walletBalance, setJoinAmount, setJoinAmountValid);
    }

    // eslint-disable-next-line
  }, [joinAmount]);

  const resetState = () => {
    setIsApprovingToken(false);
    setIsUserApproveToken(false);

    setJoinAmount(undefined);

    setJoinAmountValid(true);

    setWalletBalance(undefined);
  };

  const doUserApproveToken = async () => {
    setIsOpenPendingModal(true);
    setIsApprovingToken(true);
    let result = null;
    let error = null;

    if (deed?.coinA) {
      const [resultApprove, errorApprove]: any = await handleUserApproveToken(deed?.coinA, deed?.deedAddress);
      result = resultApprove;
      error = errorApprove;
    }

    if (error) {
      message('error', '', error?.code);
      setIsOpenPendingModal(false);
      setIsApprovingToken(false);
      return;
    }
    setIsConfirm(false);
    setTxId(result?.hash);
    await result?.wait(1);
    setIsConfirm(true);
    setIsOpenPendingModal(false);
    setIsApprovingToken(false);
  };

  const doUserJoinDeed = async () => {
    setIsOpenPendingModal(true);

    let result = null;
    let error = null;

    const [tokenDecimals]: any = await getTokenDecimalsV2(deed?.coinA);
    const formattedValue = convertPriceToBigDecimals(parseFloat(joinAmount), tokenDecimals);

    if (deed?.coinA !== TOKEN_TYPES.ETH.tokenAddress) {
      const [resultBuyIn, errorBuyIn]: any = await buyInDepositTokenForDeed(deed?.deedAddress, formattedValue);
      result = resultBuyIn;
      error = errorBuyIn;
      console.log('err', errorBuyIn);
    }

    if (deed?.coinA === TOKEN_TYPES.ETH.tokenAddress) {
      const [resultBuyIn, errorBuyIn]: any = await buyInDepositTokenForDeed(deed?.deedAddress, formattedValue, false);
      result = resultBuyIn;
      error = errorBuyIn;
      console.log('err ETH', errorBuyIn);
    }
    if (error) {
      let messageError = error?.error?.message;

      if (messageError === BLOCKCHAIN_ERROR_MESSAGE.BUYIN_TIME_OVER.blockChainError) {
        messageError = BLOCKCHAIN_ERROR_MESSAGE.BUYIN_TIME_OVER.message;
      }
      if (messageError === BLOCKCHAIN_ERROR_MESSAGE.DEED_FULL.blockChainError) {
        messageError = BLOCKCHAIN_ERROR_MESSAGE.DEED_FULL.message;
      }
      setIsOpenPendingModal(false);
      return message('error', messageError || error?.message);
    }

    setIsConfirm(false);
    setTxId(result?.hash);
    await result?.wait(1);
    setIsConfirm(true);
    setIsOpenPendingModal(false);
    toggleJoinDeedModal();
    queryDeed();

    message('success', 'You have successfully joined this deed!');
  };

  return (
    <Modal
      className='join-deed'
      centered
      visible={isOpenJoinDeedModal}
      onOk={toggleJoinDeedModal}
      onCancel={toggleJoinDeedModal}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      closeIcon={
        <img
          className='absolute top-40px right-40px'
          onClick={toggleJoinDeedModal}
          src={CloseModal}
          alt='close'
          width='12px'
          height='12px'
        />
      }
    >
      <ModalMainHeader title='Join Deed' />

      <ModalHorizontalRule />

      <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg p-20px mb-20px'>
        <DeedContractAddressInfo deedContractAddress={deed?.deedAddress} />
      </div>
      <div className='flex flex-col bg-background-2 border border-opacity-20 rounded-lg mb-20px'>
        <div className='flex relative justify-center items-end p-20px'>
          <div className='flex flex-col w-260px'>
            <div className='flex w-full justify-between mb-25px text-white text-modal-sub-info-line font-semibold'>
              <div className=''>Wallet Balance</div>
              <div>{`${NumberToFixedFormater(Number(walletBalance), 3, false, true)} ${deed?.coinAName}`}</div>
            </div>

            <Input
              onChange={e => {
                setJoinAmount(e.target.value);
              }}
              value={joinAmount}
              name='account-number'
              style={{ width: 'full', borderRadius: '8px', color: 'gray', height: '43px' }}
              placeholder='Enter Amount'
              suffix={deed?.coinAName}
            />
          </div>
          <Button
            style={{
              height: '32px',
              width: '43px',
              position: 'absolute',
              right: '80px',
              marginTop: '6px',
              marginBottom: '6px',
              marginLeft: '8px',
              backgroundColor: 'rgba(0,99,141,.3)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '0px',
              fontSize: '10px',
            }}
            onClick={() => setJoinAmount(parseFloat(walletBalance))}
          >
            MAX
          </Button>
        </div>
        <div className='flex justify-center w-full '>
          {!joinAmountValid ? (
            <p className='relative text-center text-errorRed text-modal-error-text w-260px'>
              Invalid amount. You can join with up to the wallet balance.
            </p>
          ) : null}

          {joinAmount === '0' ? (
            <p className='relative text-center text-errorRed text-modal-error-text w-260px'>
              Your input cannot be zero.
            </p>
          ) : null}
        </div>
      </div>

      <ModalHorizontalRule />

      <div className='m-auto w-400px'>
        {deed?.coinA !== TOKEN_TYPES.ETH.tokenAddress && (
          <ApproveStepsModal isApproveToken={isUserApproveToken} title2={'Join Deed'} />
        )}
      </div>

      <div className='mt-4 text-center'>
        {!isUserApproveToken && deed?.coinA !== TOKEN_TYPES.ETH.tokenAddress && (
          <button
            type='button'
            className='text-white text-modal-button w-106px h-37px px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-lg'
            onClick={doUserApproveToken}
          >
            {isApprovingToken ? 'Approving' : 'Approve'}
          </button>
        )}
        {(isUserApproveToken || deed?.coinA === TOKEN_TYPES.ETH.tokenAddress) && (
          <button
            type='button'
            className='text-white text-modal-button w-77px h-37px px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-lg font-semibold'
            onClick={() => {
              if (joinAmount === undefined) {
                setJoinAmountValid(false);
              } else {
                doUserJoinDeed();
              }
            }}
            disabled={joinAmount === '0' || !joinAmountValid || isOpenPendingModal}
          >
            Join
          </button>
        )}
      </div>
    </Modal>
  );
};
