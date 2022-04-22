import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getListLendingPools, LendingPool } from '../../APIs/LendingPoolApi';
import { getAPYInfo, getCurrentSupply } from '../../blockchain/services/LendingPoolService';

import AccountSummaryAndTable from './AccountSummaryAndTable';

import { getTokenWithIcon } from './AccountUtility';

import { NumberToFixed } from '../../utils/Formatters';

import {
  getBalanceOfUser,
  getTokenDecimalsV2,
  convertBigNumberValueToNumber,
  getETHBalance,
  getExchangeRateWithUSD,
} from '../../blockchain/utils';

import { useHistory } from 'react-router-dom';

const tableHeaders = [
  { title: 'Token', dataIndex: 'token', key: 'token', sorter: true, render: getTokenWithIcon },
  { title: 'APY %', dataIndex: 'APY', key: 'APY', sorter: true },
  { title: 'Total Supplied', dataIndex: 'totalSupplied', key: 'totalSupplied', sorter: true },
  { title: 'Wallet Balance', dataIndex: 'walletBalance', key: 'walletBalance', sorter: true },
];

export default function AccountSummaryAndLendingPoolTable() {
  const [tableData, setTableData] = useState<any[]>([]);
  const [totalLendingPoolSupplied, setTotalLendingPoolSupplied] = useState(0);
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const history = useHistory();

  const getTableData = async () => {
    const [res] = await getListLendingPools({});
    let totalSupply = 0;
    const tokens = await Promise.all(
      res.tokens.map(async (token: LendingPool, idx: number) => {
        // eslint-disable-next-line
        let [ethbalance] = await getETHBalance();
        let [tokenSupply]: any = await getCurrentSupply(token);
        let [tokenAPY]: any = await getAPYInfo(token);
        let walletBalance: any = 0;
        let walletBalanceDecimal: any = 1;

        let [exchangeRate]: any = await getExchangeRateWithUSD(token.tokenAddress);
        if (token.name === 'ETH') {
          [walletBalance] = await getETHBalance();
        } else {
          [walletBalance] = await getBalanceOfUser(token.tokenAddress, userAddress);
          [walletBalanceDecimal] = await getTokenDecimalsV2(token.tokenAddress);

          walletBalance = convertBigNumberValueToNumber(walletBalance, walletBalanceDecimal);
        }
        walletBalance = NumberToFixed(walletBalance * exchangeRate, 2);
        tokenSupply = NumberToFixed(tokenSupply * exchangeRate, 2);
        tokenAPY = NumberToFixed(tokenAPY * 100, 2);
        totalSupply += Number(tokenSupply);
        return {
          ...token,
          tokenSupply: '$' + tokenSupply,
          tokenAPY: tokenAPY + '%',
          walletBalance: '$' + walletBalance,
        };
      }),
    );
    setTotalLendingPoolSupplied(totalSupply);
    let newTableData = tokens.map((t: any) => {
      return { token: t.name, APY: t.tokenAPY, totalSupplied: t.tokenSupply, walletBalance: t.walletBalance };
    });
    setTableData(newTableData);
    setIsLoadingList(false);
  };

  useEffect(() => {
    if (userAddress) {
      getTableData();
    }
    // eslint-disable-next-line
  }, [userAddress]);

  return (
    <AccountSummaryAndTable
      title='Lending Pool Supplied'
      tableHeaders={tableHeaders}
      tableData={tableData}
      summaryTitle='Total Lending Pool Supplied'
      summaryData={totalLendingPoolSupplied}
      onRowHandler={(record: any) => {
        return {
          onClick: () => {
            history.push(`/lending/`);
          },
        };
      }}
      loading={isLoadingList}
    />
  );
}
