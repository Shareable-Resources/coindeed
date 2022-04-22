import { message } from 'antd';
import React from 'react';

type AddressListProps = { addresses: string[]; title: string };
export const AddressList = ({ addresses, title }: AddressListProps) => {
  return (
    <div className='flex flex-col py-5 pl-5 bg-blue-panel rounded-md' style={{ paddingRight: '15px' }}>
      <h3 className='text-left text-white text-xs font-bold mb-2-5 lh-1'>{title}</h3>
      <div className='slim-scroll-address-list overflow-y-auto scrolling-auto' style={{ maxHeight: '120px' }}>
        {addresses.map(address => (
          <div
            className='text-xxs lh-15 mb-1-5 cursor-pointer flex mr-2'
            title='Click to Copy'
            onClick={() => {
              navigator.clipboard.writeText(address);
              message.success('Copy successful');
            }}
          >
            <div className='truncate'>{address}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
