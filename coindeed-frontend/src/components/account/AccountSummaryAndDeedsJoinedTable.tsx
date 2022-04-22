// /* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DeedABI from '../../blockchain/abi/Deed.json';
import { queryGraph } from '../../services/graphql';
import { multicall } from '../../blockchain/multicall';
import { getPairWithIcons } from './AccountUtility';
import AccountSummaryAndTable from './AccountSummaryAndTable';
import { getTokenSymbol, getExchangeRateWithUSD } from '../../blockchain/utils';
import { useHistory } from 'react-router-dom';

import {
  getDeedNetWorth,
  getTotalLoan,
  getAmountOfDownpaymentTokenBuyerJoined,
} from '../../blockchain/services/DeedService';

const tableHeaders = [
  { title: 'Pair', dataIndex: 'pair', key: 'pair', sorter: true, render: getPairWithIcons },
  { title: 'Deed Net Worth', dataIndex: 'deedNetWorth', key: 'deedNetWorth', sorter: true },
  { title: 'Downpay Value', dataIndex: 'downpayValue', key: 'downpayValue', sorter: true },
  { title: 'PnL', dataIndex: 'pnl', key: 'pnl', sorter: true },
  { title: 'Loans Balance', dataIndex: 'loansBalance', key: 'loansBalance', sorter: true },
];

const userDeedsQuery = `
    query($userAddress: String!) {
      userDeeds(where: {userAddress: $userAddress}){
        userAddress
        deedAddress
        amountJoined
      }
    }
  `;

const newDeedsQuery = `
    query($deedAddress: String!) {
      newDeeds(where: {deedAddress: $deedAddress}){
        deedId
      }
    }
  `;

export default function AccountSummaryAndDeedsJoinedTable() {
  const [tableData, setTableData] = useState<any[]>([]);
  const [deedsNetworth, setDeedsNetWorth] = useState(0);
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const history = useHistory();

  useEffect(() => {
    const getTableData = async () => {
      const variables = {
        userAddress: userAddress,
      };
      const [res]: any = await queryGraph(userDeedsQuery, variables);

      let userDeeds = res?.data?.userDeeds;

      if (!userDeeds) {
        setDeedsNetWorth(0);
        setTableData([]);
        setIsLoadingList(false);
        return;
      }

      userDeeds = await Promise.all(
        userDeeds.map(async (userDeed: any) => {
          const variables2 = {
            deedAddress: userDeed.deedAddress,
          };
          const [res2]: any = await queryGraph(newDeedsQuery, variables2);
          const newDeed: any = res2.data.newDeeds[0];
          const deedId = newDeed.deedId;

          return { ...userDeed, deedId };
        }),
      );
      const completeDeeds = await Promise.all(
        userDeeds.map(async (basicDeed: any) => {
          let completeDeed = { ...basicDeed };
          const deedAddress = basicDeed.deedAddress;
          const listOfCalls = [
            [
              {
                address: deedAddress,
                name: 'pair',
              },
              {
                address: deedAddress,
                name: 'deedParameters',
              },
            ],
          ];
          const scdata = await Promise.all(listOfCalls.map(async call => await multicall(DeedABI, call)));

          completeDeed['coinA'] = scdata[0][0][0];
          completeDeed['coinB'] = scdata[0][0][1];
          completeDeed['deedSize'] = scdata[0][1][0];
          completeDeed['loanLeverage'] = scdata[0][1][1];
          completeDeed['managementFee'] = parseFloat((scdata[0][1][2] / 100).toString());
          return completeDeed;
        }),
      );
      let netWorthTotal = 0;
      const newTableData: any = await Promise.all(
        completeDeeds.map(async (completeDeed: any) => {
          const tokenAName = await getTokenSymbol(completeDeed.coinA);
          const tokenBName = await getTokenSymbol(completeDeed.coinB);
          const deedNetWorth = await getDeedNetWorth(completeDeed, userAddress);
          netWorthTotal += parseFloat(deedNetWorth);
          let downpayValue = await getAmountOfDownpaymentTokenBuyerJoined(completeDeed, userAddress);
          let [exchangeRate]: any = await getExchangeRateWithUSD(completeDeed.coinA);
          let loansBalance = await getTotalLoan(completeDeed, userAddress);
          let loansBalanceConv = parseFloat(loansBalance);
          loansBalanceConv = loansBalanceConv * exchangeRate;
          downpayValue = exchangeRate * downpayValue;

          let toret = {
            pair: tokenBName[0] + '/' + tokenAName[0],
            deedId: completeDeed.deedId,
            deedNetWorth: '$' + deedNetWorth,
            downpayValue: '$' + downpayValue,
            pnl: 0,
            loansBalance: '$' + loansBalanceConv,
          };
          return toret;
        }),
      );
      setDeedsNetWorth(netWorthTotal);
      setTableData(newTableData);
      setIsLoadingList(false);
    };

    if (userAddress) {
      getTableData();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <AccountSummaryAndTable
      title='Deeds Joined'
      tableHeaders={tableHeaders}
      tableData={tableData}
      summaryTitle='Deeds Net Worth'
      summaryData={deedsNetworth}
      onRowHandler={(record: any) => {
        return {
          onClick: () => {
            history.push(`/deed/${record.deedId}`);
          },
        };
      }}
      loading={isLoadingList}
    />
  );
}
