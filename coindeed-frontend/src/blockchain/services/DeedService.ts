import { BigNumber } from 'bignumber.js';

import {
  genDeedContract,
  genDeedFactoryContract,
  genERC20Contract,
  genFeedRegistryContract,
  genUniSwapV2Contract,
} from '../instance';

import { getProvider } from '../base';
import { CreateDeed, EditDeed } from '../../components/deed/type';
import { convertBigNumberValueToNumber, getTokenDecimalsV2, getExchangeRateWithUSD } from '../utils';
import { DTokenExchange, TOKEN_TYPES, USD_EXCHANGE } from '../../utils/Constants';

import { depositAmount, getTotalDepositBalance, getTotalBorrowBalance } from './LendingPoolService';

import { NumberToFixedFormater, NumberToFixedFormaterNoComma } from '../../utils/Formatters';

export const getTotalDeedCreated = async (): Promise<Array<any>> => {
  try {
    const provider = await getProvider();
    const accounts = await provider?.listAccounts();
    let totalCreatedDeed = 0;
    if (accounts) {
      const userWalletAddress = accounts[0];
      const deedFactoryInstance = await genDeedFactoryContract();
      totalCreatedDeed = await deedFactoryInstance.managerDeedCount(userWalletAddress);
    }
    return [totalCreatedDeed, null];
  } catch (error) {
    return [null, error];
  }
};

// Deed Manager can create Deed by calling createDeed() method on the Deed Contract
export const createDeedSC = async (deedParams: CreateDeed) => {
  try {
    const deedFactoryInstance = await genDeedFactoryContract();

    console.log(
      deedParams.pairOfTokens,
      0,
      deedParams.wholesaleId,
      deedParams.deedParams,
      deedParams.executionTime,
      deedParams.riskMitigation,
      deedParams.brokerConfig,
    );

    const estimatedGasFee = await deedFactoryInstance.estimateGas.createDeed(
      deedParams.pairOfTokens,
      0, // Set amount of DToken staking when create deed = 0
      deedParams.wholesaleId,
      deedParams.deedParams,
      deedParams.executionTime,
      deedParams.riskMitigation,
      deedParams.brokerConfig,
    );

    const result = await deedFactoryInstance.createDeed(
      deedParams.pairOfTokens,
      0, // Set amount of DToken staking when create deed = 0
      deedParams.wholesaleId,
      deedParams.deedParams,
      deedParams.executionTime,
      deedParams.riskMitigation,
      deedParams.brokerConfig,
      {
        gasLimit: estimatedGasFee.toString(),
      },
    );
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

// Deed Manager can cancel the deed by calling cancel() method on the deed contract
export const cancelDeed = async (deedAddress: string) => {
  try {
    const deedFactoryInstance = await genDeedContract(deedAddress);
    const cancel = await deedFactoryInstance.cancel();
    return [cancel, null];
  } catch (error) {
    console.log(error);
    return [null, error];
  }
};

// Users can claim their assets after the Deed is canceled or completed
// Method use on Deed SmartContract:  claimBalance()
export const claimBalance = async (deedAddress: string) => {
  try {
    const deedFactoryInstance = await genDeedContract(deedAddress);
    const result = await deedFactoryInstance.claimBalance();
    return [result, null];
  } catch (error) {
    console.log(error);
    return [null, error];
  }
};

// Users can exit the deed when Deed is in Open status.
// Method use on Deed SmartContract:  exitDeed()
export const exitDeed = async (deedAddress: string, _payoff: boolean, amount?: any) => {
  try {
    const deedFactoryInstance = await genDeedContract(deedAddress);
    let result = null
    if (amount) {
      // Send tx with ETH value
      result = await deedFactoryInstance.exitDeed(_payoff, { value: amount });
    } else {
      result = await deedFactoryInstance.exitDeed(_payoff);
    }
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

// Showing total of user's supplied token of Deed
// Method use on SmartContract:  buyIns()
export const getBuyIns = async (deedAddress: string, userAddress: string) => {
  try {
    const deedFactoryInstance = await genDeedContract(deedAddress);
    const result = await deedFactoryInstance.buyIns(userAddress);
    return [result, null];
  } catch (error) {
    console.log('error', error);
    return [null, error];
  }
};

// Deed manager/broker can change the Deed Status from Recruiting => In Escrow by staking enough required Dtoken
// Method use on Deed SmartContract:  stake()
export const stakeDTokenWhenRecruiting = async (deedAddress: string, stakeAmount: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.stake(stakeAmount);
    return [response, null];
  } catch (error) {
    console.log('error', error);
    return [null, error];
  }
};

// User can join the deed by suppling Deposit Token to Deed by calling:
//  buy() method if user join with ERC20 Token
// or buyIn() method if user join with ETH
export const buyInDepositTokenForDeed = async (deedAddress: string, buyInAmount: string, isERC20Token = true) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    let response = null;

    if (isERC20Token) {
      const estimatedGasFee = await deedContractInstance.estimateGas.buyIn(buyInAmount);
      const responseBuyIn = await deedContractInstance.buyIn(buyInAmount, {
        gasLimit: estimatedGasFee.toString(),
      });
      response = responseBuyIn;
    } else {
      const estimatedGasFee = await deedContractInstance.estimateGas.buyIn(buyInAmount, { value: buyInAmount });
      const responseBuyIn = await deedContractInstance.buyIn(buyInAmount, {
        value: buyInAmount,
        gasLimit: estimatedGasFee.toString(),
      });
      response = responseBuyIn;
    }

    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

// Deed manager can change status of deed from in Escrow => Open
// Method use on Deed SmartContract:  buy()
export const triggerDeedToOpenStatus = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const estimatedGasFee = await deedContractInstance.estimateGas.buy(1);
    const response = await deedContractInstance.buy(1, { gasLimit: estimatedGasFee.toString() });
    return [response, null];
  } catch (error) {
    console.log('error::::', error);
    return [null, error];
  }
};

// Deed manager can change status of deed from Open => Completed
// Method use on Deed SmartContract:  sell()
export const handleCompleteDeed = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.sell(1);
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

// Deed manager/broker can withdraw total Dtoken staked after Deed is completed
// Method use on Deed SmartContract:  withdrawStake()
export const handleWithDrawTotalStake = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.withdrawStake();
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

// Deed manager can complete the deed
// Method use on Deed SmartContract:  sell()
export const doCompleteDeed = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.sell();
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const getBalanceOfTokenB = async (deedAddress: string, tokenAddress: string) => {
  try {
    const erc20Contract = await genERC20Contract(tokenAddress);
    const response = await erc20Contract.balanceOf(deedAddress);
    return [response, null];
  } catch (error) {
    console.log(error);
    return [null, error];
  }
};

// get total quantity of Downpayment token  all users joined
export const getTotalJoinedDownPayment = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.totalSupply();
    return [response, null];
  } catch (error) {
    console.log(error);
    return [null, error];
  }
};

