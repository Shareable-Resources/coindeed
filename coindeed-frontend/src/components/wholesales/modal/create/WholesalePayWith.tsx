import { useState } from 'react';

export const WholesalePayWith = () => {
  const [token, setToken] = useState<string | undefined>('ETH');

  return (
    <div className='flex flex-col rounded-md border border-white p-4 text-xs text-gray-400 mb-8'>
      <label htmlFor='location' className='block text-xs text-left font-medium text-gray-400'>
        Token
      </label>
      <div className='flex items-center mb-4'>
        <div className='mr-auto'>
          <select
            id='location'
            name='location'
            className='mt-1 block w-full pl-3 pr-10 py-1 text-gray text-xs border-gray-300 rounded-md'
            defaultValue='ETH'
            onChange={event => setToken(event.target.value)}
          >
            <option>ETH</option>
            <option>BTC</option>
            <option>DOGE</option>
          </select>
        </div>
        1{token} = 100 DToken
      </div>
      <label className='text-left mb-1 text-white'>Transaction Fee:</label>
      <div className='flex mb-2'>
        Amount
        <div className='ml-auto'>DToken</div>
      </div>
      <div className='text-left'>X {token}</div>
    </div>
  );
};
