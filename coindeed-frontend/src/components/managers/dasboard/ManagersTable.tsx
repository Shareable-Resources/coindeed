import { Dispatch, SetStateAction, useState } from 'react';
import { DeedManager } from './ManagersDashboard';
import { roundNumber, shrinkAddressX, USDFormatter } from '../../../utils/Formatters';
import { useHistory } from 'react-router';
import { dynamicSort } from '../../../blockchain/utils';
import Table from '../../global/antd/Table';
import { ColumnsType } from 'antd/lib/table';

type ManagersTableProps = {
  deedManagers: DeedManager[];
  sortBy: { column: string | null; isDesc: boolean };
  setSortBy: Dispatch<SetStateAction<{ column: string | null; isDesc: boolean }>>;
};

type ManagersTableRowProps = {
  deedManager: DeedManager;
  number: number;
};

export const ManagersTableRow = ({ deedManager, number }: ManagersTableRowProps) => {
  const history = useHistory();
  return (
    <tr
      className='text-gray-300 cursor-pointer border-b border-white-extraLight last:border-blue-panelTrans'
      onClick={() => history.push(`/managers/${deedManager.managerAddress}`)}
    >
      <td className='text-left py-4'>
        <span className='mr-4'>{number}</span>{' '}
        <span className='underline'>{shrinkAddressX(deedManager.managerAddress, 5, 3)}</span>
      </td>
      <td className='text-left'>{USDFormatter.format(deedManager.totalStaking)}</td>
      <td className='text-left'>{deedManager.APY * 100}%</td>
      <td className='text-left'>{deedManager.openDeeds}</td>
    </tr>
  );
};

export const ManagersTable = ({ deedManagers, sortBy, setSortBy }: ManagersTableProps) => {
  const history = useHistory();
  // eslint-disable-next-line
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sortedDeedMAnagers = deedManagers.sort((a, b) => b.totalStaking - a.totalStaking);
  const mappedDeedManagers = sortedDeedMAnagers.map((manager, index) => {
    return { ...manager, i: index + 1 };
  });
  const columns: ColumnsType<any> = [
    {
      title: 'Rank',
      dataIndex: 'i',
      key: 'i',
      width: '5%',
      sorter: dynamicSort('i'),
      render: (text: any) => <div>{text}</div>,
    },
    {
      title: 'Deed Manager',
      dataIndex: 'managerAddress',
      key: 'managerAddress',
      width: '20%',
      sorter: dynamicSort('managerAddress'),
      render: (value: any) => (
        <div className='flex items-center'>
          <span className='leading-3'>{shrinkAddressX(value, 5, 3)}</span>
        </div>
      ),
    },
    {
      title: 'Total Staking',
      dataIndex: 'totalStaking',
      key: 'totalStaking',
      width: '20%',
      sorter: dynamicSort('totalStaking'),
      render: (text: any) => (
        <div className='flex items-center'>
          <span className='leading-3'>{USDFormatter.format(text)}</span>
        </div>
      ),
    },
    {
      title: 'APY%',
      dataIndex: 'APY',
      key: 'APY',
      width: '20%',

      sorter: dynamicSort('APY'),
      render: (text: any) => <div>{roundNumber(text, 2)}%</div>,
    },
    {
      title: 'Total Open Deeds',
      dataIndex: 'openDeeds',
      key: 'openDeeds',
      width: '20%',
      sorter: dynamicSort('openDeeds'),
      render: (text: any) => <div>{text}</div>,
    },
  ];

  return (
    <>
      <Table
        className={`coindeed__antd--table`}
        columns={columns}
        dataSource={mappedDeedManagers}
        pagination={false}
        locale={{ emptyText: isLoading ? 'Loading' : 'Data not available.' }}
        loading={isLoading}
        rowKey='deedId'
        onRow={(record, rowIndex) => {
          return {
            onClick: () => history.push(`/managers/${record.managerAddress}`),
          };
        }}
      />
      {/* <div className={` bg-panel bg-opacity-40 px-6 pt-4 rounded-lg `}>
        <table className='min-w-full w-full table-fixed text-white text-sm border-collapse'>
          <thead className='border-black'>
            <tr className='border-black'>
              {headers.map((column, index) => (
                <th key={index} className='text-left font-normal text-sm border-black pb-2'>
                  <button className='flex space-x-2 align-baseline' onClick={() => onChangeSort(column)}>
                    {index === 0 ? (
                      <span>
                        <span className='mr-4'>#</span>
                        {column}
                      </span>
                    ) : (
                      <span>{column}</span>
                    )}
                    <div className='w-2'>
                      <svg
                        className={`mt-2 transform rotate-${sortBy.isDesc ? '180' : '0'} opacity-${
                          sortBy.column === column ? '100' : '0'
                        } transition duration-500`}
                        height='8'
                        width='8'
                        viewBox='0 0 8 8'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path d='M4 6.5L0 0.5H8L4 6.5Z' fill='currentColor' />
                      </svg>
                    </div>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deedManagers.map((deedManager, index) => (
              <ManagersTableRow deedManager={deedManager} number={index + 1} key={index} />
            ))}
          </tbody>
        </table>
      </div> */}
    </>
  );
};
