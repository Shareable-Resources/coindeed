import React from 'react';
import { Deed } from '../../deed/dashboard/DeedTable';

type EditRiskMitigationProps = { deed: Deed };
export const EditRiskMitigation = ({ deed }: EditRiskMitigationProps) => {
  return (
    <div className='text-left bg-panel bg-opacity-50 p-25 rounded-lg text-sm'>
      <h2 className='mb-5 text-white font-semibold text-xs'>Risk Mitigation</h2>
      <div className='flex lh-1 text-xxs mb-2-5'>
        <div className='text-white'>If (Purchase Value/Deposit Value) drops:</div>
        <div className='text-white-light ml-auto'>{Number(deed?.triggerRiskMitigation) / 100}%</div>
      </div>
      <div className='flex lh-1 text-xxs mb-2-5'>
        <div className='text-white'>Leverage will adjust to:</div>
        <div className='text-white-light ml-auto'>{deed.leveragedAdjustmentRiskMitigation}x </div>
      </div>
      <div className='flex lh-1 text-xxs'>
        <div className='text-white'>
          System will complete the deed if
          <br />
          adjusted (Purchase Value/Deposit
          <br />
          Value) drops:
        </div>
        <div className='text-white-light ml-auto'>{Number(deed?.secondTriggerRiskMitigation) / 100}%</div>
      </div>
    </div>
  );
};
