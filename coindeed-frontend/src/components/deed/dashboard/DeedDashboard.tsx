import { useState, useEffect, ChangeEvent } from 'react';
import { Header } from '../../global/header/Header';
import { Search } from '../../global/Search';
import { Filter, FilterOptions } from '../../global/Filter';
import { DeedTableBrief } from './DeedTableBrief';
import { DeedTable } from './DeedTable';
import { CFL } from '../../../utils/Formatters';
import {
  MY,
  ALL,
  SEARCH_ALL_DEED_FILTER,
  DEED,
  TOKEN_TYPES,
  BLOCKCHAIN_ERROR_MESSAGE,
  RECRUITING_STATUS,
  ESCROW_STATUS,
} from '../../../utils/Constants';
import CreateDeedModal from './modal/CreateDeedModal';
import { TableTabs } from '../../global/TableTabs';
import { Pagination } from '../../global/Pagination';
import { createDeedSC, getRequiredStakingAmount } from '../../../blockchain/services/DeedService';

import { CreateDeed } from '../type';
import { message } from '../../global/antd/Message';
import PendingModal from '../../global/modal/PendingModal';
import CreateDeedSuccessModal from './modal/CreateDeedSuccessModal';
import {
  convertBigNumberValueToNumber,
  getTokenInfoByAddress,
  handleUserApproveToken,
  getRequiredDownPaymentAmount,
  getTokenDecimalsV2,
} from '../../../blockchain/utils';
import { queryGraph } from '../../../services/graphql';
import { multicall } from '../../../blockchain/multicall';

import DeedABI from '../../../blockchain/abi/Deed.json';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { getDepositTokens, getPurchasedTokens } from '../../../APIs/WholesaleApi';
import { genDeedFactoryContract } from '../../../blockchain/instance';

const DEED_FACTORY_ADDRESS = process.env.REACT_APP_DEED_FACTORY_ADDRESS;
const today = new Date();
const inOneHour = new Date(today);
const inOneDay = new Date(today);
const inTwoMonths = new Date(today);
inOneHour.setHours(today.getHours() + 1);
inOneDay.setDate(today.getDate() + 1);
inTwoMonths.setDate(today.getDate() + 60);

const TAKE: number = 7;
const All_DEEDS = ALL + ' ' + CFL(DEED) + 's';
const MY_DEEDS = MY + ' ' + CFL(DEED) + 's';

const mappingDeedInfoToTable = (deedAddress: string, deedInfo: any, userAddr: string) => {
  const tokenA = getTokenInfoByAddress(deedInfo[0][0]);
  const tokenB = getTokenInfoByAddress(deedInfo[0][1]);
  const { deedSize, leverage, managementFee } = deedInfo[1];
  const { sellTimestamp, buyTimestamp, recruitingEndTimestamp } = deedInfo[3];

  const { trigger, mitigationleverage } = deedInfo[4];
  return {
    deedId: userAddr ? deedInfo[11] : deedInfo[9],
    coinAName: tokenA?.name, // purchase token
    coinBName: tokenB?.name, // downpayment token
    coinA: tokenA?.tokenAddress || '',
    coinB: tokenB?.tokenAddress || '',
    status: deedInfo[7][0],
    deedAddress,
    deedManager: deedInfo[2][0],
    wholesaleAddress: deedInfo[5].toString(),
    loanLeverage: leverage.toString(),
    size: convertBigNumberValueToNumber(deedSize, tokenA?.decimal),
    sizeConsumed: 100,
    managementFee: parseFloat((managementFee / 100).toString()),
    recruitingEndDate: recruitingEndTimestamp.toString(),
    escrowEndDate: buyTimestamp.toString(),
    deedEndDate: sellTimestamp.toString(),
    systemTriggeredAssetPriceDrop: trigger.toString(),
    systemTriggeredLeveragedAdjustment: mitigationleverage ? mitigationleverage : '',
    systemTriggeredDeedCompletionAssetPriceDrop: 10,
    allowBrokers: false,
    minimumBrokerStakingAmount: 100,
    published: new Date(),
    updated: new Date(),
    progress: 30,
    profit: '--',
    allOrMy: '',
    type: deedInfo[5].toString() !== '0' ? 'Fixed' : 'Floating',
    yourStaked: userAddr ? deedInfo[8][0].toString() : '0',
    yourJoined: userAddr ? deedInfo[9][0].toString() : '0',
  };
};

