import { genDeedContract } from '../blockchain/instance';
import { convertBigNumberValueToNumber, getTokenDecimalsV2 } from '../blockchain/utils';
import { TOKEN_TYPES } from './Constants';


// Deed manager is a person who created Deed
export const isDeedManager = async (walletAddress: string, deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.manager();

    if (response === walletAddress) return true;
    return false;
  } catch (error) {
    return false;
  }
};

// Broker is a person who joined Deed in Recruiting Phase by staking some quantity of Dtoken
export const isBroker = async (walletAddress: string, deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const manager = await deedContractInstance.manager();
    const response = await deedContractInstance.stakes(walletAddress);
    const result = convertBigNumberValueToNumber(response, TOKEN_TYPES.DTOKEN.decimal);

    if (result > 0 && manager !== walletAddress) return true;
    return false;
  } catch (error) {
    return false;
  }
};

// Buyer is person who joined Deed in Escrow phase by deposit Downpayment Token
export const isBuyer = async (walletAddress: string, deedAddress: string, downpaymentTokenAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);

    const joinedDeedAmount = await deedContractInstance.buyIns(walletAddress)
    const [decimalDownpayToken]: any = await getTokenDecimalsV2(downpaymentTokenAddress)

    const formatedValue = convertBigNumberValueToNumber(joinedDeedAmount, decimalDownpayToken)

    if (formatedValue > 0) return true;
    return false;
  } catch (error) {
    return false;
  }
};

export const getCurrentDeedState = async (walletAddress: string, deedAddress: string) => {
  try {
    const deedContractInstance = await genDeedContract(deedAddress);
    const response = await deedContractInstance.state(walletAddress);

    return response;
  } catch (error) {
    return 0;
  }
};
