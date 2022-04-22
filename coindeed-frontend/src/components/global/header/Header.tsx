import { Tabs } from './Tabs';
import logo from '../../../images/newLogo.png';

import { WalletButton } from './../wallet/WalletButton';
import { Link } from 'react-router-dom';
// import { Wallet } from '@ethersproject/wallet';

const tabs = [
  { name: 'Deeds', route: { to: '/deed?type=all' }, current: false },
  { name: 'Lending', route: { to: '/lending' }, current: false },
  { name: 'Wholesale', route: { to: '/wholesale?type=all' }, current: false },
  // { name: 'Managers', route: { to: '/managers' }, current: false },
  { name: 'Account', route: { to: '/account' }, current: false },
];

export const Header = () => {
  return (
    <header>
      <div className='pt-8 content-max-w flex justify-between mx-auto flex-wrap'>
        <div className='order-1 ml-4'>
          <Link to='/deed?type=all'>
            <img src={logo} alt='Coindeed Logo' style={{ height: '39px' }} />
          </Link>
        </div>
        <div className='order-3 w-full mt-8 xl:order-2 xl:max-w-max xl:mt-0'>
          <Tabs tabs={tabs} />
        </div>
        <div className='order-2 mr-4 xl:order-3'>
          <WalletButton />
        </div>
      </div>

      {/* <div className='pt-8 content-max-w flex flex-col justify-center mx-auto xl:hidden'>
        <div className='flex px-4 mb-8'>
          <div className='mr-auto'>
            <Link to='/deed'>
              <img src={logo} alt='Coindeed Logo' style={{ height: '39px' }} />
            </Link>
          </div>
          <div className='ml-auto'>
            <WalletButton />
          </div>
        </div>
        <Tabs tabs={tabs} />
      </div> */}

      {/* <div className='block lg:hidden'>
        <div className='flex justify-center mb-8'>
          <Link to='/deed'>
            <img src={logo} alt='Coindeed Logo' />
          </Link>
          <div className='ml-auto'>
            <WalletButton />
          </div>
        </div>
        <div className='text-center hidden md:block'>
          <Tabs tabs={tabs} />
        </div>
        <div className='block md:hidden'>
          <Tabs tabs={tabs} />
        </div>
      </div> */}
    </header>
  );
};
