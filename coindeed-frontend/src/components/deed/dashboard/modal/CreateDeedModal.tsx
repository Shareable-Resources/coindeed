import { Fragment, useState, useEffect } from 'react';
import { CreateDeed } from '../../type';
import moment from 'moment';
import './modalStyles.css';

import { ModalHorizontalRule, DeedDuration, RiskMitigation } from './modalComponents';

import { Modal, Input, Button, Slider } from 'antd';

import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';

import { convertPriceToBigDecimals, isUserApprovedToken } from '../../../../blockchain/utils';
import { MAX_PRICE_DROP, TOKEN_TYPES, WHOLESALE_RESERVED } from '../../../../utils/Constants';
import { NumberToFixedFormater, roundNumber } from '../../../../utils/Formatters';

import GreyInfo from '../../../../images/icons/GreyInfo.svg';

import CloseModal from '../../../../images/icons/CloseModal.svg';

import { validateNotEqualToString, validateDecimal, validateNumber, validateDate } from './inputValidation';

import { getWholesaleWithId } from '../../../../blockchain/services/WholesaleService';

import { getTokenDecimalsV2 } from '../../../../blockchain/utils';

import { convertBigNumberValueToNumber } from '../../../../blockchain/utils';
import { getRequiredStakingAmount } from '../../../../blockchain/services/DeedService';
import { CustomInput } from '../../../global/antd/CustomInput';
import { loginRequired } from '../../../../services/wallet';
import { useSelector } from 'react-redux';

const DEED_FACTORY_ADDRESS = process.env.REACT_APP_DEED_FACTORY_ADDRESS;

interface ModalProps {
  handleToggleCreateDeedModal: any;
  isOpenCreateDeedModal: any;
  doCreateDeed: any;
  doApproveDToken: any;
  isCreatingDeed: boolean;
  isApprovingDeed: boolean;
  purchaseTokens: any;
  depositToken: any;
}

