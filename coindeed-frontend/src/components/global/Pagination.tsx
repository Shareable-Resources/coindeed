import React, { Dispatch, SetStateAction } from 'react';
//TODO: ammount of records % pageLength = 0  go to a blank page on last page, lets fix this

type PaginationProps = {
  skip: number;
  setSkip: Dispatch<SetStateAction<number>>;
  take: number;
  dataLength: number;
  maxLength?: number;
};
export const Pagination = ({ skip, setSkip, take, dataLength, maxLength = 0 }: PaginationProps) => {
  return (
    <div className='flex w-full justify-center space-x-10 mt-4 pb-4'>
      {skip >= 1 && (
        <button
          onClick={() => {
            skip - take < 0 ? setSkip(0) : setSkip(skip - take);
          }}
        >
          <svg width='20' height='21' viewBox='0 0 20 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <rect y='0.5' width='20' height='20' rx='10' fill='white' />
            <path d='M13 6.675L9.2915 10.5L13 14.325L11.8583 15.5L7 10.5L11.8583 5.5L13 6.675Z' fill='#353535' />
          </svg>
        </button>
      )}
      {skip === 0 && (
        <svg width='20' height='21' viewBox='0 0 20 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <g opacity='0.2'>
            <rect y='0.5' width='20' height='20' rx='10' fill='white' />
            <path d='M13 6.675L9.2915 10.5L13 14.325L11.8583 15.5L7 10.5L11.8583 5.5L13 6.675Z' fill='#353535' />
          </g>
        </svg>
      )}
      {dataLength === take && skip + dataLength < maxLength && (
        <button
          onClick={() => {
            if (dataLength === take) setSkip(skip + take);
          }}
        >
          <svg width='20' height='21' viewBox='0 0 20 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <rect y='0.5' width='20' height='20' rx='10' fill='white' />
            <path d='M7 14.325L10.7085 10.5L7 6.675L8.1417 5.5L13 10.5L8.1417 15.5L7 14.325Z' fill='#353535' />
          </svg>
        </button>
      )}
      {(dataLength < take || skip + dataLength >= maxLength) && (
        <svg width='20' height='21' viewBox='0 0 20 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <g opacity='.2'>
            <rect y='0.5' width='20' height='20' rx='10' fill='white' />
            <path d='M7 14.325L10.7085 10.5L7 6.675L8.1417 5.5L13 10.5L8.1417 15.5L7 14.325Z' fill='#353535' />
          </g>
        </svg>
      )}
    </div>
  );
};
