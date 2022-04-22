import { abbreviateNumber } from '../../../utils/Formatters';
import Table from '../../global/antd/Table';
import { convertBigNumberValueToNumber, getIconOfTokenAddress } from '../../../blockchain/utils';
import { TimeLeftMoment } from '../../global/TimeLeftMoment';
import style from './style.module.scss';
import { generateWholesaleStatus } from '../../../utils/helper';
import moment from 'moment';
import { WHOLESALE_CANCELLED } from '../../../utils/Constants';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';

export interface Wholesale {
  tokenOffered: string;
  tokenRequested: string;
  id: string;
  minSaleAmount: string;
  saleId: string;
  requestedAmount: string;
  offeredAmount: number;
  reservedTo: string; //deed address
  deadline: string;
  offeredBy: string;
  wholesaleManager: string;
  status: number;
  receivedAmount: string;
  isPrivate: boolean;
}

type WholesaleTableProps = {
  wholesales: Wholesale[];
  isLoading: boolean;
  handleTableChange: any;
  listToken: any;
  currentTab: any;
};

export const WholesaleTable = ({
  wholesales,
  isLoading,
  handleTableChange,
  listToken,
  currentTab,
}: WholesaleTableProps) => {
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const [dataTable, setDataTable] = useState<any[]>([]);
  useEffect(() => {
    const converDataWholesale = wholesales?.map((e: any) => {
      const tokenOffDetail = _.find(
        listToken,
        (token: any) => token.address.toUpperCase() === e.tokenOffered.toUpperCase(),
      );
      const tokenReqDetail = _.find(
        listToken,
        (token: any) => token.address.toUpperCase() === e.tokenRequested.toUpperCase(),
      );
      const token = {
        tokenOffered: e.tokenOffered,
        tokenRequested: e.tokenRequested,
        symbolOffer: tokenOffDetail?.name,
        symbolRequest: tokenReqDetail?.name,
      };
      const sizeToken = {
        size: convertBigNumberValueToNumber(e.offeredAmount, tokenOffDetail?.decimals),
        token: tokenOffDetail?.name,
      };
      return {
        ...e,
        token: token,
        sizeToken: sizeToken,
        state: {
          deadline: e.deadline,
          status: e.status,
        },
        deadline: {
          deadline: e.deadline,
          status: e.status,
        },
      };
    });
    setDataTable(converDataWholesale);
    //eslint-disable-next-line
  }, [wholesales]);
  const messageEmpty =
    currentTab && currentTab === 'My Wholesales' && !userAddress
      ? 'Data not available. Please connect your wallet.'
      : 'No data.';
  return (
    <Table
      className={`coindeed__antd--table ${style.customTable}`}
      tableLayout='fixed'
      onChange={handleTableChange}
      columns={[
        {
          title: 'Token',
          dataIndex: 'token',
          key: 'token',
          render: text => {
            const iconOffered = getIconOfTokenAddress(text.tokenOffered);
            const iconRequested = getIconOfTokenAddress(text.tokenRequested);
            return (
              <div className='flex items-center'>
                <div className={`w-4 h-4 mr-2 ${iconOffered ? 'bg-transparent' : 'bg-gray-300'}`}>
                  <img
                    src={iconOffered}
                    hidden={!iconOffered}
                    className={`w-full h-full`}
                    draggable='false'
                    loading='lazy'
                    alt=''
                  />
                </div>
                <div className={`w-4 h-4 mr-2 ${iconRequested ? 'bg-transparent' : 'bg-gray-300'}`}>
                  <img
                    src={iconRequested}
                    hidden={!iconRequested}
                    className={`w-full h-full`}
                    draggable='false'
                    loading='lazy'
                    alt=''
                  />
                </div>
                <span className='leading-3'>
                  {text.symbolOffer} / {text.symbolRequest}
                </span>
              </div>
            );
          },
        },
        {
          title: 'Status',
          dataIndex: 'state',
          key: 'state',
          sorter: true,
          render: text => {
            const endDate = moment.unix(Number(text.deadline));
            const diffTime = moment().diff(endDate) * -1;
            return (
              <div className='flex items-center'>
                <span className='leading-3'>{generateWholesaleStatus(text.status, diffTime)}</span>
              </div>
            );
          },
        },
        {
          title: 'Type',
          dataIndex: 'isPrivate',
          key: 'isPrivate',
          sorter: true,
          render: text => (
            <div className='flex items-center'>
              <span className='leading-3'>{text ? 'Private' : 'Public'}</span>
            </div>
          ),
        },
        { title: 'Wholesale ID', dataIndex: 'saleId', key: 'saleId', sorter: true },
        {
          title: 'Size',
          dataIndex: 'sizeToken',
          key: 'sizeToken',
          sorter: true,
          render: text => {
            return <>{`${abbreviateNumber(text.size)} ${text.token}`}</>;
          },
        },
        {
          title: 'Time Left',
          dataIndex: 'deadline',
          key: 'deadline',
          sorter: true,
          render: text => {
            return text.status !== WHOLESALE_CANCELLED ? <TimeLeftMoment targetDate={text.deadline} /> : 'Ended';
          },
        },
      ]}
      dataSource={currentTab && currentTab === 'My Wholesales' && !userAddress ? [] : dataTable}
      onRow={(record, rowIndex) => {
        return {
          onClick: () => (window.location.href = `/wholesale/${record.saleId}`),
        };
      }}
      pagination={false}
      locale={{ emptyText: isLoading ? 'Loading' : messageEmpty }}
      loading={isLoading}
      rowKey='id'
      showSorterTooltip={false}
    />
  );
};
