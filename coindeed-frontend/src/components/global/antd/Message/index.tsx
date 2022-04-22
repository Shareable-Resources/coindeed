import { notification } from 'antd';
import union from '../../../../images/icons/Union.svg';
import success from '../../../../images/icons/success.svg';
import error from '../../../../images/icons/error.svg';
import info from '../../../../images/icons/info.svg';
import './style.css';
import { MESSAGE_ERROR } from '../../../../utils/Constants';

export const message = (type: string, content?: string, code?: any) => {
  if (type === 'success') {
    notification.success({
      className: 'green-messages',
      message: 'Success',
      description: content,
      placement: 'topRight',
      closeIcon: <img className='close-icon-custom' src={union} alt='Close' />,
      icon: <img src={success} alt='Close' />,
    });
  }
  if (type === 'error') {
    const errorType = MESSAGE_ERROR.find(e => e.wallet_code === code);
    let description = '';
    if (errorType) {
      description = errorType.content as string;
    }

    notification.error({
      className: 'red-messages',
      message: 'ERROR',
      description: description || content,
      placement: 'topRight',
      closeIcon: <img className='close-icon-custom' src={union} alt='Close' />,
      icon: <img src={error} alt='Close' />,
    });
  }
  if (type === 'info') {
    notification.info({
      className: 'primary-messages',
      message: 'Information',
      description: content,
      placement: 'topRight',
      closeIcon: <img className='close-icon-custom' src={union} alt='Close' />,
      icon: <img src={info} alt='Close' />,
    });
  }
};
