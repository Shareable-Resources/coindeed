import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';

import { Modal, Radio, Space } from 'antd';
import { DeedContractAddressInfo, ModalHorizontalRule, ModalMainHeader } from '../modalComponents';
import './style.css';
import { message as mes } from '../../../../global/antd/Message';
import {
  exitDeed,
  getBalanceOfTokenB,
  getSwapToken,
  getTotalJoinedDownPayment,
} from '../../../../../blockchain/services/DeedService';
import CloseModal from '../../../../../images/icons/CloseModal.svg';
import { depositAmount, getTotalBorrowBalance } from '../../../../../blockchain/services/LendingPoolService';
import {
  convertBigNumberValueToNumber,
  convertPriceToBigDecimals,
  getTokenDecimalsV2,
} from '../../../../../blockchain/utils';
import { OPEN_STATUS, TOKEN_TYPES } from '../../../../../utils/Constants';
import ApproveStepsModal from '../../../../global/modal/ApproveStepsModal';

type ExitModalProps = {
  deed: any;
  isOpenExitModal: boolean;
  toggleExitModal: any;
  setIsOpenPendingModal: Dispatch<SetStateAction<boolean>>;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  setTxId: Dispatch<SetStateAction<string>>;
  supplyAmount: number;
  deedStatus: number;
  queryDeed: any;
};

