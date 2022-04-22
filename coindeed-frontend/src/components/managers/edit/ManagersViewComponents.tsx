import React from 'react';
import { ProgressBar } from '../../global/ProgressBar';
import { DeedManager } from '../dasboard/ManagersDashboard';
import copy10x10 from '../../../images/CopyGradient.svg';
import Table from '../../global/antd/Table';
import { dynamicSort } from '../../../blockchain/utils';
import { TimeLeftMoment } from '../../global/TimeLeftMoment';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import { message } from 'antd';

interface ManagerDeedTableBriefProps {
  title: string;
  manager: DeedManager;
  isLoading: boolean;
  isEscrow: boolean;
}
interface ManagerOverviewProps {
  manager: DeedManager;
}

export const ManagerDeedTableBrief = ({ title, manager, isLoading, isEscrow = false }: ManagerDeedTableBriefProps) => {
  const history = useHistory();

  const convertDataDeeds = manager.deeds?.map((e: any) => {
    const coinA = e.coinAName === undefined ? '' : e.coinAName;
    const coinB = e.coinBName === undefined ? '' : e.coinBName;
    return {
      ...e,
      paidToken: coinA + '/' + coinB,
    };
  });
  const dataDeeds = _.remove(convertDataDeeds, function (e, index) {
    return index < 5;
  });

  const convertDataWholesales = manager.wholesales?.map((e: any) => {
    const coinA = e.coinAName === undefined ? '' : e.coinAName;
    const coinB = e.coinBName === undefined ? '' : e.coinBName;
    return {
      ...e,
      paidToken: coinA + '/' + coinB,
    };
  });
  const dataWholesales = _.remove(convertDataWholesales, function (e, index) {
    return index < 5;
  });

  const dataColumnEscrow = [
    {
      title: 'Pair',
      dataIndex: 'paidToken',
      key: 'paidToken',
      sorter: dynamicSort('paidToken'),
      render: (text: any) => (
        <div className='flex items-center'>
          <span className='leading-3'>{text}</span>
        </div>
      ),
    },
    {
      title: 'Deed Address',
      dataIndex: 'deedAddress',
      key: 'deedAddress',
      sorter: dynamicSort('deedAddress'),
      render: (text: any) => (
        <div className='flex items-center'>
          <span className='leading-3'>{text}</span>
        </div>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      sorter: dynamicSort('progress'),
      render: (text: any) => <ProgressBar progress={text * 100} />,
    },
  ];

  const dataColumnReserved = [
    {
      title: 'Pair',
      dataIndex: 'paidToken',
      key: 'paidToken',
      sorter: dynamicSort('paidToken'),
      render: (text: any) => (
        <div className='flex items-center'>
          <span className='leading-3'>{text}</span>
        </div>
      ),
    },
    {
      title: 'Wholesale ID',
      dataIndex: 'wholesaleId',
      key: 'id',
      sorter: dynamicSort('progress'),
      render: (text: any) => <ProgressBar progress={text * 100} />,
    },
    {
      title: 'Time Left',
      dataIndex: 'deedEndDate',
      key: 'deedEndDate',
      sorter: dynamicSort('deedEndDate'),
      render: (text: any) => <TimeLeftMoment targetDate={text} />,
    },
  ];

  return (
    <div>
      <div className='text-sm font-semibold text-white float-left mb-2-5'>{title}</div>
      <Table
        className={`coindeed__antd--table coindeed__antd--table-brief coindeed__antd--table-brief-managers`}
        tableLayout='fixed'
        columns={isEscrow ? dataColumnEscrow : dataColumnReserved}
        dataSource={isEscrow ? dataDeeds : dataWholesales}
        pagination={false}
        locale={{ emptyText: isLoading ? 'Loading' : 'Data not available.' }}
        loading={isLoading}
        rowKey='deedId'
        onRow={(record, rowIndex) => {
          return {
            onClick: () => history.push(`/deed/${record.deedId}`),
          };
        }}
      />
    </div>
  );
};

export const ManagerOverview = ({ manager }: ManagerOverviewProps) => {
  return (
    <div>
      <h1 className='mb-2-5 text-sm font-semibold text-white mr-15'>Overview</h1>
      <div className='flex flex-col p-6 py-9 bg-blue-panel font-light rounded-md'>
        <div
          className='flex xl:justify-start mb-10 items-center '
          onClick={() => navigator.clipboard.writeText(manager.managerAddress)}
        >
          <h2 className='whitespace-nowrap mr-15 mb-0 my-0text-xs font-semibold text-white'>Deed Manager</h2>
          <div className='truncate mr-15 cursor-pointer text-xs text-white'>{manager.managerAddress}</div>
          <img
            className='cursor-pointer'
            src={copy10x10}
            alt='copy'
            onClick={() => {
              navigator.clipboard.writeText(manager.managerAddress);
              message.success('Copy successful');
            }}
          />
        </div>
        <div className='grid grid-cols-3 gap-4 mb-10'>
          <div className='text-center'>
            <div className='truncate text-xs'>Total Staking Amount</div>
            <div className='text-xs mt-2-5 font-semibold'>-</div>
          </div>
          <div className='text-center'>
            <div className='truncate text-xs'>APY %</div>
            <div className='text-xs mt-2-5 font-semibold'>{manager.APY}</div>
          </div>
          <div className='text-center'>
            <div className='truncate text-xs'>Total Deeds</div>
            <div className='text-xs mt-2-5 font-semibold'>-</div>
          </div>
        </div>
        <div className='grid grid-cols-3 gap-4 mb-0'>
          <div className='text-center'>
            <div className='truncate text-xs'>Deeds in Escrow</div>
            <div className='text-xs mt-2-5 font-semibold'>-</div>
          </div>
          <div className='text-center'>
            <div className='truncate text-xs'>Deeds in Recruiting</div>
            <div className='text-xs mt-2-5 font-semibold'>-</div>
          </div>
          <div className='text-center'>
            <div className='text-xs'>Deeds in Open Phase</div>
            <div className='text-xs mt-2-5 font-semibold'>{manager.openDeeds}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
