/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect, useRef } from 'react';

import { Header } from '../../global/header/Header';
import { LendingTable } from './LendingPoolsTable';
import UserSupplyTable from './UserSupplyTable/index';

import { OPEN_STATUS } from '../../../utils/Constants';
import { convertBigNumberValueToNumber, getTokenInfoByAddress } from '../../../blockchain/utils';
import { queryGraph } from '../../../services/graphql';
import { multicall } from '../../../blockchain/multicall';

import { DeedTable } from './DeedTable';
import LendingModal from './LendingModal';

import DeedABI from '../../../blockchain/abi/Deed.json';
import LendingPoolABI from '../../../blockchain/abi/LendingPool.json';
import { LendingPool } from '../../../APIs/LendingPoolApi';

const LENDINGPOOL_ADDRESS = process.env.REACT_APP_LENDING_POOL_ADDRESS;

let blockInterval: any = undefined;
const timeoutOfBlock = 15000;

export default function LendingDashboard() {
  const [listOfCreatedDeed, setListOfCreatedDeed] = useState<any[]>([]);
  const [deedDashboardData, setDeedDashboardData] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<{ column: string | null; isDesc: boolean }>({
    column: null,
    isDesc: false,
  });
  const [isLoadingOpeningDeed, setIsLoadingOpeningDeed] = useState(true);
  const [deedTableData, setDeedTableData] = useState<any[]>([]);

  const refLendingPool = useRef();
  const refUserSupply = useRef();
  const refModal = useRef();

  /* === */

  const mappingDeedInfoToTable = (deedAddress: string, deedInfo: any) => {
    const tokenA = getTokenInfoByAddress(deedInfo[0][0]);
    const tokenB = getTokenInfoByAddress(deedInfo[0][1]);

    const { deedSize } = deedInfo[1];
    return {
      deedId: deedInfo[10],
      coinAName: tokenA?.name,
      coinBName: tokenB?.name,
      coinA: tokenA?.tokenAddress || '',
      coinB: tokenB?.tokenAddress || '',
      status: deedInfo[7][0],
      deedAddress,
      deedManager: deedInfo[2][0],
      size: convertBigNumberValueToNumber(deedSize, tokenA.decimal),
      type: deedInfo[5].toString() !== '0' ? 'Fixed' : 'Floating',
      deedPendingDtoken: convertBigNumberValueToNumber(deedInfo[8][0], tokenB?.decimal),
    };
  };

  /*  */

  useEffect(() => {
    setIsLoadingOpeningDeed(true);
    const tokensQuery = `
      query {
        newDeeds(orderBy: deedId, orderDirection: desc){
          id
          deedId
          deedAddress
          manager
        }
      }
  `;
    const doSearch = async () => {
      const [res]: any = await queryGraph(tokensQuery);
      setListOfCreatedDeed(res?.data?.newDeeds);
    };
    doSearch();
  }, []);

  useEffect(() => {
    const getMultipleDeedInfo = async () => {
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
        {
          address: deed?.deedAddress,
          name: 'pendingToken',
        },
      ]);

      let result = await Promise.all(listOfCalls.map(call => multicall(DeedABI, call)));
      const resultWithDeedAddress = result.map((deed, index) => [
        ...deed,
        listOfCreatedDeed[index].deedAddress,
        listOfCreatedDeed[index].deedId,
      ]);

      const dataTable = resultWithDeedAddress.map(data => mappingDeedInfoToTable(data[data.length - 2], data));
      const listOfOpeningDeed = dataTable.filter(deed => deed.status === OPEN_STATUS);

      setDeedDashboardData(listOfOpeningDeed);
      setIsLoadingOpeningDeed(false);
    };
    getMultipleDeedInfo();
  }, [listOfCreatedDeed]);

  useEffect(() => {
    const getDeedInfoOnLendingPool = async () => {
      const listOfDeeds = deedDashboardData.map(deed => ({
        deedAddress: deed.deedAddress,
        depositToken: deed.coinA,
        collateralToken: deed.coinB,
        deedPendingTokenInterest: deed.deedPendingDtoken,
      }));

      const listOfCalls = listOfDeeds.map(deed => [
        {
          address: LENDINGPOOL_ADDRESS,
          name: 'deedInfo',
          params: [deed.deedAddress],
        },

        // deed's pendingToken
        {
          address: LENDINGPOOL_ADDRESS,
          name: 'pendingToken',
          params: [deed.collateralToken, deed.deedAddress],
        },
        // deed's current supply
        {
          address: LENDINGPOOL_ADDRESS,
          name: 'userAssetInfo',
          params: [deed.deedAddress, deed.collateralToken],
        },
      ]);

      let resultDeedInfo = await Promise.all(listOfCalls.map(call => multicall(LendingPoolABI, call)));

      const deedDataTable = deedDashboardData.map((deed, index) => {
        const coinADecimals = getTokenInfoByAddress(deed.coinA).decimal;
        const coinBDecimals = getTokenInfoByAddress(deed.coinB).decimal;

        const totalDeedInterest =
          Number(convertBigNumberValueToNumber(resultDeedInfo[index][1][0], coinBDecimals)) + deed.deedPendingDtoken;

        return {
          ...deed,
          coinADecimals,
          coinBDecimals,
          totalBorrow: Number(convertBigNumberValueToNumber(resultDeedInfo[index][0].borrow, coinADecimals)),
          pendingToken: totalDeedInterest,
          supplyBalance: Number(convertBigNumberValueToNumber(resultDeedInfo[index][2].amount, coinBDecimals)),
        };
      });

      setDeedTableData(deedDataTable);
      setIsLoadingOpeningDeed(false);
    };

    if (deedDashboardData.length > 0) {
      getDeedInfoOnLendingPool();
    }
  }, [deedDashboardData]);

  /* === */

  const refreshDataLendingPool = () => {
    (refUserSupply.current as any).reloadData();
    (refLendingPool.current as any).reloadData();
    (refModal.current as any).reloadData();
  };

  const clickRowToOpenModal = (token: LendingPool) => (refModal.current as any).open(token);

  /*  */

  useEffect(() => {
    // Update data every 15 seconds
    blockInterval = setInterval(refreshDataLendingPool, timeoutOfBlock);
    return () => {
      clearInterval(blockInterval);
    };
  }, []);

  /* === */

  return (
    <>
      <Header />
      <div className='mt-10 content-max-w mx-auto flex flex-col px-4 xl:px-0 text-white'>
        <UserSupplyTable clickRow={clickRowToOpenModal} refProp={refUserSupply} />
        <div className='mb-10' />
        <LendingTable clickRow={clickRowToOpenModal} refProp={refLendingPool} />
        {deedTableData.length > 0 && (
          <DeedTable deeds={deedTableData} sortBy={sortBy} setSortBy={setSortBy} isLoading={isLoadingOpeningDeed} />
        )}
        <div className='pb-12' />
      </div>
      <LendingModal
        refModal={refModal}
        refreshDataLendingPool={() => {
          (refUserSupply.current as any).loadData(true);
          (refLendingPool.current as any).reloadData();
        }}
      />
    </>
  );
}