export const getSwapToken = async (amountIn: string, path: string[]) => {

  let [purchaseToken, downpaymentToken] = path
  if (downpaymentToken === TOKEN_TYPES.ETH.tokenAddress) {
    downpaymentToken = TOKEN_TYPES.WETH.tokenAddress
  }
  const newPath = [purchaseToken, downpaymentToken]

  try {
    const uniswap = await genUniSwapV2Contract();
    const response = await uniswap.getAmountsOut(amountIn, newPath);
    return [response, null];
  } catch (error) {
    console.log(error);
    return [null, error];
  }
};

export const getTotalDownPaymentTokenBuyersJoined = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.totalSupply();
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const getAmountOfDownpaymentTokenBuyerJoined = async (deed: any, userAddress: string) => {
  const deedContractInstance = await genDeedContract(deed.deedAddress);

  let downPayment = await deedContractInstance.buyIns(userAddress);

  const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);

  downPayment = convertBigNumberValueToNumber(downPayment, decimalA);

  return downPayment.toString();
};

export const editDeedInfo = async (deedAddress: string, params: any) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.editBasicInfo(params);
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const editDeed = async (deedAddress: string, params: EditDeed) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.edit(
      params.deedParams,
      params.executionTime,
      params.riskMitigation,
      params.brokerConfig,
      params.wholesaleId,
    );
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const getDeedParameters = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.deedParameters();
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const getBrokerConfig = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.brokerConfig();
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const getExecutionTime = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.executionTime();
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const getRiskMitigation = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.riskMitigation();
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

