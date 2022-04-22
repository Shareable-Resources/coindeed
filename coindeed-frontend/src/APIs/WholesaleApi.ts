import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_BACKEND_API_URL;

const url = `${BASE_URL}/wholesales`;

export const getWholesale = async (id: string) => {
  try {
    const response = await axios.get(url + `/${id}`);
    return [response.data, null];
  } catch (error) {
    return [null, error];
  }
};

export const getPurchasedTokens = async () => {
  try {
    const response = await axios.get(url + '/purchase-tokens');
    return [response.data, null];
  } catch (error) {
    return [null, error];
  }
};

export const getDepositTokens = async () => {
  return axios
    .get(url + '/deposit-tokens')
    .then(res => {
      return res.data;
    })
    .catch(err => {
      console.log(err);
    });
};

export const importToken = async (data: any) => {
  return axios
    .post(url + '/import-token', data)
    .then(res => {
      return res;
    })
    .catch(err => {
      return err.response;
    });
};

export const getDepositToken = async (name: string) => {
  return axios
    .get(`${url}/deposit-token?tokenName=${name}`)
    .then(res => {
      return res.data;
    })
    .catch(err => {
      console.log(err);
    });
};

export const getPurchasedToken = async (name: string) => {
  return axios
    .get(`${url}/purchase-token?tokenName=${name}`)
    .then(res => {
      return res.data;
    })
    .catch(err => {
      console.log(err);
    });
};
