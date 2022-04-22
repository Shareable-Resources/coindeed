import { useState, useEffect, ChangeEvent } from 'react';
import { FilterOptions } from '../../global/Filter';
import { Filter } from '../../global/Filter';
import { Header } from '../../global/header/Header';
import { Search } from '../../global/Search';
import { Wholesale, WholesaleTable } from './WholesaleTable';
import { WholesaleTableBrief } from './WholesaleTableBrief';
import { TableTabs } from '../../global/TableTabs';
import {
  ALL,
  ALL_WHOLESALES,
  ASCENDING,
  DESCENDING,
  MY_WHOLESALES,
  SEARCH_PUBLIC_WHOLESALE_FILTER,
  SORT_DIRECTION,
  SORT_KEY_WS,
  WHOLESALE_COMPLETED,
  WHOLESALE_WITHDRAWN,
} from '../../../utils/Constants';
import { getDepositTokens, getPurchasedTokens, getPurchasedToken } from '../../../APIs/WholesaleApi';
import { Pagination } from '../../global/Pagination';
import { WholesaleCreateModal } from '../modal/create/WholesaleCreateModal';
import { queryGraph } from '../../../services/graphql';
import { Button } from '../../global/Button';
import moment from 'moment';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { convertBigNumberValueToNumber } from '../../../blockchain/utils';

type tab = {
  name: string;
  current: boolean;
};

const today = new Date();
const inOneHour = new Date(today);
const inOneDay = new Date(today);
const inTwoMonths = new Date(today);
inOneHour.setHours(today.getHours() + 1);
inOneDay.setDate(today.getDate() + 1);
inTwoMonths.setDate(today.getDate() + 60);
const TAKE: number = 7;

