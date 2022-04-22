import { Fragment } from 'react';
import DeeToken from '../../images/DeedTokenLogo.svg';
import { Header } from '../global/header/Header';
import { addTokenToMetaMask } from '../../services/wallet';
import AccountSummaryAndDeedsJoinedTable from './AccountSummaryAndDeedsJoinedTable';
import AccountSummaryAndLendingPoolTable from './AccountSummaryAndLendingPoolTable';
import AccountSummaryAndWholesalesListedTable from './AccountSummaryAndWholesalesListedTable';
import DeedsStakedTable from './DeedsStakedTable';
import { TOKEN_TYPES } from '../../utils/Constants';

export default function AccountDashboard() {
  const address = process.env.REACT_APP_DTOKEN_ADDRESS;
  const symbol: string = 'DToken';
  const decimals: number = TOKEN_TYPES.DTOKEN.decimal;
  const image: string = 'https://pbs.twimg.com/profile_images/802481220340908032/M_vde_oi_400x400.jpg';

  return (
    <Fragment>
      <Header />
      <div className='mt-10 content-max-w mx-auto flex flex-col px-4 xl:px-0'>
        <div className='flex mb-0 lg: justify-start'>
          <div className='flex lg:items-end items-center w-3/4 lg: mb-50'>
            <h1 className='font-semibold text-white mr-auto text-2xl mb-0'>Account Overview</h1>
          </div>
          <div className='flex flex-col text-white lg:mb-0 lg:w-1/4 mb-1-5'>
            <div className='flex gap-x-6	justify-end items-center mb-4 mt-5 pr-2'>
              <div className='flex items-center'>
                <img src={DeeToken} className='h-5 w-5 ' alt='CoinDeed' />
                <div className='ml-2 pb-0 lg:text-sm text-xs' style={{ lineHeight: '17px' }}>
                  DToken Price
                </div>
              </div>
              <div className='flex items-center font-semibold text-2xl pr-3'>
                <div>$0.00</div>
              </div>
            </div>
            <div className='flex flex-row justify-end pr-2 mb-12'>
              <div className='p-px bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue rounded-md'>
                <button
                  onClick={() => addTokenToMetaMask(address, symbol, decimals, image)}
                  className='text-xs bg-blue rounded-md py-1 px-10'
                >
                  Add Token to Wallet (Web3)
                </button>
              </div>
            </div>
          </div>
        </div>
        <AccountSummaryAndDeedsJoinedTable />
        <AccountSummaryAndLendingPoolTable />
        <AccountSummaryAndWholesalesListedTable />
        <DeedsStakedTable />
      </div>
    </Fragment>
  );
}
