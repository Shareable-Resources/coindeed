import { getIconOfToken } from '../../blockchain/utils';
import { TimeLeftMoment } from '../global/TimeLeftMoment';

export const getPairWithIcons = (pair: any) => {
  const pairs = pair.split('/');
  const iconA = getIconOfToken(pairs[0]);
  const iconB = getIconOfToken(pairs[1]);
  return (
    <div className='flex items-center'>
      <img width='16px' height='16px' style={{ marginRight: '3px' }} src={iconA} alt='' />
      <img width='16px' height='16px' style={{ marginRight: '3px' }} src={iconB} alt='' />
      <span className={iconB || iconA ? 'ml-2' : ''}>{pair}</span>
    </div>
  );
};

export const getTokenWithIcon = (token: any) => {
  const icon = getIconOfToken(token);
  return (
    <div className='flex items-center'>
      <img width='16px' height='16px' style={{ marginRight: '3px' }} src={icon} alt='' />
      <span className={'ml-2'}>{token}</span>
    </div>
  );
};

export const getCountdown = (text: any) => {
  return <TimeLeftMoment targetDate={text} />;
};
