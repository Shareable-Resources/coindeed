import _ from 'lodash';
import { TOKEN_TYPES } from '../../utils/Constants';
import { genWholesaleContract } from '../instance';
import { convertPriceToBigDecimals } from '../utils';

//result = convertBigNumberValueToNumber(result.amount.toString(), 18);
export const createWholesale = async (data: any) => {
  try {
    const wholesaleContract = await genWholesaleContract();
    const listToken = _.values(TOKEN_TYPES);
    const tokenOff = _.find(listToken, function (o) {
      return _.toLower(o.tokenAddress) === _.toLower(data.tokenOffered);
    });
    const tokenReq = _.find(listToken, function (o) {
      return _.toLower(o.tokenAddress) === _.toLower(data.tokenRequested);
    });
    const offeredAmount = convertPriceToBigDecimals(data.offeredAmount, tokenOff?.decimal);
    const requestAmount = convertPriceToBigDecimals(data.requestedAmount, tokenReq?.decimal);
    const minSaleAmount = convertPriceToBigDecimals(data.minSaleAmount, tokenReq?.decimal);
    const create = await wholesaleContract.createWholesale(
      data.tokenOffered,
      data.tokenRequested,
      offeredAmount,
      requestAmount,
      minSaleAmount,
      data.deadline,
      '0x0000000000000000000000000000000000000000',
      data.reservedTo,
      data.reservedTo === '0x0000000000000000000000000000000000000000' ? false : true,
      data.timeLock,
    );

    return [create, null];
  } catch (error) {
    console.log('error', error);

    return [null, error];
  }
};

export const getWholesaleWithId = async (saleId: string) => {
  try {
    const wholesaleContract = await genWholesaleContract();

    const wholesale = await wholesaleContract.getWholesale(saleId);

    return [wholesale, null];
  } catch (error) {
    return [null, error];
  }
};

export const reserveWhosaleToDeed = async (saleId: string, deedAddress: string) => {
  try {
    const wholesaleContract = await genWholesaleContract();

    const reserve = await wholesaleContract.reserveWholesaleToDeed(saleId, deedAddress);

    return [reserve, null];
  } catch (error) {
    return [null, error];
  }
};

export const cancelWholesale = async (saleId: string) => {
  try {
    const wholesaleContract = await genWholesaleContract();

    const cancel = await wholesaleContract.cancelWholesale(saleId);

    return [cancel, null];
  } catch (error) {
    return [null, error];
  }
};

export const claimWholesale = async (saleId: string) => {
  try {
    const wholesaleContract = await genWholesaleContract();

    const claim = await wholesaleContract.withdraw(saleId);

    return [claim, null];
  } catch (error) {
    return [null, error];
  }
};

export const getPermit = async (saleId: string, userAddress: string) => {
  try {
    const wholesaleContract = await genWholesaleContract();

    const permit = await wholesaleContract.permittedDeedManager(saleId, userAddress);

    return [permit, null];
  } catch (error) {
    return [null, error];
  }
};
