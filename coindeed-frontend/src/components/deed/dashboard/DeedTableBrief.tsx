import { ColumnsType } from 'antd/lib/table/interface';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { dynamicSort, getIconOfTokenAddress } from '../../../blockchain/utils';
import Table from '../../global/antd/Table';
import { ProgressBar } from '../../global/ProgressBar';
import { TimeLeftMoment } from '../../global/TimeLeftMoment';
import { Deed, pairTokens } from './DeedTable';
import style from './style.module.scss';
import { RECRUITING_STATUS, ESCROW_STATUS } from '../../../utils/Constants';
interface DeedTableBriefProps {
  title: string;
  deeds: Deed[];
  isLoading: boolean;
}

export const DeedTableBrief = ({ title, deeds, isLoading }: DeedTableBriefProps) => {
  const history = useHistory();
  const convertDataDeed = deeds?.map((e: any) => {
    const coinA = e.coinAName === undefined ? '' : e.coinAName;
    const coinB = e.coinBName === undefined ? '' : e.coinBName;
    const sizeWithNameOfCoin = e.size + ' ' + coinB;
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

    let stakingProgress = e.totalStaked / e.requiredStaking;
    let joinProgress = e.totalJoined / e.requiredDownPayment;

    let progress = 1;
    if (e.status === RECRUITING_STATUS) {
      progress = stakingProgress;
    } else if (e.status === ESCROW_STATUS) {
      progress = joinProgress;
    }
    return {
      ...e,
      pairTokens: [
        { name: coinB, address: e.coinB },
        { name: coinA, address: e.coinA },
      ],
      sizeOfCoin: sizeWithNameOfCoin,
      timeLeft,
      progress,
    };
  });
  const data = _.remove(convertDataDeed, function (e, index) {
    return index < 5;
  });
  const dataColumn: ColumnsType<any> = [
    {
      title: 'Pair',
      dataIndex: 'pairTokens',
      key: 'pairTokens',
      sorter: (a, b) => {
        return a.coinBName.localeCompare(b.coinBName);
      },
      render: (tokens: pairTokens[]) => {
        const icon1 = tokens[0] ? getIconOfTokenAddress(tokens[0].address) : undefined;
        const icon2 = tokens[1] ? getIconOfTokenAddress(tokens[1].address) : undefined;
        return (
          <div className='flex items-center'>
            <img
              src={icon1}
              className='mr-5px'
              width='16px'
              height='16px'
              hidden={!icon1}
              draggable='false'
              loading='lazy'
              alt=''
            />
            <img src={icon2} width='16px' height='16px' hidden={!icon2} draggable='false' loading='lazy' alt='' />
            <span className={icon2 || icon1 ? 'ml-5px' : ''}>
              {tokens[0].name} / {tokens[1].name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Time Left',
      dataIndex: 'timeLeft',
      key: 'timeLeft',
      width: '38%',
      sorter: dynamicSort('timeLeft'),
      render: (text: any) => <TimeLeftMoment targetDate={text} />,
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      align: 'right',
      key: 'progress',
      width: '96px',
      sorter: dynamicSort('progress'),
      render: (text: any) => (
        <div className='flex'>
          <div className='ml-auto'>
            <ProgressBar progress={text * 100} />
          </div>
        </div>
      ),
    },
  ];
  return (
    <div>
      <div className='text-base font-semibold float-left mb-2-5'>{title}</div>
      <Table
        className={`coindeed__antd--table ${style.customTable}`}
        tableLayout='auto'
        columns={dataColumn}
        dataSource={data}
        pagination={false}
        locale={{ emptyText: isLoading ? 'Loading' : 'No data.' }}
        loading={isLoading}
        rowKey='deedId'
        showSorterTooltip={false}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => history.push(`/deed/${record.deedId}`),
          };
        }}
      />
    </div>
  );
};
