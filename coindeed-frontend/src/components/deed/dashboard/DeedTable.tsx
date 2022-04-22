import { ProgressBar } from '../../global/ProgressBar';

import './../../../index.css';
import { Dispatch, SetStateAction } from 'react';
import { useHistory } from 'react-router-dom';

import { abbreviateNumber, shrinkAddressX } from '../../../utils/Formatters';
import { duration, generateDeedStatus } from '../../../utils/helper';
import { getIconOfTokenAddress } from '../../../blockchain/utils';
import Table from '../../global/antd/Table';
import style from './style.module.scss';
import { TimeLeftMoment } from '../../global/TimeLeftMoment';
import { ColumnsType } from 'antd/lib/table';
import { CANCELLED_STATUS, COMPLETED_STATUS } from '../../../utils/Constants';
import { useSelector } from 'react-redux';

type DeedTableProps = {
  title?: string;
  deeds: Deed[];
  isManagerPage?: boolean;
  isLoading?: boolean;
  sortBy: { column: string | null; isDesc: boolean };
  setSortBy: Dispatch<SetStateAction<{ column: string | null; isDesc: boolean }>>;
  handleChangeDeedTable?: any;
  currentTab?: any;
};

export interface Deed {
  deedId: string;
  deedAddress: string;
  deedManager: string;
  status: number;
  type: string;
  wholesaleAddress: string;
  coinA: string; // Down Payment Token
  coinB: string; // Purchase Token
  coinAName: string;
  coinBName: string;
  loanLeverage: string;
  size: number;
  sizeConsumed: number;
  managementFee: number;
  recruitingEndDate: Date;
  escrowEndDate: string;
  deedEndDate: string;
  triggerRiskMitigation: string;
  leveragedAdjustmentRiskMitigation: string;
  secondTriggerRiskMitigation: string;
  allowBrokers: Boolean;
  minimumBrokerStakingAmount: number;
  published: Date;
  updated: Date;
  progress: number;
  profit: any;
  allOrMy: string;
  requiredStakingAmount?: string;
  createdAtTimeStamp?: string;
  minimumParticipation?: number;
  buyerDeeds?: any;
  exiterDeeds?: any;
  isCanceledInEscrow?: any;
}

export type pairTokens = {
  name: string;
  address: string;
};

