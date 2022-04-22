import { useEffect, useState, Fragment } from 'react';
import { Spin } from 'antd';
import { useSelector } from 'react-redux';
import '../../../styles/ViewDeed.css';
import { Header } from '../../global/header/Header';
import DeedProgress from '../dashboard/DeedProgress';
import { Deed } from '../dashboard/DeedTable';
import { abbreviateNumber, NumberToFixedFormater } from '../../../utils/Formatters';
import { EditAddress } from '../../global/edit_dashboard/EditAddress';
import { DEED, RECRUITING_STATUS, TOKEN_TYPES } from '../../../utils/Constants';
import DeedAction from './DeedAction';
import { DeedBrokersModal } from './DeedBrokersModal';
import { AddressList } from './AddressList';
import { EditRiskMitigation } from '../../global/edit_dashboard/EditRiskMitigation';
import { useHistory } from 'react-router';
import EditLinks from '../../global/edit_dashboard/EditLinks';
import EditDeedModal from '../dashboard/modal/EditDeedModal';
import { EditManager } from '../../global/edit_dashboard/EditManager';
import { DeedCoins } from '../detail/DeedCoins';
import moment from 'moment';
import {
  convertBigNumberValueToNumber,
  getTokenDecimalsV2,
  getRequiredDownPaymentAmount,
} from '../../../blockchain/utils';
import {
  getRequiredStakingAmount,
  getTotalDownPaymentTokenBuyersJoined,
  getTotalPurchasedTokenValue,
  getTotalStake,
} from '../../../blockchain/services/DeedService';

import DeedPosition from './DeedPosition';
import { isDeedManager } from '../../../utils/roles';
import { getWholesaleWithId } from '../../../blockchain/services/WholesaleService';

type ViewDeedProps = {
  deed: Deed;
  queryDeed: any;
};

