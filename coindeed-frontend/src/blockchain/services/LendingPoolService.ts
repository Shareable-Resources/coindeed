import { ethers, utils } from 'ethers';
import { genERC20Contract, genLendingPoolContract } from '../instance';
import { convertBigNumberValueToNumber, convertPriceToBigDecimals } from '../utils';
import { getProvider } from '../base';
import { TOKEN_TYPES } from '../../utils/Constants';
import { LendingPool } from '../../APIs/LendingPoolApi';

const LENDING_POOL_ADDRESS = process.env.REACT_APP_LENDING_POOL_ADDRESS || '';

/* Read as Proxy */

// Get total available DToken user's interest
export const pendingDToken = async (token: LendingPool, lender = null) => {
  try {
    const provider = await getProvider();
    const accounts = await provider?.listAccounts();
    let resultPendingDtoken = 0;
    if (accounts.length) {
      const lendingPoolContract = await genLendingPoolContract();
      resultPendingDtoken = await lendingPoolContract.pendingDToken(token.tokenAddress, lender || accounts[0]);
    }
    resultPendingDtoken = convertBigNumberValueToNumber(resultPendingDtoken, token.decimals);
    return [resultPendingDtoken, null];
  } catch (error) {
    return [null, error];
  }
};

// Get total available interest of Token which user deposited
export const pendingToken = async (token: LendingPool, lender = null) => {
  try {
    const provider = await getProvider();
    const accounts = await provider?.listAccounts();
    let resultPendingToken = 0;
    if (accounts.length) {
      const lendingPoolContract = await genLendingPoolContract();
      resultPendingToken = await lendingPoolContract.pendingToken(token.tokenAddress, lender || accounts[0]);
    }
    resultPendingToken = convertBigNumberValueToNumber(resultPendingToken, token.decimals);
    return [resultPendingToken, null];
  } catch (error) {
    return [null, error];
  }
};

/* Write as Proxy */