const mappingDeedInfoSmallTable = async (deedAddress: string, deedInfo: any) => {
  const tokenA = getTokenInfoByAddress(deedInfo[0][0]); // Downpayment Token
  const tokenB = getTokenInfoByAddress(deedInfo[0][1]); // Purchased Token
  const { sellTimestamp, buyTimestamp, recruitingEndTimestamp } = deedInfo[1];

  let loanLeverage = deedInfo[5][1];

  let [downpayDecimals] = (await getTokenDecimalsV2(tokenA?.tokenAddress)) as [number];

  let deedSize = convertBigNumberValueToNumber(deedInfo[5][0], tokenA?.decimal);

  let requiredStaking = await getRequiredStakingAmount(deedSize, loanLeverage, tokenA?.tokenAddress);

  let requiredDownPayment = getRequiredDownPaymentAmount(deedSize, loanLeverage);

  let totalJoined = convertBigNumberValueToNumber(deedInfo[3][0], downpayDecimals);

  let totalStaked = convertBigNumberValueToNumber(deedInfo[4][0], TOKEN_TYPES.DTOKEN.decimal);

  return {
    coinAName: tokenA?.name, // Downpayment Token
    coinBName: tokenB?.name, // Purchased Token
    coinA: tokenA?.tokenAddress || '',
    coinB: tokenB?.tokenAddress || '',
    status: deedInfo[2][0],
    deedAddress: deedInfo[6],
    deedId: deedInfo[7],
    recruitingEndDate: recruitingEndTimestamp.toString(),
    escrowEndDate: buyTimestamp.toString(),
    deedEndDate: sellTimestamp.toString(),
    totalJoined: totalJoined,
    totalStaked: totalStaked,
    deedSize: deedInfo[5][0],
    leverage: deedInfo[5][1],
    managementFee: deedInfo[5][2],
    minimumBuy: deedInfo[5][3],
    requiredStaking: requiredStaking[0],
    requiredDownPayment: requiredDownPayment[0],
  };
};

