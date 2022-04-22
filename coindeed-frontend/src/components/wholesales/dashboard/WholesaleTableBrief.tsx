import { abbreviateNumber } from '../../../utils/Formatters';
import Table from '../../global/antd/Table';
import { Wholesale } from './WholesaleTable';
import { TimeLeftMoment } from '../../global/TimeLeftMoment';
import style from './style.module.scss';
import { convertBigNumberValueToNumber, dynamicSort, getIconOfTokenAddress } from '../../../blockchain/utils';
import { WHOLESALE_CANCELLED } from '../../../utils/Constants';
import { useEffect, useState } from 'react';
import _ from 'lodash';

type WholesaleTableBriefProps = {
  title?: string;
  timeRestrictions?: boolean;
  wholesales: Wholesale[];
  isLoading: boolean;
  listToken: any;
};

export const WholesaleTableBrief = ({
  title,
  timeRestrictions = false,
  wholesales,
  isLoading,
  listToken,
}: WholesaleTableBriefProps) => {
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
        deadline: {
          deadline: e.deadline,
          status: e.status,
        },
      };
    });
    setDataTable(converDataWholesale);
    // eslint-disable-next-line
  }, [wholesales, listToken]);

  return (
    <div>
      {title && <div className='text-base font-semibold mb-2-5'>{title}</div>}
      <Table
        className={`coindeed__antd--table coindeed__antd--table-brief-ws ${style.customTable}`}
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
            title: 'Size',
            dataIndex: 'sizeToken',
            key: 'sizeToken',
            sorter: (a, b) => {
              return a.sizeToken.size - b.sizeToken.size;
            },
            render: text => {
              return <>{`${abbreviateNumber(text.size)} ${text.token}`}</>;
            },
          },
          {
            title: 'Time Left',
            dataIndex: 'deadline',
            key: 'deadline',
            sorter: dynamicSort('deadline'),
            render: text => {
              return text.status !== WHOLESALE_CANCELLED ? <TimeLeftMoment targetDate={text.deadline} /> : 'Ended';
            },
          },
        ]}
        dataSource={dataTable}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => (window.location.href = `/wholesale/${record.saleId}`),
          };
        }}
        pagination={false}
        locale={{ emptyText: isLoading ? 'Loading' : 'No data.' }}
        loading={isLoading}
        rowKey='id'
        showSorterTooltip={false}
      />
    </div>
  );
};
