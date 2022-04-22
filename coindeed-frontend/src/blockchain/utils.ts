import { ethers, utils } from 'ethers';
import _ from 'lodash';
import { loginRequired } from '../services/wallet';
import { MAX_INT, TOKEN_TYPES, TYPE_OF_COIN, USD_EXCHANGE } from '../utils/Constants';
import { getProvider } from './base';
import { genERC20Contract, genFeedRegistryContract, genORACELContract, genUniSwapV2Contract } from './instance';

const LENDING_POOL_ADDRESS = process.env.REACT_APP_LENDING_POOL_ADDRESS;
const DTOKEN_ADDRESS = process.env.REACT_APP_DTOKEN_ADDRESS;
const DTOKEN_DECIMALS = 18;
const FEED_REGISTRY_DECIMAL = 6;

export const convertBigNumberValueToNumber = (value: any, decimal: number = 18): any => {
  const res = ethers.utils.formatUnits(value, decimal).toString();
  return Number(res);
};

export const convertPriceToBigDecimals = (value: number, decimal: number = 18) => {
  const res = ethers.utils.parseUnits(value.toString(), decimal);
  return res.toString();
};

export interface tokenFormat {
  name: string;
  decimal: number;
  tokenAddress: string;
  oracelTokenAddress?: string;
}
export const getTokenInfoByName = (tokenName: string): tokenFormat => {
  let token = (TOKEN_TYPES as any)[tokenName];

  if (!token) {
    const keys = Object.keys(TOKEN_TYPES);
    const data = keys.map(key => (TOKEN_TYPES as any)[key]);
    token = data.find(e => e.name === tokenName);
  }

  return token || null;
};
export const getTokenInfoByAddress = (tokenAddress: string): tokenFormat => {
  const keys = Object.keys(TOKEN_TYPES);
  const tokens = keys.map(key => (TOKEN_TYPES as any)[key]);
  const result = tokens.find(e => e.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
  return result;
};
export const getIconOfToken = (tokenName: string): any => {
  return TYPE_OF_COIN.find(t => t.name === tokenName)?.icon || undefined;
};
export const getIconOfTokenAddress = (tokenAddress: string): any => {
  return TYPE_OF_COIN.find(t => _.toLower(t.tokenAddress) === _.toLower(tokenAddress))?.icon || undefined;
};

/*  */

export const getExchange = async (oracalAddress: string) => {
  try {
    const Contract = await genORACELContract(oracalAddress);
    const response = await Contract.latestAnswer();
    const decimals = await Contract.decimals();
    const result = convertBigNumberValueToNumber(response, decimals);
    return [result, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

export const getExchangeByTokenAddress = async (tokenAddress: string) => {
  try {
    const oracalAddress = getTokenInfoByAddress(tokenAddress).oracelTokenAddress;
    if (oracalAddress) return getExchange(oracalAddress);
    return [null, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

export const handleUserApproveToken = async (tokenAddress: string, spender = LENDING_POOL_ADDRESS) => {
  try {
    await loginRequired();
    const TokenContract = await genERC20Contract(tokenAddress);
    const approve = await TokenContract.approve(spender, MAX_INT);
    return [approve, null];
  } catch (error) {
    return [null, error];
  }
};

export const isUserApprovedToken = async (tokenAddress: string, spender = LENDING_POOL_ADDRESS) => {
  try {
    const provider = await getProvider();
    const accounts = await provider?.listAccounts();

    if (accounts) {
      const TokenContract = await genERC20Contract(tokenAddress);
      const allowance = await TokenContract!.allowance(accounts[0], spender);
      if (allowance.toString() !== '0') return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

/*  */

export function dynamicSort(property: string) {
  let sortOrder = 1;
  if (property[0] === '-') {
    sortOrder = -1;
    property = property.substr(1);
  }
  return (a: any, b: any) => {
    const result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
}

export const getTokenDecimals = async (tokenAddress: string) => {
  try {
    const erc20Contract = await genERC20Contract(tokenAddress);
    return [erc20Contract.decimals(), null];
  } catch (error) {
    return [null, error];
  }
};

export const getTokenDecimalsV2 = async (tokenAddress: string) => {
  try {
    let decimal = 18;
    if (tokenAddress !== TOKEN_TYPES.ETH.tokenAddress) {
      const erc20Contract = await genERC20Contract(tokenAddress);
      decimal = await erc20Contract.decimals();
    }
    return [decimal, null];
  } catch (error) {
    return [null, error];
  }
};

export const getUniswapExchangeWithDToken = async (tokenAddress: string, amount: string) => {
  try {
    const uniswapV2 = await genUniSwapV2Contract();
    const exchange = await uniswapV2.getAmountsOut(amount, [tokenAddress, DTOKEN_ADDRESS]);

    const result = convertBigNumberValueToNumber(exchange[1], DTOKEN_DECIMALS);

    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

export const getTokenSymbol = async (tokenAddress: string) => {
  try {
    if (tokenAddress === TOKEN_TYPES.ETH.tokenAddress) {
      return ['ETH', null];
    }
    const erc20Contract = await genERC20Contract(tokenAddress);
    const symbol = await erc20Contract.symbol();
    return [symbol, null];
  } catch (error) {
    return [null, error];
  }
};

export const getBalanceOfUser = async (tokenAddress: string, userAddress: string) => {
  try {
    const erc20Contract = await genERC20Contract(tokenAddress);
    const balance = await erc20Contract.balanceOf(userAddress);
    return [balance, null];
  } catch (error) {
    return [null, error];
  }
};

// get exchange between Downpayment token and Dtoken
export const getExchangeDownpaymentAndDToken = async (tokenAddress: string) => {
  try {
    const USD_ADDRESS = '0x0000000000000000000000000000000000000348';

    const feedRegistry = await genFeedRegistryContract();
    const downpayTokenExchangeValue = await feedRegistry.latestAnswer(tokenAddress, USD_ADDRESS);
    const downpayTokenExchange = convertBigNumberValueToNumber(downpayTokenExchangeValue, FEED_REGISTRY_DECIMAL);

    const DTokenExchangeValue = await feedRegistry.latestAnswer(DTOKEN_ADDRESS, USD_ADDRESS);
    const DTokenExchange = convertBigNumberValueToNumber(DTokenExchangeValue, FEED_REGISTRY_DECIMAL);

    const result = downpayTokenExchange / DTokenExchange;

    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

export const getExchangeRateWithUSD = async (tokenAddress: string) => {
  try {
    const feedRegistry = await genFeedRegistryContract();
    const Exchange = await feedRegistry.latestAnswer(tokenAddress, USD_EXCHANGE.address);
    const Decimals = await feedRegistry.decimals(tokenAddress, USD_EXCHANGE.address);
    return [convertBigNumberValueToNumber(Exchange, Decimals), null];
  } catch (error) {
    return [null, error];
  }
};

export const getRequiredDownPaymentAmount = (deedSize: number, loanLeverage: number) => {
  try {
    let requiredDownPaymentAmount = deedSize / loanLeverage;
    return [requiredDownPaymentAmount, null];
  } catch (error) {
    return [null, error];
  }
};

export const getETHBalance = async () => {
  try {
    const provider = await getProvider();
    const accounts = await provider?.listAccounts();
    let balance;
    if (accounts) {
      balance = await provider?.getBalance(accounts[0]);
      balance = utils.formatEther(balance || 0);
    }
    return [balance, null];
  } catch (error) {
    return [null, error];
  }
};