export default function ViewDeed({ deed, queryDeed }: ViewDeedProps) {
  const history = useHistory();

  const [isManager, setIsManager] = useState(false);
  const [openBrokers, setOpenBrokers] = useState(false);
  const [isOpenEditDeedModal, setIsOpenEditDeedModal] = useState(false);
  const published = moment.unix(Number(deed?.createdAtTimeStamp)).toDate();
  const [amountRequiredStaking, setAmountRequiredStaking] = useState<number>(0);
  const [amountCurrentlyStaking, setAmountCurrentlyStaking] = useState<number>(0);
  const [amountRequiredDownPayment, setRequiredDownPayment] = useState<number>(0);
  const [totalDownPaymentJoined, setTotalDownPaymentJoined] = useState<number>();
  const [totalPurchasedToken, setTotalPurchasedToken] = useState<string>('_');
  const [buyers, setBuyers] = useState<any>(['--']);
  const [exited, setExited] = useState<any>(['--']);
  const [exitDeedLock, setExitDeedLock] = useState<any>(0);

  const userAddress = useSelector((state: any) => state.wallet.userAddress);

  useEffect(() => {
    const getRequiredDtokenStaking = async (downpayTokenAddress: string) => {
      const [result]: any = await getRequiredStakingAmount(deed?.size, Number(deed?.loanLeverage), deed?.coinA);

      setAmountRequiredStaking(Number(result));

      const [requiredDownPaymentAmount] = getRequiredDownPaymentAmount(deed?.size, Number(deed?.loanLeverage));

      setRequiredDownPayment(requiredDownPaymentAmount as number);
    };
    const totalSupply = async () => {
      const [decimalA]: any = await getTokenDecimalsV2(deed?.coinA);
      const [result]: any = await getTotalDownPaymentTokenBuyersJoined(deed?.deedAddress);
      if (result) setTotalDownPaymentJoined(convertBigNumberValueToNumber(result, decimalA));
    };
    const checkForAmountCurrentlyStaking = async () => {
      const [result] = await getTotalStake(deed?.deedAddress);

      if (result) {
        const formattedTotalDtokenStaked = convertBigNumberValueToNumber(result, TOKEN_TYPES.DTOKEN.decimal);
        setAmountCurrentlyStaking(formattedTotalDtokenStaked);
      }
    };
    const filterBuyerExiterAddresses = () => {
      const buyers = (deed?.buyerDeeds && deed?.buyerDeeds.map((e: any) => e.userAddress)) || ['--'];

      const exited = (deed?.exiterDeeds && deed?.exiterDeeds.map((e: any) => e.userAddress)) || ['--'];

      setBuyers(buyers);
      setExited(exited);
    };

    const checkForManager = async () => {
      if (deed) {
        const isManagerRole = await isDeedManager(userAddress, deed?.deedAddress);
        setIsManager(isManagerRole);
      }
    };

    const getPurchasedTokenValue = async () => {
      const [result] = await getTotalPurchasedTokenValue(deed?.deedAddress, deed?.coinB);
      // result > 0 only when Deed is passed to Open Phase
      // That means deed going to uniswap to swap from Downpayment token (CoinA) to Purchase token (CoinB)
      if (Number(result) > 0) {
        setTotalPurchasedToken(NumberToFixedFormater(result));
      }
    };

    if (userAddress) {
      totalSupply();
      checkForManager();
      getRequiredDtokenStaking(deed?.coinA);
      checkForAmountCurrentlyStaking();
      getPurchasedTokenValue();
    }
    filterBuyerExiterAddresses();
  }, [deed, userAddress]);

  const toggleEditDeedModal = () => {
    setIsOpenEditDeedModal(!isOpenEditDeedModal);
  };

  useEffect(() => {
    const getWholesale = async () => {
      const [wholesale]: any = await getWholesaleWithId(deed?.wholesaleAddress);
      if (wholesale) {
        const deedLock = wholesale.exitDeedLock.toString();
        setExitDeedLock(moment.unix(Number(deed.escrowEndDate)).add(deedLock, 's').unix());
      }
    };
    getWholesale();
    //eslint-disable-next-line
  }, [deed]);

  if (!deed) {
    return (
      <div className='loading'>
        <Spin />
        <h3 className='text-white'>Loading...</h3>
      </div>
    );
  }

  return (
    <Fragment>
      <Header />
      <div className='mt-10 content-max-w mx-auto flex flex-col px-4 xl:px-0'>
        <div className='text-white flex items-center'>
          <div
            className='flex mb-10 text-white cursor-pointer'
            onClick={() => history.goBack()}
            style={{ marginLeft: '-5px' }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 mr-1'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 17l-5-5m0 0l5-5m-5 5h12' />
            </svg>
            Back
          </div>

          <div className='mb-auto ml-auto flex'>
            <DeedAction
              deed={deed}
              deedStatus={deed.status}
              cancelledInStatus={deed.isCanceledInEscrow}
              amountCurrentlyStaking={amountCurrentlyStaking}
              amountRequiredStaking={amountRequiredStaking}
              amountRequiredDownPayment={amountRequiredDownPayment}
              totalDownPaymentJoined={totalDownPaymentJoined as number}
              queryDeed={queryDeed}
              exitDeedLock={exitDeedLock}
            />
          </div>
        </div>
        <DeedCoins tokenPurchased={deed.coinB} downPayToken={deed.coinA} />
        <div
          className='flex flex-col items-center sm:items:start sm:flex-row text-white'
          style={{ marginBottom: '25px' }}
        >
          <div className='flex flex-row'>
            <EditAddress name='Deed Address' address={deed.deedAddress} underline={false} />
          </div>
          <div className='md:ml-8 flex flex-row'>
            <EditManager title='Deed Manager' offeredBy={deed.deedManager} />
          </div>
          <div className='md:ml-8 flex flex-row'>
            <h2 className='mr-4 mb-0 text-white font-semibold text-xs'>Brokers</h2>
            <button
              className='flex items-center font-regular'
              onClick={() => {
                setOpenBrokers(true);
              }}
              title='Expand Brokers'
            >
              <svg
                className='ml-4'
                width='10'
                height='10'
                viewBox='0 0 10 10'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M8.88889 8.88889H1.11111V1.11111H5V0H1.11111C0.494444 0 0 0.5 0 1.11111V8.88889C0 9.5 0.494444 10 1.11111 10H8.88889C9.5 10 10 9.5 10 8.88889V5H8.88889V8.88889ZM6.11111 0V1.11111H8.10556L2.64444 6.57222L3.42778 7.35556L8.88889 1.89444V3.88889H10V0H6.11111Z'
                  fill='url(#paint0_linear_5485_12641)'
                />
                <defs>
                  <linearGradient
                    id='paint0_linear_5485_12641'
                    x1='-4.45265e-07'
                    y1='-0.128202'
                    x2='11.34'
                    y2='1.74051'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop stop-color='#00BEDF' />
                    <stop offset='1' stop-color='#0068B3' />
                  </linearGradient>
                </defs>
              </svg>
            </button>
          </div>
          <div className='hidden lg:flex ml-auto'>
            <EditLinks
              ethplorer={deed.deedAddress}
              share={window.location.href}
              shareId={`https://app.coindeed.io/deed/${deed.deedId}`}
              title2='Deed'
              isDeed={true}
            />
          </div>
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-2 place-content-stretch text-white text-sm gap-25'>
          <div className='grid progress-status-info'>
            <div className='flex col-span-2 flex-col'>
              <DeedProgress
                percentComplete={deed.progress}
                amountCurrentlyStaking={amountCurrentlyStaking}
                amountRequiredStaking={amountRequiredStaking}
                timeLeft={deed.deedEndDate}
                status={deed.status}
                cancelledInStatus={deed.isCanceledInEscrow}
                isDeed={true}
                deed={deed}
                statusType={DEED}
                amountRequiredDownPayment={amountRequiredDownPayment}
                exitDeedLock={exitDeedLock}
              />
              <EditRiskMitigation deed={deed} />
            </div>

            <div
              className='grid text-xs grid-cols-3 grid-rows-2 md:flex flex-col col-auto md:col-1/3 text-left bg-panel bg-opacity-50 rounded-lg'
              style={{ padding: '25px' }}
            >
              <div className='mb-5'>
                <div className='flex'>
                  <h2 className='lh-15 mb-2-5 text-white text-xs font-semibold truncate'>Published Date</h2>
                  {deed.status === RECRUITING_STATUS && isManager && (
                    <div
                      onClick={() => setIsOpenEditDeedModal(true)}
                      className='underline ml-auto hidden italic sm:block cursor-pointer'
                    >
                      Edit
                    </div>
                  )}
                </div>
                <div className='font-light text-white-light truncate'>
                  {/* 09/05/2022 */}
                  {published.toLocaleString('default', { day: '2-digit' })}{' '}
                  {published.toLocaleString('default', { month: 'long' })} {published.getFullYear()}
                </div>
              </div>

              <div className='mb-5'>
                <h2 className='lh-15 mb-2-5 text-white text-xs font-semibold truncate'>Current Leverage</h2>
                <div className='font-light text-white-light truncate'>{deed.loanLeverage}x</div>
              </div>
              <div className='mb-5'>
                <h2 className='lh-15 mb-2-5 text-white text-xs font-semibold truncate'>Total Deed Size</h2>
                <div className='font-light text-white-light truncate'>
                  {abbreviateNumber(deed.size)} {deed.coinAName}
                </div>
              </div>
              <div className='mb-5'>
                <h2 className='lh-15 mb-2-5 text-white text-xs font-semibold truncate'>Total Purchased Token</h2>
                <div className='font-light text-white-light truncate'>
                  {totalPurchasedToken !== '_' ? `${totalPurchasedToken} ${deed.coinBName}` : '_'}
                </div>
              </div>
              <div className='mb-5'>
                <h2 className='lh-15 mb-2-5 text-white text-xs font-semibold truncate'>Down Payment</h2>
                <div className='font-light text-white-light truncate'>
                  {abbreviateNumber(parseFloat(NumberToFixedFormater(deed.size / parseInt(deed.loanLeverage), 2)))}{' '}
                  {deed.coinAName}
                </div>
              </div>

              <div className='mb-5'>
                <h2 className='lh-15 mb-2-5 text-white text-xs font-semibold truncate'>Management Fee</h2>
                <div className='font-light text-white-light truncate'>
                  {deed.managementFee === 100 ? deed.managementFee : deed.managementFee.toPrecision(2)}%
                </div>
              </div>
              <div>
                <h2 className='lh-15 mb-2-5 text-white text-xs font-semibold truncate'>Open to Brokers</h2>
                <div className='font-light text-white-light truncate'>{deed.allowBrokers ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-25'>
            <DeedPosition deed={deed} />
            <div className='grid grid-cols-2 gap-5'>
              <AddressList addresses={buyers} title='Buyers' />
              <AddressList addresses={exited} title='Exited' />
            </div>
            <div className='flex mb-4 justify-center lg:hidden'>
              <EditLinks
                ethplorer={deed.deedAddress}
                share={window.location.href}
                shareId={`https://app.coindeed.io/deed/${deed.deedId}`}
                title2='Deed'
                isDeed={true}
              />
            </div>
          </div>
        </div>
      </div>
      <EditDeedModal
        deed={deed}
        isOpenEditDeedModal={isOpenEditDeedModal}
        toggleEditDeedModal={toggleEditDeedModal}
        updated={() => {
          setIsOpenEditDeedModal(false);
        }}
      ></EditDeedModal>
      <DeedBrokersModal open={openBrokers} setOpen={setOpenBrokers} brokers={buyers} />
    </Fragment>
  );
}
