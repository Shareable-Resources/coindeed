import { CFL } from './Formatters';

import DTOKEN_ICON from '../images/icons/eth_icon.svg';

import ETH_ICON from '../images/icon-token/ETH.png';
import BNB_ICON from '../images/icon-token/BNB.png';
import USDC_ICON from '../images/icon-token/USDC.png';
import DAI_ICON from '../images/icon-token/DAI.png';
import USDT_ICON from '../images/icon-token/USDT.png';
import WBTC_ICON from '../images/icons/btc.svg';

import iconMetamask from '../images/wallet/MetaMask.svg';
import iconWalletConnect from '../images/wallet/WalletConnect.svg';
// import iconCoinbaseWallet from '../images/wallet/CoinbaseWallet.svg';

export type FilterNameAndValue = {
  name: string;
  value: string;
};

export const COMPLETED = 'Completed';
export const ESCROW = 'In Escrow';
export const RECRUITING = 'Recruiting';
export const OPEN = 'Open';
export const CANCELED = 'Canceled';
export const RESERVED = 'Reserved';
export const WHOLESALE = 'wholesale';
export const DEED = 'deed';
export const TOKEN = 'token';
export const ADDRESS = 'address';
export const MANAGER = 'manager';
export const STATUS = 'status';
export const SIZE = 'size';
export const PROFIT = 'profit';
export const PROGRESS = 'progress';
export const WITHDRAWN = 'Withdrawn';

// sorting
export const ASCENDING = 'asc';
export const DESCENDING = 'desc';
export const END_DATE = 'endDate';

// filters
export const INVITE = 'Invite';
export const BOUNDED = 'Bounded';
export const MY = 'My';

export const PUB = 'Public';
export const PRIV = 'Private';

export const DEEDS_JOINED = 'Deeds Joined';
export const DEEDS_CREATED = 'Deeds Created';
export const DEEDS_STAKED = 'Deeds Staked';
export const JOINED = 'Joined';
export const STAKED = 'Staked';
export const CREATED = 'Created';

export const FIXED = 'Fixed';
export const FLOATING = 'Floating';

export const LEVERAGE = 'Leverage';

export const FIVE_X = '1x-5x';
export const TEN_X = '6x-10x';
export const TWENTY_X = '11x-20x';
export const GREATER_THAN_TWENTY_X = '>20x';

export const ALL_WHOLESALES = 'All Wholesales';
export const WHOLESALES_BOUNDED = 'Wholesales bounded to my Deeds';
export const MY_WHOLESALES = 'My Wholesales';
export const OPEN_WHOLESALES = 'Open Wholesales';
export const RESERVED_WHOLESALES = 'Reserved Wholesales';
export const COMPLETED_WHOLESALES = 'Completed Wholesales';
export const CANCELED_WHOLESALES = 'Canceled Wholesales';
export const WHOLESALE_INVITES = 'Wholesale Invites';
export const WHOLESALES_CREATED = 'Wholesales Created';
export const ALL = 'All';
export const PAIR = 'Pair';
export const ID = 'id';

export const SEARCH_ALL_DEED_FILTER = [ALL, PAIR, CFL(DEED) + ' ' + CFL(ADDRESS)];

export const SEARCH_PUBLIC_WHOLESALE_FILTER = [
  ALL,
  CFL(TOKEN),
  CFL(WHOLESALE) + ' ' + CFL(ID),
  CFL(WHOLESALE) + ' ' + CFL(MANAGER),
  CFL(DEED) + ' ' + CFL(ADDRESS),
];

export const SEARCH_PRIVATE_WHOLESALE_FILTER = [
  ALL,
  CFL(TOKEN),
  CFL(WHOLESALE) + ' ' + CFL(ADDRESS),
  CFL(DEED) + ' ' + CFL(ADDRESS),
];

export const PUBLIC_WHOLESALE_FILTER: FilterNameAndValue[] = [
  { name: OPEN_WHOLESALES, value: OPEN },
  { name: RESERVED_WHOLESALES, value: RESERVED },
  { name: COMPLETED_WHOLESALES, value: COMPLETED },
  { name: CANCELED_WHOLESALES, value: CANCELED },
];
export const PRIVATE_WHOLESALE_FILTER: FilterNameAndValue[] = [
  { name: WHOLESALES_CREATED, value: CREATED },
  { name: WHOLESALE_INVITES, value: INVITE },
  { name: WHOLESALES_BOUNDED, value: BOUNDED },
];

