import axios from 'axios';

const url = 'https://api.coindeed.io/lending-pool';

export interface LendingPool {
  id: number;
  name: string;
  decimals: number;
  tokenAddress: string;
  oracelTokenAddress: string;
}

export const getListLendingPools = async ({
  keyword,
  skip,
  take,
}: {
  keyword?: string;
  skip?: number;
  take?: number;
}) => {
  return await axios
    .get(url, { params: { keyword, skip, take } })
    .then(res => [res.data, null])
    .catch(error => [null, error]);
};

export const getLendingPoolByTokenAddress = async (tokenAddress: string) => {
  return await axios
    .get(url + '/token-address/' + tokenAddress)
    .then(res => [res.data, null])
    .catch(error => [null, error]);
};

export const getLendingPoolByOracelTokenAddress = async (oracelTokenAddress: string) => {
  return await axios
    .get(url + '/oracel-token-address/' + oracelTokenAddress)
    .then(res => [res.data, null])
    .catch(error => [null, error]);
};
