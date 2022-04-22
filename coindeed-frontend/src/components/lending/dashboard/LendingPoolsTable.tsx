/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
// import { Filter } from '../../global/Filter';

import { NumberToFixedFormater } from '../../../utils/Formatters';
import { dynamicSort, getExchangeRateWithUSD, getIconOfTokenAddress } from '../../../blockchain/utils';
import LendingCreateModal from './modal/LendingCreateModal';
import { Pagination } from '../../global/Pagination';
import Table from '../../global/antd/Table';
import style from './UserSupplyTable/style.module.scss';
import _ from 'lodash';
import { Search } from '../../global/Search';
import { getAPYInfo, getTotalLiquidityOfTokenAddress } from '../../../blockchain/services/LendingPoolService';
import { getListLendingPools, LendingPool } from '../../../APIs/LendingPoolApi';

export const pageSize = 5;

interface LendingTableProps {
  clickRow: any;
  refProp?: any;
}

let searchTimeout: any = undefined;

export const LendingTable = ({ clickRow, refProp }: LendingTableProps) => {
  const [open, setOpen] = useState(false);
  const [skip, setSkip] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [lendingPoolInfo, setLendingPoolInfo] = useState<any>([]);
  const [isLoadingLendingPool, setIsLoadingLendingPool] = useState(true);
  const [maxLengthTokenOfLendingPool, setMaxLengthTokenOfLendingPool] = useState(0);
  const refLendingPool = useRef();

  /* === */

  const getLendingPoolInfo = async (listTokens: LendingPool[] = []) => {
    const lendingPool: any[] = [];
    async function getPoolInfo(token: LendingPool) {
      const data = await Promise.all([
        getAPYInfo(token),
        getTotalLiquidityOfTokenAddress(token),
        getExchangeRateWithUSD(token.tokenAddress),
      ]);
      const APY = data[0][0];
      const totalLiquidity = (data[1][0] as any) * (data[2][0] as any);
      lendingPool.push({ token, APY, totalLiquidity });
    }

    for (let i = 0; i < listTokens.length; i++) await getPoolInfo(listTokens[i]);
    setLendingPoolInfo(lendingPool);
  };

  const loadLendingPool = async (keyword?: string, skip?: number, noLoading = false) => {
    try {
      if (!noLoading) setIsLoadingLendingPool(true);
      const [res] = await getListLendingPools({ keyword, skip, take: pageSize });
      const listToken = res.tokens;
      (refLendingPool.current as any).listToken = listToken;
      setMaxLengthTokenOfLendingPool(res.length);
      await getLendingPoolInfo(listToken);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingLendingPool(false);
    }
  };

  function convertDataToTableData(data: any[]) {
    let newData: any = undefined;
    if (data && data.length) {
      newData = _.compact(data).map((e, i) => {
        return {
          ...e,
          key: i,
          tokenName: e.token.name,
          APYFormated: (e.APY === 'Infinity' ? '0.000' : NumberToFixedFormater(e.APY * 100, 6, true)) + '%',
          totalLiquidityFormated: '$ ' + NumberToFixedFormater(e.totalLiquidity, 6, true),
        };
      });
    }
    return newData || [];
  }

  /* === */

  useImperativeHandle(refProp, () => ({
    getListToken() {
      return (refLendingPool.current as any).listToken;
    },
    reloadData() {
      getLendingPoolInfo((refLendingPool.current as any).listToken);
    },
  }));

  /* === */

  useEffect(() => {
    loadLendingPool(search, skip);
  }, [skip]);

  useEffect(() => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadLendingPool(search, 0);
    }, 1000);
  }, [search]);

  /* === */

  return (
    <div ref={refProp}>
      <div className='flex mb-3 justify-between' ref={refLendingPool as any}>
        <h1 className='text-left text-white text-base'>All Lending Pools</h1>
        <div className='flex space-x-5 items-center'>
          <Search
            query={search}
            onInput={(e: any) => setSearch(e.target.value)}
            setQuery={setSearch}
            showDropdown={false}
          />
          {/* <Filter /> */}
          {/* <Button primary label='Create Pool' className='h-9' /> */}
          {/* Table 2 */}
        </div>
      </div>
      <Table
        rowKey='key'
        className={`coindeed__antd--table ${style.customTable2}`}
        tableLayout='fixed'
        columns={[
          {
            title: 'Token',
            dataIndex: 'token',
            key: 'tokenName',
            sorter: dynamicSort('tokenName'),
            render: token => {
              const icon = getIconOfTokenAddress(token.tokenAddress);
              return (
                <div className='flex items-center'>
                  <div className={`w-4 h-4 mr-2 ${icon ? 'bg-transparent' : 'bg-gray-300'}`}>
                    <img
                      src={icon}
                      hidden={!icon}
                      className={`w-full h-full`}
                      draggable='false'
                      loading='lazy'
                      alt=''
                    />
                  </div>
                  <span className='leading-3'>{token.name}</span>
                </div>
              );
            },
          },
          { title: 'APY %', dataIndex: 'APYFormated', key: 'APY', sorter: dynamicSort('APY') },
          {
            title: 'Total Liquidity',
            dataIndex: 'totalLiquidityFormated',
            key: 'totalLiquidity',
            sorter: dynamicSort('totalLiquidity'),
          },
        ]}
        dataSource={convertDataToTableData(lendingPoolInfo)}
        onRow={(record, rowIndex) => ({ onClick: () => clickRow(record.token) })}
        pagination={false}
        locale={{ emptyText: isLoadingLendingPool ? 'Loading' : 'No results found. Please enter another token.' }}
        loading={isLoadingLendingPool}
        showSorterTooltip={false}
      />

      <LendingCreateModal open={open} setOpen={setOpen} />
      <Pagination
        skip={skip}
        setSkip={setSkip}
        take={pageSize}
        dataLength={lendingPoolInfo.length}
        maxLength={maxLengthTokenOfLendingPool}
      />
    </div>
  );
};