export const ACTION_FILTER: FilterNameAndValue[] = [
  { name: DEEDS_JOINED, value: JOINED },
  { name: DEEDS_STAKED, value: STAKED },
  { name: DEEDS_CREATED, value: CREATED },
];
export const STATUS_FILTER: FilterNameAndValue[] = [
  { name: RECRUITING, value: CFL(RECRUITING) },
  { name: ESCROW, value: CFL(ESCROW) },
  { name: OPEN, value: CFL(OPEN) },
  { name: COMPLETED, value: CFL(COMPLETED) },
  { name: CANCELED, value: CFL(CANCELED) },
];
export const DEED_TYPE_FILTER: FilterNameAndValue[] = [
  { name: FIXED, value: FIXED },
  { name: FLOATING, value: FLOATING },
];
export const LEVERAGE_FILTER: FilterNameAndValue[] = [
  { name: FIVE_X, value: '5' },
  { name: TEN_X, value: '10' },
  { name: TWENTY_X, value: '20' },
  { name: GREATER_THAN_TWENTY_X, value: '21' },
];

export const searchFilterOptions = [
  'All',
  CFL(TOKEN),
  CFL(WHOLESALE) + ' ' + CFL(ADDRESS),
  CFL(WHOLESALE) + ' ' + CFL(MANAGER),
  CFL(DEED) + ' ' + CFL(ADDRESS),
];

export const RECRUITING_STATUS = 0;
export const ESCROW_STATUS = 1;
export const OPEN_STATUS = 2;
export const COMPLETED_STATUS = 3;
export const CANCELLED_STATUS = 4;

export const TYPE_OF_COIN = [
  {
    name: 'ETH',
    icon: ETH_ICON,
    tokenAddress: '0x0000000000000000000000000000000000000000',
  },
  {
    name: 'BNB',
    icon: BNB_ICON,
    tokenAddress: '0x730129b9aE5A6B3Fa6a674a5dC33a84Cb1711D07',
  },
  {
    name: 'USDC',
    icon: USDC_ICON,
    tokenAddress: '0x248E7Fa5fB6De623d339c837299692fFB4ea5971',
  },
  {
    name: 'DAI',
    icon: DAI_ICON,
    tokenAddress: '0xDFEe9D9e9aC61980f4F43dD12B8F62Ade3D0B28B',
  },
  {
    name: 'USDT',
    icon: USDT_ICON,
    tokenAddress: '0xd35d2e839d888d1cDBAdef7dE118b87DfefeD20e',
  },
  {
    name: 'TKN1',
    tokenAddress: '0x0196674A7Ec59F821023F8eE03326d6d3907E656',
  },
  {
    name: 'TKN2',
    tokenAddress: '0xED18CD520eF5a46f358b555365912759FE54fE0A',
  },
  {
    name: 'DTOKEN',
    icon: DTOKEN_ICON,
    tokenAddress: '0x819242E08d84fC6C05389B84b85913B828439c90',
  },
  {
    name: 'WBTC',
    icon: WBTC_ICON,
    tokenAddress: '0xc36e25b6e3692a3310e173cb94bdd14662d5bf6a',
  },
  {
    name: 'WETH',
    icon: ETH_ICON,
    tokenAddress: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  },
];

export const TOKEN_TYPES = {
  ETH: {
    name: 'ETH',
    decimal: 18,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    oracelTokenAddress: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
  },
  BNB_TOKEN: {
    name: 'BNB',
    decimal: 18,
    tokenAddress: '0x730129b9aE5A6B3Fa6a674a5dC33a84Cb1711D07',
    oracelTokenAddress: '0xcf0f51ca2cDAecb464eeE4227f5295F2384F84ED',
  },
  USDC_TOKEN: {
    name: 'USDC',
    decimal: 6,
    tokenAddress: '0x248E7Fa5fB6De623d339c837299692fFB4ea5971',
    oracelTokenAddress: '0xa24de01df22b63d23Ebc1882a5E3d4ec0d907bFB',
  },
  DAI_TOKEN: {
    name: 'DAI',
    decimal: 18,
    tokenAddress: '0xDFEe9D9e9aC61980f4F43dD12B8F62Ade3D0B28B',
    oracelTokenAddress: '0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF',
  },
  USDT: {
    name: 'USDT',
    decimal: 6,
    tokenAddress: '0xd35d2e839d888d1cDBAdef7dE118b87DfefeD20e',
    oracelTokenAddress: '0xa24de01df22b63d23Ebc1882a5E3d4ec0d907bFB',
  },
  TKN1_TOKEN: {
    name: 'TKN1',
    decimal: 18,
    tokenAddress: '0x0196674A7Ec59F821023F8eE03326d6d3907E656',
    oracelTokenAddress: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
  },
  TKN2_TOKEN: {
    name: 'TKN2',
    decimal: 18,
    tokenAddress: '0xED18CD520eF5a46f358b555365912759FE54fE0A',
    oracelTokenAddress: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
  },
  DTOKEN: {
    name: 'DTOKEN',
    decimal: 18,
    tokenAddress: '0x819242E08d84fC6C05389B84b85913B828439c90',
  },
  WETH: {
    name: 'WETH',
    decimal: 18,
    tokenAddress: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  },
  WBTC: {
    name: 'WBTC',
    decimal: 8,
    tokenAddress: '0xc36e25b6e3692a3310e173cb94bdd14662d5bf6a',
  },
};