// get current amount of Dtoken that deed manager/brokers staked on Deed
export const getAmountDTokenStakedByUserAddress = async (deedAddress: string, userAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.stakes(userAddress);
    const result = convertBigNumberValueToNumber(response, TOKEN_TYPES.DTOKEN.decimal);
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

// get current amount of Downpay ment token that buyer joined  on Deed
export const getAmountDownPayTokenUserJoined = async (
  deedAddress: string,
  userAddress: string,
  downPaymentTokenAddress: string,
) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.buyIns(userAddress);
    const decimal = await getTokenDecimalsV2(downPaymentTokenAddress);

    const result = convertBigNumberValueToNumber(response, Number(decimal[0]));

    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

// Get Total amount of Dtoken staked by all user
export const getTotalStake = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.totalStake();
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

// Handling Deed manager can move Deed to Escrow when required Dtoken staked is met
export const moveToEscrow = async (deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.ready();
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

// get total required Dtoken need to stake
export const getRequiredStakingAmount = async (
  deedSize: number,
  loanLeverage: number,
  downpaymentTokenAddress: string,
) => {
  try {
    const feedRegistryContractInstance = await genFeedRegistryContract();
    const priceDownpaymentToken = await feedRegistryContractInstance.latestAnswer(
      downpaymentTokenAddress,
      USD_EXCHANGE.address,
    );
    const formatedPricePurchaseToken = convertBigNumberValueToNumber(priceDownpaymentToken, USD_EXCHANGE.decimal);
    const [decimalDownpayToken] = await getTokenDecimalsV2(downpaymentTokenAddress);

    const result = new BigNumber(deedSize / loanLeverage)
      .multipliedBy(Math.pow(10, Number(decimalDownpayToken)))
      .multipliedBy(formatedPricePurchaseToken)
      .multipliedBy(Math.pow(10, 18 - Number(decimalDownpayToken)))
      .multipliedBy(DTokenExchange);
    const formatedValue = convertBigNumberValueToNumber(result.toFixed(), TOKEN_TYPES.DTOKEN.decimal);

    return [formatedValue, null];
  } catch (error) {
    return [null, error];
  }
};

export const getTotalLoan = async (deed: any, userAddress: any) => {
  const [usersDownPayment]: any = await getAmountDownPayTokenUserJoined(deed?.deedAddress, userAddress, deed?.coinA);

  const managementFeePercentage = deed.managementFee / 100;

  const loanLeverage = deed.loanLeverage;

  const managementFeeAmount = usersDownPayment * managementFeePercentage;

  const currentValue = usersDownPayment - managementFeeAmount;

  const totalLoan = currentValue * loanLeverage - currentValue;

  const formattedTotalLoan = NumberToFixedFormaterNoComma(totalLoan, 2);

  return formattedTotalLoan;
};

export const getAmountReceived = async (deed: any, userAddress: any) => {
  const [usersDownPayment]: any = await getAmountDownPayTokenUserJoined(deed?.deedAddress, userAddress, deed?.coinA);

  let [totalDownPayment]: any = await getTotalJoinedDownPayment(deed?.deedAddress);

  const [decimalA]: any = await getTokenDecimalsV2(deed.coinA);

  totalDownPayment = convertBigNumberValueToNumber(totalDownPayment, decimalA);

  const [decimalB]: any = await getTokenDecimalsV2(deed.coinB);

  const [response]: any = await depositAmount(deed.coinB, deed.deedAddress);

  let deposit = convertBigNumberValueToNumber(response, decimalB);

  const percentJoin = usersDownPayment / totalDownPayment;

  const amountReceived = percentJoin * deposit;

  const formattedAmountReceived = NumberToFixedFormater(amountReceived, 2);

  return formattedAmountReceived;
};
export const getDeedNetWorth = async (deed: any, userAddress: any) => {
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

  const [usersDownPayment]: any = await getAmountDownPayTokenUserJoined(deed?.deedAddress, userAddress, deed?.coinA);

  let NW_Deed = totalDepositBalance * tokenBPrice - totalBorrowBalance * tokenAPrice;

  let user_net_worth = (usersDownPayment / totalDownPayment) * NW_Deed;

  let formatted_user_net_worth = NumberToFixedFormaterNoComma(user_net_worth, 2);

  return formatted_user_net_worth;
};

// Get total amount of purchase token value when deed get swapped (on OPEN Phase)
export const getTotalPurchasedTokenValue = async (deedAddress: string, purchaseTokenAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.totalPurchasedToken();

    const [decimal]: any = await getTokenDecimalsV2(purchaseTokenAddress);

    const result = convertBigNumberValueToNumber(response, Number(decimal));
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};
