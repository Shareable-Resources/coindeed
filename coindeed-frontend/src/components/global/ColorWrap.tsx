import React, { ReactElement } from 'react';

type ColorWrapProps = {
  children?: ReactElement | ReactElement[];
};
export const ColorWrap = ({ children }: ColorWrapProps) => {
  return (
    // <div className='bg-grad bg-background min-h-screen'>
    <div>
      {/* <div className='bg-grad-item right-1/2 bg-primary-1 bg-opacity-50'></div>
      <div className='bg-grad-item left-1/2 bg-primary-1 bg-opacity-50'></div> */}
      {children}
    </div>
  );
};
