import { ProgressBar } from '../../global/ProgressBar';
import { abbreviateNumber, NumberToFixedFormater, roundNumber } from '../../../utils/Formatters';
import {
  RECRUITING_STATUS,
  ESCROW_STATUS,
  OPEN_STATUS,
  COMPLETED_STATUS,
  CANCELLED_STATUS,
} from '../../../utils/Constants';
import { TimeLeftMoment } from '../../global/TimeLeftMoment';
import { useEffect, useState } from 'react';
import { Deed } from './DeedTable';
import moment from 'moment';
import { getTotalJoinedDownPayment, getDeedParameters, getSwapToken } from '../../../blockchain/services/DeedService';
import { convertBigNumberValueToNumber, getTokenDecimalsV2 } from '../../../blockchain/utils';
import { queryGraph } from '../../../services/graphql';
import { useParams } from 'react-router';
import { Tooltip } from 'antd';
import infoIcon from '../../../images/icons/infoIcon.svg';

type DeedProgressProps = {
  percentComplete: number;
  stakingRequired?: number;
  amountRequiredStaking: number;
  timeLeft: string;
  status: number;
  cancelledInStatus: number | null;
  amountCurrentlyStaking: number;
  isDeed?: boolean;
  deed?: any;
  statusType: string;
  amountRequiredDownPayment: number;
  exitDeedLock: any;
};

type DeedViewParam = {
  deedId: string;
};

