import React, { useEffect, useState } from 'react';
import { DeedManager } from '../dasboard/ManagersDashboard';
import { ManagerDeedTableBrief, ManagerOverview } from './ManagersViewComponents';
import { DeedTable } from '../../deed/dashboard/DeedTable';
import { Search } from '../../global/Search';
import { Filter, FilterOptions } from '../../global/Filter';
import { Header } from '../../global/header/Header';
import { SEARCH_ALL_DEED_FILTER, ALL } from '../../../utils/Constants';
import '../../../styles/_managersView.scss';
import { Pagination } from '../../global/Pagination';
import { useHistory } from 'react-router';

type ManagersViewProps = {
  manager: DeedManager;
};

export const ManagersView = ({ manager }: ManagersViewProps) => {
  const history = useHistory();
  const filterOptions: FilterOptions = {
    action: '',
    status: '',
    deedType: '',
    leverage: '',
  };

  const TAKE = 7;
  const [skip, setSkip] = useState<number>(0);
  const [filterValues, setFilterValues] = useState<FilterOptions>(filterOptions);
  const [query, setQuery] = useState<string>('');
  const [searchOption, setSearchOption] = useState<string>(ALL);
  const [sortBy, setSortBy] = useState<{ column: string | null; isDesc: boolean }>({
    column: null,
    isDesc: false,
  });
  // eslint-disable-next-line
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    //RUN NEW API CALL FOR SORT BY
    // console.log(sortBy);
  }, [sortBy]);

  const onInputSearch = () => {
    // console.log('query:', query);
    // console.log('filter val:', filterValues);
    // console.log('search opt:', searchOption);
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
        <div className='grid manager-view-summary-row gap-8 text-white text-sm mb-10'>
          <ManagerOverview manager={manager} />
          <div className='row-1 xl:row-2'>
            <ManagerDeedTableBrief manager={manager} isEscrow={true} title='Deeds in Escrow' isLoading={isLoading} />
          </div>
          <div className=''>
            <ManagerDeedTableBrief
              manager={manager}
              isEscrow={false}
              title='Wholesale Reserved'
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className='text-white'>
          <div className='flex items-end search-height mb-2-5'>
            <h1 className='font-bold text-sm text-white lh-17 mb-0 mt-auto'>Deeds Managed</h1>
            <div className='flex ml-auto mr-4 mt-auto'>
              <Search
                onInput={onInputSearch}
                query={query}
                setQuery={setQuery}
                currentOption={searchOption}
                setCurrentOption={setSearchOption}
                options={SEARCH_ALL_DEED_FILTER}
              />
              <div className='ml-4 mt-auto'>
                <Filter filterValues={filterValues} setFilterValues={setFilterValues} />
              </div>
            </div>
          </div>
          <DeedTable isManagerPage={true} deeds={manager.deeds} sortBy={sortBy} setSortBy={setSortBy} />
          <Pagination skip={skip} setSkip={setSkip} take={TAKE} dataLength={manager.deeds.length} />
        </div>
      </div>
    </>
  );
};
