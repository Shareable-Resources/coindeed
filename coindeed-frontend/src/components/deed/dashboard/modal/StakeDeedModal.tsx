import { useEffect, Dispatch, SetStateAction, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Input, Button } from 'antd';
import { DeedContractAddressInfo, ModalHorizontalRule, ModalMainHeader } from './modalComponents';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';
import { BLOCKCHAIN_ERROR_MESSAGE, TOKEN_TYPES } from '../../../../utils/Constants';
import {
  convertPriceToBigDecimals,
  handleUserApproveToken,
  isUserApprovedToken,
  getTokenDecimalsV2,
  getBalanceOfUser,
  convertBigNumberValueToNumber,
} from '../../../../blockchain/utils';
import { stakeDTokenWhenRecruiting } from '../../../../blockchain/services/DeedService';
import { message } from '../../../global/antd/Message';
import { NumberToFixedFormater } from '../../../../utils/Formatters';
import CloseModal from '../../../../images/icons/CloseModal.svg';
import { validateNumber } from './inputValidation';
import { ProgressBar } from '../../../global/ProgressBar';
import CustomButton from '../../../global/antd/CustomButton';
type StakeDeedModalProps = {
  deed: any;
  isOpenStakeDeedModal: boolean;
  toggleStakeDeedModal: any;
  setIsOpenPendingModal: any;
  setIsConfirm: Dispatch<SetStateAction<boolean>>;
  isOpenPendingModal: boolean;
  setTxId: Dispatch<SetStateAction<string>>;
  amountCurrentlyStaking: number;
  amountRequiredStaking: number;
  queryDeed: any;
};

const DTokenAddress = '0x819242E08d84fC6C05389B84b85913B828439c90';