export default function ExitModal({
  isOpenExitModal,
  toggleExitModal,
  setIsOpenPendingModal,
  setIsConfirm,
  setTxId,
  supplyAmount,
  deed,
  deedStatus,
  queryDeed,
}: ExitModalProps) {
  const [radio, setRadio] = useState<number>(1);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [tokenBAmount, setTokenBAmount] = useState<any>(0);
  const [tokenBAmountBigNumber, setTokenBAmountBigNumber] = useState<any>(0);
  const [totalSupply, setTotalSupply] = useState<any>();
  const [swapAmount, setSwapAmount] = useState<any>(0);
  const [swapAmountCoinB, setSwapAmountCoinB] = useState<any>(0);
  const [manamentFeeState, setManamentFeeState] = useState<any>(0);
  const [percentJoinState, setPercentJoinState] = useState<any>(0);
  const [currentValueState, setCurrentValueState] = useState<any>(0);
  const [totalLoanState, setTotalLoanState] = useState<any>(0);
  const [returnAState, setReturnAState] = useState<any>(0);
  const [returnBState, setReturnBState] = useState<any>(0);
  // eslint-disable-next-line

  const handleExitDeed = async () => {
    setIsOpenPendingModal(true);
    let error = null;
    let result = null;

    if (deed.coinA === TOKEN_TYPES.ETH.tokenAddress) {
      const totalBorrowBalance = await getTotalBorrowAmount();
      const [resultTx, errorTx]: any = await exitDeed(deed?.deedAddress, !disabled, totalBorrowBalance);
      result = resultTx;
      error = errorTx;
    } else {
      const [resultTx, errorTx]: any = await exitDeed(deed?.deedAddress, !disabled);
      result = resultTx;
      error = errorTx;
    }
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
    toggleExitModal();
    queryDeed();
    mes('success', 'You have successfully exited this deed!');
  };

  useEffect(() => {
    if (radio === 1) {
      setDisabled(false);
      return;
    }
    setDisabled(true);
  }, [radio]);

  useEffect(() => {
    const checkDepositAmount = async () => {
      const [decimalB]: any = await getTokenDecimalsV2(deed.coinB);
      const [response]: any = await depositAmount(deed.coinB, deed.deedAddress);
      if (response !== null && typeof response === 'object' && parseFloat(response?.toString()) > 0) {
        if (convertBigNumberValueToNumber(response, decimalB) !== 0) {
          setTokenBAmountBigNumber(response.toString());
          setTokenBAmount(convertBigNumberValueToNumber(response, decimalB));
        } else {
          checkBalanceOfTokenB();
        }
      }
    };

    const checkBalanceOfTokenB = async () => {
      const [decimalB]: any = await getTokenDecimalsV2(deed.coinB);
      const [response]: any = await getBalanceOfTokenB(deed.deedAddress, deed.coinB);
      if (response !== null && typeof response === 'object' && parseFloat(response?.toString()) > 0) {
        setTokenBAmountBigNumber(response.toString());
        setTokenBAmount(convertBigNumberValueToNumber(response, decimalB));
      }
    };

    const getTotalSup = async () => {
      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);
      const [response]: any = await getTotalJoinedDownPayment(deed.deedAddress);
      if (response !== null && typeof response === 'object' && parseFloat(response?.toString()) > 0) {
        return setTotalSupply(convertBigNumberValueToNumber(response, decimalA));
      }
    };

    checkDepositAmount();
    getTotalSup();
    // eslint-disable-next-line
  }, [disabled]);

  useEffect(() => {
    const getSwap = async () => {
      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);
      const [response]: any = await getSwapToken(tokenBAmountBigNumber, [deed.coinB as string, deed.coinA as string]);
      if (response !== null) {
        setSwapAmount(convertBigNumberValueToNumber(response[1], decimalA));
      }
    };

    if (!disabled && tokenBAmount !== undefined && tokenBAmount > 0) {
      getSwap();
    }
    // eslint-disable-next-line
  }, [radio]);

  useEffect(() => {
    const getSwap = async () => {
      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);
      const [decimalB]: any = await getTokenDecimalsV2(deed.coinB);
      if (percentJoinState > 0) {
        let dataSwap = tokenBAmount * percentJoinState;
        const arrDataSwap = dataSwap.toString().split('.');
        let len = 0;
        if (arrDataSwap.length > 1) {
          len = arrDataSwap[1].length;
        }
        if (len > decimalB) dataSwap = Number(dataSwap.toFixed(decimalB));
        const [response]: any = await getSwapToken(convertPriceToBigDecimals(dataSwap, decimalB), [
          deed.coinB as string,
          deed.coinA as string,
        ]);
        if (response !== null) {
          setSwapAmountCoinB(convertBigNumberValueToNumber(response[1], decimalA));
        }
      }
    };

    if (!disabled && tokenBAmount !== undefined && supplyAmount > 0 && tokenBAmount > 0) {
      getSwap();
    }
    // eslint-disable-next-line
  }, [tokenBAmount, supplyAmount, percentJoinState, radio, deed]);

  useEffect(() => {
    const processData = () => {
      const managementFee = (supplyAmount * deed.managementFee) / 100;
      const currentValue = supplyAmount - managementFee;
      const totalLoan = currentValue * Number(deed.loanLeverage) - currentValue;

      const percentJoin = supplyAmount / totalSupply;
      const totalA = Number(deed.loanLeverage) > 1 ? swapAmountCoinB - totalLoan : swapAmount * percentJoin;
      const returnA = totalA.toFixed(2);
      const returnB = (percentJoin * tokenBAmount).toFixed(2);

      setManamentFeeState(managementFee);
      setPercentJoinState(percentJoin);
      setCurrentValueState(currentValue);
      setTotalLoanState(totalLoan);
      setReturnAState(returnA);
      setReturnBState(returnB);
    };
    processData();
    //eslint-disable-next-line
  }, [tokenBAmount, swapAmountCoinB, swapAmount, totalSupply, deed, isOpenExitModal, radio]);

  const getTotalBorrowAmount = async () => {
    let [totalBorrowBalance]: any = await getTotalBorrowBalance(deed?.coinA, deed?.deedAddress);
    const repayEthAmount = BigNumber.from(totalBorrowBalance).mul(120).div(100);
    console.log('totalBorrowBalance', totalBorrowBalance.toString());
    console.log('repayEthAmount:::', repayEthAmount.toString());
    return repayEthAmount;
  };

  return (
    <Modal
      className='cancel-modal'
      centered
      visible={isOpenExitModal}
      onOk={toggleExitModal}
      onCancel={toggleExitModal}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      maskStyle={{ background: '#6b7280bf' }}
      closeIcon={
        <img
          className='absolute top-40px right-40px'
          onClick={toggleExitModal}
          src={CloseModal}
          width='12px'
          height='12px'
          alt='cancel'
        />
      }
    >
      <ModalMainHeader title='Exit Deed' />

      <ModalHorizontalRule />

      <div className='bg-background-2 flex flex-col border border-opacity-20 rounded-lg p-20px mb-20px'>
        <DeedContractAddressInfo deedContractAddress={deed?.deedAddress} />
      </div>

      {deedStatus === OPEN_STATUS ? (
        <div className='flex bg-background-2  border border-opacity-20 rounded-lg  px-60px py-20px mb-20px'>
          <div className='radio-box'>
            <h2 className='text-modal-sub-title text-white '>Pay off loan</h2>
            <Radio.Group className='radio-check' value={radio} onChange={(e: any) => setRadio(e.target.value)}>
              <Space direction='vertical'>
                <Radio value={1}>Yes</Radio>
                <Radio value={0}>No</Radio>
              </Space>
            </Radio.Group>
          </div>
          <div className='flex flex-col justify-center w-full'>
            <div
              className={
                !radio
                  ? 'pt-4 ml-27px text-modal-sub-info-line text-white-halfLight'
                  : 'pt-4 ml-27px text-white text-modal-sub-info-line'
              }
            >
              Loan Balance
            </div>
            <div
              className={
                !radio
                  ? 'flex  ml-27px text-modal-sub-info-line text-white-extraLight'
                  : 'flex ml-27px text-modal-sub-info-line text-white-light'
              }
            >
              <div className='mr-3 mt-2'>{`${totalLoanState.toFixed(2)} ${deed?.coinAName}`}</div>{' '}
            </div>
          </div>
        </div>
      ) : null}

      <div className='bg-background-2 flex flex-col mb-20px border border-opacity-20 rounded-lg px-60px py-20px'>
        <div className='box-container'>
          <div className='title'>Current Value of Initial Payment</div>
          <div className='content'>{`${currentValueState.toFixed(2)} ${deed?.coinAName}`}</div>
        </div>
        {deedStatus === OPEN_STATUS && radio ? (
          <div className='box-container mt-2'>
            <div className='title'>Total Loan Amount</div>
            <div className='content'>{`${totalLoanState.toFixed(2)} ${deed?.coinAName}`}</div>
          </div>
        ) : null}
        <div className='box-container mt-2'>
          <div className='title'>Management Fee</div>

          <div className='content'>{`${manamentFeeState} ${deed?.coinAName}`}</div>
        </div>
        {/* <div className='box-container mt-2'>
          <div className='title'>Loan Interest</div>
          <div className='content'>{`${loanInterest.toFixed(2)} ${deed?.coinAName}`}</div>
        </div> */}
        {deedStatus === OPEN_STATUS && radio ? (
          <div>
            <div className='box-container mt-6'>
              <div className='supper-title'>You will pay:</div>
            </div>
            <div className='box-container mt-2'>
              <div className='title'>Amount</div>
              <div className='content'>{`${totalLoanState.toFixed(2)} ${deed?.coinAName}`}</div>
            </div>
          </div>
        ) : null}
        <div className='box-container mt-6'>
          <div className='supper-title '>You will receive:</div>
        </div>
        <div className='box-container mt-2'>
          <div className='title'>Amount</div>
          <div className='content'>{`${disabled ? returnAState : returnBState} ${
            disabled ? deed?.coinAName : deed?.coinBName
          }`}</div>
        </div>
      </div>

      <ModalHorizontalRule />

      <div className='m-auto w-400px'>
        <ApproveStepsModal isApproveToken={true} title2='Exit Deed' />
      </div>

      <div className='mt-20px button-group'>
        <button
          className='text-white text-modal-button px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue ml-16px w-74px h-37px rounded-lg font-semibold'
          onClick={handleExitDeed}
        >
          Exit
        </button>
      </div>
    </Modal>
  );
}
