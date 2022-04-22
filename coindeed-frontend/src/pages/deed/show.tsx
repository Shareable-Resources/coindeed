import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Deed } from '../../components/deed/dashboard/DeedTable';
import { queryGraph } from '../../services/graphql';
import { multicall } from '../../blockchain/multicall';

import ViewDeed from '../../components/deed/detail/ViewDeed';
import { convertBigNumberValueToNumber, getTokenInfoByAddress } from '../../blockchain/utils';
import DeedABI from '../../blockchain/abi/Deed.json';
import { TOKEN_TYPES } from '../../utils/Constants';
import { NumberToFixedFormater } from '../../utils/Formatters';
import Error from '../error';

type DeedViewParam = {
  deedId: string;
};

export default function DeedShow() {
  const [deed, setDeed] = useState<Deed>();
  const [deedValid, setDeedValid] = useState(true);
  const params = useParams<DeedViewParam>();

  const deedsWithIdQuery = `
    query($deedId: String!) {
      newDeeds( where: {deedId: $deedId}){
        id
        deedId
        deedAddress
        manager
        createdAtTimeStamp
        isCanceledInEscrow
      }
    }
  `;

  const buyerAndExiterDeedsQuery = `
      query($deedAddress: String!) {
        buyerDeeds: userDeeds(where: {deedAddress: $deedAddress}){
          userAddress
        }
        exiterDeeds: exitDeeds(where: {owner: $deedAddress}) {
          userAddress: buyer
        }
      }
    `;

  const queryDeeds = async () => {
    const variables1 = {
      deedId: params.deedId,
    };
    const [deedsWithId]: any = await queryGraph(deedsWithIdQuery, variables1);
    let partialDeed = deedsWithId?.data?.newDeeds[0];
    if (partialDeed) {
      const variables2 = {
        deedAddress: partialDeed.deedAddress,
      };
      const [buyerAndExiterDeeds]: any = await queryGraph(buyerAndExiterDeedsQuery, variables2);
      partialDeed = {
        ...partialDeed,
        buyerDeeds: buyerAndExiterDeeds?.data?.buyerDeeds,
        exiterDeeds: buyerAndExiterDeeds?.data?.exiterDeeds,
      };
      getDeedInfoFromSmartContract(partialDeed);
    } else {
      setDeedValid(false);
    }
  };

  useEffect(() => {
    queryDeeds();
    // eslint-disable-next-line
  }, []);

  const getDeedInfoFromSmartContract = async (partialDeed: any) => {
    const listOfCalls = [
      [
        // pair of tokens
        {
          address: partialDeed?.deedAddress,
          name: 'pair',
        },
        // deed parameters
        {
          address: partialDeed?.deedAddress,
          name: 'deedParameters',
        },
        // deed manager address
        {
          address: partialDeed?.deedAddress,
          name: 'manager',
        },
        // executionTime
        {
          address: partialDeed?.deedAddress,
          name: 'executionTime',
        },
        // riskMitigation
        {
          address: partialDeed?.deedAddress,
          name: 'riskMitigation',
        },
        {
          address: partialDeed?.deedAddress,
          name: 'wholesaleId',
        },
        {
          address: partialDeed?.deedAddress,
          name: 'state',
        },
        {
          address: partialDeed?.deedAddress,
          name: 'totalStake',
        },
        // broker config
        {
          address: partialDeed?.deedAddress,
          name: 'brokerConfig',
        },
      ],
    ];

    let result = await Promise.all(listOfCalls.map(call => multicall(DeedABI, call)));
    const resultWithDeedAddress = result.map(e => [
      ...e,
      partialDeed?.deedAddress,
      partialDeed?.deedId,
      partialDeed?.createdAtTimeStamp,
      partialDeed?.buyerDeeds,
      partialDeed?.exiterDeeds,
      partialDeed?.isCanceledInEscrow,
    ]);

    const data = mappingDeedInfoToTable(resultWithDeedAddress[0]);
    setDeed(data as Deed);
  };

  const mappingDeedInfoToTable = (deedInfo: any) => {
    const tokenA = getTokenInfoByAddress(deedInfo[0][0]);
    const tokenB = getTokenInfoByAddress(deedInfo[0][1]);
    const { deedSize, leverage, managementFee, minimumBuy } = deedInfo[1];
    const { buyTimestamp, sellTimestamp, recruitingEndTimestamp } = deedInfo[3];
    const { trigger, secondTrigger, leverage: leverageRisMitigation } = deedInfo[4];
    return {
      deedId: deedInfo[8],
      coinAName: tokenA?.name,
      coinBName: tokenB?.name,
      coinA: tokenA?.tokenAddress || '',
      coinB: tokenB?.tokenAddress || '',
      status: deedInfo[6][0],
      deedAddress: deedInfo[9],
      deedManager: deedInfo[2][0],
      wholesaleAddress: deedInfo[5].toString(),
      loanLeverage: leverage.toString(),
      size: convertBigNumberValueToNumber(deedSize, tokenA?.decimal),
      sizeConsumed: 100,
      managementFee: parseFloat((managementFee / 100).toString()),
      recruitingEndDate: recruitingEndTimestamp.toString(),
      escrowEndDate: buyTimestamp.toString(),
      deedEndDate: sellTimestamp.toString(),
      triggerRiskMitigation: trigger.toString(),
      leveragedAdjustmentRiskMitigation: leverageRisMitigation.toString(),
      secondTriggerRiskMitigation: secondTrigger.toString(),
      allowBrokers: deedInfo[8][0],
      minimumBrokerStakingAmount: 100,
      requiredStakingAmount: NumberToFixedFormater(convertBigNumberValueToNumber(deedSize), 6),
      published: new Date(),
      updated: new Date(),
      progress: 30,
      profit: '--',
      allOrMy: '',
      type: deedInfo[5] ? 'Fixed' : 'Floating',
      totalStaked: convertBigNumberValueToNumber(deedInfo[7].toString(), TOKEN_TYPES.DTOKEN.decimal),
      createdAtTimeStamp: deedInfo[11],
      minimumParticipation: minimumBuy / 100,
      buyerDeeds: deedInfo[12],
      exiterDeeds: deedInfo[13],
      isCanceledInEscrow: deedInfo[14],
    };
  };

  return <>{deedValid ? <ViewDeed deed={deed as Deed} queryDeed={queryDeeds} /> : <Error />}</>;
}
