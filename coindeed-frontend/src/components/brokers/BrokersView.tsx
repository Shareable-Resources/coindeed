import React, { useState } from 'react';
import { DeedTable } from '../deed/dashboard/DeedTable';
import { Filter, FilterOptions } from '../global/Filter';
import { Header } from '../global/header/Header';
import { Deed } from '../deed/dashboard/DeedTable';
import { Search } from '../global/Search';
import { useHistory } from 'react-router-dom';
import { Pagination } from '../global/Pagination';

export interface Broker {
  address: string;
  deeds: Deed[];
}

type BrokersViewProps = { broker: Broker };
export const BrokersView = ({ broker }: BrokersViewProps) => {
  const history = useHistory();
  const filterOptions: FilterOptions = {
    status: '',
    deedType: '',
    leverage: '',
  };
  const TAKE = 7;
  const [skip, setSkip] = useState<number>(0);
  const [filterValues, setFilterValues] = useState<FilterOptions>(filterOptions);
  const [query, setQuery] = useState<string>('');
  const [searchOption, setSearchOption] = useState<string>('All');
  const [sortBy, setSortBy] = useState<{ column: string | null; isDesc: boolean }>({
    column: null,
    isDesc: false,
  });

  const onInputSearch = () => {
    console.log(query);
    console.log(searchOption);
  };

  return (
    <>
      <Header />
      <div className='mt-10 content-max-w mx-auto flex flex-col px-4 xl:px-0'>
        <div
          className='flex mb-30 text-white cursor-pointer'
          onClick={() => history.goBack()}
          style={{ marginLeft: '-5px' }}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 mr-1'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 17l-5-5m0 0l5-5m-5 5h12' />
          </svg>
          Back
        </div>

        <div className='text-white'>
          <div className='flex items-end search-height mb-2-5'>
            <h1 className='font-bold text-sm text-white lh-17 mb-0 mt-auto'>Deeds Staked</h1>
            <div className='flex ml-auto mr-4 mt-auto'>
              <Search
                onInput={onInputSearch}
                query={query}
                setQuery={setQuery}
                currentOption={searchOption}
                setCurrentOption={setSearchOption}
              />

              <div className='ml-4 mt-auto'>
                <Filter filterValues={filterValues} setFilterValues={setFilterValues} />
              </div>
            </div>
          </div>
          <DeedTable isManagerPage={true} deeds={broker.deeds} sortBy={sortBy} setSortBy={setSortBy} />
          <Pagination skip={skip} setSkip={setSkip} take={TAKE} dataLength={broker.deeds.length} />
        </div>
      </div>
    </>
  );
};