export const StakeDeedModal = ({
  deed,
  isOpenStakeDeedModal,
  toggleStakeDeedModal,
  setIsConfirm,
  setIsOpenPendingModal,
  setTxId,
  amountCurrentlyStaking,
  amountRequiredStaking,
  queryDeed,
}: StakeDeedModalProps) => {
  const [isApprovingDeed, setIsApprovingDeed] = useState(false);
  const [isUserApproveDToken, setIsUserApproveDToken] = useState(false);

  const userAddress = useSelector((state: any) => state.wallet.userAddress);

  // Staking Amount Data
  const [stakingAmount, setStakingAmount] = useState<any>();
  const [isStaking, setIsStaking] = useState(false);

  const [stakingAmountValid, setStakingAmountValid] = useState('');
  const [walletBalance, setWalletBalance] = useState<any>('');
  const [decimalRequiredStaking, setDecimalRequireStaking] = useState<any>(0);
  const [decimalCurrentStaking, setDecimalCurrentStaking] = useState<any>(0);

  useEffect(() => {
    if (amountCurrentlyStaking || amountRequiredStaking) {
      const processCurrentStaking = amountCurrentlyStaking.toString().split('.');
      const processRequiredStaking = amountRequiredStaking.toString().split('.');
      if (processCurrentStaking.length === 2 && processCurrentStaking[1].length > 0)
        setDecimalCurrentStaking(processCurrentStaking[1].length);
      if (processRequiredStaking.length === 2 && processRequiredStaking[1].length > 0) {
        setDecimalRequireStaking(processRequiredStaking[1].length);
      }
    }
  }, [amountCurrentlyStaking, amountRequiredStaking]);

  useEffect(() => {
    const checkUserApproveDToken = async () => {
      const result = await isUserApprovedToken(TOKEN_TYPES.DTOKEN.tokenAddress, deed?.deedAddress);
      setIsUserApproveDToken(result);
    };

    checkUserApproveDToken();
  }, [isApprovingDeed, deed, isUserApproveDToken]);

  useEffect(() => {
    const checkWalletBalance = async () => {
      const [tokenDecimal] = await getTokenDecimalsV2(DTokenAddress);
      const [balance]: any = await getBalanceOfUser(DTokenAddress, userAddress);
      if (balance) {
        setWalletBalance(convertBigNumberValueToNumber(balance, Number(tokenDecimal)));
      } else {
        setWalletBalance('--');
      }
    };

    if (userAddress) {
      checkWalletBalance();
    }
  }, [toggleStakeDeedModal, userAddress]);

  useEffect(() => {
    if (stakingAmount !== undefined) {
      const value = checkValid(stakingAmount);
      setStakingAmountValid(value === true ? '' : value);
    }
    // eslint-disable-next-line
  }, [stakingAmount]);

  const doApproveToken = async () => {
    setIsOpenPendingModal(true);
    setIsApprovingDeed(true);
    const [result, error]: any = await handleUserApproveToken(TOKEN_TYPES.DTOKEN.tokenAddress, deed?.deedAddress);
    if (error) {
      message('error', '', error?.code);
      setIsOpenPendingModal(false);
      return;
    }
    setIsConfirm(false);
    setTxId(result?.hash);
    await result?.wait(1);
    setIsConfirm(true);
    setIsOpenPendingModal(false);
    setIsApprovingDeed(false);
  };

  // Deed manager/broker need to stake enough DToken to change status from Recruiting to Escrow
  const handleStakingDTokenForRecruiting = async () => {
    if (checkValid(stakingAmount) !== true) return;
    const formatedValue = convertPriceToBigDecimals(parseFloat(stakingAmount), TOKEN_TYPES.DTOKEN.decimal);
    setIsOpenPendingModal(true);
    const [result, error]: any = await stakeDTokenWhenRecruiting(deed?.deedAddress, formatedValue);
    if (error) {
      let messageError = error?.error?.message;
      if (messageError === BLOCKCHAIN_ERROR_MESSAGE.RECRUITING_END.blockChainError) {
        messageError = BLOCKCHAIN_ERROR_MESSAGE.RECRUITING_END.message;
      }
      setIsOpenPendingModal(false);
      return message('error', messageError || error?.message);
    }
    setIsConfirm(false);
    setTxId(result?.hash);
    setIsStaking(true);
    await result?.wait(1);
    setIsConfirm(false);
    setIsOpenPendingModal(false);
    setIsStaking(false);
    queryDeed();
    message('success', 'You have successfully staked DToken on this deed!');
    toggleStakeDeedModal();
  };

  const checkValid = (value: any) => {
    if (value === undefined || value.length === 0) return 'This field requires input';
    if (!validateNumber(value, 0, walletBalance, setStakingAmount, () => {}))
      return 'Insufficient wallet balance. Please purchase more DToken or enter a valid staking amount';
    if (value.length && Number(value) === 0) return 'Your input cannot be zero';
    return true;
  };
  return (
    <Modal
      className='stake-deed'
      centered
      visible={isOpenStakeDeedModal}
      onOk={toggleStakeDeedModal}
      onCancel={toggleStakeDeedModal}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      closeIcon={
        <img
          className='absolute top-40px right-40px'
          alt=''
          onClick={toggleStakeDeedModal}
          src={CloseModal}
          width='12px'
          height='12px'
        />
      }
    >
      <ModalMainHeader title='Stake Deed' />

      <ModalHorizontalRule />

      <div className='flex flex-col bg-background-2 w-full border border-opacity-20 rounded-lg p-20px mb-20px'>
        <DeedContractAddressInfo deedContractAddress={deed?.deedAddress} />
      </div>
      <div className='flex flex-col bg-background-2 border border-opacity-20 rounded-lg mb-20px'>
        <div className='flex relative justify-center items-end p-20px'>
          <div className='flex flex-col w-260px'>
            <div className='mb-5px'>
              <ProgressBar large={true} progress={(amountCurrentlyStaking * 100) / amountRequiredStaking} />
            </div>
            <div className='flex w-full justify-between mb-5px'>
              <div className='text-white text-modal-sub-info-line font-semibold'>Current Staking</div>
              <div className='text-white text-modal-sub-info-line font-normal'>
                {NumberToFixedFormater(amountCurrentlyStaking, decimalCurrentStaking)} DToken
              </div>
            </div>
            <div className='flex w-full justify-between mb-25px'>
              <div className='text-white text-modal-sub-info-line font-semibold'>Minimum Required Staking</div>
              <div className='text-white text-modal-sub-info-line font-normal'>
                {NumberToFixedFormater(amountRequiredStaking, decimalRequiredStaking)} DToken
              </div>
            </div>

            <div className='flex w-full justify-between mb-25px text-white text-modal-sub-info-line font-semibold'>
              <div>Wallet Balance</div>
              <div className='text-white text-modal-sub-info-line font-normal'>{`${NumberToFixedFormater(
                Number(walletBalance),
                3,
                false,
                true,
              )} DToken`}</div>
            </div>

            <Input
              onChange={e => {
                setStakingAmount(e.target.value);
              }}
              value={stakingAmount}
              name='account-number'
              style={{
                width: 'full',
                borderRadius: '8px',
                color: 'gray',
                height: '43px',
                borderColor: !!stakingAmountValid.length ? 'red' : '',
              }}
              placeholder='Enter Amount'
              suffix='DToken'
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
            onClick={() => {
              if (parseFloat(walletBalance)) {
                var with2Decimals = walletBalance.toString().match(/^-?\d+(?:\.\d{0,6})?/)[0];
                setStakingAmount(with2Decimals);
              }
            }}
          >
            MAX
          </Button>
        </div>
        <div className='flex justify-center w-full '>
          {stakingAmountValid && (
            <p className='relative text-center text-errorRed text-modal-error-text w-260px'>{stakingAmountValid}</p>
          )}
        </div>
      </div>

      <ModalHorizontalRule />

      <div className='m-auto w-400px'>
        <ApproveStepsModal isApproveToken={isUserApproveDToken} title2={'Stake Deed'} />
      </div>

      <div className='mt-4 text-center'>
        {!isUserApproveDToken && (
          <button
            type='button'
            className='text-white text-modal-button w-106px h-37px px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-lg'
            onClick={doApproveToken}
          >
            Approve
          </button>
        )}
        {isUserApproveDToken && (
          <CustomButton
            type='button'
            className='text-white text-modal-button w-87px h-37px text-modal-button px-4 py-2 text-sm font-medium bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-lg font-semibold'
            onClick={handleStakingDTokenForRecruiting}
            disabled={!!stakingAmountValid.length}
            customType='OkButton'
          >
            {isStaking ? 'Staking' : 'Stake'}
          </CustomButton>
        )}
      </div>
    </Modal>
  );
};