export const Page = () => {
  const dispatch = useDispatch();
  const dataSearch = window.location.search;
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const searchFilterOptions: FilterOptions = {
    action: '',
    status: '',
    deedType: '',
    leverage: '',
  };

  const [listOfCreatedDeed, setListOfCreatedDeed] = useState<any[]>([]);
  const [listOfRecruitingDeed, setListOfRecruitingDeed] = useState<any[]>([]);
  const [listOfEscrowDeed, setListOfEscrowDeed] = useState<any[]>([]);

  const [isOpenCreateDeedModal, setIsOpenCreateDeedModal] = useState(false);
  const [isOpenPendingModal, setIsOpenPendingModal] = useState(false);
  const [isCreatingDeed, setIsCreatingDeed] = useState(false);
  const [isApprovingDeed, setIsApprovingDeed] = useState(false);

  const [isConfirm, setIsConfirm] = useState(true);
  const [txCreateDeedId, setTxCreateDeedId] = useState('');
  // const [totalOfMyDeeds, setTotalOfMyDeed] = useState(0);

  const [currentTab, setCurrentTab] = useState<string>(
    dataSearch === '?type=all' || dataSearch === '' ? All_DEEDS : MY_DEEDS,
  );
  const [filterValuesAll, setFilterValuesAll] = useState<FilterOptions>(searchFilterOptions);
  const [queryAll, setQueryAll] = useState<string>('');
  const [searchFilterAll, setSearchFilterAll] = useState<string>(ALL);

  const [deedDashboardDataOrigin, setDeedDashboardDataOrigin] = useState<any[]>([]);
  const [deedDashboardData, setDeedDashboardData] = useState<any[]>([]);
  const [dataQueryForSearch, setDataQueryForSearch] = useState<any[]>([]);
  const [dataDeedFilterAndSearch, setDataDeedFilterAndSearch] = useState<any[]>([]);
  const [purchaseToken, setPurchaseToken] = useState<any>([]);
  const [depositToken, setDepositToken] = useState<any>([]);

  const [escrowDeeds, setEscrowDeeds] = useState<any[]>([]);
  const [recruitingDeeds, setRecruitingDeeds] = useState<any[]>([]);

  const [sortBy, setSortBy] = useState<{ column: string | null; isDesc: boolean }>({
    column: null,
    isDesc: false,
  });
  const [skip, setSkip] = useState<number>(0);
  const [isLoadingDeed, setIsLoadingDeed] = useState(true);
  const [isLoadingRecruiting, setIsLoadingRecruiting] = useState(true);
  const [isLoadingEscrow, setIsLoadingEscrow] = useState(true);
  const [isCreated, setIsCreated] = useState(false);
  const [sorting, setSorting] = useState<number>(0);
  const [maxLength, setMaxLength] = useState<number>(0);

  const [shoudShowCreateDeedSuccessModalToggled, setShouldShowCreateDeedSuccessModalToggled] = useState(false);

  const toggleCreateDeedSuccessModal = () => {
    setShouldShowCreateDeedSuccessModalToggled(!shoudShowCreateDeedSuccessModalToggled);
  };

  useEffect(() => {
    getWholesaleToken();
  }, [isOpenCreateDeedModal]);

  useEffect(() => {
    const getReceivedToken = async () => {
      const token = await getDepositTokens();
      if (token !== undefined && token.length > 0) {
        setDepositToken(token);
      }
    };
    getReceivedToken();
  }, [isOpenCreateDeedModal]);

  const getWholesaleToken = async () => {
    const [token, error]: any = await getPurchasedTokens();
    if (error) {
    }
    if (token !== null && token.length > 0) {
      setPurchaseToken(token);
    }
  };

  const tokensQuery = `
      query($manager: String) {
        newDeeds(
          orderBy: deedId,
          orderDirection: desc
          where: {
            ${currentTab === MY_DEEDS ? 'manager: $manager' : ''}
          }
          first: 1000
          ){
          id
          deedId
          deedAddress
          manager
        }
        userDeeds(
          where: {
            ${currentTab === MY_DEEDS ? 'userAddress: $manager' : ''}
          }
        ) {
          deedAddress
          userAddress
          amountJoined
        }
      }
  `;
  const allData = `
      query {
        newDeeds{
          id
        }
      }
  `;

  const DeedRecruitingQuery = `
    query {
      newDeeds(
          first: 5, 
          orderBy: deedId,
          orderDirection: desc,
          where: {status: ${RECRUITING_STATUS}}
        ) {
        id
        deedId
        deedAddress
        manager
      }
    }
  `;
  const DeedEscrowQuery = `
      query {
        newDeeds(
            first: 5, 
            orderBy: deedId,
            orderDirection: desc,
            where: {status: ${ESCROW_STATUS}}
          ) {
          id
          deedId
          deedAddress
          manager
        }
      }
  `;

  useEffect(() => {
    const getRecruitingAndEscrowData = async () => {
      const [recruiting]: any = await queryGraph(DeedRecruitingQuery);

      const [escrow]: any = await queryGraph(DeedEscrowQuery);
      setListOfRecruitingDeed(recruiting?.data?.newDeeds);
      setListOfEscrowDeed(escrow?.data?.newDeeds);
    };
    getRecruitingAndEscrowData();
    // eslint-disable-next-line
  }, []);

  const doSearch = async (variable: any) => {
    const [res]: any = await queryGraph(tokensQuery, variable);
    const [all]: any = await queryGraph(allData);
    setMaxLength(all?.data?.newDeeds.length);
    if (currentTab === MY_DEEDS) {
      return setListOfCreatedDeed(res?.data?.newDeeds.concat(res?.data?.userDeeds));
    }
    setListOfCreatedDeed(res?.data?.newDeeds);
  };

  useEffect(() => {
    const variableAll = {};
    const variableMy = {
      manager: userAddress,
    };
    if (currentTab === All_DEEDS) doSearch(variableAll);
    if (currentTab === MY_DEEDS) doSearch(variableMy);

    // eslint-disable-next-line
  }, [skip, currentTab, userAddress, isCreated]);

  useEffect(() => {
    setSkip(0);
  }, [currentTab]);

  useEffect(() => {
    const getMultipleDeedInfo = async () => {
      setIsLoadingDeed(true);
      const listOfCalls = listOfCreatedDeed.map(deed => [
        // pair of tokens
        {
          address: deed.deedAddress,
          name: 'pair',
        },
        // deed parameters
        {
          address: deed.deedAddress,
          name: 'deedParameters',
        },
        // deed manager address
        {
          address: deed.deedAddress,
          name: 'manager',
        },
        // executionTime
        {
          address: deed.deedAddress,
          name: 'executionTime',
        },
        // riskMitigation
        {
          address: deed.deedAddress,
          name: 'riskMitigation',
        },
        {
          address: deed.deedAddress,
          name: 'wholesaleId',
        },
        {
          address: deed.deedAddress,
          name: 'totalStake',
        },
        {
          address: deed?.deedAddress,
          name: 'state',
        },
        userAddress && {
          address: deed?.deedAddress,
          name: 'stakes',
          params: [userAddress],
        },
        userAddress && {
          address: deed?.deedAddress,
          name: 'buyIns',
          params: [userAddress],
        },
      ]);

      let result = await Promise.all(listOfCalls.map(call => multicall(DeedABI, _.compact(call))));

      const resultWithDeedAddress = result.map((deed, index) => [
        ...deed,
        listOfCreatedDeed[index].deedAddress,
        listOfCreatedDeed[index].deedId,
      ]);

      const dataTable = resultWithDeedAddress.map(data =>
        mappingDeedInfoToTable(data[data.length - 2], data, userAddress),
      );

      setDeedDashboardData(dataTable);
      setDeedDashboardDataOrigin(dataTable);
      setDataDeedFilterAndSearch(dataTable);
      setDataQueryForSearch(dataTable);

      setIsLoadingDeed(false);
    };
    getMultipleDeedInfo();
    // eslint-disable-next-line
  }, [listOfCreatedDeed]);

  useEffect(() => {
    const getMultipleDeedInfo = async () => {
      setIsLoadingRecruiting(true);
      setIsLoadingEscrow(true);
      const listOfRecruitingCalls = listOfRecruitingDeed.map(deed => [
        // pair of tokens
        {
          address: deed.deedAddress,
          name: 'pair',
        },
        // executionTime
        {
          address: deed.deedAddress,
          name: 'executionTime',
        },
        {
          address: deed?.deedAddress,
          name: 'state',
        },
        {
          address: deed?.deedAddress,
          name: 'totalSupply',
        },
        {
          address: deed?.deedAddress,
          name: 'totalStake',
        },
        {
          address: deed?.deedAddress,
          name: 'deedParameters',
        },
      ]);
      const listOfEscrowCalls = listOfEscrowDeed.map(deed => [
        // pair of tokens
        {
          address: deed.deedAddress,
          name: 'pair',
        },
        {
          address: deed.deedAddress,
          name: 'executionTime',
        },
        {
          address: deed?.deedAddress,
          name: 'state',
        },
        {
          address: deed?.deedAddress,
          name: 'totalSupply',
        },
        {
          address: deed?.deedAddress,
          name: 'totalStake',
        },
        {
          address: deed?.deedAddress,
          name: 'deedParameters',
        },
      ]);
      let recruiting = await Promise.all(listOfRecruitingCalls.map(call => multicall(DeedABI, call)));

      let escrow = await Promise.all(listOfEscrowCalls.map(call => multicall(DeedABI, call)));
      const resultRecruitingWithDeedAddress = recruiting.map((deed, index) => [
        ...deed,
        listOfRecruitingDeed[index].deedAddress,
        listOfRecruitingDeed[index].deedId,
      ]);
      const resultEscrowWithDeedAddress = escrow.map((deed, index) => [
        ...deed,
        listOfEscrowDeed[index].deedAddress,
        listOfEscrowDeed[index].deedId,
      ]);
      const dataTableRecruiting = await Promise.all(
        resultRecruitingWithDeedAddress.map(async data => {
          let res = await mappingDeedInfoSmallTable(data[data.length - 2], data);
          return res;
        }),
      );
      const dataTableEscrow = await Promise.all(
        resultEscrowWithDeedAddress.map(async data => {
          let res = await mappingDeedInfoSmallTable(data[data.length - 2], data);
          return res;
        }),
      );
      setRecruitingDeeds(dataTableRecruiting as any[]);
      setEscrowDeeds(dataTableEscrow as any[]);
      setIsLoadingRecruiting(false);
      setIsLoadingEscrow(false);
    };
    getMultipleDeedInfo();
  }, [listOfRecruitingDeed, listOfEscrowDeed]);

  const doCreateDeed = async (deedParams: CreateDeed) => {
    setIsOpenPendingModal(true);
    setIsCreatingDeed(true);
    const [result, error]: any = await createDeedSC(deedParams);
    if (error) {
      setIsCreatingDeed(false);
      setIsOpenPendingModal(false);

      if (error) {
        let messageError = error?.error?.message;

        console.log('messageError', messageError);

        if (messageError === BLOCKCHAIN_ERROR_MESSAGE.NOT_PERMITTED_TO_RESERVE.blockChainError) {
          messageError = BLOCKCHAIN_ERROR_MESSAGE.NOT_PERMITTED_TO_RESERVE.message;
        }
        if (messageError === BLOCKCHAIN_ERROR_MESSAGE.BAD_BUY_TIME.blockChainError) {
          messageError = BLOCKCHAIN_ERROR_MESSAGE.BAD_BUY_TIME.message;
        }
        if (messageError === BLOCKCHAIN_ERROR_MESSAGE.ERROR_RECRUITING_TIMESTAMP.blockChainError) {
          messageError = BLOCKCHAIN_ERROR_MESSAGE.ERROR_RECRUITING_TIMESTAMP.message;
        }
        setIsOpenPendingModal(false);
        return message('error', messageError || error?.message);
      }
    }

    setIsConfirm(false);
    setTxCreateDeedId(result.hash);
    await result.wait(1);
    setIsOpenPendingModal(false);
    setIsConfirm(true);
    setIsCreatingDeed(false);

    // message('success', 'You have successfully created a deed!');
    toggleCreateDeedSuccessModal();
    setIsOpenCreateDeedModal(false);
    setIsCreated(true);
  };

  useEffect(() => {
    const getEventSC = async () => {
      const deedFactoryInstance = await genDeedFactoryContract();
      deedFactoryInstance.on('DeedCreated', (from, to, value, event) => {
        console.log({
          from: from,
          to: to,
          value: value,
          data: event,
        });
      });

      if (isCreated) setTimeout(getEventSC, 3000);
    };
    getEventSC();
  }, [isCreated]);

  const doApproveDToken = async () => {
    setIsOpenPendingModal(true);

    const [response, error]: any = await handleUserApproveToken(TOKEN_TYPES.DTOKEN.tokenAddress, DEED_FACTORY_ADDRESS);
    if (error) {
      if (error) {
        message('error', '', error?.code);
        setIsOpenPendingModal(false);
        return;
      }
    }

    setIsConfirm(false);
    setIsApprovingDeed(true);
    setTxCreateDeedId(response.hash);
    await response.wait(1);
    setIsConfirm(true);
    setIsApprovingDeed(false);
    setIsOpenPendingModal(false);
    message('success', 'You have successfully approved DToken!');
  };

  // new Query Param other than change page, Reset Pagination
  const handleToggleCreateDeedModal = () => {
    if (userAddress) {
      return setIsOpenCreateDeedModal(!isOpenCreateDeedModal);
    } else {
      return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
    }
  };

  const handleChangeDeedTable = (pagination: any, filters: any, sorter: any) => {
    setSorting(sorting + 1);
    // cancel sorting
    if (sorter.order === undefined)
      setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => b.deedId - a.deedId));

    // sorting status
    if (sorter.columnKey === 'status') {
      if (sorter.order === 'ascend')
        setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => a.status - b.status));
      if (sorter.order === 'descend')
        setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => b.status - a.status));
    }

    // sorting pair token
    if (sorter.columnKey === 'pairTokens') {
      if (sorter.order === 'ascend')
        setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => a.coinBName.localeCompare(b.coinBName)));
      if (sorter.order === 'descend')
        setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => b.coinBName.localeCompare(a.coinBName)));
    }

    // sorting loan leverage
    if (sorter.columnKey === 'loanLeverage') {
      if (sorter.order === 'ascend')
        setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => a.loanLeverage - b.loanLeverage));
      if (sorter.order === 'descend')
        setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => b.loanLeverage - a.loanLeverage));
    }

    // sorting timeleft
    if (sorter.columnKey === 'timeLeft') {
      if (sorter.order === 'ascend')
        setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => Number(a.deedEndDate) - Number(b.deedEndDate)));
      if (sorter.order === 'descend')
        setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => Number(b.deedEndDate) - Number(a.deedEndDate)));
    }

    // sorting size token
    if (sorter.columnKey === 'sizeOfCoin') {
      if (sorter.order === 'ascend') setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => a.size - b.size));
      if (sorter.order === 'descend') setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => b.size - a.size));
    }

    // sorting progress
    if (sorter.columnKey === 'progress') {
      if (sorter.order === 'ascend')
        setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => a.progress - b.progress));
      if (sorter.order === 'descend')
        setDeedDashboardData(deedDashboardData.sort((a: any, b: any) => b.progress - a.progress));
    }
  };

  const onInputSearch = async (event: ChangeEvent<HTMLInputElement>) => {
    setQueryAll(event.target.value);
    if (event.target.value === '') setDataDeedFilterAndSearch(dataDeedFilterAndSearch);

    if (searchFilterAll === 'Pair') {
      setDataDeedFilterAndSearch(
        dataQueryForSearch.filter((e: any) =>
          (e.coinBName + '/' + e.coinAName).includes(event.target.value.toUpperCase()),
        ),
      );
    }

    if (searchFilterAll === 'Deed Address') {
      setDataDeedFilterAndSearch(dataQueryForSearch.filter((e: any) => e.deedAddress.includes(event.target.value)));
    }

    if (searchFilterAll === 'All') {
      setDataDeedFilterAndSearch(
        dataQueryForSearch.filter(
          (e: any) =>
            (e.coinBName + '/' + e.coinAName).includes(event.target.value.toUpperCase()) ||
            e.deedAddress.includes(event.target.value),
        ),
      );
    }
  };

  useEffect(() => {
    if (queryAll === '') setDeedDashboardData(dataDeedFilterAndSearch);
    // eslint-disable-next-line
  }, [queryAll]);

  useEffect(() => {
    let dataFilter = _.clone(deedDashboardDataOrigin);
    if (filterValuesAll === searchFilterOptions) setDeedDashboardData(deedDashboardDataOrigin);

    if (filterValuesAll.action === 'Created') dataFilter = dataFilter.filter((e: any) => e.deedManager === userAddress);

    if (filterValuesAll.action === 'Staked') dataFilter = dataFilter.filter((e: any) => Number(e.yourStaked) > 0);

    if (filterValuesAll.action === 'Joined') dataFilter = dataFilter.filter((e: any) => Number(e.yourJoined) > 0);

    if (filterValuesAll.status === 'Recruiting') dataFilter = dataFilter.filter((e: any) => e.status === 0);

    if (filterValuesAll.status === 'In escrow') dataFilter = dataFilter.filter((e: any) => e.status === 1);

    if (filterValuesAll.status === 'Open') dataFilter = dataFilter.filter((e: any) => e.status === 2);

    if (filterValuesAll.status === 'Completed') dataFilter = dataFilter.filter((e: any) => e.status === 3);

    if (filterValuesAll.status === 'Canceled') dataFilter = dataFilter.filter((e: any) => e.status === 4);

    if (filterValuesAll.deedType === 'Fixed') dataFilter = dataFilter.filter((e: any) => e.type === 'Fixed');

    if (filterValuesAll.deedType === 'Floating') dataFilter = dataFilter.filter((e: any) => e.type === 'Floating');

    if (filterValuesAll.leverage === '5') dataFilter = dataFilter.filter((e: any) => Number(e.loanLeverage) <= 5);

    if (filterValuesAll.leverage === '10')
      dataFilter = dataFilter.filter((e: any) => Number(e.loanLeverage) > 5 && Number(e.loanLeverage) <= 10);

    if (filterValuesAll.leverage === '20')
      dataFilter = dataFilter.filter((e: any) => Number(e.loanLeverage) > 10 && Number(e.loanLeverage) <= 20);

    if (filterValuesAll.leverage === '21') dataFilter = dataFilter.filter((e: any) => Number(e.loanLeverage) > 20);

    setDataDeedFilterAndSearch(dataFilter);
    setDataQueryForSearch(dataFilter);
    // eslint-disable-next-line
  }, [filterValuesAll]);

  useEffect(() => {
    setDeedDashboardData(dataDeedFilterAndSearch);
  }, [dataDeedFilterAndSearch]);
  return (
    <>
      <Header />
      <div className='mt-10 content-max-w mx-auto flex flex-col px-4 xl:px-0'>
        <div className='grid grid-cols-1 gap-10 lg:grid-cols-2'>
          <div>
            <DeedTableBrief title='Deeds in Recruiting' deeds={recruitingDeeds} isLoading={isLoadingRecruiting} />
          </div>
          <div>
            <DeedTableBrief title='Deeds in Escrow' deeds={escrowDeeds} isLoading={isLoadingEscrow} />
          </div>
        </div>

        <div className='mt-10'>
          <div className='flex mb-2-5 justify-between'>
            <div>
              <TableTabs tabs={[All_DEEDS, MY_DEEDS]} setCurrentTab={setCurrentTab} currentTab={currentTab} />
            </div>
            <div className='flex items-center'>
              <div className='flex space-x-3 mr-30px'>
                <Search
                  onInput={onInputSearch}
                  query={queryAll}
                  setQuery={setQueryAll}
                  currentOption={searchFilterAll}
                  setCurrentOption={setSearchFilterAll}
                  options={SEARCH_ALL_DEED_FILTER}
                />
                <Filter filterValues={filterValuesAll} setFilterValues={setFilterValuesAll} />
              </div>

              <div className='mt-auto'>
                <CreateDeedModal
                  isOpenCreateDeedModal={isOpenCreateDeedModal}
                  handleToggleCreateDeedModal={handleToggleCreateDeedModal}
                  doCreateDeed={doCreateDeed}
                  doApproveDToken={doApproveDToken}
                  isCreatingDeed={isCreatingDeed}
                  isApprovingDeed={isApprovingDeed}
                  purchaseTokens={purchaseToken}
                  depositToken={depositToken}
                />
              </div>
            </div>
          </div>
          <DeedTable
            deeds={deedDashboardData.slice(skip, skip + TAKE)}
            sortBy={sortBy}
            setSortBy={setSortBy}
            isLoading={isLoadingDeed}
            handleChangeDeedTable={handleChangeDeedTable}
            currentTab={currentTab}
          />
        </div>
      </div>
      <Pagination
        skip={skip}
        setSkip={setSkip}
        take={TAKE}
        dataLength={currentTab === 'My Deeds' && !userAddress ? 0 : deedDashboardData.slice(skip, skip + TAKE).length}
        maxLength={maxLength}
      />
      <PendingModal
        open={isOpenPendingModal}
        setOpen={setIsOpenPendingModal}
        isConfirm={isConfirm}
        txId={txCreateDeedId}
      />
      <CreateDeedSuccessModal
        toggleCreateDeedSuccessModal={toggleCreateDeedSuccessModal}
        shoudShowCreateDeedSuccessModalToggled={shoudShowCreateDeedSuccessModalToggled}
      />
    </>
  );
};
