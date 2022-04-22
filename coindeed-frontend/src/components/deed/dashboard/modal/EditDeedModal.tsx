/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';
import {
  DeedContractAddressInfo,
  ModalHorizontalRule,
  ModalMainHeader,
  DeedDuration,
  RiskMitigation,
} from './modalComponents';
import { Modal, Input } from 'antd';
import CloseModal from '../../../../images/icons/CloseModal.svg';
import moment from 'moment';

import GreyInfo from '../../../../images/icons/GreyInfo.svg';

import { validateDecimal, validateNumber, validateDate } from './inputValidation';
import {
  editDeed,
  getBrokerConfig,
  getDeedParameters,
  getExecutionTime,
  getRiskMitigation,
} from '../../../../blockchain/services/DeedService';
import { message } from '../../../global/antd/Message';
import { EditDeed } from '../../type';
import { Deed } from '../DeedTable';
import PendingModal from '../../../global/modal/PendingModal';
import CustomButton from '../../../global/antd/CustomButton';
import { BLOCKCHAIN_ERROR_MESSAGE, MAX_PRICE_DROP } from '../../../../utils/Constants';

interface EditDeedModalProps {
  deed: Deed;
  toggleEditDeedModal?: any;
  isOpenEditDeedModal: any;
  openConfirmationModal?: any;
  updated?: any;
}