export const MAX_INT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
export const USD_EXCHANGE = {
  address: '0x0000000000000000000000000000000000000348',
  decimal: 6,
};

export const DTokenExchange = 1;
export const MAX_PRICE_DROP = 80;

export const MESSAGE_ERROR = [
  { name: 'WALLET_INVALID', content: 'Please use XXX network', code: 1000, wallet_code: 0 },
  {
    name: 'EMPTY',
    content: 'This [Field name] requires input',
    code: 1001,
    wallet_code: 0,
  },
  {
    name: 'NOT_ENOUGH_BALLANCE',
    content: 'Please deposite more [Field name] to process your request ',
    code: 1002,
    wallet_code: 0,
  },
  {
    name: 'INVALID',
    content: 'This [Field name] is invalid',
    code: 1003,
    wallet_code: 0,
  },
  {
    name: 'INFORMATION_NOT_EXISTED',
    content: 'No results found. Please try again',
    code: 1004,
    wallet_code: 0,
  },
  {
    name: 'WALLET_NOT_FOUND',
    content: 'Please connect your wallet to process your request.',
    code: 1005,
    wallet_code: 0,
  },
  {
    name: 'REJECT',
    content: 'This action has been declined by your wallet.',
    code: 1006,
    wallet_code: 4001,
  },
  {
    name: 'BLOCKCHAIN_ERROR',
    content: 'Something went wrong',
    code: 1007,
    wallet_code: -32603,
  },
];

export const BLOCKCHAIN_ERROR_MESSAGE = {
  BAD_BUY_TIME: {
    blockChainError: 'execution reverted: BAD_BUY_TIME',
    message: 'Please choose escrow end date time before wholesale end date time',
  },
  ALREADY_RESERVE: {
    blockChainError: 'execution reverted: ALREADY_RESERVE',
    message: 'This wholesale is already is not exist or reserved by other deed',
  },
  NOT_ENOUGH_BUY_IN: {
    blockChainError: 'execution reverted: amount too low',
    message: 'Total downpayment token Buyer joined is not met with required amount',
  },
  NOT_PERMITTED_TO_RESERVE: {
    blockChainError: 'execution reverted: Not permitted to reserve',
    message: 'This wholesale is private and only can be used by whitelisted Deed Manager.',
  },
  RECRUITING_END: {
    blockChainError: 'execution reverted: RECRUITING_ENDED',
    message: 'Time for recruiting phase is over. You cannot stake from now',
  },
  BUYIN_TIME_OVER: {
    blockChainError: 'execution reverted: BUYIN_TIME_OVER',
    message: 'Time for escrow phase is over. You cannot join deed from now',
  },
  DEED_FULL: {
    blockChainError: 'execution reverted: DEED_FULL',
    message: 'Deed is full. You cannot join this Deed.',
  },
  NOT_ENOUGH_LIQUIDITY: {
    blockChainError: 'execution reverted: Coindeed: not enough liquidity',
    message: 'The lending pool currently has not enough liquidity',
  },
  ERROR_RECRUITING_TIMESTAMP: {
    blockChainError: 'execution reverted: BAD_END',
    message: 'Please choose recruiting end date time after the current time',
  },
};

export const REGEX_GET_ALL_STRING = /[^0-9.]/g;
export const REGEX_ONLY_DOT = /(\..*)\./g;

export const WHOLESALE_OPEN = 0;
export const WHOLESALE_RESERVED = 1;
export const WHOLESALE_CANCELLED = 2;
export const WHOLESALE_COMPLETED = 3;
export const WHOLESALE_WITHDRAWN = 4;

export const SWAP_MODES = {
  DEX: 1,
  WHOLESALE: 2,
};

export const LIST_WALLET = {
  Metamask: { name: 'Metamask', icon: iconMetamask },
  WalletConnect: { name: 'WalletConnect', icon: iconWalletConnect },
  // CoinbaseWallet: { name: 'CoinbaseWallet', icon: iconCoinbaseWallet },
};

export const SORT_KEY_WS = {
  STATUS: 'state',
  IS_PRIVATE: 'isPrivate',
  SALE_ID: 'saleId',
  SIZE: 'sizeToken',
  DEADLINE: 'deadline',
};

export const SORT_DIRECTION = {
  ASC: 'ascend',
  DESC: 'descend',
};
