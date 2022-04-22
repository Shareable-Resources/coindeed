import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getListLendingPools, LendingPool } from '../../../../APIs/LendingPoolApi';
import {
  getAPYInfo,
  getCurrentSupply,
  pendingDToken,
  pendingToken,
} from '../../../../blockchain/services/LendingPoolService';
import { dynamicSort, getIconOfTokenAddress } from '../../../../blockchain/utils';
import { NumberToFixedFormater } from '../../../../utils/Formatters';
import Table from '../../../global/antd/Table';
import style from './style.module.scss';

type UserSupplyTableProps = {
  clickRow: any;
  refProp?: any;
};

export const headers = ['Token', 'APY %', 'Interest Earned', 'Supply Balance'];

export const UserSupplyTable = ({ clickRow, refProp }: UserSupplyTableProps) => {
  /* === */

  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const refUserSupply = useRef();
  const [currentUserSupply, setCurrentUserSupply] = useState<Array<any>>([]);
  const [isLoadingCurrentSupply, setIsLoadingCurrentSupply] = useState(true);

  /* === */

  const loadCurrentSupply = async (noLoading = false) => {
    try {
      if (!noLoading) setIsLoadingCurrentSupply(true);
      const listToken: LendingPool[] = [];
      if (userAddress) {
        const [res] = await getListLendingPools({});
        const promiseListToken: any[] = [];
        res.tokens.forEach((token: LendingPool) => promiseListToken.push(getCurrentSupply(token)));
        const resListToken = await Promise.all(promiseListToken);
        console.log('loadCurrentSupply resListToken: ', resListToken);
        console.log('loadCurrentSupply res.tokens: ', res.tokens);
        resListToken.forEach((value, i) => {
          if (typeof value[0] === 'number' && value[0] > 0) listToken.push(res.tokens[i]);
        });
      }

      (refUserSupply.current as any).listToken = listToken;
      await getUserCurrentSupplyInfo(listToken);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingCurrentSupply(false);
    }
  };

  const getUserCurrentSupplyInfo = async (listTokens: LendingPool[] = []) => {
    const userPoolSuppling: any[] = [];
    async function addUserPoolSupply(token: LendingPool) {
      const data = await Promise.all([
        pendingDToken(token),
        pendingToken(token),
        getAPYInfo(token),
        getCurrentSupply(token),
      ]);
      userPoolSuppling.push({
        interestEarned: data[0][0],
        interestEarned2: data[1][0],
        APY: data[2][0],
        supplyBalance: data[3][0] || 0,
        token,
      });
    }

    for (let i = 0; i < listTokens.length; i++) await addUserPoolSupply(listTokens[i]);
    setCurrentUserSupply(userPoolSuppling);
  };

  function convertDataToTableData(data: any) {
    let newData: any = undefined;
    if (data && data.length) {
      newData = data.map((e: any, i: number) => {
        const decimals = e.token.decimals;
        return {
          ...e,
          key: i,
          APYFormated: `${NumberToFixedFormater(e.APY * 100, 2, true)}%`,
          tokenName: e.token.name,
          interestEarnedFormated: `${NumberToFixedFormater(
            Number(e.interestEarned).toFixed(decimals),
            6,
            false,
            true,
          )} DToken / ${NumberToFixedFormater(Number(e.interestEarned2).toFixed(decimals), 6, false, true)} ${
            e.token.name
          }`,
          supplyBalanceFormated: `${NumberToFixedFormater(
            Number(e.supplyBalance).toFixed(decimals) || 0,
            6,
            false,
            true,
          )} ${e.token.name}`,
        };
      });
    }

    return newData || [];
  }

  /* === */

  useImperativeHandle(refProp, () => ({
    getListToken() {
      return (refUserSupply.current as any).listToken;
    },
    reloadData() {
      getUserCurrentSupplyInfo((refUserSupply.current as any).listToken);
    },
    loadData(noLoading = false) {
      loadCurrentSupply(noLoading);
    },
  }));

  /* === */

  useEffect(() => {
    loadCurrentSupply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress]);

  /* === */

  return (
    <div>
      <div className='flex mb-2-5 justify-between' ref={refUserSupply as any}>
        <h1 className='text-left text-white text-base mb-0 font-semibold'>Currently Supplying</h1>
      </div>
      <Table
        rowKey='key'
        className={`coindeed__antd--table ${style.customTable}`}
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
            title: 'Interest Earned',
            dataIndex: 'interestEarnedFormated',
            key: 'interestEarned',
            sorter: dynamicSort('interestEarned'),
          },
          {
            title: 'Supply Balance',
            dataIndex: 'supplyBalanceFormated',
            key: 'supplyBalance',
            sorter: dynamicSort('supplyBalance'),
          },
        ]}
        dataSource={convertDataToTableData(currentUserSupply)}
        onRow={(record, rowIndex) => ({ onClick: () => clickRow(record.token) })}
        pagination={false}
        locale={{ emptyText: isLoadingCurrentSupply ? 'Loading' : 'No Current Supply.' }}
        loading={isLoadingCurrentSupply}
        showSorterTooltip={false}
      />
    </div>
  );
};

export default UserSupplyTable;