export const WholesaleDashboard = () => {
  const dispatch = useDispatch();
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const dataSearch = window.location.search;
  const [tabSelect, setTabSelect] = useState<tab[]>([
    { name: 'Today', current: false },
    { name: 'Last 24 Hours', current: false },
    { name: 'Week', current: false },
    { name: 'Month', current: false },
    { name: 'All', current: true },
  ]);

  const searchFilterOptions: FilterOptions = {
    view: '',
  };

  const [currentTab, setCurrentTab] = useState<string>(
    dataSearch === '?type=all' || dataSearch === '' ? ALL_WHOLESALES : MY_WHOLESALES,
  );
  const [pubFilterValues, setPubFilterValues] = useState<FilterOptions>(searchFilterOptions);
  const [privFilterValues, setPrivFilterValues] = useState<FilterOptions>(searchFilterOptions);
  const [queryPub, setQueryPub] = useState<string>('');
  const [queryPriv] = useState<string>('');
  const [searchFilterPub, setSearchFilterPub] = useState<string>(ALL);
  const [searchFilterPriv] = useState<string>(ALL);
  const [openCreate, setOpenCreate] = useState(false);
  const [wholesaleDashboardDataLargest5, setWholesaleDashBoardDataLargest5] = useState<Wholesale[]>([]);
  const [wholesaleDashboardDataSoon5, setWholesaleDashBoardDataSoon5] = useState<Wholesale[]>([]);
  const [wholesaleDashboardData, setWholesaleDashBoardData] = useState<Wholesale[]>([]);
  const [myAddress, setMyAddress] = useState<string>('');
  const [skip, setSkip] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const handleLargestTableTabClick = (tabSelected: tab) => {
    setTabSelect(
      tabSelect.map(tab => (tabSelected.name === tab.name ? { ...tab, current: true } : { ...tab, current: false })),
    );
  };
  const [purchaseToken, setPurchaseToken] = useState<any>([]);
  const [depositToken, setDepositToken] = useState<any>([]);
  const [maxLength, setMaxLength] = useState<number>(0);
  const [isCreatedWS, setIsCreatedWS] = useState(false);
  const [searchToken, setSearchToken] = useState<string>('');
  const [searchManager, setSearchManager] = useState<string>('');
  const [searchReservedBy, setSearchReservedBy] = useState<string>('');
  const [searchSaleId, setSearchSaleId] = useState<number>(0);
  const [searchInDeed, setSearchInDeed] = useState<string[]>([]);
  const [sortKeyWSTable, setSortKeyWSTable] = useState<string>(SORT_KEY_WS.SALE_ID);
  const [sortDirection, setSortDirection] = useState<string>(DESCENDING);

  useEffect(() => {
    setSkip(0);
  }, [pubFilterValues, privFilterValues, currentTab, queryPriv, queryPub, searchFilterPub, searchFilterPriv]);

  useEffect(() => {
    getWholesaleToken();
  }, [openCreate]);

  useEffect(() => {
    const getReceivedToken = async () => {
      const token = await getDepositTokens();
      if (token !== undefined && token.length > 0) {
        setDepositToken(token);
      }
    };
    getReceivedToken();
  }, [openCreate]);

  const getWholesaleToken = async () => {
    const [token, error]: any = await getPurchasedTokens();
    if (error) {
    }
    if (token !== null && token.length > 0) {
      setPurchaseToken(token);
    }
  };

  const onInputSearch = async (event: ChangeEvent<HTMLInputElement>) => {
    const dataInput = event.target.value;
    setQueryPub(dataInput);
    if (searchFilterPub === 'Token') {
      const token = await getPurchasedToken(dataInput);
      if (token) {
        return setSearchToken(token.address);
      } else return setSearchToken('0x0000000');
    }

    if (searchFilterPub === 'Deed Address') {
      if (dataInput) return setSearchReservedBy(dataInput);
      else return setSearchReservedBy('0x0000000');
    }
    if (searchFilterPub === 'Wholesale Manager') {
      if (dataInput) return setSearchManager(dataInput);
      else return setSearchManager('0x0000000');
    }
    if (searchFilterPub === 'Wholesale Id') {
      return setSearchSaleId(Number(dataInput));
    }
  };

  useEffect(() => {
    const getUserWallet = () => {
      if (userAddress) {
        setMyAddress(userAddress);
      }
    };
    getUserWallet();
  });

  useEffect(() => {
    setSearchToken('');
    setSearchReservedBy('');
    setSearchManager('');
    setSearchSaleId(0);
  }, [searchFilterPub]);

  useEffect(() => {
    setPubFilterValues({ view: '' });
    setPrivFilterValues({ view: '' });
  }, [currentTab]);

  const processFilterStatus = () => {
    switch (pubFilterValues.view) {
      case '':
        return '';
      case 'Open':
        return 0;
      case 'Reserved':
        return 1;
      case 'Canceled':
        return 2;
      case 'Completed':
        return 3;
    }
  };

  useEffect(() => {
    const getAllMyDeed = async () => {
      if (privFilterValues.view === 'Bounded') {
        const [result] = await queryGraph(allMyDeed);
        const allDeed = (result as any).data.newDeeds;
        const arrDeed = allDeed.map((e: any) => e.deedAddress);
        return setSearchInDeed(arrDeed);
      }
    };
    getAllMyDeed();
    // eslint-disable-next-line
  }, [privFilterValues]);

  const processTabSelect = () => {
    const selected = _.find(tabSelect, (e: any) => e.current === true);
    let compareDate: any = 0;
    if (selected?.name === tabSelect[0].name) {
      compareDate = moment().hours(0).minute(0).second(0).unix();
    }
    if (selected?.name === tabSelect[1].name) {
      compareDate = moment().subtract(24, 'hours').unix();
    }
    if (selected?.name === tabSelect[2].name) {
      compareDate = moment.utc().subtract(7, 'day').unix();
    }
    if (selected?.name === tabSelect[3].name) {
      compareDate = moment.utc().subtract(30, 'day').unix();
    }
    if (selected?.name === tabSelect[4].name) {
      compareDate = moment.utc('2022-01-01').unix();
    }
    return compareDate;
  };

  useEffect(() => {
    const compareDate = processTabSelect();
    const dataStatus = processFilterStatus();
    if (queryPub === '') {
      setSearchToken('');
      setSearchReservedBy('');
      setSearchManager('');
      setSearchSaleId(0);
    }

    const variablesMy = {
      offeredBy: myAddress,
      searchToken: searchToken,
      searchSaleId: searchSaleId,
      searchReservedBy: searchReservedBy,
      status: dataStatus,
      isPrivate: privFilterValues.view === 'Invite' ? true : '',
      timeCompare: compareDate,
    };

    const variablesAll = {
      searchToken: searchToken,
      searchSaleId: searchSaleId,
      searchManager: searchManager,
      searchReservedBy: searchReservedBy,
      status: dataStatus,
      timeCompare: compareDate,
    };
    const variablesLargest = {
      timeCompare: compareDate,
    };
    if (currentTab === MY_WHOLESALES) getListWholesale(variablesMy);
    if (currentTab === ALL_WHOLESALES) getListWholesale(variablesAll);

    getListWholeEndingSoon();
    getListWholesaleLargest(variablesLargest);
    // eslint-disable-next-line
  }, [
    skip,
    currentTab,
    tabSelect,
    isCreatedWS,
    searchToken,
    searchSaleId,
    searchManager,
    pubFilterValues,
    privFilterValues,
    searchReservedBy,
    queryPub,
    sortKeyWSTable,
    sortDirection,
    myAddress,
  ]);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const sortKey = sorter.columnKey;
    const orderBy = sorter.order;
    setSortDirection(orderBy === SORT_DIRECTION.ASC ? ASCENDING : DESCENDING);
    setSkip(0);

    if (sortKey === SORT_KEY_WS.SALE_ID) {
      setSortKeyWSTable('saleId');
    }

    if (sortKey === SORT_KEY_WS.IS_PRIVATE) {
      setSortKeyWSTable('isPrivate');
    }

    if (sortKey === SORT_KEY_WS.STATUS) {
      setSortKeyWSTable('status');
    }

    if (sortKey === SORT_KEY_WS.SIZE) {
      setSortKeyWSTable('offeredAmount');
    }

    if (sortKey === SORT_KEY_WS.DEADLINE) {
      setSortKeyWSTable('deadline');
    }

    if (sortKey && orderBy === undefined) {
      setSortKeyWSTable('saleId');
      setSortDirection(DESCENDING);
    }
  };

  const compareDateProcess = processTabSelect();
  const tokensQueryListWholesale = `
      query(
        $offeredBy: String, 
        $searchToken: String, 
        $searchManager: String, 
        $searchReservedBy: String, 
        $searchSaleId: Int, 
        $status: Int
        $isPrivate: Boolean
        $timeCompare: Int
        ) {
          newWholesales(
            first: 7,
            skip: ${skip}, 
            orderBy: ${sortKeyWSTable}, 
            orderDirection: ${sortDirection}, 
            where: {
              ${compareDateProcess === 0 ? '' : 'createdAtTimeStamp_gte: $timeCompare'}
              ${compareDateProcess === 0 ? '' : `createdAtTimeStamp_lte: ${moment().unix()}`}
              ${currentTab === ALL_WHOLESALES ? '' : 'offeredBy: $offeredBy'}
              ${searchToken === '' ? '' : 'tokenOffered: $searchToken'}
              ${searchManager === '' ? '' : 'offeredBy: $searchManager'}
              ${searchReservedBy === '' ? '' : 'reservedBy: $searchReservedBy'}
              ${searchSaleId === 0 ? '' : 'saleId: $searchSaleId'}
              ${
                pubFilterValues.view === ''
                  ? ''
                  : pubFilterValues.view === 'Open'
                  ? `status: $status, deadline_gte: ${moment().unix()}`
                  : pubFilterValues.view === 'Completed'
                  ? `status_in: [${WHOLESALE_COMPLETED}, ${WHOLESALE_WITHDRAWN}]`
                  : 'status: $status'
              }
              ${privFilterValues.view !== 'Invite' ? '' : 'isPrivate: $isPrivate'}
              ${
                privFilterValues.view === 'Bounded' && searchInDeed.length > 0 && currentTab !== ALL_WHOLESALES
                  ? `reservedBy_in: [${searchInDeed.map((e: any) => `"${e}"`)}]`
                  : ''
              }
            }
          ) {
            id
            saleId
            offeredBy
            tokenOffered
            tokenRequested
            offeredAmount
            requestedAmount
            minSaleAmount
            deadline
            reservedTo
            createdAtTimeStamp
            status
            isPrivate
          }
        }
    `;
  const tokensQueryForEnding = `
        query {
          newWholesales(
            where: {
              deadline_gt: ${moment().unix()}
            },
            orderBy: deadline,
            orderDirection: asc,
            first: 5
            ){
            id
            saleId
            tokenOffered
            tokenRequested
            offeredAmount
            requestedAmount
            deadline
            status
            isPrivate
          }
        }
    `;

  const tokensQueryForLargeTable = `
        query($timeCompare: Int) {
          newWholesales(where: {
            ${compareDateProcess === 0 ? '' : 'createdAtTimeStamp_gte: $timeCompare'}
              ${compareDateProcess === 0 ? '' : `createdAtTimeStamp_lte: ${moment().unix()}`}
          }) {
            id
            saleId
            tokenOffered
            tokenRequested
            offeredAmount
            requestedAmount
            deadline
            status
            isPrivate
          }
        }
    `;

  const allWholesale = `
    query {
      newWholesales {
        id
      }
    }
`;

  const allMyDeed = `
    query {
      newDeeds(where: {
        manager: "${myAddress}"
      }) {
        deedAddress
      }
    }
  `;

  const getListWholesale = async (variables: any) => {
    const [res] = await queryGraph(tokensQueryListWholesale, variables);
    const [all] = await queryGraph(allWholesale);
    setIsLoading(false);
    setMaxLength((all as any)?.data?.newWholesales.length);
    const dataWholesales = (res as any)?.data?.newWholesales;
    setWholesaleDashBoardData(dataWholesales);
  };

  const getListWholeEndingSoon = async () => {
    const [res5] = await queryGraph(tokensQueryForEnding);
    const dataWholesales5 = (res5 as any)?.data?.newWholesales;
    setWholesaleDashBoardDataSoon5(dataWholesales5);
  };

  const getListWholesaleLargest = async (variablesLargest: any) => {
    const [res5] = await queryGraph(tokensQueryForLargeTable, variablesLargest);
    const dataWholesales5 = (res5 as any)?.data?.newWholesales;
    const newData5 = dataWholesales5.map((e: any) => {
      const listToken = _.uniqBy(_.concat(purchaseToken, depositToken), (e: any) => e.name);
      const tokenOffDetail = listToken.filter((f: any) => f.address.toUpperCase() === e.tokenOffered.toUpperCase());
      return { id: e.saleId, amount: convertBigNumberValueToNumber(e.offeredAmount, tokenOffDetail[0]?.decimals) };
    });
    const sortAmount = newData5.sort((a: any, b: any) => b.amount - a.amount);
    const dataLargest = sortAmount.slice(0, 5).map((e: any) => {
      return _.find(dataWholesales5, function (a) {
        return a.saleId === e.id;
      });
    });
    setWholesaleDashBoardDataLargest5(dataLargest);
  };

  return (
    <>
      <Header />
      <div className='mt-10 content-max-w mx-auto flex flex-col px-4 xl:px-0'>
        <div className='grid gap-8 text-left grid-cols-1 lg:grid-cols-2'>
          <div>
            <WholesaleTableBrief
              wholesales={wholesaleDashboardDataSoon5}
              title={'Ending Soon'}
              isLoading={isLoading}
              listToken={purchaseToken}
            />
          </div>
          <div>
            <div className='flex'>
              <h1 className='text-white text-base font-semibold mb-2-5'>Largest</h1>
              <div className='flex ml-auto text-xs'>
                {tabSelect
                  .filter((e: any) => e.name !== 'All')
                  .map((tab, index) => (
                    <div
                      key={index}
                      className={
                        tab.current
                          ? 'text-white mx-2 cursor-pointer'
                          : 'text-white-light underline mx-2 cursor-pointer'
                      }
                      onClick={() => handleLargestTableTabClick(tab)}
                    >
                      {tab.name}
                    </div>
                  ))}
              </div>
            </div>
            <WholesaleTableBrief
              wholesales={wholesaleDashboardDataLargest5}
              timeRestrictions={true}
              isLoading={isLoading}
              listToken={purchaseToken}
            />
          </div>
        </div>
        <div className='mt-10'>
          <div className='flex mb-2-5 justify-between'>
            <div>
              <TableTabs tabs={[ALL_WHOLESALES, MY_WHOLESALES]} setCurrentTab={setCurrentTab} currentTab={currentTab} />
            </div>
            <div className='flex space-x-5 items-center justify-center'>
              <div className='flex space-x-3 mr-2-5'>
                <Search
                  onInput={onInputSearch}
                  query={queryPub}
                  setQuery={setQueryPub}
                  currentOption={searchFilterPub}
                  setCurrentOption={setSearchFilterPub}
                  options={SEARCH_PUBLIC_WHOLESALE_FILTER}
                />
                {currentTab === MY_WHOLESALES ? (
                  <Filter
                    wholesale={true}
                    pub={false}
                    filterValues={privFilterValues}
                    setFilterValues={setPrivFilterValues}
                  />
                ) : (
                  <Filter
                    wholesale={true}
                    pub={true}
                    filterValues={pubFilterValues}
                    setFilterValues={setPubFilterValues}
                  />
                )}
              </div>
              <Button
                primary
                label='Create Wholesale'
                onClick={() => {
                  if (userAddress) setOpenCreate(true);
                  else {
                    dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
                  }
                }}
              />
              <WholesaleCreateModal
                openCreate={openCreate}
                setOpenCreate={setOpenCreate}
                purchaseToken={purchaseToken}
                depositToken={depositToken}
                getWholesaleToken={getWholesaleToken}
                setIsCreatedWS={setIsCreatedWS}
              />
            </div>
          </div>
          <WholesaleTable
            wholesales={wholesaleDashboardData}
            isLoading={isLoading}
            handleTableChange={handleTableChange}
            listToken={purchaseToken}
            currentTab={currentTab}
          />
        </div>
      </div>
      {wholesaleDashboardData && (
        <Pagination
          skip={skip}
          setSkip={setSkip}
          take={TAKE}
          dataLength={wholesaleDashboardData.length}
          maxLength={maxLength}
        />
      )}
    </>
  );
};
