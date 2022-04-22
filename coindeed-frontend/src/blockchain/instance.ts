import { getContractInstance } from './base';

// CONTRACT ABI
import LendingPoolABI from './abi/LendingPool.json';
import DeedFactoryABI from './abi/DeedFactory.json';
import DeedABI from './abi/Deed.json';
import WholesaleABI from './abi/Wholesale.json';
import Multicall from './abi/Multicall.json';

import ABI_ERC20 from './abi/ABI_ERC20.json';
import ABI_ORACEL from './abi/ABI_ORACEL.json';
import ABI_UNISWAPV2 from './abi/UniswapV2.json';
import FEED_REGISTRY from './abi/FeedRegistry.json';
import DAO_ABI from './abi/DAO.json';




// CONTRACT ADDRESS
const lendingPoolAddress = process.env.REACT_APP_LENDING_POOL_ADDRESS;
const deedFactoryAddress = process.env.REACT_APP_DEED_FACTORY_ADDRESS;
const wholesaleAddress = process.env.REACT_APP_WHOLESALE_ADDRESS;
const multicallAddress = process.env.REACT_APP_MULTICAL_ADDRESS;
const uniswapV2Address = process.env.REACT_APP_UNISWAPV2;
const feedRegistryAddress = process.env.REACT_APP_FEED_REGISTRY
const daoAddress = process.env.REACT_APP_DAO_ADDRESS



export const genERC20Contract = (tokenAddress: string) => {
  return getContractInstance(ABI_ERC20, tokenAddress);
};

export const genORACELContract = (tokenAddress: string) => {
  return getContractInstance(ABI_ORACEL, tokenAddress);
};

/*  */

export const genLendingPoolContract = () => {
  return getContractInstance(LendingPoolABI, lendingPoolAddress);
};

export const genDeedContract = (deedAddress: string) => {
  return getContractInstance(DeedABI, deedAddress);
};

export const genWholesaleContract = () => {
  return getContractInstance(WholesaleABI, wholesaleAddress);
};

export const genMulticalContract = () => {
  return getContractInstance(Multicall, multicallAddress);
};

export const genDeedFactoryContract = () => {
  return getContractInstance(DeedFactoryABI, deedFactoryAddress);
};

export const genUniSwapV2Contract = () => {
  return getContractInstance(ABI_UNISWAPV2, uniswapV2Address);
};

export const genFeedRegistryContract = () => {
  return getContractInstance(FEED_REGISTRY, feedRegistryAddress);
};

export const genDaoContract = () => {
  return getContractInstance(DAO_ABI, daoAddress);
};


/*  */

