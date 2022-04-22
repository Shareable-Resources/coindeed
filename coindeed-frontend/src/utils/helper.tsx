import _ from 'lodash';
import moment from 'moment';
import { Deed } from '../components/deed/dashboard/DeedTable';
import {
  CANCELED,
  CANCELLED_STATUS,
  COMPLETED,
  COMPLETED_STATUS,
  ESCROW,
  ESCROW_STATUS,
  OPEN,
  OPEN_STATUS,
  RECRUITING,
  RECRUITING_STATUS,
  RESERVED,
  WHOLESALE_CANCELLED,
  WHOLESALE_COMPLETED,
  WHOLESALE_OPEN,
  WHOLESALE_RESERVED,
  WHOLESALE_WITHDRAWN,
  TOKEN_TYPES,
} from './Constants';

export const generateDeedStatus = (status: number) => {
  let strStatus = '';
  switch (status) {
    case RECRUITING_STATUS:
      strStatus = RECRUITING;
      break;
    case ESCROW_STATUS:
      strStatus = ESCROW;
      break;
    case OPEN_STATUS:
      strStatus = OPEN;
      break;
    case COMPLETED_STATUS:
      strStatus = COMPLETED;
      break;
    case CANCELLED_STATUS:
      strStatus = CANCELED;
      break;
  }
  return strStatus;
};

export const generateWholesaleStatus = (status: number, diffTime = 1) => {
  let strStatus = '';
  switch (status) {
    case WHOLESALE_OPEN:
      if (diffTime > 0) {
        strStatus = OPEN;
      } else {
        strStatus = CANCELED;
      }
      break;
    case WHOLESALE_RESERVED:
      strStatus = RESERVED;
      break;
    case WHOLESALE_CANCELLED:
      strStatus = CANCELED;
      break;
    case WHOLESALE_COMPLETED:
      strStatus = COMPLETED;
      break;
    case WHOLESALE_WITHDRAWN:
      strStatus = COMPLETED;
      break;
  }
  return strStatus;
};

export const generateTokenNameByAddress = (address: string) => {
  const listToken = _.values(TOKEN_TYPES);
  const token = _.find(listToken, function (o) {
    return _.toLower(o.tokenAddress) === _.toLower(address);
  });
  return token ? token.name : '';
};

export const duration = (deed: Deed) => {
  const targetDate = parseInt(deed.deedEndDate);
  const startDate = moment(deed.published);
  const endDate = moment.unix(targetDate);

  const diffTime = endDate.diff(startDate);
  if (diffTime > 0) {
    const durationTime = moment.duration(diffTime, 'millisecond');

    const years = Math.round(durationTime.asYears());
    const months = Math.round(durationTime.asMonths());
    const days = Math.round(durationTime.asDays());
    const hours = Math.round(durationTime.asHours());
    const minutes = Math.round(durationTime.asMinutes());
    const seconds = Math.round(durationTime.asSeconds());

    if (years && months > 11) return `${years}y`;
    else if (months && days > 28) return `${months}mo`;
    else if (days && hours > 23) return `${days}d`;
    else if (hours && minutes > 59) return `${hours}hr`;
    else if (minutes && seconds > 59) return `${minutes}min`;
    else if (seconds) return `${seconds}s`;
    else return 'Ended';
  }
  return 'Ended';
};

export const generateAmountTokenByDecimal = (amount: number, address: string) => {
  const listToken = _.values(TOKEN_TYPES);
  const token = _.find(listToken, function (o) {
    return _.toLower(o.tokenAddress) === _.toLower(address);
  });
  return amount / Math.pow(10, token?.decimal as number);
};

export const getMobileOperatingSystem = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
    return 'iOS';
  } else if (userAgent.match(/Android/i)) {
    return 'Android';
  } else {
    return undefined;
  }
};
