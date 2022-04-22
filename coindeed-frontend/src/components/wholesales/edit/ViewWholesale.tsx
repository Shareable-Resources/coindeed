import { WHOLESALE, WHOLESALE_OPEN } from '../../../utils/Constants';
import { shrinkAddressX } from '../../../utils/Formatters';
import { EditId } from '../../global/edit_dashboard/EditAddress';
import EditGraph from '../../global/edit_dashboard/EditGraph';
import EditLinks from '../../global/edit_dashboard/EditLinks';
import { Header } from '../../global/header/Header';
import { Wholesale } from '../dashboard/WholesaleTable';
import '../../../styles/ViewWholesale.css';
import EditStatus from '../../global/edit_dashboard/EditStatus';
import '../../../styles/ViewWholesale.css';
import { useHistory } from 'react-router';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import WholesaleAction from './wholesale-action';
import { EditManager } from '../../global/edit_dashboard/EditManager';
import { DeedCoins } from '../../deed/detail/DeedCoins';
import { getPermit } from '../../../blockchain/services/WholesaleService';
import { useSelector } from 'react-redux';
import { convertBigNumberValueToNumber, getExchangeRateWithUSD, getTokenDecimalsV2 } from '../../../blockchain/utils';
import moment from 'moment';

type ViewWholesaleProps = {
  wholesale: Wholesale;
};

const wholesaleAddress = process.env.REACT_APP_WHOLESALE_ADDRESS;

