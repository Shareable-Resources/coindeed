import React, { useState, useEffect } from 'react';
import { Header } from '../../global/header/Header';
import { Deed } from '../../deed/dashboard/DeedTable';
// import { wholesales } from '../../wholesales/dashboard/WholesaleDashboard';
import { Wholesale } from '../../wholesales/dashboard/WholesaleTable';
import { Search } from '../../global/Search';
import { ManagersTable } from './ManagersTable';

export interface DeedManager {
  totalStaking: number;
  APY: number;
  openDeeds: number;
  managerAddress: string;
  deeds: Deed[];
  wholesales: Wholesale[];
}

export const deedManagers: DeedManager[] = [
  {
    APY: 0.914,
    totalStaking: 100000000.0,
    openDeeds: 11,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
  {
    APY: 0.9014,
    totalStaking: 1000000000.0,
    openDeeds: 10,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
  {
    APY: 0.9,
    totalStaking: 1002000000.0,
    openDeeds: 9,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
  {
    APY: 0.9,
    totalStaking: 1000400000.0,
    openDeeds: 8,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
  {
    APY: 0.9,
    totalStaking: 1000050000.0,
    openDeeds: 7,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
  {
    APY: 0.9,
    totalStaking: 100000000.0,
    openDeeds: 6,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
  {
    APY: 0.9,
    totalStaking: 1000600000.0,
    openDeeds: 5,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
  {
    APY: 0.9,
    totalStaking: 100000000.0,
    openDeeds: 4,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
  {
    APY: 0.9,
    totalStaking: 100000000.0,
    openDeeds: 3,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
  {
    APY: 0.9,
    totalStaking: 300000000.0,
    openDeeds: 2,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
  {
    APY: 0.9122,
    totalStaking: 400000000.0,
    openDeeds: 1,
    managerAddress: '0xb123ab123ab123ab123ab123a',
    deeds: [],
    wholesales: [],
  },
];

export const ManagersDashboard = () => {
  const [sortBy, setSortBy] = useState<{ column: string | null; isDesc: boolean }>({
    column: null,
    isDesc: false,
  });
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    //RUN NEW API CALL FOR SORT BY
    // console.log(sortBy);
  }, [sortBy]);
  const onInputSearch = () => {
    // console.log(query);
  };

  return (
    <>
      <Header />
      <div className='mt-10 content-max-w mx-auto flex flex-col px-4 xl:px-0'>
        <div className='flex justify-between items-end search-height mb-2-5'>
          <h1 className='text-left justify-center text-white font-bold text-base mt-auto mb-0'>All Deed Managers</h1>
          <div className='flex mr-4 mt-auto'>
            <Search query={query} setQuery={setQuery} showDropdown={false} onInput={onInputSearch} />
          </div>
        </div>
        <ManagersTable deedManagers={deedManagers} sortBy={sortBy} setSortBy={setSortBy} />
      </div>
    </>
  );
};
