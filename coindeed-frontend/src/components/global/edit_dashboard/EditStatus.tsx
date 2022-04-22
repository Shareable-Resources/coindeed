import {
  DEED,
  WHOLESALE_OPEN,
  WHOLESALE,
  WHOLESALE_RESERVED,
  WHOLESALE_CANCELLED,
  WHOLESALE_COMPLETED,
  WHOLESALE_WITHDRAWN,
} from '../../../utils/Constants';
import { generateDeedStatus, generateWholesaleStatus } from '../../../utils/helper';
import { Wholesale } from '../../wholesales/dashboard/WholesaleTable';
import { TimeLeftMoment } from '../TimeLeftMoment';
import moment from 'moment';
import { useSelector } from 'react-redux';

type EditStatusProps = {
  status: number;
  statusType: string;
  wholesale: Wholesale;
  pub: boolean;
  isWholesaler?: boolean;
  hasPermitted?: boolean;
};

interface statusTexts {
  [key: string]: string | undefined;
  completed: string;
  open?: string;
  recruiting?: string;
  escrow?: string;
  canceled?: string;
  reserved?: string;
}

const deedStatusTexts: statusTexts = {
  completed: 'This Deed has ended and is now complete. Deed Managers and Brokers may proceed to claim their earnings.',
  open: 'This Deed is currently open. Buyers may complete their loan at any time. This Deed will automatically complete once the Deed duration is met.',
  recruiting:
    'This Deed is in Recruiting. Brokers may stake the Deed during this phase. If no brokers are present, the Deed manager may cancel this deed.',
  escrow: 'This Deed is still in escrow. This Deed can be canceled or closed by the Deed Manager during this phase.',
};
const wholesaleStatusTexts: statusTexts = {
  completed: 'This wholesale has been completed and swapped. You may now claim your remaining balance and proceeds.',
  completeEveryOne: 'This wholesale has been completed and swapped.',
  openWholesaler: 'This wholesale is open for reservations.',
  openDeedManager:
    'You were Invited to reserve this wholesale for your deed. Please accept this reservation by the end date or this wholesale offer will expire.',
  canceled: 'This wholesale has been canceled.',
  reserved: 'This wholesale has been reserved by a Deed Manager and is pending swap.',
  openPrivate:
    'You were Invited to reserve this wholesale for your deed. Please accept this reservation by the end date or this wholesale offer will expire.',
};
export default function EditStatus({
  status,
  statusType,
  wholesale,
  pub = true,
  isWholesaler,
  hasPermitted,
}: EditStatusProps) {
  const wholesaleState = useSelector((state: any) => state.wholesale.state);

  const statusInfo = (status: number, statusType: string) => {
    switch (statusType) {
      case DEED:
        return deedStatusTexts[`${generateDeedStatus(status)}`];
      case WHOLESALE:
        return wholesaleStatusTexts[`${generateWholesaleStatus(status).toLocaleLowerCase()}`];
      default:
        return '';
    }
  };

  const statusTextContentWholesale = (status: number) => {
    switch (status) {
      case WHOLESALE_OPEN:
        return hasPermitted ? wholesaleStatusTexts.openDeedManager : wholesaleStatusTexts.openWholesaler;
      case WHOLESALE_RESERVED:
        return wholesaleStatusTexts.reserved;
      case WHOLESALE_CANCELLED:
        return wholesaleStatusTexts.canceled;
      case WHOLESALE_COMPLETED || WHOLESALE_WITHDRAWN:
        return isWholesaler ? wholesaleStatusTexts.completed : wholesaleStatusTexts.completeEveryOne;
    }
  };

  const statusColor = (status: number) => {
    let tailwind = '';
    switch (status) {
      case 0:
        if (diffTime > 0) {
          tailwind += 'text-moneyGreen';
        } else {
          tailwind += 'text-transparent bg-clip-text bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue';
        }
        break;
      case 2:
        tailwind += 'text-transparent bg-clip-text bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue';
        break;
      case 1:
        tailwind += 'text-escrowYellow';
        break;
      case 3:
        tailwind += 'text-transparent bg-clip-text bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue';
        break;
      case 4:
        tailwind += 'text-red-400';
        break;
      default:
        tailwind += 'text-transparent bg-clip-text bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue';
        break;
    }

    return tailwind;
  };
  const statusColorWholesale = (status: number) => {
    let tailwind = '';
    switch (status) {
      case 0:
        if (diffTime > 0) {
          tailwind += 'text-moneyGreen';
        } else {
          tailwind += 'text-red-400';
        }
        break;
      case 2:
        tailwind += 'text-red-400';
        break;
      case 1:
        tailwind += 'text-escrowYellow';
        break;
      case 3:
        tailwind += 'text-transparent bg-clip-text bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue';
        break;
      case 4:
        tailwind += 'text-transparent bg-clip-text bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue';
        break;
      default:
        tailwind += 'text-transparent bg-clip-text bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue';
        break;
    }

    return tailwind;
  };
  const endDate = moment.unix(Number(wholesale.deadline));
  const diffTime = moment().diff(endDate) * -1;
  return (
    <div className='text-left bg-panel bg-opacity-50 p-25 rounded-lg text-sm h-auto'>
      <div className='flex mb-5'>
        <h2 className='m-0 lh-15 text-white font-semibold text-xs'>Status</h2>
        <div
          className={`${
            statusType === WHOLESALE ? statusColorWholesale(wholesaleState) : statusColor(status)
          } font-semibold text-xs ml-auto mb-0`}
        >
          {statusType === WHOLESALE ? generateWholesaleStatus(wholesaleState, diffTime) : generateDeedStatus(status)}
        </div>
      </div>
      <div className='flex text-xxs lh-1 mb-2-5'>
        <div className='text-white'>Time Left</div>
        <div className='text-white-light ml-auto -mr-2'>
          {wholesale?.deadline && wholesale?.status !== WHOLESALE_CANCELLED ? (
            <TimeLeftMoment targetDate={wholesale?.deadline} lightWhite={true} />
          ) : (
            'Ended'
          )}
        </div>
      </div>
      <div className='flex text-xxs lh-1 mb-5'>
        <div className='text-white'>End date</div>
        <div className='text-white-light ml-auto'>
          {moment.unix(parseInt(wholesale.deadline)).format('YYYY/MM/DD HH:mm:ss')}
        </div>
      </div>
      <p className='mb-5 text-xs text-white'>
        {statusType === WHOLESALE ? statusTextContentWholesale(status) : statusInfo(status, statusType)}
      </p>
      <a className='flex justify-end items-center text-right text-xs text-white font-semibold lh-15' href='/'>
        {statusType[0].toLocaleUpperCase()}
        {statusType.slice(1)} FAQ
        <svg
          className='ml-2-5'
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
              <stop stopColor='#00BEDF' />
              <stop offset='1' stopColor='#0068B3' />
            </linearGradient>
          </defs>
        </svg>
      </a>
    </div>
  );
}
