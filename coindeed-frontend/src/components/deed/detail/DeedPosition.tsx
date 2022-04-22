import { useEffect, useState } from 'react';

import {
  getAmountDownPayTokenUserJoined,
  getAmountDTokenStakedByUserAddress,
  getTotalJoinedDownPayment,
} from '../../../blockchain/services/DeedService';

import {
  depositAmount,
  getTotalDepositBalance,
  getTotalBorrowBalance,
} from '../../../blockchain/services/LendingPoolService';

import { useSelector } from 'react-redux';

import { convertBigNumberValueToNumber, getTokenDecimalsV2, getExchangeRateWithUSD } from '../../../blockchain/utils';

import { OPEN_STATUS } from '../../../utils/Constants';

import { NumberToFixedFormater, NumberToFixedFormaterNoComma } from '../../../utils/Formatters';

type DeedPositionProps = {
  deed: any;
};

export default function DeedPosition({ deed }: DeedPositionProps) {
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const [currentDtokenStaked, setCurrentDtokenStaked] = useState<any>(undefined);
  const [currentDownpayJoined, setCurrentDownpayJoined] = useState<any>(undefined);
  const [amountReceived, setAmountReceived] = useState<any>('');
  const [totalLoan, setTotalLoan] = useState<any>('');
  const [userNetWorth, setUserNetWorth] = useState<any>(undefined);
  useEffect(() => {
    const getCurrentUserStakedDtoken = async () => {
      const [result]: any = await getAmountDTokenStakedByUserAddress(deed?.deedAddress, userAddress);

      if (result) {
        let formattedCurrentStaked = NumberToFixedFormater(result, 2);
        setCurrentDtokenStaked(formattedCurrentStaked);
      } else {
        setCurrentDtokenStaked(undefined);
      }
    };

    const getCurrentUserJoined = async () => {
      const [result] = await getAmountDownPayTokenUserJoined(deed?.deedAddress, userAddress, deed?.coinA);

      if (result) {
        let formattedDownPayment = NumberToFixedFormater(result, 2);
        setCurrentDownpayJoined(formattedDownPayment);
      } else {
        setCurrentDownpayJoined(undefined);
      }
    };

    const getTotalLoan = async () => {
      const [usersDownPayment]: any = await getAmountDownPayTokenUserJoined(
        deed?.deedAddress,
        userAddress,
        deed?.coinA,
      );

      console.log(
        'deedPosition deed?.deedAddress: ',
        deed?.deedAddress,
        'getTotalLoan deed.managementFee: ',
        deed.managementFee,
      );

      const managementFeePercentage = deed.managementFee / 100;

      console.log(
        'deedPosition deed?.deedAddress: ',
        deed?.deedAddress,
        'getTotalLoan deed.loanLeverage: ',
        deed.loanLeverage,
      );

      const loanLeverage = deed.loanLeverage;

      const managementFeeAmount = usersDownPayment * managementFeePercentage;

      const currentValue = usersDownPayment - managementFeeAmount;

      const totalLoan = currentValue * loanLeverage - currentValue;

      const formattedTotalLoan = NumberToFixedFormater(totalLoan, 2);

      console.log('setting totalLoan in DeedPosition with: ', formattedTotalLoan);

      setTotalLoan(formattedTotalLoan);
    };

    const getAmountReceived = async () => {
      const [usersDownPayment]: any = await getAmountDownPayTokenUserJoined(
        deed?.deedAddress,
        userAddress,
        deed?.coinA,
      );

      let [totalDownPayment]: any = await getTotalJoinedDownPayment(deed?.deedAddress);

      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);

      totalDownPayment = convertBigNumberValueToNumber(totalDownPayment, decimalA);

      const [decimalB]: any = await getTokenDecimalsV2(deed.coinB);

      const [response]: any = await depositAmount(deed.coinB, deed.deedAddress);

      let deposit = convertBigNumberValueToNumber(response, decimalB);

      const percentJoin = usersDownPayment / totalDownPayment;

      const amountReceived = percentJoin * deposit;

      const formattedAmountReceived = NumberToFixedFormater(amountReceived, 2);

      setAmountReceived(formattedAmountReceived);
    };
    const getDeedNetWorth = async () => {
      const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);

      const [decimalB]: any = await getTokenDecimalsV2(deed.coinB);
      let [totalDepositBalance]: any = await getTotalDepositBalance(deed?.coinB, deed?.deedAddress);

      totalDepositBalance = convertBigNumberValueToNumber(totalDepositBalance, decimalB);

      let [totalBorrowBalance]: any = await getTotalBorrowBalance(deed?.coinA, deed?.deedAddress);

      totalBorrowBalance = convertBigNumberValueToNumber(totalBorrowBalance, decimalA);

      const [tokenAPrice]: any = await getExchangeRateWithUSD(deed?.coinA);

      const [tokenBPrice]: any = await getExchangeRateWithUSD(deed?.coinB);

      let [totalDownPayment]: any = await getTotalJoinedDownPayment(deed?.deedAddress);

      totalDownPayment = convertBigNumberValueToNumber(totalDownPayment, decimalA);

      const [usersDownPayment]: any = await getAmountDownPayTokenUserJoined(
        deed?.deedAddress,
        userAddress,
        deed?.coinA,
      );

      let NW_Deed = totalDepositBalance * tokenBPrice - totalBorrowBalance * tokenAPrice;

      let user_net_worth = (usersDownPayment / totalDownPayment) * NW_Deed;

      let formatted_user_net_worth = NumberToFixedFormaterNoComma(user_net_worth, 2);

      setUserNetWorth(formatted_user_net_worth);
    };

    if (userAddress) {
      getCurrentUserStakedDtoken();
      getCurrentUserJoined();
      getAmountReceived();
      getTotalLoan();
      getDeedNetWorth();
    }
    // eslint-disable-next-line
  }, [deed, userAddress]);

  return (
    <div className='p-25px bg-panel bg-opacity-50 rounded-lg w-580px h-203px'>
      <h1 className='text-white font-black text-deed-position'>My Deed Position</h1>
      <div className='flex my-42px'>
        <div className='flex-col mr-74px '>
          <h2 className='text-white text-deed-position'>My Staking </h2>
          <div className='text-white-light text-deed-position'>
            {currentDtokenStaked !== undefined ? currentDtokenStaked + ' DToken' : '-'}{' '}
          </div>
        </div>
        <div className='flex-col mr-74px'>
          <h2 className='text-white text-deed-position'>My Down Payment</h2>
          <div className='text-white-light text-deed-position'>
            {currentDownpayJoined !== undefined ? currentDownpayJoined + ' ' + deed?.coinAName : '-'}
          </div>
        </div>
        <div className='flex-col mr-74px'>
          <h2 className='text-white text-deed-position'>My Deed Net Worth </h2>
          <div className='text-white-light text-deed-position'>
            {userNetWorth !== undefined ? userNetWorth + ' USD' : '-'}
          </div>
        </div>
      </div>
      {deed.status === OPEN_STATUS ? (
        <div className='text-white-light text-deed-position'>
          If you were to pay off your loan of{' '}
          <span className='text-white'>
            {totalLoan} {deed?.coinAName}{' '}
          </span>
          , you will recieve <span className='text-white'>{amountReceived}</span> {deed?.coinBName}
        </div>
      ) : (
        <div className='text-white text-deed-position'></div>
      )}
    </div>
  );
}