export default function DeedProgress({
  amountRequiredStaking,
  stakingRequired,
  amountRequiredDownPayment,
  status,
  cancelledInStatus,
  amountCurrentlyStaking,
  isDeed = false,
  deed,
  exitDeedLock,
}: DeedProgressProps) {
  const params = useParams<DeedViewParam>();
  const [visibleDate, setVisibleDate] = useState(true);
  // const [staking, setStaking] = useState<number>(0);
  const [totalDownPaymentJoined, setTotalDownPaymentJoined] = useState<string>('0');
  const [totalDownPaymentSubgraph, setTotalDownPaymentSubgraph] = useState<any>(0);
  const [amountExited, setAmountExited] = useState<any>(0);
  // eslint-disable-next-line
  const [minBuy, setMinBuy] = useState<string>('');

  const statusHeaderFormatter = (status: number) => {
    switch (status) {
      case RECRUITING_STATUS:
        return 'Recruiting';
      case ESCROW_STATUS:
        return 'Escrow';
      case OPEN_STATUS:
        return 'Open';
      case COMPLETED_STATUS:
        return 'Completed';
      case CANCELLED_STATUS:
        return 'Canceled';
      default:
        return 'Invalid';
    }
  };

  const progressFormatterLine1 = (status: number) => {
    switch (status) {
      case RECRUITING_STATUS:
        return 'Current Staking';
      case ESCROW_STATUS:
        return 'Currently Joined';
      case OPEN_STATUS:
      case COMPLETED_STATUS:
        return 'Amount Exited';
      case CANCELLED_STATUS:
        if (cancelledInStatus === 0) {
          return 'Current Staking';
        } else {
          return 'Currently Joined';
        }
      default:
        return 'Invalid';
    }
  };

  const progressDataLine1 = (status: number, tokenName?: string) => {
    switch (status) {
      case RECRUITING_STATUS:
        return amountCurrentlyStaking > 0
          ? abbreviateNumber(parseFloat(NumberToFixedFormater(amountCurrentlyStaking, 2))) + ' Dtokens'
          : '0 Dtokens';
      case ESCROW_STATUS:
        return abbreviateNumber(parseFloat(parseFloat(totalDownPaymentJoined).toFixed(2))) + ' ' + tokenName;
      case OPEN_STATUS:
        return abbreviateNumber(parseFloat(amountExited.toFixed(2))) + ' ' + tokenName;
      case COMPLETED_STATUS:
        return abbreviateNumber(parseFloat(amountExited.toFixed(2))) + ' ' + tokenName;
      default:
        return '--';
    }
  };

  const progressFormatterLine2 = (status: number) => {
    switch (status) {
      case RECRUITING_STATUS:
        return 'Required Staking';
      case ESCROW_STATUS:
        return 'Required Down Payment';
      case OPEN_STATUS:
      case COMPLETED_STATUS:
        return 'Total Amount Joined';
      case CANCELLED_STATUS:
        if (cancelledInStatus === 0) {
          return 'Required Staking';
        } else {
          return 'Required  Down Payment';
        }
      default:
        return 'Amount Exited';
    }
  };

  const TimeLeftFormatter = (status: number) => {
    switch (status) {
      case RECRUITING_STATUS:
        return 'Time Left For Recruiting';
      case ESCROW_STATUS:
        return 'Time Left in Escrow';
      case OPEN_STATUS:
      case COMPLETED_STATUS:
        return 'Time Left';
      case CANCELLED_STATUS:
        if (cancelledInStatus === 0) {
          return 'Time Left in Recruiting';
        }
        if (cancelledInStatus === 1) {
          return 'Time Left in Escrow';
        }
        return 'Time Left';
      default:
        return 'Time Left';
    }
  };

  const TimeLeftTimeFormatter = (
    status: number,
    deed: Deed,
    countdown: boolean = false,
    dateOnlyFormat: boolean = false,
  ) => {
    const dateFormat = (date: any) => {
      if (moment().diff(moment.unix(date)) > 0 || deed?.status > status) {
        return 'Completed';
      } else if (dateOnlyFormat) {
        return moment.unix(parseInt(date)).format('YYYY/MM/DD');
      } else {
        return moment.unix(parseInt(date)).format('YYYY/MM/DD HH:mm:ss');
      }
    };
    switch (status) {
      case RECRUITING_STATUS:
        return countdown ? (
          <TimeLeftMoment targetDate={deed.recruitingEndDate} lightWhite={true} />
        ) : (
          dateFormat(deed.recruitingEndDate)
        );
      case ESCROW_STATUS:
        return countdown ? (
          <TimeLeftMoment targetDate={deed.escrowEndDate} lightWhite={true} />
        ) : (
          dateFormat(deed.escrowEndDate)
        );

      case COMPLETED_STATUS:
        return countdown ? 'Ended' : 'Completed';

      case CANCELLED_STATUS:
        return countdown ? 'Ended' : 'Completed';

      default:
        return countdown ? (
          <TimeLeftMoment targetDate={deed.deedEndDate} lightWhite={true} />
        ) : (
          dateFormat(deed.deedEndDate)
        );
    }
  };

  const statusColor = (status: number) => {
    let tailwind = 'mb-4 ';
    switch (status) {
      case RECRUITING_STATUS:
        tailwind += 'text-moneyBlue';
        break;
      case ESCROW_STATUS:
        tailwind += 'text-escrowYellow';
        break;
      case OPEN_STATUS:
        tailwind += 'text-moneyGreen';
        break;
      case COMPLETED_STATUS:
        tailwind += 'text-transparent bg-clip-text bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue';
        break;
      case CANCELLED_STATUS:
        tailwind += 'text-red-400';
        break;
      default:
        tailwind += 'text-transparent bg-clip-text bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue';
        break;
    }

    return tailwind;
  };

  useEffect(() => {
    setVisibleDate(false);
  }, [deed]);

  useEffect(() => {
    if (!visibleDate) setVisibleDate(true);
  }, [visibleDate]);

  useEffect(() => {
    const totalSupply = async () => {
      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);
      const [result] = await getTotalJoinedDownPayment(deed?.deedAddress);
      if (result) setTotalDownPaymentJoined(convertBigNumberValueToNumber(result, decimalA));
    };
    // const totalStake = async () => {
    //   const [result] = await getTotalStake(deed?.deedAddress);

    //   if (result) setStaking(convertBigNumberValueToNumber(result, TOKEN_TYPES.DTOKEN.decimal));
    // };
    const getDeedParam = async () => {
      const [deedParams]: any = await getDeedParameters(deed?.deedAddress);
      if (deedParams) setMinBuy(deedParams['minimumBuy'].toString());
    };
    totalSupply();
    // totalStake();
    getDeedParam();
  });

  const deedQuery = `
  query($deedId: String) {
    newDeeds(
        where: {deedId: $deedId}
      ) {
        totalDownpaymentSupply
    }
    exitDeeds (where: {owner: "${deed?.deedAddress}"}) {
      amount
    }
  }
`;
  useEffect(() => {
    const process = async () => {
      const variables = {
        deedId: params.deedId,
      };
      const [res]: any = await queryGraph(deedQuery, variables);
      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);
      if ((res as any)?.data?.newDeeds[0]?.totalDownpaymentSupply) {
        const totalDownPaymentSupply = convertBigNumberValueToNumber(
          (res as any)?.data?.newDeeds[0]?.totalDownpaymentSupply,
          decimalA,
        );
        setTotalDownPaymentSubgraph(totalDownPaymentSupply);
      }
      const totalItemExited = (res as any)?.data?.exitDeeds;
      let arr = [] as any[];
      if (totalItemExited.length > 0) {
        totalItemExited.map((e: any) => {
          return arr.push(e.amount);
        });
      }
      const sumExited = arr.reduce((a: any, b: any) => a + b, 0);
      if (sumExited > 0) {
        const [response]: any = await getSwapToken(sumExited, [deed.coinB as string, deed.coinA as string]);
        if (response) {
          setAmountExited(convertBigNumberValueToNumber(response[1], decimalA));
        }
      }
    };
    if (status !== CANCELLED_STATUS) process();
    // eslint-disable-next-line
  }, [deed]);

  return (
    <div className='text-left text-white mt-0 ml-0 mr-0 mb-25 bg-panel bg-opacity-50 p-25 text-sm rounded-lg'>
      <div className='flex'>
        <h2 className='mb-4 text-white text-xs font-semibold'>Progress</h2>
        <h2 className={`${statusColor(status)} font-semibold text-xs ml-auto`}>{statusHeaderFormatter(status)}</h2>
      </div>

      {status === RECRUITING_STATUS && (
        <ProgressBar large={true} progress={(amountCurrentlyStaking * 100) / amountRequiredStaking} />
      )}

      {status === ESCROW_STATUS && (
        <ProgressBar
          large={true}
          progress={(parseFloat(totalDownPaymentJoined) * Number(deed?.loanLeverage) * 100) / deed?.size}
        />
      )}

      {status === OPEN_STATUS && <ProgressBar large={true} progress={100} />}

      {status === COMPLETED_STATUS && <ProgressBar large={true} progress={100} />}

      {status === CANCELLED_STATUS && (
        <ProgressBar
          large={true}
          progress={
            cancelledInStatus
              ? (parseFloat(totalDownPaymentJoined) * Number(deed?.loanLeverage) * 100) / deed?.size
              : (amountCurrentlyStaking * 100) / amountRequiredStaking
          }
        />
      )}

      <div className='flex text-xxs lh-1 mb-4'>
        <div className='flex w-full'>
          {status === RECRUITING_STATUS && (
            <div className='w-full'>
              <div className='flex text-xxs mt-2 lh-1 ' style={{ marginBottom: '5px' }}>
                <div>
                  <h3 className='truncate text-white font-semibold mb-0'>{progressFormatterLine1(status)}</h3>
                  <div className='mt-1 font-light whitespace-nowrap opacity-70'>
                    {progressDataLine1(status, deed?.coinAName)}
                  </div>
                </div>
                <div className='ml-auto whitespace-nowrap'>
                  {(amountCurrentlyStaking * 100) / amountRequiredStaking < 100
                    ? roundNumber((amountCurrentlyStaking * 100) / amountRequiredStaking, 2)
                    : '100'}
                  % Complete
                </div>
              </div>
              <div className='mt-3'>
                <h3 className='text-white font-semibold'>{progressFormatterLine2(status)}</h3>
                <div className='opacity-70 font-light'>
                  {amountRequiredStaking
                    ? NumberToFixedFormater(abbreviateNumber(amountRequiredStaking), 2) + ' DTokens'
                    : '--'}
                </div>
              </div>
            </div>
          )}

          {status === ESCROW_STATUS && (
            <div className='w-full'>
              <div className='flex mt-2'>
                <div>
                  <h3 className='truncate text-white font-semibold mb-0'>{progressFormatterLine1(status)}</h3>
                  <div className='ml-auto mr-2 font-light whitespace-nowrap mt-1 opacity-70'>
                    {progressDataLine1(status, deed?.coinAName)}
                  </div>
                </div>
                <div className='ml-auto whitespace-nowrap mt-2'>
                  {(parseFloat(totalDownPaymentJoined) * Number(deed?.loanLeverage) * 100) / deed?.size < 100
                    ? roundNumber(
                        (parseFloat(totalDownPaymentJoined) * Number(deed?.loanLeverage) * 100) / deed?.size,
                        2,
                      )
                    : '100'}
                  % Complete
                </div>
              </div>

              <div className='flex mt-2'>
                <div>
                  <h3 className='text-white font-semibold'>{progressFormatterLine2(status)}</h3>
                  <div className='font-light opacity-70'>
                    {roundNumber(abbreviateNumber(deed?.size / Number(deed?.loanLeverage)), 2) + ' ' + deed?.coinAName}
                  </div>
                </div>
                <div className='ml-auto'>
                  <h3 className='text-white ml-8 font-semibold'>Min Participation</h3>
                  <div className='ml-auto font-light w-max opacity-70'>
                    {deed?.minimumBrokerStakingAmount ? `${Number(minBuy) / 100}%` : '--'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === OPEN_STATUS && (
            <div className='w-full'>
              <div className='flex text-xxs mt-2 lh-1 ' style={{ marginBottom: '5px' }}>
                <div>
                  <h3 className='truncate text-white font-semibold mb-0'>{progressFormatterLine1(status)}</h3>
                  <div className='mt-1 font-light whitespace-nowrap opacity-70'>
                    {`${NumberToFixedFormater(amountExited, 2)} ${deed?.coinAName}`}
                  </div>
                </div>
                <div className='ml-auto whitespace-nowrap'>100% Complete</div>
              </div>
              <div className='mt-3'>
                <h3 className='text-white font-semibold'>{progressFormatterLine2(status)}</h3>
                <div className='opacity-70 font-light'>
                  {NumberToFixedFormater(totalDownPaymentSubgraph, 2) + ' ' + deed.coinAName || '--'}
                </div>
              </div>
            </div>
          )}

          {status === COMPLETED_STATUS && (
            <div className='w-full'>
              <div className='flex text-xxs mt-2 lh-1 ' style={{ marginBottom: '5px' }}>
                <div>
                  <h3 className='truncate text-white font-semibold mb-0'>{progressFormatterLine1(status)}</h3>
                  <div className='mt-1 font-light whitespace-nowrap opacity-70'>
                    {progressDataLine1(status, deed?.coinAName)}
                  </div>
                </div>
                <div className='ml-auto whitespace-nowrap'>100% Complete</div>
              </div>
              <div className='mt-3'>
                <h3 className='text-white font-semibold'>{progressFormatterLine2(status)}</h3>
                <div className='opacity-70 font-light'>
                  {NumberToFixedFormater(totalDownPaymentSubgraph, 2) + ' ' + deed.coinAName || '--'}
                </div>
              </div>
            </div>
          )}

          {status === CANCELLED_STATUS && (
            <>
              {cancelledInStatus ? (
                <div className='w-full'>
                  <div className='flex text-xxs mt-2 lh-1 ' style={{ marginBottom: '5px' }}>
                    <div>
                      <h3 className='truncate text-white font-semibold mb-0'>
                        {progressFormatterLine1(ESCROW_STATUS)}
                      </h3>
                      <div className='mt-1 font-light whitespace-nowrap opacity-70'>
                        {progressDataLine1(ESCROW_STATUS, deed?.coinAName)}
                      </div>
                    </div>
                    <div className='ml-auto whitespace-nowrap'>
                      {(parseFloat(totalDownPaymentJoined) * Number(deed?.loanLeverage) * 100) / deed?.size < 100
                        ? roundNumber(
                            (parseFloat(totalDownPaymentJoined) * Number(deed?.loanLeverage) * 100) / deed?.size,
                            2,
                          )
                        : '100'}
                      % Complete
                    </div>
                  </div>
                  <div className='flex mt-2'>
                    <div>
                      <h3 className='text-white font-semibold'>{progressFormatterLine2(ESCROW_STATUS)}</h3>
                      <div className='font-light opacity-70'>
                        {roundNumber(deed?.size / Number(deed?.loanLeverage)) + ' ' + deed?.coinAName}
                      </div>
                    </div>
                    <div className='ml-auto'>
                      <h3 className='text-white ml-8 font-semibold'>Min Participation</h3>
                      <div className='ml-auto font-light w-max opacity-70'>
                        {deed?.minimumBrokerStakingAmount ? `${Number(minBuy) / 100}%` : '--'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='w-full'>
                  <div className='flex text-xxs mt-2 lh-1 ' style={{ marginBottom: '5px' }}>
                    <div>
                      <h3 className='truncate text-white font-semibold mb-0'>
                        {progressFormatterLine1(RECRUITING_STATUS)}
                      </h3>
                      <div className='mt-1 font-light whitespace-nowrap opacity-70'>
                        {progressDataLine1(RECRUITING_STATUS, deed?.coinAName)}
                      </div>
                    </div>
                    <div className='ml-auto whitespace-nowrap'>
                      {(amountCurrentlyStaking * 100) / amountRequiredStaking < 100
                        ? roundNumber((amountCurrentlyStaking * 100) / amountRequiredStaking, 2)
                        : '100'}
                      % Complete
                    </div>
                  </div>
                  <div className='mt-3'>
                    <h3 className='text-white font-semibold'>{progressFormatterLine2(RECRUITING_STATUS)}</h3>
                    <div className='opacity-70 font-light'>
                      {amountRequiredStaking ? NumberToFixedFormater(amountRequiredStaking, 2) + ' DTokens' : '--'}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className='flex text-xxs mt-4 lh-1'>
        <h3 className='text-white font-semibold mb-5px'>{TimeLeftFormatter(status)}</h3>
        <div className='ml-auto text-white-light font-light'>
          {visibleDate && TimeLeftTimeFormatter(status, deed, true, false)}
        </div>
      </div>

      {isDeed && (
        <>
          <div className='flex text-xxs m-0 lh-1'>
            <h3 className='text-white font-semibold mb-5px'>Recruiting End Date</h3>
            <div
              className='ml-auto text-white-light font-light'
              title={TimeLeftTimeFormatter(RECRUITING_STATUS, deed, false, false) as string}
            >
              <Tooltip
                placement='bottom'
                className='cursor-pointer'
                title={moment.unix(parseInt(deed.recruitingEndDate)).format('YYYY/MM/DD HH:mm:ss')}
              >
                {TimeLeftTimeFormatter(RECRUITING_STATUS, deed, false, true)}
              </Tooltip>
            </div>
          </div>
          <div className='flex text-xxs m-0 lh-1'>
            <h3 className='text-white font-semibold mb-5px'>Escrow End Date</h3>
            <div
              className='ml-auto text-white-light font-light'
              title={TimeLeftTimeFormatter(ESCROW_STATUS, deed, false, false) as string}
            >
              <Tooltip
                placement='bottom'
                className='cursor-pointer'
                title={moment.unix(parseInt(deed.escrowEndDate)).format('YYYY/MM/DD HH:mm:ss')}
              >
                {deed.status === 2 ? 'End' : TimeLeftTimeFormatter(ESCROW_STATUS, deed, false, true)}
              </Tooltip>
            </div>
          </div>
          <div className='flex text-xxs m-0 lh-1'>
            <h3 className='text-white font-semibold mb-5px'>Deed Completion Date</h3>
            <div
              className='ml-auto text-white-light font-light'
              title={TimeLeftTimeFormatter(OPEN_STATUS, deed, false, false) as string}
            >
              <Tooltip
                placement='bottom'
                className='cursor-pointer'
                title={moment.unix(parseInt(deed.deedEndDate)).format('YYYY/MM/DD HH:mm:ss')}
              >
                {TimeLeftTimeFormatter(OPEN_STATUS, deed, false, true)}
              </Tooltip>
            </div>
          </div>
          {status === OPEN_STATUS && (
            <div className='flex text-xxs m-0 mt-4 lh-1'>
              <h3 className='text-white font-semibold mb-5px flex'>
                Time Locked{' '}
                <Tooltip
                  placement='bottom'
                  className='cursor-pointer'
                  title='The Deed will be locked for a certain amount of time and prevent Buyers from exiting once the deed enters the Open phase to prevent arbitrage.'
                >
                  <img className='ml-2' src={infoIcon} alt='info' />
                </Tooltip>
              </h3>
              <div className='ml-auto text-white-light font-light'>
                {deed.wholesaleAddress === '0' ? '--' : <TimeLeftMoment targetDate={exitDeedLock} lightWhite={true} />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
