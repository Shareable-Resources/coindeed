import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AccountSummaryAndTable from './AccountSummaryAndTable';
import { getPairWithIcons, getCountdown } from './AccountUtility';
import { queryGraph } from '../../services/graphql';
import { getTokenSymbol, getExchangeRateWithUSD } from '../../blockchain/utils';
import { generateWholesaleStatus, generateAmountTokenByDecimal } from '../../utils/helper';
import { useHistory } from 'react-router-dom';
import { multicall } from '../../blockchain/multicall';
import WholesaleABI from '../../blockchain/abi/Wholesale.json';

const WHOLESALE_ADDRESS = process.env.REACT_APP_WHOLESALE_ADDRESS;

const tableHeaders = [
  { title: 'Pair', dataIndex: 'pair', key: 'pair', sorter: true, render: getPairWithIcons },
  { title: 'Wholesale Id', dataIndex: 'wholesaleId', key: 'wholesaleId', sorter: true, width: '13%' },
  { title: 'Status', dataIndex: 'status', key: 'status', sorter: true, width: '10%' },

  {
    title: 'Time Left To Claim',
    dataIndex: 'timeLeftToClaim',
    key: 'timeLeftToClaim',
    sorter: true,
    render: getCountdown,
  },
  { title: 'Remaining Balance', dataIndex: 'remainingBalance', key: 'remainingBalance', sorter: true },
  {
    title: 'Total Amount To Claim',
    dataIndex: 'totalAmountToClaim',
    key: 'totalAmountToClaim',
    sorter: true,
  },
];

export default function AccountSummaryAndWholesalesListedTable() {
  const [tableData, setTableData] = useState<any[]>([]);
  const [totalWholesaleClaimableBalance, setTotalWholesaleClaimableBalance] = useState(0);
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const history = useHistory();

  const newWholesalesQuery = `
        query($offeredBy: String) {
          newWholesales(where: {offeredBy: $offeredBy}){
            saleId
            tokenOffered
            tokenRequested
            deadline
            status
            offeredAmount
          }
        }
    `;

  const getTableData = async () => {
    const variables = { offeredBy: userAddress };
    let claimableBalance = 0;
    const [res]: any = await queryGraph(newWholesalesQuery, variables);

    let wholesales = res.data.newWholesales;

    wholesales = await Promise.all(
      wholesales.map(async (wholesale: any) => {
        console.log();
        let [tokenOfferedSymbol] = await getTokenSymbol(wholesale.tokenOffered);
        let [tokenRequestedSymbol] = await getTokenSymbol(wholesale.tokenRequested);
        let wholesaleId = Number(wholesale.saleId);
        let status = generateWholesaleStatus(wholesale.status);
        let tokenPair = tokenOfferedSymbol + '/' + tokenRequestedSymbol;
        return {
          pair: tokenPair,
          wholesaleId: wholesaleId,
          status: status,
          timeLeftToClaim: '',
          remainingBalance: '',
          totalAmountToClaim: '',
          saleId: wholesale.saleId,
        };
      }),
    );

    const completeWholesales = await Promise.all(
      wholesales.map(async (basicWholesale: any) => {
        let completeWholesale = { ...basicWholesale };
        const wholesaleId = Number(basicWholesale.saleId);

        const listOfCalls = [
          [
            {
              address: WHOLESALE_ADDRESS,
              name: 'saleIdMapping',
              params: [wholesaleId],
            },
          ],
        ];

        const scdata = await Promise.all(listOfCalls.map(async call => await multicall(WholesaleABI, call)));

        completeWholesale['tokenOffered'] = scdata[0][0]['tokenOffered'];
        completeWholesale['tokenRequested'] = scdata[0][0]['tokenRequested'];
        completeWholesale['timeLeftToClaim'] = Number(scdata[0][0]['deadline']);
        const [offeredSymbol] = await getTokenSymbol(completeWholesale['tokenOffered']);
        const [requestedSymbol] = await getTokenSymbol(completeWholesale['tokenRequested']);
        const [offeredUSDExchange]: any = await getExchangeRateWithUSD(completeWholesale['tokenOffered']);
        const [requestedSDExchange]: any = await getExchangeRateWithUSD(completeWholesale['tokenRequested']);

        completeWholesale['offeredAmount'] = generateAmountTokenByDecimal(
          Number(scdata[0][0]['offeredAmount']),
          completeWholesale['tokenOffered'],
        );
        completeWholesale['soldAmount'] = generateAmountTokenByDecimal(
          Number(scdata[0][0]['soldAmount']),
          completeWholesale['tokenOffered'],
        );
        completeWholesale['receivedAmount'] = generateAmountTokenByDecimal(
          Number(scdata[0][0]['receivedAmount']),
          completeWholesale['tokenRequested'],
        );
        completeWholesale['remainingBalance'] =
          completeWholesale['offeredAmount'] -
          completeWholesale['soldAmount'] +
          ' of ' +
          completeWholesale['offeredAmount'] +
          ' ' +
          offeredSymbol;
        completeWholesale['totalAmountToClaim'] =
          completeWholesale['offeredAmount'] -
          completeWholesale['soldAmount'] +
          ' ' +
          offeredSymbol +
          ' / ' +
          completeWholesale['receivedAmount'] +
          ' ' +
          requestedSymbol;

        claimableBalance =
          claimableBalance +
          offeredUSDExchange * (completeWholesale['offeredAmount'] - completeWholesale['soldAmount']) +
          requestedSDExchange * completeWholesale['receivedAmount'];
        return completeWholesale;
      }),
    );

    setTotalWholesaleClaimableBalance(claimableBalance);
    setTableData(completeWholesales);
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
      title='Wholesales Listed'
      tableHeaders={tableHeaders}
      tableData={tableData}
      summaryTitle='Total Wholesale Claimable Balance'
      summaryData={totalWholesaleClaimableBalance}
      onRowHandler={(record: any) => {
        return {
          onClick: () => {
            history.push(`/wholesale/${record.wholesaleId}`);
          },
        };
      }}
      loading={isLoadingList}
    />
  );
}