export const ViewWholesale = ({ wholesale }: ViewWholesaleProps) => {
  const history = useHistory();
  const [isWholesaler, setIsWholesaler] = useState(false);
  const [hasPermitted, setHasPermit] = useState<any>(false);
  const [priceWSToken, setPriceWSToken] = useState<any>(1);
  const [totalSize, setTotalSize] = useState<any>('--');
  const [minimum, setMinimum] = useState<any>('--');
  const [amountReserved, setAmountReserved] = useState<any>('--');
  const userAddress = useSelector((state: any) => state.wallet.userAddress);

  useEffect(() => {
    const getUserWallet = async () => {
      if (userAddress && _.toLower(userAddress) === _.toLower(wholesale?.offeredBy)) {
        setIsWholesaler(true);
      }
      const [permit] = await getPermit(wholesale.saleId, userAddress);
      setHasPermit(permit);
    };
    const getPriceWSToken = async () => {
      // eslint-disable-next-line
      const [exchange]: any = await getExchangeRateWithUSD(wholesale?.tokenRequested);
      const [decimalTokenOffer]: any = await getTokenDecimalsV2(wholesale?.tokenOffered);
      const [decimalRequest]: any = await getTokenDecimalsV2(wholesale?.tokenRequested);
      if (wholesale.offeredAmount && wholesale.receivedAmount) {
        const offerAmount = convertBigNumberValueToNumber(wholesale?.offeredAmount, decimalTokenOffer);
        const requestAmount = convertBigNumberValueToNumber(wholesale?.requestedAmount, decimalRequest);
        const min = convertBigNumberValueToNumber(wholesale?.minSaleAmount, decimalRequest);
        const reserved = convertBigNumberValueToNumber(wholesale?.receivedAmount, decimalRequest);
        const pricePer = requestAmount / offerAmount;
        setTotalSize(offerAmount);
        setMinimum(min);
        setAmountReserved(reserved);
        setPriceWSToken(pricePer);
        setTimeout(getPriceWSToken, 180000);
      }
    };
    getUserWallet();
    getPriceWSToken();
    // eslint-disable-next-line
  }, [wholesale]);

  const endDate = moment.unix(Number(wholesale.deadline));
  const diffTime = moment().diff(endDate) * -1;

  useEffect(() => {
    if (wholesale?.status === WHOLESALE_OPEN) {
      const refreshTimer = 1000;
      let IntervalTimer: any;
      if (diffTime > 0) IntervalTimer = setInterval(checkCountDownEndDate, refreshTimer);
      return () => {
        clearInterval(IntervalTimer);
      };
    }
    //eslint-disable-next-line
  }, [wholesale]);

  const checkCountDownEndDate = () => {
    if (moment().diff(endDate) * -1 < 0) return window.location.reload();
  };

  return (
    <>
      <Header />
      <div className='mt-10 content-max-w mx-auto flex flex-col px-4 xl:px-0'>
        <div className='text-white flex items-center justify-between items-baseline'>
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
          <WholesaleAction wholesale={wholesale} isPublic={wholesale.isPrivate} isWholesaler={isWholesaler} />
        </div>
        {/* 
        <div className='flex items-center mb-5'>
          <img className='mr-1' src={iconOffered} alt='token icon' width='30px' height='30px' />
          <img src={iconRequested} alt='token icon' width='30px' height='30px' />
          <h1 className='text-white text-left text-2xl font-bold mb-0 ml-2-5 lh-29'>
            {generateTokenNameByAddress(wholesale.tokenOffered)}
          </h1>
          <h1 className='text-white text-left text-2xl font-bold m-0 lh-29'>/</h1>
          <h1 className='text-white text-left text-2xl font-bold mb-0 ml-1 lh-29'>
            {generateTokenNameByAddress(wholesale.tokenRequested)}
          </h1>
        </div> */}
        <DeedCoins tokenPurchased={wholesale.tokenOffered} downPayToken={wholesale.tokenRequested} />

        <div className='flex flex-col items-center sm:items:start sm:flex-row text-white mb-6'>
          <div className='flex flex-row'>
            <EditId name='Wholesale Id' address={wholesale.saleId} />
          </div>
          <div className='md:ml-10 flex'>
            <EditManager title='Wholesale Manager' offeredBy={wholesale.offeredBy} />
          </div>
          <div className='hidden lg:flex ml-auto'>
            <EditLinks
              ethplorer={wholesaleAddress as string}
              share={window.location.href}
              title2='Wholesale'
              shareId={`https://app.coindeed.io/wholesale/${wholesale?.saleId}`}
              isDeed={false}
            />
          </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-25'>
          <div className=''>
            <EditGraph title={'Price Performance'} />
          </div>
          <div className='progress-status-info-wholesale'>
            <div className=''>
              <div className='grid grid-cols-2 sm:grid-cols-1 text-left rounded-md p-4 bg-panel bg-opacity-50 text-xs'>
                <div>
                  <div className='flex text-left'>
                    <h2 className='mb-2-5 font-semibold truncate text-white'>Wholesale Type</h2>
                    {/* <div className='underline ml-auto hidden italic sm:block'>Edit</div> */}
                  </div>
                  <div className='mb-5 text-white-light truncate text-left'>
                    {wholesale.isPrivate ? 'Private' : 'Public'}
                  </div>
                  <div className='mb-5 text-left'>
                    <h2 className='mb-2-5 font-semibold lh-15 text-white'>Price</h2>
                    <div className='text-white-light truncate'>{priceWSToken}</div>
                  </div>
                  <div className='mb-5 text-left'>
                    <h2 className='mb-2-5 font-semibold lh-15 text-white'>Total Size</h2>
                    <div className='text-white-light truncate'>{totalSize}</div>
                  </div>
                </div>
                <div>
                  <div className='flex text-left'>
                    <h2 className='mb-2-5 font-semibold lh-15 truncate text-white'>Min Deed Amount Required</h2>
                    {/* <div className='underline ml-auto block sm:hidden'>Edit</div> */}
                  </div>
                  <div className='mb-5 text-white-light truncate'>{minimum}</div>
                  <div className='mb-5 text-left'>
                    <h2 className='mb-2-5 font-semibold lh-15 text-white'>Amount Reserved</h2>
                    <div className='text-white-light truncate'>{amountReserved}</div>
                  </div>
                  <div className='mb-0 text-left'>
                    <h2 className='mb-2-5 font-semibold lh-15 text-white '>Deed Bounded</h2>
                    <div className='text-white-light truncate'>
                      {wholesale.reservedTo === '0x0000000000000000000000000000000000000000'
                        ? '-'
                        : shrinkAddressX(wholesale.reservedTo, 8, 3)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex-box'>
              <EditStatus
                wholesale={wholesale}
                status={wholesale.status}
                statusType={WHOLESALE}
                pub={wholesale.isPrivate}
                isWholesaler={isWholesaler}
                hasPermitted={hasPermitted}
              />
            </div>
          </div>
          <div className='flex mb-4 justify-center lg:hidden'>
            <EditLinks
              ethplorer={wholesaleAddress as string}
              share={window.location.href}
              title2='Wholesale'
              shareId={`https://app.coindeed.io/wholesale/${wholesale?.saleId}`}
              isDeed={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};
