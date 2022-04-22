import React from 'react';
import openPage from '../../../images/OpenPageGradient.svg';
import { shrinkAddressX } from '../../../utils/Formatters';

type EditManagerProps = { offeredBy: string; title: string };
export const EditManager = ({ offeredBy, title }: EditManagerProps) => {
  return (
    <>
      <h2 className='mr-15 mb-0 text-white font-semibold text-xs'>{title}</h2>

      <a href={`/managers/${offeredBy}`}>
        <div className='flex items-center'>
          <div className='max-w-15ch text-xs text-white border-b border-b-white mr-15'>
            {shrinkAddressX(`${offeredBy}`, 8, 3)}
          </div>
          <img src={openPage} alt='go to manager page' />
        </div>
      </a>
    </>
  );
};
