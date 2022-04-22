import React from 'react';
import { getIconOfToken } from '../../../blockchain/utils';
import { generateTokenNameByAddress } from '../../../utils/helper';

type DeedCoinsProps = { tokenPurchased: string; downPayToken: string };
export const DeedCoins = ({ tokenPurchased, downPayToken }: DeedCoinsProps) => {
  const iconOffered = getIconOfToken(generateTokenNameByAddress(tokenPurchased));
  const iconRequested = getIconOfToken(generateTokenNameByAddress(downPayToken));
  return (
    <div
      className='flex items-center mb-5'
      title={`Purchased Token: ${generateTokenNameByAddress(
        tokenPurchased,
      )}, Down Payment Token: ${generateTokenNameByAddress(downPayToken)}`}
    >
      <img className='mr-1' src={iconOffered} alt='token icon' width='30px' height='30px' />
      <img src={iconRequested} alt='token icon' width='30px' height='30px' />
      <h1 className='text-white text-left text-2xl font-bold mb-0 ml-2-5 lh-29'>
        {generateTokenNameByAddress(tokenPurchased)}
      </h1>
      <h1 className='text-white text-left text-2xl font-bold m-0 lh-29'>/</h1>
      <h1 className='text-white text-left text-2xl font-bold mb-0 ml-1 lh-29'>
        {generateTokenNameByAddress(downPayToken)}
      </h1>
    </div>
  );
};