export default function CreateDeedModal({
  handleToggleCreateDeedModal,
  isOpenCreateDeedModal,
  doCreateDeed,
  doApproveDToken,
  isCreatingDeed,
  isApprovingDeed,
  purchaseTokens,
  depositToken,
}: ModalProps) {
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const DOWNPAYMENT_TOKENS = [
    { id: 5, name: 'USDT', decimals: 6, address: '0xd35d2e839d888d1cdbadef7de118b87dfefed20e' },

    {
      id: 1,
      name: 'BNB',
      decimals: 18,
      address: '0x730129b9aE5A6B3Fa6a674a5dC33a84Cb1711D07',
    },
    {
      id: 6,
      name: 'DAI',
      decimals: 18,
      address: '0xDFEe9D9e9aC61980f4F43dD12B8F62Ade3D0B28B',
    },
    {
      id: 7,
      name: 'USDC',
      decimals: 6,
      address: '0x248E7Fa5fB6De623d339c837299692fFB4ea5971',
    },

    { id: 8, name: 'ETH', decimals: 18, address: '0x0000000000000000000000000000000000000000' },
  ];

  const PURCHASE_TOKENS = [
    { id: 4, name: 'BNB', decimals: 18, address: '0x730129b9ae5a6b3fa6a674a5dc33a84cb1711d07' },
    { id: 2, name: 'USDT', decimals: 6, address: '0xd35d2e839d888d1cDBAdef7dE118b87DfefeD20e' },
    { id: 3, name: 'USDC', decimals: 6, address: '0x248E7Fa5fB6De623d339c837299692fFB4ea5971' },
    { id: 5, name: 'DEED', decimals: 18, address: '0x819242e08d84fc6c05389b84b85913b828439c90' },
  ];

  let [leverageMultiple, setLeverageMultiple] = useState(1);
  let [deedSize, setDeedSize] = useState('');
  let [minimumParticipation, setMinimumParticipation] = useState('');

  const [leverageAdjustPurchaseDepositRatio, setLeverageAdjustPurchaseDepositRatio] = useState<any>();
  const [leverageAdjustMultiple, setLeverageAdjustMultiple] = useState(1);
  const [completeDeedPurchaseDepositRatio, setCompleteDeedPurchaseDepositRatio] = useState<any>();

  let [isApproveDToken, setIsApproveDToken] = useState(false);
  const [purchaseToken, setPurchaseToken] = useState<any>(PURCHASE_TOKENS[0]);
  const [downpaymentToken, setDownpaymentToken] = useState<any>(DOWNPAYMENT_TOKENS[0]);
  const [managementFee, setManagementFee] = useState('');

  // Duration Data
  const [recrutingEndDateOnly, setRecruitingEndDateOnly] = useState<any>();
  const [recrutingEndTimeOnly, setRecruitingEndTimeOnly] = useState<any>();
  const [escrowEndDateOnly, setEscrowEndDateOnly] = useState<any>();
  const [escrowEndTimeOnly, setEscrowEndTimeOnly] = useState<any>();
  const [deedEndDateOnly, setDeedEndDateOnly] = useState<any>();
  const [deedEndTimeOnly, setDeedEndTimeOnly] = useState<any>();

  const [swapTypeRadio, setSwapTypeRadio] = useState('DEX');
  // const [minimumJoinRadio, setMinimumJoinRadio] = useState('NO');

  const [allowBrokersRadio, setAllowBrokersRadio] = useState('No');
  // eslint-disable-next-line
  const [wholesaleId, setWholesaleId] = useState('');
  // eslint-disable-next-line
  const [brokersMinimumStaking, setBrokersMinimumStaking] = useState('');

  const [currPage, setCurrPage] = useState(0);

  //Validation state

  const [purchaseTokenValid, setPurchaseTokenValid] = useState(true);
  const [downpaymentTokenValid, setDownPaymentTokenValid] = useState(true);
  const [deedSizeValid, setDeedSizeValid] = useState(true);
  const [deedSizeRequired, setDeedSizeRequired] = useState(true);
  const [minimumParticipationValid, setMinimumParticipationValid] = useState(true);
  const [managementFeeValid, setManangementFeeValid] = useState(true);
  const [recrutingEndDateValid, setRecrutingEndDateValid] = useState(true);
  const [escrowEndDateValid, setEscrowEndDateValid] = useState(true);
  const [deedEndDateValid, setDeedEndDateValid] = useState(true);
  const [deedEndDateValidWithLockTime, setDeedEndDateValidWithLockTime] = useState(true);

  const [leverageAdjustPurchaseDepositRatioValid, setLeverageAdjustPurchaseDepositRatioValid] = useState(true);
  const [leverageAdjustMultipleValid, setLeverageAdjustMultipleValid] = useState(true);
  const [completeDeedPurchaseDepositRatioValid, setCompleteDeedPurchaseDepositRatioValid] = useState(true);
  const [isSecondTriggerValid, setIsSecondTriggerValid] = useState(false);
  const [maxPriceDropWithLeverage, setMaxPriceDropWithLeverage] = useState(0);

  const [isWholesaleReserved, setIsWholesaleReserved] = useState(false);
  const [wholesaleIdValid, setWholesaleIdValid] = useState(true);
  const [wholesaleSizeValid, setWholesaleSizeValid] = useState(true);
  const [wholesalePairsValid, setWholesalePairsValid] = useState(true);
  const [wholesaleExitDeedLockTime, setWholesaleExitDeedLockTime] = useState<number>(0);

  const [requiredStakingAmount, setRequiredStakingAmount] = useState<number>(0);
  const convertTime = (unixtime: any) => {
    var a = new Date(unixtime * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = year + '-' + month + '-' + date + '@' + hour + ':' + min + ':' + sec;
    return time;
  };

  const [dataTokenOffer, setDataTokenOffer] = useState<any>([]);

  useEffect(() => {
    const data = purchaseTokens.map((e: any) => {
      return {
        ...e,
        name: e.name,
        address: e.address,
        id: e.id,
      };
    });
    setDataTokenOffer(data.filter((e: any) => e.isActive === true));
    // eslint-disable-next-line
  }, [purchaseToken]);

  const resetState = () => {
    setLeverageMultiple(1);
    setDeedSize('');
    setMinimumParticipation('');
    setLeverageAdjustPurchaseDepositRatio(undefined);
    setLeverageAdjustMultiple(1);
    setCompleteDeedPurchaseDepositRatio(undefined);
    setPurchaseToken(PURCHASE_TOKENS[0]);
    setDownpaymentToken(DOWNPAYMENT_TOKENS[0]);
    setManagementFee('');
    setRecruitingEndDateOnly(undefined);
    setRecruitingEndTimeOnly(undefined);
    setEscrowEndDateOnly(undefined);
    setEscrowEndTimeOnly(undefined);
    setDeedEndDateOnly(undefined);
    setDeedEndTimeOnly(undefined);
    setSwapTypeRadio('DEX');
    setAllowBrokersRadio('No');
    setWholesaleId('');
    setBrokersMinimumStaking('');
    setCurrPage(0);
    setPurchaseTokenValid(true);
    setDownPaymentTokenValid(true);
    setDeedSizeValid(true);
    setDeedSizeRequired(true);
    setMinimumParticipationValid(true);
    setManangementFeeValid(true);
    setRecrutingEndDateValid(true);
    setEscrowEndDateValid(true);
    setDeedEndDateValid(true);
    setLeverageAdjustPurchaseDepositRatioValid(true);
    setLeverageAdjustMultipleValid(true);
    setCompleteDeedPurchaseDepositRatioValid(true);
    setDeedEndDateValidWithLockTime(true);
  };

  const handleSelectPurchaseToken = (events: any) => {
    const selectedToken = dataTokenOffer.find((token: any) => token.address === events.target.value);

    setPurchaseToken(selectedToken);
  };
  const handleSelectDownpaymentToken = (events: any) => {
    const selectedToken = dataTokenOffer.find((token: any) => token.address === events.target.value);
    setDownpaymentToken(selectedToken);
  };

  useEffect(() => {
    resetState();
    const checkUserLogin = async () => {
      if (!userAddress) {
        await loginRequired();
      }
    };
    checkUserLogin();
    // eslint-disable-next-line
  }, [isOpenCreateDeedModal]);
  useEffect(() => {
    validateNotEqualToString(purchaseToken.name, downpaymentToken.name, undefined, setPurchaseTokenValid);
    validateNotEqualToString(downpaymentToken.name, purchaseToken.name, undefined, setDownPaymentTokenValid);
  }, [purchaseToken, downpaymentToken]);

  useEffect(() => {
    if (deedSize) {
      validateNumber(deedSize, undefined, undefined, setDeedSize, setDeedSizeValid);
      if (deedSize === '') {
        setDeedSizeRequired(false);
      } else setDeedSizeRequired(true);
    } else {
      setDeedSizeRequired(false);
    }
  }, [deedSize]);

  useEffect(() => {
    const calculateRequiredStakingAmount = async () => {
      // eslint-disable-next-line
      const [result, error] = await getRequiredStakingAmount(
        Number(deedSize),
        leverageMultiple,
        downpaymentToken.address,
      );
    };
    calculateRequiredStakingAmount();
  }, [deedSize, leverageMultiple, downpaymentToken]);

  useEffect(() => {
    if (minimumParticipation)
      validateDecimal(minimumParticipation, 2, 0, 100, setMinimumParticipation, setMinimumParticipationValid);
  }, [minimumParticipation]);

  useEffect(() => {
    if (managementFee) validateDecimal(managementFee, 2, 0, 100, setManagementFee, setManangementFeeValid);
  }, [managementFee]);

  useEffect(() => {
    if (wholesaleId !== '') {
      validateWholesaleId();
    }
    // eslint-disable-next-line
  }, [purchaseToken, downpaymentToken, deedSize, managementFee]);

  useEffect(() => {
    if (swapTypeRadio === 'DEX') setWholesaleId('');
  }, [swapTypeRadio]);

  const computeRecrutingEndDate = () => {
    if (
      recrutingEndDateOnly?.year === undefined ||
      recrutingEndDateOnly?.month === undefined ||
      recrutingEndDateOnly?.day === undefined ||
      recrutingEndTimeOnly?.hours === undefined ||
      recrutingEndTimeOnly?.minutes === undefined ||
      recrutingEndTimeOnly?.seconds === undefined
    ) {
      return undefined;
    }
    const dateobj = new Date(
      recrutingEndDateOnly.year,
      recrutingEndDateOnly.month,
      recrutingEndDateOnly.day,
      recrutingEndTimeOnly.hours,
      recrutingEndTimeOnly.minutes,
      recrutingEndTimeOnly.seconds,
    );
    return moment(dateobj).unix();
  };

  const computeEscrowEndDate = () => {
    if (
      escrowEndDateOnly?.year === undefined ||
      escrowEndDateOnly?.month === undefined ||
      escrowEndDateOnly?.day === undefined ||
      escrowEndTimeOnly?.hours === undefined ||
      escrowEndTimeOnly?.minutes === undefined ||
      escrowEndTimeOnly?.seconds === undefined
    ) {
      return undefined;
    }
    const dateobj = new Date(
      escrowEndDateOnly.year,
      escrowEndDateOnly.month,
      escrowEndDateOnly.day,
      escrowEndTimeOnly.hours,
      escrowEndTimeOnly.minutes,
      escrowEndTimeOnly.seconds,
    );

    return moment(dateobj).unix();
  };

  const computeDeedEndDate = () => {
    if (
      deedEndDateOnly?.year === undefined ||
      deedEndDateOnly?.month === undefined ||
      deedEndDateOnly?.day === undefined ||
      deedEndTimeOnly?.hours === undefined ||
      deedEndTimeOnly?.minutes === undefined ||
      deedEndTimeOnly?.seconds === undefined
    ) {
      return undefined;
    }
    const dateobj = new Date(
      deedEndDateOnly.year,
      deedEndDateOnly.month,
      deedEndDateOnly.day,
      deedEndTimeOnly.hours,
      deedEndTimeOnly.minutes,
      deedEndTimeOnly.seconds,
    );

    return moment(dateobj).unix();
  };

  useEffect(() => {
    if (recrutingEndDateOnly && recrutingEndTimeOnly) {
      validateDate(computeRecrutingEndDate(), undefined, undefined, undefined, setRecrutingEndDateValid);
    }

    if (escrowEndDateOnly && escrowEndTimeOnly) {
      validateDate(computeEscrowEndDate(), computeRecrutingEndDate(), undefined, undefined, setEscrowEndDateValid);
    }

    if (deedEndDateOnly && deedEndTimeOnly) {
      validateDate(computeDeedEndDate(), computeEscrowEndDate(), undefined, undefined, setDeedEndDateValid);
    }
    if (deedEndDateOnly && deedEndTimeOnly && wholesaleExitDeedLockTime > 0) {
      const wholesaleTotalExitDeedLockTime = moment
        .unix(computeEscrowEndDate() as number)
        .add(wholesaleExitDeedLockTime, 'seconds')
        .unix();

      validateDate(
        computeDeedEndDate(),
        wholesaleTotalExitDeedLockTime,
        undefined,
        undefined,
        setDeedEndDateValidWithLockTime,
      );
    }

    // eslint-disable-next-line
  }, [
    recrutingEndDateOnly,
    recrutingEndTimeOnly,
    escrowEndDateOnly,
    escrowEndTimeOnly,
    deedEndDateOnly,
    deedEndTimeOnly,
    wholesaleExitDeedLockTime,
  ]);

  useEffect(() => {
    if (leverageAdjustPurchaseDepositRatio !== undefined) {
      validateDecimal(
        leverageAdjustPurchaseDepositRatio,
        2,
        1,
        100,
        setLeverageAdjustPurchaseDepositRatio,
        setLeverageAdjustPurchaseDepositRatioValid,
      );
    }

    if (completeDeedPurchaseDepositRatio !== undefined) {
      validateDecimal(
        completeDeedPurchaseDepositRatio,
        2,
        leverageAdjustPurchaseDepositRatio !== undefined ? parseFloat(leverageAdjustPurchaseDepositRatio) + 0.01 : 1,
        100,
        setCompleteDeedPurchaseDepositRatio,
        setCompleteDeedPurchaseDepositRatioValid,
      );
    }

    const maxPriceDropWithLeverageValue = MAX_PRICE_DROP / leverageMultiple;

    setMaxPriceDropWithLeverage(Math.round(maxPriceDropWithLeverageValue));

    if (MAX_PRICE_DROP / leverageMultiple < Number(completeDeedPurchaseDepositRatio)) {
      setIsSecondTriggerValid(false);
    } else {
      setIsSecondTriggerValid(true);
    }

    // eslint-disable-next-line
  }, [leverageAdjustPurchaseDepositRatio, completeDeedPurchaseDepositRatio, leverageMultiple]);

  useEffect(() => {
    if (leverageAdjustMultiple !== undefined)
      validateNumber(
        leverageAdjustMultiple.toString(),
        undefined,
        leverageMultiple - 1,
        setLeverageAdjustMultiple,
        setLeverageAdjustMultipleValid,
      );
  }, [leverageMultiple, leverageAdjustMultiple]);

  const isPositionValid = () => {
    let valid1 = validateNotEqualToString(purchaseToken.name, downpaymentToken.name, undefined, setPurchaseTokenValid);
    let valid2 = validateNotEqualToString(
      downpaymentToken.name,
      purchaseToken.name,
      undefined,
      setDownPaymentTokenValid,
    );
    let valid3 = validateNumber(deedSize, undefined, undefined, setDeedSize, setDeedSizeValid);
    let valid4 = validateDecimal(
      minimumParticipation,
      2,
      0,
      100,
      setMinimumParticipation,
      setMinimumParticipationValid,
    );
    let valid5 = false;
    if (deedSize === '') {
      valid5 = false;
      setDeedSizeRequired(false);
    } else {
      setDeedSizeRequired(true);
      valid5 = true;
    }
    return valid1 && valid2 && valid3 && valid4 && valid5;
  };
  const isManagementValid = async () => {
    let validManagementFee = validateDecimal(managementFee, 2, 0, 100, setManagementFee, setManangementFeeValid);

    let validWholesaleID = swapTypeRadio === 'Wholesale' ? await validateWholesaleId() : true;
    return validManagementFee && validWholesaleID;
  };
  const isDurationValid = () => {
    let valid1 = validateDate(computeRecrutingEndDate(), undefined, undefined, undefined, setRecrutingEndDateValid);
    let valid2 = validateDate(
      computeEscrowEndDate(),
      computeRecrutingEndDate(),
      undefined,
      undefined,
      setEscrowEndDateValid,
    );
    let valid3 = validateDate(computeDeedEndDate(), computeEscrowEndDate(), undefined, undefined, setDeedEndDateValid);

    const wholesaleTotalExitDeedLockTime = moment
      .unix(computeEscrowEndDate() as number)
      .add(wholesaleExitDeedLockTime, 'seconds')
      .unix();

    let valid4 = validateDate(
      computeDeedEndDate(),
      wholesaleTotalExitDeedLockTime,
      undefined,
      undefined,
      setDeedEndDateValidWithLockTime,
    );

    return valid1 && valid2 && valid3 && valid4;
  };

  const isRiskMitigationValid = () => {
    let valid1 = validateDecimal(
      leverageAdjustPurchaseDepositRatio,
      2,
      1,
      100,
      setLeverageAdjustPurchaseDepositRatio,
      setLeverageAdjustPurchaseDepositRatioValid,
    );
    let valid2 = validateNumber(
      leverageAdjustMultiple.toString(),
      undefined,
      leverageMultiple.toString(),
      setLeverageAdjustMultiple,
      setLeverageAdjustMultipleValid,
    );
    let valid3 = validateDecimal(
      completeDeedPurchaseDepositRatio,
      2,
      leverageAdjustPurchaseDepositRatio !== undefined ? parseFloat(leverageAdjustPurchaseDepositRatio) + 0.01 : 1,
      100,
      setCompleteDeedPurchaseDepositRatio,
      setCompleteDeedPurchaseDepositRatioValid,
    );
    return valid1 && valid2 && valid3 && isSecondTriggerValid;
  };
  const validateWholesaleId = async () => {
    // let result = await getWholesaleWithId(wholesaleId) as any

    let [wholeSaleInfo]: any = await getWholesaleWithId(wholesaleId);

    if (wholeSaleInfo === null) {
      setWholesaleIdValid(false);
      return false;
    } else if (wholeSaleInfo !== null) {
      setWholesaleIdValid(true);
      let [tokenDecimals]: any = await getTokenDecimalsV2(wholeSaleInfo.tokenRequested);
      const minSaleAmountWholesale = convertBigNumberValueToNumber(wholeSaleInfo?.minSaleAmount, tokenDecimals);

      const minimumDownPaymentNeedJoin = (parseInt(deedSize) * parseInt(minimumParticipation)) / 100;

      if (wholeSaleInfo.state >= WHOLESALE_RESERVED) {
        setIsWholesaleReserved(true);
      } else setIsWholesaleReserved(false);

      if (
        minimumDownPaymentNeedJoin - (minimumDownPaymentNeedJoin * parseInt(managementFee)) / 100 <
        minSaleAmountWholesale
      ) {
        setWholesaleSizeValid(false);
        return false;
      } else if (
        purchaseToken.address.toLowerCase() !== wholeSaleInfo['tokenOffered'].toLowerCase() ||
        downpaymentToken.address.toLowerCase() !== wholeSaleInfo['tokenRequested'].toLowerCase()
      ) {
        setWholesalePairsValid(false);
        return false;
      }

      if (wholeSaleInfo.exitDeedLock.toString() !== '0') {
        setWholesaleExitDeedLockTime(Number(wholeSaleInfo.exitDeedLock.toString()));
      }
    }

    setWholesaleIdValid(true);
    setWholesalePairsValid(true);
    setWholesaleSizeValid(true);
    return true;
  };

  useEffect(() => {
    const checkUserApproveDToken = async () => {
      const result = await isUserApprovedToken(TOKEN_TYPES.DTOKEN.tokenAddress, DEED_FACTORY_ADDRESS);
      setIsApproveDToken(result);
    };

    checkUserApproveDToken();
  }, [isApprovingDeed]);

  const handleCreateDeed = async () => {
    // Buyers supply tokenA
    // Wholesaler is person who wants to sell tokenB
    const pairTokenAddress = {
      tokenA: downpaymentToken.address,
      tokenB: purchaseToken.address,
    };

    const stakingAmount = roundNumber(Number(deedSize) / leverageMultiple);

    const createDeedParams: CreateDeed = {
      pairOfTokens: pairTokenAddress,
      stakingAmount: convertPriceToBigDecimals(Number(stakingAmount), TOKEN_TYPES.DTOKEN.decimal),
      wholesaleId: Number(wholesaleId),

      deedParams: {
        deedSize: convertPriceToBigDecimals(Number(deedSize), downpaymentToken.decimals),
        leverage: Number(leverageMultiple),
        managementFee: parseFloat(managementFee) * 100,
        minimumBuy: Number(minimumParticipation) * 100,
        minimumJoin: convertPriceToBigDecimals(0, downpaymentToken.decimals),
      },
      executionTime: {
        recruitingEndTimestamp: computeRecrutingEndDate(),
        buyTimestamp: computeEscrowEndDate(),
        sellTimestamp: computeDeedEndDate(),
      },

      riskMitigation: {
        trigger: Number(leverageAdjustPurchaseDepositRatio) * 100,
        leverage: Number(leverageAdjustMultiple),
        secondTrigger: Number(completeDeedPurchaseDepositRatio) * 100,
      },

      brokerConfig: { allowed: allowBrokersRadio === 'No' ? false : true },
    };

    doCreateDeed(createDeedParams);
  };

  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }

  function goToNextPage() {
    setCurrPage(currPage + 1);
  }
  function goToPreviousPage() {
    setCurrPage(currPage - 1);
  }

  useEffect(() => {
    if (deedSize) {
      const checkRequiredStaking = async () => {
        const [result]: any = await getRequiredStakingAmount(
          parseFloat(deedSize),
          leverageMultiple,
          downpaymentToken.address,
        );
        setRequiredStakingAmount(result);
      };
      checkRequiredStaking();
    } else {
      setRequiredStakingAmount(0);
    }
  }, [deedSize, leverageMultiple, downpaymentToken]);
  return (
    <Fragment>
      <div className=''>
        <button
          type='button'
          onClick={handleToggleCreateDeedModal}
          className='bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue hover:from-gradient-darkBlue hover:to-gradient-lightBlue inline-flex items-center px-5 py-2 text-sm leading-4 font-bold rounded-md shadow-sm text-white'
        >
          Create Deed
        </button>
      </div>

      <Modal
        className='create-deed'
        centered
        visible={isOpenCreateDeedModal}
        onOk={handleToggleCreateDeedModal}
        onCancel={handleToggleCreateDeedModal}
        footer={null}
        width={600}
        zIndex={4}
        maskClosable={false}
        closeIcon={
          <img
            className='absolute top-40px right-40px'
            onClick={handleToggleCreateDeedModal}
            src={CloseModal}
            alt='close'
            width='12px'
            height='12px'
          />
        }
      >
        <h1 className='text-2xl font-medium leading-6 text-white text-left mb-40px'>Create Deed</h1>
        <ModalHorizontalRule />

        <div className='flex text-fadedGrey mb-3'>
          <div className={currPage === 0 ? 'text-primary-1' : currPage > 0 ? 'text-white' : 'text-fadedGrey'}>
            Position &gt; &nbsp;
          </div>
          <div className={currPage === 1 ? 'text-primary-1' : currPage > 1 ? 'text-white' : 'text-fadedGrey'}>
            Management &gt; &nbsp;
          </div>
          <div className={currPage === 2 ? 'text-primary-1' : currPage > 2 ? 'text-white' : 'text-fadedGrey'}>
            Duration &gt; &nbsp;
          </div>
          <div className={currPage === 3 ? 'text-primary-1' : currPage > 3 ? 'text-white' : 'text-fadedGrey'}>
            Risk Mitigation &gt; &nbsp;
          </div>
          <div className={currPage === 4 ? 'text-primary-1' : currPage > 4 ? 'text-white' : 'text-fadedGrey'}>
            Review
          </div>
        </div>
        {currPage === 0 ? (
          <Fragment>
            <div className='border border-opacity-20 rounded-lg p-20px'>
              <h2 className='text-white text-modal-sub-title'>Position </h2>
              <div className='flex flex-col px-40px py-20px'>
                <div className='flex flex-row justify-center mb-20px'>
                  <div className='flex flex-col'>
                    <h3 className='text-white mb-12px'>Purchase Token</h3>
                    <select
                      onChange={e => {
                        handleSelectPurchaseToken(e);
                      }}
                      value={purchaseToken.address}
                      className='text-black w-190px h-43px rounded-lg'
                    >
                      {dataTokenOffer.map((token: any) => {
                        return (
                          <option value={token.address} key={token.id}>
                            {token.name}
                          </option>
                        );
                      })}
                    </select>
                    {!purchaseTokenValid ? (
                      <p className='text-errorRed text-modal-error-text'>
                        Your Purchase token cannot match the Down Payment token. Please select another token.{' '}
                      </p>
                    ) : null}
                  </div>
                  <div className='flex flex-col ml-20px'>
                    <h3 className='text-white mb-12px'>Down Payment Token</h3>
                    <select
                      onChange={e => {
                        handleSelectDownpaymentToken(e);
                      }}
                      value={downpaymentToken.address}
                      className='text-black w-190px h-43px rounded-lg'
                    >
                      {dataTokenOffer.map((token: any) => {
                        return (
                          <option value={token.address} key={token.id}>
                            {token.name}
                          </option>
                        );
                      })}
                    </select>
                    {!downpaymentTokenValid ? (
                      <p className='text-errorRed text-modal-error-text'>
                        {' '}
                        Your Down Payment token cannot match the Purchase token. Please select another token.
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className='flex flex-row mb-20px'>
                  <div className='flex flex-col items-center w-full'>
                    <h3 className='text-white w-full mb-20px'>Leverage X</h3>
                    <Input.Group compact style={{ width: '300px', marginBottom: '20px' }}>
                      <Button
                        onClick={() => {
                          setLeverageMultiple(Math.max(leverageMultiple - 1, 1));
                        }}
                        style={{
                          width: '30px',
                          height: '43px',
                          borderRadius: '8px',
                          border: 'none',
                          borderTopRightRadius: '0px',
                          borderBottomRightRadius: '0px',
                        }}
                      >
                        -
                      </Button>
                      <Input
                        value={leverageMultiple + 'x'}
                        onChange={e => setLeverageMultiple(parseInt(e.target.value))}
                        className='text-black  sm:text-sm'
                        style={{
                          color: 'rgb(68,68,68)',
                          width: '240px',
                          height: '43px',
                          backgroundColor: '  white',
                          border: 'none',
                          textAlign: 'center',
                        }}
                        disabled
                      />
                      <Button
                        onClick={() => {
                          setLeverageMultiple(Math.min(leverageMultiple + 1, 25));
                        }}
                        style={{
                          flex: 'row',
                          alignItems: 'center',
                          width: '30px',
                          height: '43px',
                          borderRadius: '8px',
                          border: 'none',
                          borderTopLeftRadius: '0px',
                          borderBottomLeftRadius: '0px',
                        }}
                      >
                        +
                      </Button>
                    </Input.Group>
                    <div className=' w-full'>
                      <Slider
                        onChange={(mul: any) => setLeverageMultiple(mul)}
                        value={leverageMultiple}
                        min={1}
                        max={25}
                        marks={{
                          1: { style: { color: 'white' }, label: '1x' },
                          25: { style: { color: 'white' }, label: '25x' },
                        }}
                        trackStyle={{ backgroundColor: 'rgb(229, 231, 235)' }}
                      />
                    </div>
                  </div>
                </div>

                <div className='flex flex-row justify-center'>
                  <div className='flex flex-col'>
                    <h3 className='text-white mb-12px'>Deed Size</h3>
                    <CustomInput
                      type='numeric'
                      style={{
                        width: '190px',
                        height: '43px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        marginTop: '1px',
                      }}
                      classNameCustom='input-custom'
                      setInputValue={setDeedSize}
                      inputValue={deedSize}
                      suffix={downpaymentToken?.name as string}
                    />
                    {!deedSizeValid ? (
                      <p className='text-modal-error-text text-errorRed text-sm'>Deed size must be a number.</p>
                    ) : null}
                    {parseFloat(deedSize) === 0 ? (
                      <p className='text-modal-error-text text-errorRed text-sm'>Your input cannot be zero.</p>
                    ) : null}
                    {!deedSizeRequired ? (
                      <p className='text-modal-error-text text-errorRed text-sm'>This field requires input.</p>
                    ) : null}
                    <h3 className='text-white mb-20px'>Down Payment</h3>
                    <div className='text-white-light'>
                      {NumberToFixedFormater(Number(deedSize) / leverageMultiple, 2) + ' ' + downpaymentToken?.name}
                    </div>
                  </div>
                  <div className='flex flex-col ml-20px'>
                    <h3 className='text-white mb-12px'>Minimum Participation</h3>
                    <CustomInput
                      type='numeric'
                      style={{
                        width: '190px',
                        height: '43px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        marginTop: '0px',
                      }}
                      classNameCustom='input-custom'
                      setInputValue={setMinimumParticipation}
                      inputValue={minimumParticipation}
                      suffix='%'
                    />
                    {!minimumParticipationValid ? (
                      <p className='text-modal-error-text text-errorRed text-sm'>
                        Minimum Participation Must Be Between 0.00% and 100.00%
                      </p>
                    ) : null}
                    <h3 className='text-white mb-20px'>Required Staking Amount</h3>
                    <div className='text-white-light'>{NumberToFixedFormater(requiredStakingAmount) + ' DToken'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex w-full justify-center'>
              <button
                type='button'
                className={classNames(
                  'text-white',
                  'px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-md w-120px m-16px',
                )}
                onClick={() => {
                  if (isPositionValid()) {
                    goToNextPage();
                  }
                }}
              >
                Next
              </button>
            </div>
          </Fragment>
        ) : currPage === 1 ? (
          <Fragment>
            <div className='border border-opacity-20 rounded-lg p-20px'>
              <h1 className='text-white text-modal-sub-title mb-25px'>Management</h1>
              <div className='px-20px'>
                <h2 className='text-white flex items-center mb-10px text-modal-sub-title'>
                  Management Fee <img className='ml-10px' src={GreyInfo} alt='info' />
                </h2>
                <div className='w-full flex '>
                  <div className='relative'>
                    <Input
                      onChange={e => {
                        setManagementFee(e.target.value);
                      }}
                      type='text'
                      name='account-number'
                      id='account-number'
                      value={managementFee}
                      style={{ width: '190px', height: '44px', borderRadius: '8px', marginBottom: '20px' }}
                      className='text-gray placeholder-gray sm:text-sm border-gray-300'
                      placeholder='Amount'
                      suffix='%'
                    />
                  </div>
                </div>
                {!managementFeeValid ? (
                  <p className='text-modal-error-text text-errorRed'>
                    Management Fee Must Be Between 0.00% and 100.00%
                  </p>
                ) : null}
                <h2 className='text-white font-semibold mb-12px text-modal-sub-title'>Allow Brokers</h2>
                <div className='flex justify-between items-end mb-20px'>
                  <div
                    className='mr-40px'
                    onChange={e => {
                      setAllowBrokersRadio((e.target as HTMLInputElement).value);
                    }}
                  >
                    <div>
                      <label className='text-radio-text inline-flex items-center'>
                        <input
                          defaultChecked
                          checked={allowBrokersRadio === 'No'}
                          type='radio'
                          className=' form-radio bg-opacity-1 '
                          value={'No'}
                          name='AllowBrokers'
                          alt='info'
                        />
                        <span className='ml-2 text-gray-400 flex items-center'>No</span>
                      </label>
                    </div>
                    <div>
                      <label className='text-radio-text inline-flex items-center'>
                        <input
                          type='radio'
                          className='form-radio'
                          value='Yes'
                          name='AllowBrokers'
                          checked={allowBrokersRadio === 'Yes'}
                        />
                        <span className='ml-2 text-gray-400'>Yes</span>
                      </label>
                    </div>
                  </div>
                </div>

                <h2 className='text-white font-semibold mb-12px text-modal-sub-title'>Swap Type</h2>
                <div className='flex justify-between items-end'>
                  <div
                    className='mr-40px'
                    onChange={e => {
                      setSwapTypeRadio((e.target as HTMLInputElement).value);
                    }}
                  >
                    <div>
                      <label className='text-radio-text inline-flex items-center'>
                        <input
                          defaultChecked
                          type='radio'
                          className=' form-radio bg-opacity-1'
                          value='DEX'
                          checked={swapTypeRadio === 'DEX'}
                          name='SwapType'
                          alt='info'
                        />
                        <span className='ml-2 text-gray-400 flex items-center'>DEX</span>
                        <img className='ml-10px' src={GreyInfo} alt='info' />
                      </label>
                    </div>
                    <div>
                      <label className='text-radio-text inline-flex items-center'>
                        <input
                          type='radio'
                          className='form-radio'
                          value='Wholesale'
                          checked={swapTypeRadio === 'Wholesale'}
                          name='SwapType'
                        />
                        <span className='ml-2 text-gray-400'>Wholesale</span>
                      </label>
                    </div>
                  </div>
                  {swapTypeRadio === 'DEX' ? (
                    <Input
                      style={{
                        width: '317px',
                        height: '43px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255,255,255, 0.4)',
                      }}
                      className='swap-radio-input'
                      placeholder='Paste Wholesale ID'
                      disabled
                    />
                  ) : (
                    <Input
                      style={{ width: '317px', height: '43px', borderRadius: '8px' }}
                      placeholder='Paste Wholesale ID'
                      className='swap-radio-input'
                      value={wholesaleId}
                      onBlur={validateWholesaleId}
                      onChange={e => {
                        setWholesaleId((e.target as HTMLInputElement).value);
                      }}
                    />
                  )}
                </div>
                {swapTypeRadio === 'Wholesale' && isWholesaleReserved ? (
                  <p className='text-errorRed text-modal-error-text'>
                    {' '}
                    This wholesale is currently being reserved for another deed.{' '}
                  </p>
                ) : null}
                {swapTypeRadio === 'Wholesale' && !wholesaleIdValid ? (
                  <p className='text-errorRed text-modal-error-text'>Wholesale Id Invalid</p>
                ) : null}
                {swapTypeRadio === 'Wholesale' && !wholesaleSizeValid ? (
                  <p className='text-errorRed text-modal-error-text'>
                    The total deed size must not be less than the wholesale minimum
                  </p>
                ) : null}
                {swapTypeRadio === 'Wholesale' && !wholesalePairsValid ? (
                  <p className='text-errorRed text-modal-error-text'>
                    The purchase and down payment tokens must match the wholesale tokens
                  </p>
                ) : null}
              </div>
            </div>
            <div className='flex w-full justify-center'>
              <button
                type='button'
                className={classNames(
                  'text-white',
                  'px-4 py-2 text-sm font-medium bg-primary-3 rounded-md w-120px m-16px',
                )}
                onClick={goToPreviousPage}
              >
                Back
              </button>
              <button
                type='button'
                className={classNames(
                  'text-white',
                  'px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-md w-120px m-16px',
                )}
                onClick={async () => {
                  if (await isManagementValid()) goToNextPage();
                }}
              >
                Next
              </button>
            </div>
          </Fragment>
        ) : currPage === 2 ? (
          <Fragment>
            <div className='border border-opacity-20 rounded-lg p-20px'>
              <DeedDuration
                recrutingEndDateOnly={recrutingEndDateOnly}
                recrutingEndTimeOnly={recrutingEndTimeOnly}
                setRecruitingEndDateOnly={setRecruitingEndDateOnly}
                setRecruitingEndTimeOnly={setRecruitingEndTimeOnly}
                recrutingEndDateValid={recrutingEndDateValid}
                escrowEndDateOnly={escrowEndDateOnly}
                escrowEndTimeOnly={escrowEndTimeOnly}
                setEscrowEndDateOnly={setEscrowEndDateOnly}
                setEscrowEndTimeOnly={setEscrowEndTimeOnly}
                escrowEndDateValid={escrowEndDateValid}
                deedEndDateOnly={deedEndDateOnly}
                deedEndTimeOnly={deedEndTimeOnly}
                setDeedEndDateOnly={setDeedEndDateOnly}
                setDeedEndTimeOnly={setDeedEndTimeOnly}
                deedEndDateValid={deedEndDateValid}
                deedEndDateValidWithLockTime={deedEndDateValidWithLockTime}
              />
            </div>
            <div className='flex w-full justify-center'>
              <button
                type='button'
                className={classNames(
                  'text-white',
                  'px-4 py-2 text-sm font-medium bg-primary-3 rounded-md w-120px m-16px',
                )}
                onClick={goToPreviousPage}
              >
                Back
              </button>
              <button
                type='button'
                className={classNames(
                  'text-white',
                  'px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-md w-120px m-16px',
                )}
                onClick={() => {
                  if (isDurationValid()) goToNextPage();
                }}
              >
                Next
              </button>
            </div>
          </Fragment>
        ) : currPage === 3 ? (
          <Fragment>
            <div id='risk-mitigation' className='border border-opacity-20 rounded-lg p-20px'>
              <RiskMitigation
                leverageAdjustPurchaseDepositRatio={leverageAdjustPurchaseDepositRatio}
                leverageAdjustPurchaseDepositRatioValid={leverageAdjustPurchaseDepositRatioValid}
                setLeverageAdjustPurchaseDepositRatio={setLeverageAdjustPurchaseDepositRatio}
                leverageAdjustMultiple={leverageAdjustMultiple}
                leverageAdjustMultipleValid={leverageAdjustMultipleValid}
                setLeverageAdjustMultiple={setLeverageAdjustMultiple}
                completeDeedPurchaseDepositRatio={completeDeedPurchaseDepositRatio}
                completeDeedPurchaseDepositRatioValid={completeDeedPurchaseDepositRatioValid}
                setCompleteDeedPurchaseDepositRatio={setCompleteDeedPurchaseDepositRatio}
                isSecondTriggerValid={isSecondTriggerValid}
                maxPriceDropWithLeverage={maxPriceDropWithLeverage}
              />
            </div>

            <div className='flex w-full justify-center'>
              <button
                type='button'
                className={classNames(
                  'text-white',
                  'px-4 py-2 text-sm font-medium bg-primary-3 rounded-md w-120px m-16px',
                )}
                onClick={goToPreviousPage}
              >
                Back
              </button>
              <button
                type='button'
                className={classNames(
                  'text-white',
                  'px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-md w-120px m-16px',
                )}
                onClick={() => {
                  if (isRiskMitigationValid()) goToNextPage();
                }}
              >
                Next
              </button>
            </div>
          </Fragment>
        ) : currPage === 4 ? (
          <div>
            <div className='text-white border border-opacity-20 rounded-lg p-20px mb-20px'>
              <h2 className='text-white text-modal-sub-title font-semibold'>Position</h2>
              <div className='w-400px m-auto text-review-data mx-40px'>
                <div className='flex justify-between my-10px'>
                  <div>Purchase Token</div>
                  <div>{purchaseToken.name}</div>
                </div>
                <div className='flex justify-between my-10px'>
                  <div>Downpayment Token</div>
                  <div>{downpaymentToken.name}</div>
                </div>
                <div className='flex justify-between my-10px'>
                  <div>Loan Leverage</div>
                  <div>{leverageMultiple}x</div>
                </div>
                <div className='flex justify-between my-10px'>
                  <div>Deed Size</div>
                  <div>{deedSize}</div>
                </div>
                <div className='flex justify-between my-10px'>
                  <div>Minimum Participation</div>
                  <div>{minimumParticipation}%</div>
                </div>
              </div>
            </div>
            <div className='text-white border border-opacity-20 rounded-lg p-20px mb-20px'>
              <h2 className='text-white text-modal-sub-title font-semibold'>Management</h2>
              <div className='w-400px m-auto text-review-data mx-40px'>
                <div className='flex justify-between my-10px'>
                  <div>Management Fee</div>
                  <div>{managementFee}%</div>
                </div>
                <div className='flex justify-between my-10px'>
                  <div>Allow Brokers</div>
                  <div>{allowBrokersRadio === 'Yes' ? 'Yes' : 'No'}</div>
                </div>
                <div className='flex justify-between my-10px'>
                  <div>Swap Type</div>
                  <div>{swapTypeRadio}</div>
                </div>
                {swapTypeRadio === 'Wholesale' ? (
                  <div className='flex justify-between my-10px'>
                    <div>Wholesale ID</div>
                    <div>{wholesaleId}</div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className='text-white border border-opacity-20 rounded-lg p-20px mb-20px'>
              <h2 className='text-white text-modal-sub-title font-semibold'>Duration</h2>
              <div className='w-400px m-auto text-review-data mx-40px'>
                <div className='flex justify-between my-10px'>
                  <div>Recruting End Date</div>
                  <div>{convertTime(computeRecrutingEndDate())}</div>
                </div>
                <div className='flex justify-between my-10px'>
                  <div>Escrow End Date</div>
                  <div>{convertTime(computeEscrowEndDate())}</div>
                </div>
                <div className='flex justify-between my-10px'>
                  <div>Deed End Date</div>
                  <div>{convertTime(computeDeedEndDate())}</div>
                </div>
              </div>
            </div>
            <div className='text-white border border-opacity-20 rounded-lg p-20px mb-20px'>
              <h2 className='text-white text-modal-sub-title font-semibold'>Risk Mitigation</h2>
              <div className='w-400px m-auto text-review-data mx-40px'>
                <div className='flex justify-between my-10px'>
                  <div>Level One Price Drop</div>
                  <div>{leverageAdjustPurchaseDepositRatio}%</div>
                </div>
                <div className='flex justify-between my-10px'>
                  <div>Leverage Adjustment</div>
                  <div>{leverageAdjustMultiple}x</div>
                </div>
                <div className='flex justify-between my-10px'>
                  <div>Level Two Price Drop</div>
                  <div>{completeDeedPurchaseDepositRatio}%</div>
                </div>
              </div>
            </div>
            <div className='text-white w-full text-center text-confirm-message mb-20px'>
              Please review your Deed details
              <br />
              before approving to create a deed
            </div>
            <ModalHorizontalRule />

            <ApproveStepsModal isApproveToken={isApproveDToken} title2={'Create Deed'} />

            <div className='flex w-full justify-center'>
              <button
                type='button'
                className={classNames(
                  'text-white',
                  'px-4 py-2 text-sm font-medium bg-primary-3 rounded-md w-120px m-16px',
                )}
                onClick={goToPreviousPage}
              >
                Back
              </button>

              {isApproveDToken && (
                <button
                  type='button'
                  className={classNames(
                    'text-white',
                    'px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-md w-120px m-16px',
                  )}
                  onClick={handleCreateDeed}
                  disabled={isCreatingDeed}
                >
                  {isCreatingDeed ? 'Creating' : 'Create'}
                </button>
              )}
              {!isApproveDToken && (
                <button
                  type='button'
                  className={classNames(
                    'text-white',
                    'px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-md w-120px m-16px',
                  )}
                  onClick={doApproveDToken}
                >
                  {isApprovingDeed ? 'Approving' : 'Approve'}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </Fragment>
  );
}
