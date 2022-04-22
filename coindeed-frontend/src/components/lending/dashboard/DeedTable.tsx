import './../../../index.css';
import { Dispatch, SetStateAction } from 'react';
import { useHistory } from 'react-router-dom';

import { abbreviateNumber, NumberToFixedFormater } from '../../../utils/Formatters';
import { dynamicSort, getIconOfTokenAddress } from '../../../blockchain/utils';
import Table from '../../global/antd/Table';
import _ from 'lodash';

type DeedTableProps = {
  title?: string;
  deeds: Deed[];
  managers?: boolean;
  isLoading?: boolean;
  sortBy: { column: string | null; isDesc: boolean };
  setSortBy: Dispatch<SetStateAction<{ column: string | null; isDesc: boolean }>>;
};

export interface Deed {
  deedId: string;
  status: number;
  type: string;
  coinA: string;
  coinB: string;
  coinAName: string;
  coinBName: string;
  loanLeverage: string;
  size: number;
}

export const DeedTable = ({ deeds, managers = false, sortBy, setSortBy, isLoading }: DeedTableProps) => {
  const history = useHistory();

  const convertDataDeed = deeds?.map((deed: any) => {
    const coinA = deed.coinAName === undefined ? '' : deed.coinAName;
    const coinB = deed.coinBName === undefined ? '' : deed.coinBName;
    const paidToken = coinB + '/' + coinA;
    const icons = [
      deed.coinB ? getIconOfTokenAddress(deed.coinB) : undefined,
      deed.coinA ? getIconOfTokenAddress(deed.coinA) : undefined,
    ];
    return {
      ...deed,
      paidToken,
      totalInterest: `${NumberToFixedFormater(
        Number(deed.pendingToken).toFixed(deed.coinBDecimals),
        6,
        false,
        true,
      )} ${coinB}`,
      icons,
      paidColumn: { text: paidToken, icons },
      sizeColumn: `${abbreviateNumber(deed.size)} ${deed.coinAName}`,
      totalBorrowColumn: `${NumberToFixedFormater(deed.totalBorrow, 6, false, true)} ${coinA}`,
      supplyBalanceColumn: `${NumberToFixedFormater(deed.supplyBalance, 6, false, true)} ${coinB}`,
    };
  });

  const dataColumnManagers = [
    {
      title: 'Pair',
      dataIndex: 'paidColumn',
      key: 'paidToken',
      sorter: dynamicSort('paidToken'),
      render: (paidColumn: any) => {
        return (
          <div className='flex items-center'>
            {/* eslint-disable-next-line */}
            {paidColumn.icons.map((icon?: string) => {
              if (icon) return <img src={icon} className='w-4 h-4 mr-1' draggable='false' loading='lazy' alt='' />;
            })}
            <span className={`leading-3`}>{paidColumn.text}</span>
          </div>
        );
      },
    },
    {
      title: 'Deed Type',
      dataIndex: 'type',
      key: 'type',
      sorter: dynamicSort('type'),
    },

    {
      title: 'Deed Size',
      dataIndex: 'sizeColumn',
      key: 'size',
      sorter: dynamicSort('size'),
      render: (text: any) => (
        <div className='text-left'>
          <span className='leading-3'>{text}</span>
        </div>
      ),
    },
    {
      title: 'Total Borrow',
      dataIndex: 'totalBorrowColumn',
      key: 'totalBorrow',
      sorter: dynamicSort('totalBorrow'),
      render: (text: any) => (
        <div className='text-left'>
          <span className='leading-3'>{text}</span>
        </div>
      ),
    },
    {
      title: 'Supply Balance',
      dataIndex: 'supplyBalanceColumn',
      key: 'supplyBalance',
      sorter: dynamicSort('supplyBalance'),
      render: (text: any) => (
        <div className='text-left'>
          <span className='leading-3'>{text}</span>
        </div>
      ),
    },
    {
      title: 'Total Interest',
      dataIndex: 'totalInterest',
      key: 'totalInterest',
      sorter: dynamicSort('pendingDToken'),
      render: (text: any) => (
        <div className='text-left'>
          <span className='leading-3'>{text}</span>
        </div>
      ),
    },
  ];
  const dataColumnNormal = _.remove(dataColumnManagers, function (n) {
    return n.dataIndex !== 'deedManager';
  });
  return (
    <div>
      <div className='flex mb-3 justify-between'>
        <h1 className='text-left text-white text-base'>Open Deed</h1>
      </div>
      <Table
        className={`coindeed__antd--table `}
        tableLayout='fixed'
        columns={managers ? dataColumnManagers : dataColumnNormal}
        dataSource={convertDataDeed}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => history.push(`/deed/${record.deedId}`),
          };
        }}
        pagination={false}
        locale={{ emptyText: isLoading ? 'Loading' : 'Data not available.' }}
        loading={isLoading}
        rowKey='deedId'
      />
    </div>
  );
};
