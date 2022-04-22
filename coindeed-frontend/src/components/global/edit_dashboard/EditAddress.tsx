import { message } from 'antd';
import { shrinkAddressX } from '../../../utils/Formatters';

type EditAddressProps = {
  name: string;
  address: string;
  underline?: boolean;
};

export const EditAddress = ({ name, address, underline = true }: EditAddressProps) => {
  return (
    <>
      <h2 className='mb-0 text-white font-semibold text-xs'>{name}</h2>
      <button
        className='flex items-center font-regular ml-15'
        onClick={() => {
          navigator.clipboard.writeText(address);
          message.success('Copy successful');
        }}
        title='Click To Copy'
      >
        <div
          className={
            underline ? 'max-w-15ch text-xs text-white border-b border-white' : 'max-w-15ch text-xs text-white'
          }
        >
          {shrinkAddressX(address, 8, 3)}
        </div>
        <svg
          className='ml-15'
          width='10'
          height='10'
          viewBox='0 0 10 10'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M5.99988 9.99942H1.00047C0.732536 10.0087 0.472766 9.90637 0.283195 9.7168C0.0936249 9.52723 -0.00872667 9.26746 0.000584049 8.99953V4.00012C-0.00872667 3.73219 0.0936249 3.47242 0.283195 3.28285C0.472766 3.09327 0.732536 2.99092 1.00047 3.00023H3.00023V1.00047C2.99092 0.732536 3.09327 0.472766 3.28285 0.283195C3.47242 0.0936249 3.73219 -0.00872667 4.00012 0.000584049H8.99953C9.26746 -0.00872667 9.52723 0.0936249 9.7168 0.283195C9.90637 0.472766 10.0087 0.732536 9.99942 1.00047V5.99988C10.0086 6.26777 9.90618 6.52745 9.71664 6.71699C9.5271 6.90653 9.26742 7.00893 8.99953 6.99977H6.99977V8.99953C7.00893 9.26742 6.90653 9.5271 6.71699 9.71664C6.52745 9.90618 6.26777 10.0086 5.99988 9.99942ZM1.00047 4.00012V8.99953H5.99988V6.99977H4.00012C3.73223 7.00893 3.47255 6.90653 3.28301 6.71699C3.09347 6.52745 2.99107 6.26777 3.00023 5.99988V4.00012H1.00047ZM4.00012 1.00047V5.99988H8.99953V1.00047H4.00012Z'
            fill='url(#paint0_linear_5485_13158)'
          />
          <defs>
            <linearGradient
              id='paint0_linear_5485_13158'
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
    </>
  );
};

export const EditId = ({ name, address }: EditAddressProps) => {
  return (
    <>
      <h2 className='mb-0 text-white font-semibold text-xs'>{name}</h2>
      <button
        className='flex items-center font-regular ml-15'
        onClick={() => {
          navigator.clipboard.writeText(address);
          message.success('Copy successful');
        }}
        title='Click To Copy'
      >
        <div className='max-w-15ch text-xs text-white'>{address}</div>
        <svg
          className='ml-15'
          width='10'
          height='10'
          viewBox='0 0 10 10'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M5.99988 9.99942H1.00047C0.732536 10.0087 0.472766 9.90637 0.283195 9.7168C0.0936249 9.52723 -0.00872667 9.26746 0.000584049 8.99953V4.00012C-0.00872667 3.73219 0.0936249 3.47242 0.283195 3.28285C0.472766 3.09327 0.732536 2.99092 1.00047 3.00023H3.00023V1.00047C2.99092 0.732536 3.09327 0.472766 3.28285 0.283195C3.47242 0.0936249 3.73219 -0.00872667 4.00012 0.000584049H8.99953C9.26746 -0.00872667 9.52723 0.0936249 9.7168 0.283195C9.90637 0.472766 10.0087 0.732536 9.99942 1.00047V5.99988C10.0086 6.26777 9.90618 6.52745 9.71664 6.71699C9.5271 6.90653 9.26742 7.00893 8.99953 6.99977H6.99977V8.99953C7.00893 9.26742 6.90653 9.5271 6.71699 9.71664C6.52745 9.90618 6.26777 10.0086 5.99988 9.99942ZM1.00047 4.00012V8.99953H5.99988V6.99977H4.00012C3.73223 7.00893 3.47255 6.90653 3.28301 6.71699C3.09347 6.52745 2.99107 6.26777 3.00023 5.99988V4.00012H1.00047ZM4.00012 1.00047V5.99988H8.99953V1.00047H4.00012Z'
            fill='url(#paint0_linear_5485_13158)'
          />
          <defs>
            <linearGradient
              id='paint0_linear_5485_13158'
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
    </>
  );
};
