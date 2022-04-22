// /* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DeedABI from '../../blockchain/abi/Deed.json';
import { queryGraph } from '../../services/graphql';
import { multicall } from '../../blockchain/multicall';
import { getCountdown, getPairWithIcons } from './AccountUtility';
import AccountSummaryAndTable from './AccountSummaryAndTable';
import {
  getTokenSymbol,
  convertBigNumberValueToNumber,
  getTokenDecimalsV2,
  convertPriceToBigDecimals,
} from '../../blockchain/utils';
import { useHistory } from 'react-router-dom';

import { COMPLETED_STATUS, TOKEN_TYPES } from '../../utils/Constants';
import { generateDeedStatus } from '../../utils/helper';
import { genDaoContract, genDeedContract, genDeedFactoryContract } from '../../blockchain/instance';
import { getTotalStake } from '../../blockchain/services/DeedService';

const tableHeaders = [
  { title: 'Pair', dataIndex: 'pair', key: 'pair', sorter: true, render: getPairWithIcons },
  { title: 'Status', dataIndex: 'status', key: 'status', sorter: true },
  {
    title: 'Time Left to Claim',
    dataIndex: 'timeLeftToClaimFee',
    key: 'timeLeftToClaimFee',
    sorter: true,
    render: (record: any) => {
      return record.deedStatus !== COMPLETED_STATUS ? getCountdown(record.timeLeftToClaimFee) : '--';
    },
  },
  { title: 'Total Deed Staking', dataIndex: 'totalDtokenStaked', key: 'totalDtokenStaked', sorter: true },
  {
    title: 'Management Fee Earn',
    dataIndex: 'managementFeeEarn',
    key: 'managementFeeEarn',
    sorter: true,
    render: (record: any) => {
      return `${record} DToken`;
    },
  },
];

const allDeedsData = `
  query {
    newDeeds{
      deedId
      deedAddress
      status
    }
  }
`;

export default function DeedsStakedTable() {
  const [tableData, setTableData] = useState<any[]>([]);
  const [totalManagementFee, setTotalManagementFeeClaimable] = useState(0);
  const [isLoadingListDeeds, setIsLoadingListDeeds] = useState(true);

  const userAddress = useSelector((state: any) => state.wallet.userAddress);

  const history = useHistory();

  useEffect(() => {
    const getTableData = async () => {
      const [allDeed]: any = await queryGraph(allDeedsData);

      const listAllDeedAddress = allDeed.data.newDeeds.map((deed: any) => ({
        deedAddress: deed.deedAddress,
        deedId: deed.deedId,
      }));

      const fullDeedInfo = await Promise.all(
        listAllDeedAddress.map(async (deed: any) => {
          let deedInfo: any = { deedId: deed.deedId, deedAddress: deed.deedAddress };

          const listOfCalls = [
            [
              {
                address: deed.deedAddress,
                name: 'pair',
              },
              {
                address: deed.deedAddress,
                name: 'deedParameters',
              },
              {
                address: deed.deedAddress,
                name: 'state',
              },
              {
                address: deed.deedAddress,
                name: 'executionTime',
              },
              {
                address: deed.deedAddress,
                name: 'stakes',
                params: [userAddress],
              },
            ],
          ];

          // Get Deed data from Smartcontract
          const deedDataFromSC = await Promise.all(listOfCalls.map(async call => await multicall(DeedABI, call)));

          deedInfo.coinA = deedDataFromSC[0][0][0];
          deedInfo.coinB = deedDataFromSC[0][0][1];
          deedInfo.status = deedDataFromSC[0][2][0].toString();
          deedInfo.timeClaimFee = deedDataFromSC[0][3].sellTimestamp.toString();
          deedInfo.stakedAmount = convertBigNumberValueToNumber(deedDataFromSC[0][4][0], TOKEN_TYPES.DTOKEN.decimal);
          return deedInfo;
        }),
      );

      const listOfStakedDeeds = fullDeedInfo.filter((deed: any) => deed.stakedAmount > 0);

      const deedTable: any = await Promise.all(
        listOfStakedDeeds.map(async (deedInfo: any) => {
          const tokenAName = await getTokenSymbol(deedInfo.coinA);
          const tokenBName = await getTokenSymbol(deedInfo.coinB);
          const deedStatus = generateDeedStatus(Number(deedInfo.status));

          let totalStaking = await getTotalStake(deedInfo.deedAddress);

          totalStaking = convertBigNumberValueToNumber(totalStaking[0], TOKEN_TYPES.DTOKEN.decimal);
          const rateStaking = Number(totalStaking) / deedInfo.stakedAmount;

          const managementFee = await calculateManagemeneFeeEarned(rateStaking, deedInfo.deedAddress, deedInfo.coinA);

          let deedRecord = {
            pair: tokenBName[0] + '/' + tokenAName[0],
            status: deedStatus,
            timeLeftToClaimFee: { timeLeftToClaimFee: deedInfo.timeClaimFee, deedStatus: Number(deedInfo.status) },
            deedId: deedInfo.deedId,
            totalDtokenStaked: `${deedInfo.stakedAmount} DToken`,
            managementFeeEarn: `${managementFee}`,
          };
          return deedRecord;
        }),
      );

      let totalManagementFee = 0;

      for (let deed of deedTable) {
        totalManagementFee = totalManagementFee + Number(deed.managementFeeEarn);
      }

      setTotalManagementFeeClaimable(totalManagementFee);

      setTableData(deedTable);
      setIsLoadingListDeeds(false);
    };

    const calculateManagemeneFeeEarned = async (rateDtokenStaked: any, deedAddress: string, downpaymentToken: any) => {
      const deedInstance = await genDeedContract(deedAddress);
      const totalFee = await deedInstance.totalFee();

      const [downpaymentTokenDecimal]: any = await getTokenDecimalsV2(downpaymentToken);

      const formatedTotalFee = convertBigNumberValueToNumber(totalFee, Number(downpaymentTokenDecimal));

      const deedFactoryInstance = await genDeedFactoryContract();
      let platformFee = await deedFactoryInstance.platformFee();
      platformFee = Number(platformFee) / 10000;

      const amountFeeDownPaymentToken = rateDtokenStaked * formatedTotalFee;
      const roundNumberAmountFeeDownPaymentToken = amountFeeDownPaymentToken.toFixed(4);

      const formatedValue = convertPriceToBigDecimals(
        Number(roundNumberAmountFeeDownPaymentToken),
        Number(downpaymentTokenDecimal),
      );

      const daoInstance = await genDaoContract();
      const result = await daoInstance.getCoinDeedManagementFee(downpaymentToken, formatedValue);
      const formattedResult = convertBigNumberValueToNumber(result, TOKEN_TYPES.DTOKEN.decimal);

      const amountPlatFormFee = formattedResult * platformFee;

      const managementFee = formattedResult - amountPlatFormFee;

      return managementFee;
    };
    if (userAddress) {
      getTableData();
    }
    // eslint-disable-next-line
  }, [userAddress]);

  return (
    <AccountSummaryAndTable
      title='Deeds Staked'
      tableHeaders={tableHeaders}
      tableData={tableData}
      summaryTitle='Total Deed Management Fee Balance'
      summaryData={totalManagementFee}
      onRowHandler={(record: any) => {
        return {
          onClick: () => {
            history.push(`/deed/${record.deedId}`);
          },
        };
      }}
      loading={isLoadingListDeeds}
    />
  );
}