// Deposit token to a pool
export const deposit = async (token: LendingPool, amount: number) => {
  try {
    const lendingPoolContract = await genLendingPoolContract();
    let valueAmount = convertPriceToBigDecimals(amount, token.decimals);
    let response;
    if (token.tokenAddress === TOKEN_TYPES.ETH.tokenAddress) {
      response = await lendingPoolContract.deposit(token.tokenAddress, valueAmount, { value: valueAmount });
    } else {
      response = await lendingPoolContract.deposit(token.tokenAddress, valueAmount);
    }
    return [response, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

// Withdraw token from a pool
export const withdraw = async (token: LendingPool, amount: number) => {
  try {
    const contract = await genLendingPoolContract();
    const response = await contract.withdraw(token.tokenAddress, convertPriceToBigDecimals(amount, token.decimals));
    return [response, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

// Withdraw profit from a pool
export const claimDToken = async (tokenAddress: string) => {
  try {
    const lendingPoolContract = await genLendingPoolContract();
    const value = await lendingPoolContract.claimDToken(tokenAddress);
    return [value, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

// Get the information of a pool
export const poolInfo = async (tokenAddress: string) => {
  try {
    const contract = await genLendingPoolContract();
    const result = await contract.poolInfo(tokenAddress);
    return [result, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

/*  */

export const getBalanceOfToken = async (tokenAddress: string, decimals: number) => {
  try {
    let balance;

    if (tokenAddress === TOKEN_TYPES.ETH.tokenAddress) {
      const provider = await getProvider();
      balance = await provider?.getBalance(LENDING_POOL_ADDRESS);
      balance = Number(utils.formatEther(balance || 0));
      return [balance, null];
    }

    if (!tokenAddress) return [0, null];

    const contract = await genERC20Contract(tokenAddress);

    balance = await contract.balanceOf(LENDING_POOL_ADDRESS);
    balance = convertBigNumberValueToNumber(balance, decimals);
    return [balance, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};
export const getBalanceOfUser = async (tokenAddress: string, decimals: number) => {
  try {
    const provider = await getProvider();
    const accounts = await provider?.listAccounts();
    let balance = null;

    if (accounts.length) {
      if (tokenAddress === TOKEN_TYPES.ETH.tokenAddress) {
        balance = await provider?.getBalance(accounts[0]);
        balance = ethers.utils.formatUnits(balance, decimals);
        return [balance, null];
      }

      const contract = await genERC20Contract(tokenAddress);

      if (!contract) {
        if (!contract) console.error('Contract not found!');
        return [null, null];
      }

      balance = await contract.balanceOf(accounts[0]);
      balance = convertBigNumberValueToNumber(balance, decimals);
    }

    return [balance, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

/*  */

// Get the number of tokens that the user has deposited in the pool
export const getCurrentSupply = async (token: LendingPool, lender = null) => {
  try {
    const lendingPoolContract = await genLendingPoolContract();
    const provider = await getProvider();
    const accounts = await provider?.listAccounts();
    let result: any = 0;
    if (accounts.length) {
      result = await lendingPoolContract.userAssetInfo(lender || accounts[0], token.tokenAddress);
      result = convertBigNumberValueToNumber(result.amount.toString(), token.decimals);
    }

    return [result, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

// Get the interest percentage of a pool
export const getAPYInfo = async (token: LendingPool) => {
  try {
    const [poolInfoResult]: any = await poolInfo(token.tokenAddress);
    const Borrowsa = convertBigNumberValueToNumber(poolInfoResult?.totalBorrows || 0, token.decimals);
    const [Casha]: any = await getBalanceOfToken(token.tokenAddress, token.decimals);

    const Ua = Borrowsa / (Casha + Borrowsa);
    const BorrowingInterestRatea = 0.025 + Ua * 0.2;
    const APR = BorrowingInterestRatea * Ua;

    const APY = Math.pow(1 + APR / 1095, 1095) - 1;

    return [APY, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

// Get total liquidity of a pool
export const getTotalLiquidityOfTokenAddress = async (token: LendingPool) => {
  try {
    if (!token) return [null, 'Token Not Found!'];

    const [totalSupply]: any = await getBalanceOfToken(token.tokenAddress, token.decimals);
    const [poolInfoResult]: any = await poolInfo(token.tokenAddress);
    const totalBorrows = convertBigNumberValueToNumber(poolInfoResult?.totalBorrows || 0, token.decimals);
    const value = totalSupply + totalBorrows;
    return [value, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

/*  */

export const getEstimatedETHGasFee = async (estimatedGasUnits: number) => {
  // transaction fee = gas unit * gas price
  const provider = await getProvider();
  const gasPriceWei = await provider.getGasPrice();
  const gasPriceETH = ethers.utils.formatEther(gasPriceWei);
  return estimatedGasUnits * Number(gasPriceETH) * 2.5;
};
export const getEstimateGasOfDeposit = async (token: LendingPool, amount: number) => {
  try {
    const lendingPoolContract = await genLendingPoolContract();
    let valueAmount = convertPriceToBigDecimals(amount, token.decimals);
    let response;
    if (token.tokenAddress === TOKEN_TYPES.ETH.tokenAddress) {
      response = await lendingPoolContract.estimateGas.deposit(token.tokenAddress, valueAmount, { value: valueAmount });
    } else {
      response = await lendingPoolContract.estimateGas.deposit(token.tokenAddress, valueAmount);
    }
    const value = await getEstimatedETHGasFee(Number(response));

    return [value, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

export const depositAmount = async (tokenAddress: string, lender: string) => {
  try {
    const contract = await genLendingPoolContract();
    const response = await contract.depositAmount(tokenAddress, lender);
    return [response, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
};

export const getTotalDepositBalance = async (tokenAddress: string, deedAddress: string) => {
  try {
    const contract = await genLendingPoolContract();
    const response = await contract.totalDepositBalance(tokenAddress, deedAddress);
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const getTotalBorrowBalance = async (tokenAddress: string, deedAddress: string) => {
  try {
    const contract = await genLendingPoolContract();
    const response = await contract.totalBorrowBalance(tokenAddress, deedAddress);
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};