export default function EditDeedModal({
  deed,
  toggleEditDeedModal,
  isOpenEditDeedModal,
  openConfirmationModal,
  updated,
}: EditDeedModalProps) {
  // Duration Data
  const [recrutingEndDateOnly, setRecruitingEndDateOnly] = useState<any>();
  const [recrutingEndTimeOnly, setRecruitingEndTimeOnly] = useState<any>();
  const [escrowEndDateOnly, setEscrowEndDateOnly] = useState<any>();
  const [escrowEndTimeOnly, setEscrowEndTimeOnly] = useState<any>();
  const [deedEndDateOnly, setDeedEndDateOnly] = useState<any>();
  const [deedEndTimeOnly, setDeedEndTimeOnly] = useState<any>();

  // Swap Type Data
  const [wholesaleId, setWholesaleId] = useState<any>();
  const [wholesaleIdValid, setWholesaleIdValid] = useState<any>('');

  // Risk Mitigation Data
  const [leverageAdjustPurchaseDepositRatio, setLeverageAdjustPurchaseDepositRatio] = useState(0);
  const [leverageAdjustMultiple, setLeverageAdjustMultiple] = useState(1);
  const [maxLeverageAdjustMultiple, setMaxLeverageAdjustMultiple] = useState(1);
  const [completeDeedPurchaseDepositRatio, setCompleteDeedPurchaseDepositRatio] = useState(0);

  const [swapTypeRadio, setSwapTypeRadio] = useState('DEX');

  const [recrutingEndDateValid, setRecrutingEndDateValid] = useState(true);
  const [escrowEndDateValid, setEscrowEndDateValid] = useState(true);
  const [deedEndDateValid, setDeedEndDateValid] = useState(true);

  const [leverageAdjustPurchaseDepositRatioValid, setLeverageAdjustPurchaseDepositRatioValid] = useState(true);
  const [leverageAdjustMultipleValid, setLeverageAdjustMultipleValid] = useState(true);
  const [completeDeedPurchaseDepositRatioValid, setCompleteDeedPurchaseDepositRatioValid] = useState(true);

  const [maxPriceDropWithLeverage, setMaxPriceDropWithLeverage] = useState(0);

  //
  const [isPendingModal, setPendingModal] = useState(false);
  const [isConfirm, setConfirm] = useState(true);
  const [txId, setTxId] = useState(undefined);

  useEffect(() => {
    getExecutionTime(deed.deedAddress).then(res => {
      const [data] = res as [any];

      if (!data) return;

      const RecrutingEndDate = moment.unix(data.recruitingEndTimestamp);
      const EscrowEndDate = moment.unix(data.buyTimestamp);
      const DeedEndDate = moment.unix(data.sellTimestamp);

      setRecruitingEndDateOnly({
        day: Number(RecrutingEndDate.format('DD')),
        month: Number(RecrutingEndDate.format('MM')) - 1,
        year: Number(RecrutingEndDate.format('YYYY')),
      });
      setRecruitingEndTimeOnly({
        hours: RecrutingEndDate.hour(),
        minutes: RecrutingEndDate.minute(),
        seconds: RecrutingEndDate.second(),
      });
      setEscrowEndDateOnly({
        day: Number(EscrowEndDate.format('DD')),
        month: Number(EscrowEndDate.format('MM')) - 1,
        year: Number(EscrowEndDate.format('YYYY')),
      });
      setEscrowEndTimeOnly({
        hours: EscrowEndDate.hour(),
        minutes: EscrowEndDate.minute(),
        seconds: EscrowEndDate.second(),
      });
      setDeedEndDateOnly({
        day: Number(DeedEndDate.format('DD')),
        month: Number(DeedEndDate.format('MM')) - 1,
        year: Number(DeedEndDate.format('YYYY')),
      });
      setDeedEndTimeOnly({
        hours: DeedEndDate.hour(),
        minutes: DeedEndDate.minute(),
        seconds: DeedEndDate.second(),
      });
    });
    getRiskMitigation(deed.deedAddress).then(res => {
      const [data] = res as [any];

      if (!data) return;

      setLeverageAdjustPurchaseDepositRatio(data.trigger);

      setLeverageAdjustMultiple(data.leverage);
      setMaxLeverageAdjustMultiple(data.leverage);

      setCompleteDeedPurchaseDepositRatio(data.secondTrigger);
    });
    if (Number(deed.wholesaleAddress)) {
      setSwapTypeRadio('WHOLESALE');
      setWholesaleId(Number(deed.wholesaleAddress));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recrutingEndDateOnly && recrutingEndTimeOnly)
      validateDate(computeRecrutingEndDate(), undefined, undefined, undefined, setRecrutingEndDateValid);
    if (escrowEndDateOnly && escrowEndTimeOnly)
      validateDate(computeEscrowEndDate(), computeRecrutingEndDate(), undefined, undefined, setEscrowEndDateValid);
    if (deedEndDateOnly && deedEndTimeOnly)
      validateDate(computeDeedEndDate(), computeEscrowEndDate(), undefined, undefined, setDeedEndDateValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    recrutingEndDateOnly,
    recrutingEndTimeOnly,
    escrowEndDateOnly,
    escrowEndTimeOnly,
    deedEndDateOnly,
    deedEndTimeOnly,
  ]);

  useEffect(() => {
    console.log(true);
    if (leverageAdjustPurchaseDepositRatio)
      validateDecimal(
        leverageAdjustPurchaseDepositRatio / 100,
        2,
        1,
        100,
        setLeverageAdjustPurchaseDepositRatio,
        setLeverageAdjustPurchaseDepositRatioValid,
      );
    if (leverageAdjustMultiple)
      validateNumber(
        leverageAdjustMultiple.toString(),
        undefined,
        maxLeverageAdjustMultiple,
        setLeverageAdjustMultiple,
        setLeverageAdjustMultipleValid,
      );
    if (completeDeedPurchaseDepositRatio)
      validateDecimal(
        completeDeedPurchaseDepositRatio / 100,
        2,
        leverageAdjustPurchaseDepositRatio / 100,
        100,
        setCompleteDeedPurchaseDepositRatio,
        setCompleteDeedPurchaseDepositRatioValid,
      );
  }, [leverageAdjustPurchaseDepositRatio, leverageAdjustMultiple, completeDeedPurchaseDepositRatio]);

  const isEditDeedValid = () => {
    let valid1 = validateDate(computeRecrutingEndDate(), undefined, undefined, undefined, setRecrutingEndDateValid);
    let valid2 = validateDate(
      computeEscrowEndDate(),
      computeRecrutingEndDate(),
      undefined,
      undefined,
      setEscrowEndDateValid,
    );
    let valid3 = validateDate(computeDeedEndDate(), computeEscrowEndDate(), undefined, undefined, setDeedEndDateValid);
    let valid4 = validateDecimal(
      leverageAdjustPurchaseDepositRatio / 100,
      2,
      1,
      100,
      setLeverageAdjustPurchaseDepositRatio,
      setLeverageAdjustPurchaseDepositRatioValid,
    );
    let valid5 = validateNumber(
      leverageAdjustMultiple.toString(),
      undefined,
      maxLeverageAdjustMultiple,
      setLeverageAdjustMultiple,
      setLeverageAdjustMultipleValid,
    );
    let valid6 = validateDecimal(
      completeDeedPurchaseDepositRatio / 100,
      2,
      leverageAdjustPurchaseDepositRatio / 100,
      100,
      setCompleteDeedPurchaseDepositRatio,
      setCompleteDeedPurchaseDepositRatioValid,
    );
    const valid7 = computeSwapType();
    return valid1 && valid2 && valid3 && valid4 && valid5 && valid6 && valid7;
  };

  const computeSwapType = () => {
    const result = swapTypeRadio === 'DEX' ? true : !!Number(wholesaleId);
    setWholesaleIdValid(result ? '' : 'Wholesale Id Invalid');
    return result;
  };

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

  const doUpdateDeedInfo = async () => {
    try {
      setPendingModal(true);

      const [deedParams]: any = await getDeedParameters(deed.deedAddress);
      const [brokerConfig]: any = await getBrokerConfig(deed.deedAddress);
      const editParams: EditDeed = {
        deedParams,
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
        brokerConfig,
        wholesaleId: swapTypeRadio === 'DEX' ? 0 : Number(wholesaleId),
      };

      const [result, error]: any = await editDeed(deed.deedAddress, editParams);

      if (error) {
        setPendingModal(false);
        let messageError = error?.error?.message;
        if (messageError === BLOCKCHAIN_ERROR_MESSAGE.BAD_BUY_TIME.blockChainError)
          messageError = BLOCKCHAIN_ERROR_MESSAGE.BAD_BUY_TIME.message;
        if (messageError === BLOCKCHAIN_ERROR_MESSAGE.ALREADY_RESERVE.blockChainError)
          messageError = BLOCKCHAIN_ERROR_MESSAGE.ALREADY_RESERVE.message;
        return message('error', messageError || error?.message);
      }

      setConfirm(false);
      setTxId(result.hash);
      await result.wait(1);
      setPendingModal(false);
      setConfirm(true);
      setMaxLeverageAdjustMultiple(leverageAdjustMultiple);
      updated();
      return message('success', 'Deed updated successfully');
    } catch (error) {
      setPendingModal(false);
    }
  };

  useEffect(() => {
    computeSwapType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wholesaleId, swapTypeRadio]);

  useEffect(() => {
    const maxPriceDropWithLeverageValue = MAX_PRICE_DROP / Number(leverageAdjustMultiple);
    setMaxPriceDropWithLeverage(maxPriceDropWithLeverageValue);
  }, [leverageAdjustMultiple, completeDeedPurchaseDepositRatio]);

  return (
    <>
      <Modal
        className='edit-deed'
        centered
        visible={isOpenEditDeedModal}
        // onOk={isOpenEditDeedModal}
        // onCancel={isOpenEditDeedModal}
        footer={null}
        width={600}
        closeIcon={
          <img
            className='absolute top-40px right-40px'
            onClick={toggleEditDeedModal}
            alt='close'
            src={CloseModal}
            width='12px'
            height='12px'
          />
        }
      >
        <ModalMainHeader title='Edit Deed' />
        <ModalHorizontalRule />

        <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg p-20px mb-20px'>
          <DeedContractAddressInfo deedContractAddress={deed.deedAddress} />
        </div>

        <div className='bg-background-2 border border-opacity-20 rounded-lg p-20px mb-20px'>
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
          />
        </div>

        <div className='text-modal-sub-title bg-background-2 border border-opacity-20 mb-20px rounded-lg p-20px'>
          <h2 className='text-white font-semibold mb-0'>Swap Type</h2>
          <div className='flex flex-row items-center flex-wrap mt-25px mx-40px'>
            <div
              className='mr-10'
              onChange={e => {
                setSwapTypeRadio((e.target as HTMLInputElement).value);
              }}
            >
              <div>
                <label className='text-radio-text inline-flex items-center'>
                  <input
                    defaultChecked
                    type='radio'
                    className=' form-radio bg-opacity-1 '
                    value='DEX'
                    name='SwapType'
                    alt='info'
                    checked={swapTypeRadio === 'DEX'}
                  />
                  <span className='ml-2 text-gray-400 flex items-center'>DEX</span>
                  <img className='m-10px' src={GreyInfo} alt='info' />
                </label>
              </div>
              <div>
                <label className='text-radio-text inline-flex items-center'>
                  <input
                    type='radio'
                    className='form-radio'
                    value='WHOLESALE'
                    name='SwapType'
                    checked={swapTypeRadio === 'WHOLESALE'}
                  />
                  <span className='ml-2 text-gray-400'>Wholesale</span>
                </label>
              </div>
            </div>
            <div className='flex-1'>
              <Input
                style={{
                  width: '100%',
                  height: '43px',
                  borderRadius: '8px',
                  opacity: swapTypeRadio === 'DEX' ? 0.4 : 1,
                }}
                className='swap-radio-input'
                placeholder='Paste Wholesale ID'
                disabled={swapTypeRadio === 'DEX'}
                value={wholesaleId}
                onChange={e => {
                  setWholesaleId((e.target as HTMLInputElement).value);
                }}
              />
            </div>
            <p className='mt-2 mb-0 w-full text-red-600 text-xs'>{wholesaleIdValid}</p>
          </div>
        </div>

        <div className='bg-background-2 border border-opacity-20 mb-20px rounded-lg p-20px'>
          <RiskMitigation
            leverageAdjustPurchaseDepositRatio={leverageAdjustPurchaseDepositRatio / 100}
            leverageAdjustPurchaseDepositRatioValid={leverageAdjustPurchaseDepositRatioValid}
            setLeverageAdjustPurchaseDepositRatio={setLeverageAdjustPurchaseDepositRatio}
            leverageAdjustMultiple={leverageAdjustMultiple}
            leverageAdjustMultipleValid={leverageAdjustMultipleValid}
            setLeverageAdjustMultiple={setLeverageAdjustMultiple}
            completeDeedPurchaseDepositRatio={completeDeedPurchaseDepositRatio / 100}
            completeDeedPurchaseDepositRatioValid={completeDeedPurchaseDepositRatioValid}
            setCompleteDeedPurchaseDepositRatio={setCompleteDeedPurchaseDepositRatio}
            maxPriceDropWithLeverage={maxPriceDropWithLeverage}
          />
        </div>

        <ModalHorizontalRule />
        <div className='m-auto w-440px'>
          <ApproveStepsModal isApproveToken={true} title2={'Update Deed'} />
        </div>
        <div className='mt-4 text-center'>
          <CustomButton
            customType='OkButton'
            disabled={isPendingModal}
            className={`${isPendingModal ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (isEditDeedValid()) doUpdateDeedInfo();
            }}
          >
            {isPendingModal ? 'Updating' : 'Update'}
          </CustomButton>
        </div>
      </Modal>
      <PendingModal open={isPendingModal} setOpen={setPendingModal} isConfirm={isConfirm} txId={txId} />
    </>
  );
}