export const DeedTable = ({
  title,
  deeds,
  isManagerPage = false,
  sortBy,
  setSortBy,
  isLoading,
  handleChangeDeedTable,
  currentTab,
}: DeedTableProps) => {
  const history = useHistory();
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const convertDataDeed = deeds?.map((e: Deed) => {
    const coinA = e.coinAName === undefined ? '' : e.coinAName;
    const coinB = e.coinBName === undefined ? '' : e.coinBName;
    let timeLeft;

    switch (e.status) {
      case 0:
        timeLeft = e.recruitingEndDate;
        break;
      case 1:
        timeLeft = e.escrowEndDate;
        break;
      default:
        timeLeft = e.deedEndDate;
        break;
    }
    return {
      ...e,
      pairTokens: [
        { name: coinB, address: e.coinB },
        { name: coinA, address: e.coinA },
      ],
      duration: duration(e),
      sizeOfCoin: {
        size: e.size,
        name: coinA,
      },
      timeLeft: e.status === CANCELLED_STATUS || e.status === COMPLETED_STATUS ? 0 : timeLeft,
    };
  });

  const dataColumn: ColumnsType<any> = [
    {
      title: 'Pair',
      dataIndex: 'pairTokens',
      key: 'pairTokens',
      width: '15%',
      sorter: true,
      render: (tokens: pairTokens[]) => {
        const icon1 = tokens[0] ? getIconOfTokenAddress(tokens[0].address) : undefined;
        const icon2 = tokens[1] ? getIconOfTokenAddress(tokens[1].address) : undefined;
        return (
          <div className='flex items-center'>
            <img
              src={icon1}
              style={{ marginRight: '3px' }}
              width='16px'
              height='16px'
              hidden={!icon1}
              draggable='false'
              loading='lazy'
              alt=''
            />
            <img src={icon2} width='16px' height='16px' hidden={!icon2} draggable='false' loading='lazy' alt='' />
            <span className={icon2 || icon1 ? 'ml-2' : ''}>
              {tokens[0].name} / {tokens[1].name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (text: any) => (
        <div className='flex items-center font-normal'>
          <span className='leading-3'>{generateDeedStatus(text)}</span>
        </div>
      ),
    },
    {
      title: 'Time Left',
      dataIndex: 'timeLeft',
      key: 'timeLeft',
      width: '15%',
      sorter: true,
      render: (text: any) => <TimeLeftMoment targetDate={text} />,
    },
    {
      title: 'Deed Address',
      dataIndex: 'deedAddress',
      key: 'deedAddress',
      width: '15%',
      render: (text: any) => (
        <div className='flex items-center font-normal'>
          <div className='border-b border-white'>{shrinkAddressX(text, 8, 3)}</div>
        </div>
      ),
    },
    {
      title: 'Leverage',
      dataIndex: 'loanLeverage',
      key: 'loanLeverage',
      width: '15%',
      sorter: true,
      render: (text: any) => (
        <div className='text-left'>
          <span className='leading-3'>{text}x</span>
        </div>
      ),
    },
    {
      title: 'Total Size',
      dataIndex: 'sizeOfCoin',
      key: 'sizeOfCoin',
      width: '15%',
      sorter: true,
      render: (text: any) => (
        <div className='text-left'>
          <span className='leading-3'>{`${abbreviateNumber(text.size)} ${text.name}`}</span>
        </div>
      ),
    },
    // {
    //   title: 'Duration',
    //   dataIndex: 'duration',
    //   key: 'duration',
    //   sorter: dynamicSort('duration'),
    //   render: (text: any) => (
    //     <div className='text-left'>
    //       <span className='leading-3'>{text}</span>
    //     </div>
    //   ),
    // },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      align: 'right',
      width: '96px',
      sorter: true,
      render: (text: any) => (
        <div className='flex'>
          <div className='ml-auto'>
            <ProgressBar progress={text * 100} />
          </div>
        </div>
      ),
    },
  ];

  const managersDataColumn: ColumnsType<any> = [
    {
      title: 'Pair',
      dataIndex: 'paidToken',
      key: 'paidToken',
      sorter: true,
      render: (text: any) => (
        <div className='flex items-center'>
          <span className='leading-3'>{text}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (text: any) => (
        <div className='flex items-center font-normal'>
          <span className='leading-3'>{generateDeedStatus(text)}</span>
        </div>
      ),
    },
    {
      title: 'Time Left',
      dataIndex: 'deedEndDate',
      key: 'deedEndDate',
      sorter: true,
      render: (text: any) => <TimeLeftMoment targetDate={text} />,
    },
    {
      title: 'Deed Address',
      dataIndex: 'deedAddress',
      key: 'deedAddress',
      render: (text: any) => (
        <div className='flex items-center font-normal'>
          <div className='border-b border-white'>{shrinkAddressX(text, 4, 3)}</div>
        </div>
      ),
    },
    {
      title: 'Leverage',
      dataIndex: 'loanLeverage',
      key: 'loanLeverage',
      sorter: true,
      render: (text: any) => (
        <div className='text-left'>
          <span className='leading-3'>{text}x</span>
        </div>
      ),
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      sorter: true,
      render: (text: any) => (
        <div className={text > 0 ? 'text-moneyGreen text-left' : 'text-moneyRed text-left'}>
          {text > 0 ? '+' : '-'}
          {text}%
        </div>
      ),
    },
    {
      title: 'Total Size',
      dataIndex: 'sizeOfCoin',
      key: 'sizeOfCoin',
      sorter: true,
      render: (text: any) => (
        <div className='text-left'>
          <span className='leading-3'>{`${abbreviateNumber(text.size)} ${text.name}`}</span>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      sorter: true,
      render: (text: any) => (
        <div className='text-left'>
          <span className='leading-3'>XXX</span>
        </div>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      sorter: true,
      render: (text: any) => <ProgressBar progress={text * 100} />,
    },
  ];
  const messageEmpty =
    currentTab && currentTab === 'My Deeds' && !userAddress
      ? 'Data not available. Please connect your wallet.'
      : 'No data.';
  return (
    <Table
      className={`coindeed__antd--table ${style.customTable}`}
      tableLayout='auto'
      columns={isManagerPage ? managersDataColumn : dataColumn}
      dataSource={currentTab && currentTab === 'My Deeds' && !userAddress ? [] : convertDataDeed}
      onRow={(record, rowIndex) => {
        return {
          onClick: () => history.push(`/deed/${record.deedId}`),
        };
      }}
      pagination={false}
      locale={{
        emptyText: isLoading ? 'Loading' : messageEmpty,
      }}
      loading={isLoading}
      rowKey='deedAddress'
      onChange={handleChangeDeedTable}
      showSorterTooltip={false}
    />
  );
};
