// TODO: Change deedSTATUS back to deed.status
import { useState, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import moment from 'moment';
import './style.scss';

import CancelModal from '../dashboard/modal/CancelModal';
import ClaimDownPaymentModal from '../dashboard/modal/ClaimDownPaymentModal';
import ClaimManagementFeeModal from '../dashboard/modal/ClaimManagementFeeModal';
import ClaimStakingModal from '../dashboard/modal/ClaimStakingModal';

import PendingModal from '../../global/modal/PendingModal';
import { StakeDeedModal } from '../dashboard/modal/StakeDeedModal';
import { JoinDeedModal } from '../dashboard/modal/JoinDeedModal';
import ExitModal from '../dashboard/modal/ExitModal';

import {
  ESCROW_STATUS,
  CANCELLED_STATUS,
  RECRUITING_STATUS,
  OPEN_STATUS,
  COMPLETED_STATUS,
  TOKEN_TYPES,
} from '../../../utils/Constants';

import {
  getAmountDownPayTokenUserJoined,
  getAmountDTokenStakedByUserAddress,
  getBuyIns,
  moveToEscrow,
  getTotalJoinedDownPayment,
  getTotalStake,
} from '../../../blockchain/services/DeedService';
import CustomButton from '../../global/antd/CustomButton';
import { CompleteDeedModal } from '../dashboard/modal/CompleteDeedModal';
import { ExecuteDeedModal } from '../dashboard/modal/ExecuteDeedModal';
import ClaimDeedModal from '../dashboard/modal/ClaimDeedModal';

import { convertBigNumberValueToNumber, getTokenDecimalsV2 } from '../../../blockchain/utils';
import { isBroker, isBuyer, isDeedManager } from '../../../utils/roles';
import { message } from '../../global/antd/Message';
import { NumberToFixedFormater } from '../../../utils/Formatters';
import { Tooltip } from 'antd';

type DeedActionProps = {
  amountRequiredStaking: number;
  amountCurrentlyStaking: number;
  amountRequiredDownPayment: number;
  deedStatus: number;
  cancelledInStatus: number | null;
  deed: any;
  totalDownPaymentJoined: number;
  queryDeed: any;
  exitDeedLock: any;
};

export default function DeedAction({
  deed,
  deedStatus,
  cancelledInStatus,
  amountCurrentlyStaking,
  amountRequiredStaking,
  amountRequiredDownPayment,
  totalDownPaymentJoined,
  queryDeed,
  exitDeedLock,
}: DeedActionProps) {
  const dispatch = useDispatch();
  const [isOpenClaimStakingModal, setIsOpenClaimStakingModal] = useState(false);
  const [isOpenExecuteDeedModal, setIsOpenExecuteDeedModal] = useState(false);
  const [isOpenCompleteDeedModal, setIsOpenCompleteDeedModal] = useState(false);
  const [isOpenJoinDeedModal, setIsOpenJoinDeedModal] = useState(false);
  const [isOpenStakeDeedModal, setIsOpenStakeDeedModal] = useState(false);
  const [isOpenExitModal, setIsOpenExitModal] = useState(false);
  const [isOpenClaimManagementFeeModal, setIsOpenClaimManagementFeeModal] = useState(false);
  const [isOpenClaimDownPaymentModal, setIsOpenClaimDownPaymentModal] = useState(false);
  const [isOpenCancelModal, setIsOpenCancelModal] = useState(false);
  const [isOpenClaimDeedModal, setIsOpenClaimDeedModal] = useState(false);

  const [isOpenPendingModal, setIsOpenPendingModal] = useState(false);
  const [isConfirm, setIsConfirm] = useState(true);
  const [exited, setExited] = useState(false);
  const [shouldDislayExecuteButton, setShouldDisplayExecuteButton] = useState(false);
  const [txId, setTxId] = useState<string>('');
  const [buyerSupplyAmount, setBuyerSupplyAmount] = useState<number>(0);
  const [currentDtokenStaked, setCurrentDtokenStaked] = useState(0);
  // eslint-disable-next-line
  const [totalDtokenStaked, setTotalDtokenStake] = useState(amountCurrentlyStaking);
  const [totalJoinedDaoP, setTotalJoinedDaoP] = useState(totalDownPaymentJoined);
  //eslint-disable-next-line
  const [currentDownpayJoined, setCurrentDownpayJoined] = useState<any>(0);
  const [isDisableJoinButton, setIsDisableJoinButton] = useState(false);
  const [isShowJoinButton, setIsShowJoinButton] = useState(false);
  const [isShowStakeButton, setIsShowStakeButton] = useState(false);
  const [isShowCompleteButton, setIsShowCompleteButton] = useState(false);
  const [isShowCancelButtonWhenRecruiting, setIsShowCancelButtonWhenRecruiting] = useState(false);
  const [countdownTimerDisableJoinButton, setCountdownTimerDisableJoinButton] = useState<number>(0);
  const [countdownTimerShowCompleteButton, setCountdownTimerShowCompleteButton] = useState<number>(0);
  const [countdownTimerShowCancelButtonRecruiting, setCountdownTimerShowCancelButtonRecruitng] = useState<number>(0);
  const [isLockExitDeed, setIsLockExitDeed] = useState(exitDeedLock === 0 ? false : true);

  // CURRENT USER ADDRESSC CONNECTED WALLET
  const userAddress = useSelector((state: any) => state.wallet.userAddress);

  // ROLE CHECKING
  const [isBuyerRole, setIsBuyerRole] = useState(false);
  const [isBrokerRole, setIsBrokerRole] = useState(false);
  const [isDeedManagerRole, setIsDeedManagerRole] = useState(false);

  const escrowEndDate = moment.unix(deed?.escrowEndDate);
  const recruitingEndDate = moment.unix(deed?.recruitingEndDate);
  const deedEndDate = moment.unix(deed?.deedEndDate);
  const diffTimeEscrow = moment().diff(escrowEndDate) * -1;
  const diffTimeDeedOpen = moment().diff(deedEndDate) * -1;
  const diffTimeDeedRecruiting = moment().diff(recruitingEndDate) * -1;
  const diffTimeDeedLock = moment().diff(moment.unix(exitDeedLock)) * -1;

  useEffect(() => {
    const getBuyInStatus = async () => {
      const [result]: any = await getBuyIns(deed?.deedAddress, userAddress);
      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);

      if (result && result.toString() === '0') {
        setExited(true);
        setBuyerSupplyAmount(0);
      } else if (result) {
        setExited(false);
        const amount = convertBigNumberValueToNumber(result, decimalA);
        setBuyerSupplyAmount(amount);
      }
    };

    const getBuyer = async () => {
      const result = await isBuyer(userAddress, deed?.deedAddress, deed?.coinAName);
      setIsBuyerRole(result);
    };
    const checkIsUserBroker = async () => {
      const isTrue = await isBroker(userAddress, deed?.deedAddress);
      setIsBrokerRole(isTrue);
    };
    const checkIsUserManager = async () => {
      const isTrue = await isDeedManager(userAddress, deed?.deedAddress);
      setIsDeedManagerRole(isTrue);
    };
    const getCurrentUserStakedDtoken = async () => {
      const [result]: any = await getAmountDTokenStakedByUserAddress(deed?.deedAddress, userAddress);

      setCurrentDtokenStaked(result);
    };

    const getCurrentUserJoined = async () => {
      const [result] = await getAmountDownPayTokenUserJoined(deed?.deedAddress, userAddress, deed?.coinA);

      setCurrentDownpayJoined(result as any);
    };

    if (userAddress) {
      getBuyer();
      getBuyInStatus();
      checkIsUserBroker();
      checkIsUserManager();
      getCurrentUserStakedDtoken();
      getCurrentUserJoined();
    }
    // eslint-disable-next-line
  }, [deed, isOpenPendingModal, userAddress]);

  const toggleClaimStakingModal = () => {
    if (userAddress) {
      return setIsOpenClaimStakingModal(!isOpenClaimStakingModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };

  const toggleExecuteDeedModal = () => {
    if (userAddress) {
      return setIsOpenExecuteDeedModal(!isOpenExecuteDeedModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };

  const toggleCompleteDeedModal = () => {
    if (userAddress) {
      return setIsOpenCompleteDeedModal(!isOpenCompleteDeedModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };
  const toggleJoinDeeedModal = () => {
    if (userAddress) {
      return setIsOpenJoinDeedModal(!isOpenJoinDeedModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };
  const toggleStakeDeedModal = () => {
    if (userAddress) {
      return setIsOpenStakeDeedModal(!isOpenStakeDeedModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };
  const toggleExitModal = () => {
    if (userAddress) {
      return setIsOpenExitModal(!isOpenExitModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };
  const toggleClaimManagementFeeModal = () => {
    if (userAddress) {
      return setIsOpenClaimManagementFeeModal(!isOpenClaimManagementFeeModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };
  const toggleClaimDownPaymentModal = () => {
    if (userAddress) {
      return setIsOpenClaimDownPaymentModal(!isOpenClaimDownPaymentModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };
  const toggleCancelModal = () => {
    if (userAddress) {
      return setIsOpenCancelModal(!isOpenCancelModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };
  const toggleClaimDeedModal = () => {
    if (userAddress) {
      return setIsOpenClaimDeedModal(!isOpenClaimDeedModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };

  const checkDisplayExecuteButton = () => {
    const toggleExecute =
      NumberToFixedFormater(totalDownPaymentJoined) === NumberToFixedFormater(deed?.size / Number(deed?.loanLeverage));
    setShouldDisplayExecuteButton(toggleExecute);
  };

  const getTotalSupplyDeed = async () => {
    const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);
    const [totalSupplyDeed]: any = await getTotalJoinedDownPayment(deed?.deedAddress);
    if (totalSupplyDeed) {
      setTotalJoinedDaoP(convertBigNumberValueToNumber(totalSupplyDeed, decimalA));
    }
  };

  const checkDisabledJoinButton = async () => {
    getTotalSupplyDeed();
    setCountdownTimerDisableJoinButton(countdownTimerDisableJoinButton + 1);
  };

  useEffect(() => {
    if (diffTimeEscrow < 0) {
      getTotalSupplyDeed();
    }
    // eslint-disable-next-line
  }, [deed?.deedAddress]);

  const checkShowCompleteButton = async () => {
    if (diffTimeDeedLock < 0) {
      setIsLockExitDeed(false);
    } else setIsLockExitDeed(true);

    const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);
    const [totalSupplyDeed]: any = await getTotalJoinedDownPayment(deed?.deedAddress);

    if (convertBigNumberValueToNumber(totalSupplyDeed, decimalA) === 0) {
      setIsShowCompleteButton(true);
    } else {
      setCountdownTimerShowCompleteButton(countdownTimerShowCompleteButton + 1);
    }
  };

  const triggerToEscrow = async () => {
    setIsOpenPendingModal(true);
    const [result, error]: any = await moveToEscrow(deed?.deedAddress);
    setIsConfirm(false);
    setTxId(result?.hash);
    if (error) {
      let messageError = error?.error?.message;
      setIsOpenPendingModal(false);
      return message('error', messageError || error?.message);
    }
    await result?.wait(1);
    setIsConfirm(false);
    setIsOpenPendingModal(false);
    queryDeed();
    message('success', 'Deed has been moved to Escrow phase!');
  };

  useEffect(() => {
    if (deed?.status === OPEN_STATUS) {
      const refreshTimer = 1000;
      let IntervalTimer: any;
      if (diffTimeDeedOpen > 0 && !isShowCompleteButton) {
        IntervalTimer = setInterval(checkShowCompleteButton, refreshTimer);
      }

      if (diffTimeDeedOpen < 0) {
        setIsShowCompleteButton(true);
      }
      return () => {
        clearInterval(IntervalTimer);
      };
    }
    //eslint-disable-next-line
  }, [deed, countdownTimerShowCompleteButton]);

  useEffect(() => {
    if (deed?.status === ESCROW_STATUS) {
      const refreshTimer = 1000;
      let IntervalTimer: any;
      if (diffTimeEscrow > 0) {
        IntervalTimer = setInterval(checkDisabledJoinButton, refreshTimer);
        if (totalJoinedDaoP === amountRequiredDownPayment) {
          setIsDisableJoinButton(true);
        }
      }
      if (diffTimeEscrow < 0) {
        setIsShowJoinButton(true);
      }
      return () => {
        clearInterval(IntervalTimer);
      };
    }
    // eslint-disable-next-line
  }, [deed, countdownTimerDisableJoinButton, totalJoinedDaoP, amountRequiredDownPayment]);

  useEffect(() => {
    if (deed?.status === ESCROW_STATUS) {
      const refreshTimer = 1000;
      let IntervalTimer: any;
      if (diffTimeEscrow > 0) IntervalTimer = setInterval(checkDisplayExecuteButton, refreshTimer);
      if (diffTimeEscrow < 0 && amountRequiredDownPayment > 0 && totalDownPaymentJoined >= amountRequiredDownPayment) {
        setShouldDisplayExecuteButton(true);
      }
      return () => {
        clearInterval(IntervalTimer);
      };
    }
    // eslint-disable-next-line
  }, [deed, totalDownPaymentJoined, amountRequiredDownPayment]);

  useEffect(() => {
    if (deed?.status === RECRUITING_STATUS) {
      const refreshTimer = 1000;
      let IntervalTimer: any;
      if (diffTimeDeedRecruiting > 0) IntervalTimer = setInterval(checkCancelButtonWhenIsRecruiting, refreshTimer);
      if (diffTimeDeedRecruiting < 0) {
        setIsShowStakeButton(true);
        // if (totalDtokenStaked < amountRequiredStaking) {
        //   setIsShowCancelButtonWhenRecruiting(true);
        // }
      }
      return () => {
        clearInterval(IntervalTimer);
      };
    }
    // eslint-disable-next-line
  }, [deed, countdownTimerShowCancelButtonRecruiting, amountRequiredStaking]);

  const checkCancelButtonWhenIsRecruiting = async () => {
    const [result]: any = await getTotalStake(deed?.deedAddress);
    const [currentUserStaked]: any = await getAmountDTokenStakedByUserAddress(deed?.deedAddress, userAddress);
    if (currentUserStaked === convertBigNumberValueToNumber(result, TOKEN_TYPES.DTOKEN.decimal)) {
      setIsShowCancelButtonWhenRecruiting(true);
    } else setIsShowCancelButtonWhenRecruiting(false);

    setTotalDtokenStake(convertBigNumberValueToNumber(result, TOKEN_TYPES.DTOKEN.decimal));
    setCountdownTimerShowCancelButtonRecruitng(countdownTimerShowCancelButtonRecruiting + 1);
  };
  return (
    <div>
      {isDeedManagerRole && (
        <Fragment>
          <div className='flex items-center'>
            {deedStatus === RECRUITING_STATUS && (
              <div className='flex items-center'>
                <div className='recruiting-manager'>
                  {!isShowStakeButton && (
                    <CustomButton customType='OkButton' onClick={toggleStakeDeedModal}>
                      Stake
                    </CustomButton>
                  )}
                </div>
                {isShowCancelButtonWhenRecruiting && (
                  <CustomButton className='ml-5' customType='cancelButton' onClick={toggleCancelModal}>
                    Cancel
                  </CustomButton>
                )}
                {amountRequiredStaking > 0 && amountCurrentlyStaking >= amountRequiredStaking && (
                  <CustomButton className='ml-5' customType='cancelButton' onClick={triggerToEscrow}>
                    Start Escrow
                  </CustomButton>
                )}
              </div>
            )}
            {deedStatus === ESCROW_STATUS && (
              <div className='flex items-center'>
                <div className='recruiting-manager'>
                  {!isShowJoinButton && isDisableJoinButton && (
                    <Tooltip title='Deed is full. You cannot join this deed.'>
                      <span>
                        <CustomButton customType='OkButton' disabled={isDisableJoinButton}>
                          Join
                        </CustomButton>
                      </span>
                    </Tooltip>
                  )}
                  {!isShowJoinButton && !isDisableJoinButton && (
                    <CustomButton customType='OkButton' onClick={toggleJoinDeeedModal} disabled={isDisableJoinButton}>
                      Join
                    </CustomButton>
                  )}
                  {/* {isShowCancelButtonWhenEscrow && (
                    <CustomButton className='ml-5' customType='cancelButton' onClick={toggleCancelModal}>
                      Cancel
                    </CustomButton>
                  )} */}
                </div>
                {shouldDislayExecuteButton && (
                  <div>
                    <CustomButton className='ml-5' customType='cancelButton' onClick={toggleExecuteDeedModal}>
                      Execute
                    </CustomButton>
                  </div>
                )}
              </div>
            )}
            {deedStatus === OPEN_STATUS && isShowCompleteButton && (
              <div className='recruiting-manager'>
                <CustomButton customType='OkButton' onClick={toggleCompleteDeedModal}>
                  Complete
                </CustomButton>
              </div>
            )}
            {deedStatus === OPEN_STATUS && !exited && (
              <div className={`${isDeedManagerRole && isBuyerRole ? 'isDMAndBuyer' : ''}`}>
                <CustomButton
                  customType={isDeedManagerRole && isBuyerRole && isShowCompleteButton ? 'cancelButton' : 'OkButton'}
                  onClick={
                    isLockExitDeed
                      ? () => {
                          message('info', `You can not exit this deed until the wholesale's time locked is ended`);
                        }
                      : toggleExitModal
                  }
                  // disabled={isLockExitDeed}
                >
                  Exit
                </CustomButton>
              </div>
            )}
            {deedStatus === COMPLETED_STATUS && (
              <div className='flex items-center'>
                <div className='recruiting-broker'>
                  {currentDtokenStaked > 0 && (
                    <CustomButton
                      customType={currentDtokenStaked > 0 ? 'OkButton' : 'cancelButton'}
                      disabled={currentDtokenStaked === 0}
                      onClick={toggleClaimManagementFeeModal}
                    >
                      Claim Fee
                    </CustomButton>
                  )}
                  {deedStatus === COMPLETED_STATUS && buyerSupplyAmount > 0 && isBuyerRole && (
                    <CustomButton customType='cancelButton' className='isDMAndBuyer' onClick={toggleClaimDeedModal}>
                      Claim Deed
                    </CustomButton>
                  )}
                </div>
              </div>
            )}
          </div>
        </Fragment>
      )}

      {!isDeedManagerRole && (
        <>
          {/* Buyer in Recruiting */}
          {deedStatus === RECRUITING_STATUS && deed?.allowBrokers && (
            <div className='flex items-center'>
              <div className='recruiting-manager'>
                {!isShowStakeButton && (
                  <CustomButton customType='OkButton' onClick={toggleStakeDeedModal}>
                    Stake
                  </CustomButton>
                )}
              </div>
            </div>
          )}

          {/* Buyer in is Escrow */}
          {deedStatus === ESCROW_STATUS && (
            <div className='flex items-center'>
              <div className='recruiting-manager'>
                {!isShowJoinButton && isDisableJoinButton && (
                  <Tooltip title='Deed is full. You cannot join this deed.'>
                    <span>
                      <CustomButton customType='OkButton' disabled={isDisableJoinButton}>
                        Join
                      </CustomButton>
                    </span>
                  </Tooltip>
                )}
                {!isShowJoinButton && !isDisableJoinButton && (
                  <CustomButton customType='OkButton' onClick={toggleJoinDeeedModal} disabled={isDisableJoinButton}>
                    Join
                  </CustomButton>
                )}
              </div>
            </div>
          )}

          {/* BUYER is in OPEN */}
          {deedStatus === OPEN_STATUS && isBuyerRole && !exited && (
            <div className='flex items-center'>
              <div className='recruiting-manager'>
                <CustomButton customType={'OkButton'} disabled={exited} onClick={toggleExitModal}>
                  Exit
                </CustomButton>
              </div>
            </div>
          )}

          {/* BUYER is in COMPLETED */}
          {deedStatus === COMPLETED_STATUS && buyerSupplyAmount > 0 && (
            <div className='flex items-center'>
              <div className='recruiting-manager'>
                <CustomButton customType='OkButton' onClick={toggleClaimDeedModal}>
                  Claim Deed
                </CustomButton>
              </div>
            </div>
          )}

          {/* BROKER is claim Management Fee when Deed is completed*/}
          {deedStatus === COMPLETED_STATUS && isBrokerRole && (
            <div className='flex items-center'>
              <div className='recruiting-broker'>
                {currentDtokenStaked > 0 && (
                  <CustomButton customType={'OkButton'} onClick={toggleClaimManagementFeeModal}>
                    Claim Fee
                  </CustomButton>
                )}
              </div>
            </div>
          )}

          {/* BROKER action when DEED is in  RECRUITING*/}
          {deedStatus === CANCELLED_STATUS && isBrokerRole && (
            <div className='flex items-center'>
              <div className='recruiting-broker'>
                {currentDtokenStaked > 0 && (
                  <CustomButton customType={'OkButton'} onClick={toggleClaimStakingModal}>
                    Claim Staking
                  </CustomButton>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {/* BUYER action when DEED is in Canceled*/}
      {deedStatus === CANCELLED_STATUS && isBuyerRole && (
        <div className='flex items-center'>
          <div className='recruiting-broker'>
            {currentDownpayJoined > 0 && (
              <CustomButton customType={'OkButton'} onClick={toggleClaimDownPaymentModal}>
                Claim DP
              </CustomButton>
            )}
          </div>
        </div>
      )}

      <CancelModal
        deed={deed}
        isOpenCancelModal={isOpenCancelModal}
        toggleCancelModal={toggleCancelModal}
        setIsOpenPendingModal={setIsOpenPendingModal}
        setIsConfirm={setIsConfirm}
        setTxId={setTxId}
        currentDtokenStaked={currentDtokenStaked}
        queryDeed={queryDeed}
      />
      <ClaimDownPaymentModal
        deed={deed}
        isOpenClaimDownPaymentModal={isOpenClaimDownPaymentModal}
        toggleClaimDownPaymentModal={toggleClaimDownPaymentModal}
        setIsOpenPendingModal={setIsOpenPendingModal}
        setIsConfirm={setIsConfirm}
        setTxId={setTxId}
        deedAddress={deed.deedAddress}
        queryDeed={queryDeed}
      />

      {deed?.status === COMPLETED_STATUS && isBuyerRole && (
        <ClaimDeedModal
          deed={deed}
          isOpenClaimDeedModal={isOpenClaimDeedModal}
          toggleClaimDeedModal={toggleClaimDeedModal}
          setIsOpenPendingModal={setIsOpenPendingModal}
          setIsConfirm={setIsConfirm}
          setTxId={setTxId}
          deedAddress={deed.deedAddress}
          queryDeed={queryDeed}
          supplyAmount={buyerSupplyAmount as number}
        />
      )}

      {deed?.status === COMPLETED_STATUS && (
        <ClaimManagementFeeModal
          // open={openClaimForManagementFee}
          // setOpen={setOpenClaimForManagementFee}
          isOpenClaimManagementFeeModal={isOpenClaimManagementFeeModal}
          toggleClaimManagementFeeModal={toggleClaimManagementFeeModal}
          setIsOpenPendingModal={setIsOpenPendingModal}
          setIsConfirm={setIsConfirm}
          setTxId={setTxId}
          deedAddress={deed.deedAddress}
          currentDtokenStaked={currentDtokenStaked}
          totalAmountCurrentlyStaking={amountCurrentlyStaking}
          downpaymentToken={deed?.coinA}
          queryDeed={queryDeed}
        />
      )}
      {deed?.status === OPEN_STATUS && (
        <ExitModal
          deed={deed}
          isOpenExitModal={isOpenExitModal}
          toggleExitModal={toggleExitModal}
          setIsOpenPendingModal={setIsOpenPendingModal}
          setIsConfirm={setIsConfirm}
          setTxId={setTxId}
          supplyAmount={buyerSupplyAmount as number}
          deedStatus={deedStatus}
          queryDeed={queryDeed}
        />
      )}
      {deed?.status === RECRUITING_STATUS && isOpenStakeDeedModal && (
        <StakeDeedModal
          deed={deed}
          isOpenStakeDeedModal={isOpenStakeDeedModal}
          toggleStakeDeedModal={toggleStakeDeedModal}
          setIsOpenPendingModal={setIsOpenPendingModal}
          setIsConfirm={setIsConfirm}
          isOpenPendingModal={isOpenPendingModal}
          setTxId={setTxId}
          amountCurrentlyStaking={amountCurrentlyStaking}
          amountRequiredStaking={amountRequiredStaking}
          queryDeed={queryDeed}
        />
      )}

      <JoinDeedModal
        deed={deed}
        isOpenJoinDeedModal={isOpenJoinDeedModal}
        toggleJoinDeedModal={toggleJoinDeeedModal}
        setIsOpenPendingModal={setIsOpenPendingModal}
        setIsConfirm={setIsConfirm}
        isOpenPendingModal={isOpenPendingModal}
        setTxId={setTxId}
        queryDeed={queryDeed}
      />
      {/* <CloseEscrowModal deed={deed}  setOpen={setOpenCloseDeedModal} /> */}

      <CompleteDeedModal
        deed={deed}
        isOpenCompleteDeedModal={isOpenCompleteDeedModal}
        toggleCompleteDeedModal={toggleCompleteDeedModal}
        setIsOpenPendingModal={setIsOpenPendingModal}
        setIsConfirm={setIsConfirm}
        setTxId={setTxId}
        queryDeed={queryDeed}
      />
      <ExecuteDeedModal
        deed={deed}
        isOpenExecuteDeedModal={isOpenExecuteDeedModal}
        toggleExecuteDeedModal={toggleExecuteDeedModal}
        setIsOpenPendingModal={setIsOpenPendingModal}
        isOpenPendingModal={isOpenPendingModal}
        setIsConfirm={setIsConfirm}
        setTxId={setTxId}
        queryDeed={queryDeed}
      />

      <ClaimStakingModal
        deed={deed}
        isOpenClaimStakingModal={isOpenClaimStakingModal}
        toggleClaimStakingModal={toggleClaimStakingModal}
        setIsOpenPendingModal={setIsOpenPendingModal}
        setIsConfirm={setIsConfirm}
        setTxId={setTxId}
        amountStaked={currentDtokenStaked}
        queryDeed={queryDeed}
      />

      <PendingModal open={isOpenPendingModal} setOpen={setIsOpenPendingModal} isConfirm={isConfirm} txId={txId} />
    </div>
  );
}
