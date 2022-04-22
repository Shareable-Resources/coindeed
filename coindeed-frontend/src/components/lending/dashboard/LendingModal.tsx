/* eslint-disable react-hooks/exhaustive-deps */
import { Modal } from 'antd';
import { ChangeEvent, useEffect, useImperativeHandle, useState } from 'react';
import { LendingPool } from '../../../APIs/LendingPoolApi';
import {
  claimDToken,
  getBalanceOfToken,
  deposit as depositService,
  withdraw as withdrawService,
  getBalanceOfUser,
  getEstimateGasOfDeposit,
  pendingDToken,
  pendingToken,
  getAPYInfo,
  getCurrentSupply,
} from '../../../blockchain/services/LendingPoolService';
import {
  handleUserApproveToken,
  isUserApprovedToken,
  getIconOfTokenAddress,
  getExchangeRateWithUSD,
} from '../../../blockchain/utils';
import { REGEX_GET_ALL_STRING, REGEX_ONLY_DOT, TOKEN_TYPES } from '../../../utils/Constants';
import { NumberToFixedFormater } from '../../../utils/Formatters';
import CustomButton from '../../global/antd/CustomButton';
import { message } from '../../global/antd/Message';
import InputAmountTokens from '../../global/InputAmountTokens';
import ApproveStepsModal from '../../global/modal/ApproveStepsModal';
import PendingModal from '../../global/modal/PendingModal';
import { loginRequired } from '../../../services/wallet';
import { useSelector } from 'react-redux';

function IconClose(props: any) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='12'
      height='12'
      viewBox='0 0 12 12'
      fill='currentColor'
      className='w-full h-full'
      {...props}
    >
      <path d='M7.54278 6L11.6805 1.8623C12.1065 1.43627 12.1065 0.745546 11.6805 0.31952C11.2545 -0.106506 10.5637 -0.106507 10.1377 0.31952L6 4.45722L1.8623 0.31952C1.43627 -0.106506 0.745546 -0.106506 0.31952 0.31952C-0.106507 0.745547 -0.106507 1.43627 0.31952 1.8623L4.45722 6L0.31952 10.1377C-0.106507 10.5637 -0.106506 11.2545 0.31952 11.6805C0.745547 12.1065 1.43627 12.1065 1.8623 11.6805L6 7.54278L10.1377 11.6805C10.5637 12.1065 11.2545 12.1065 11.6805 11.6805C12.1065 11.2545 12.1065 10.5637 11.6805 10.1377L7.54278 6Z' />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width='10' height='8' viewBox='0 0 10 8' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M5.7271 8L9.54528 4.18182L5.7271 0.363636L5.07085 1.01989L7.77255 3.71307H0.775391V4.65057H7.77255L5.07085 7.35227L5.7271 8Z' />
    </svg>
  );
}

export default function LendingModal({ refModal, refreshDataLendingPool }: any) {
  const withdraw = 'Withdraw';
  const supply = 'Supply';
  const tabs = [supply, withdraw];
  const [isTab, setIsTab] = useState('Supply');
  const [visible, setVisible] = useState(false);
  /*  */
  const [ExchangePrice, setExchangePrice] = useState(0);
  const [maxValueInPool, setMaxValueInPool] = useState(0);
  /*  */
  const [Balance, setBalance] = useState(0);
  const [pool, setPool] = useState<any>({ interestEarned: 0, interestEarned2: 0, APY: 0, supplyBalance: 0 });
  const [tokenFake, setTokenFake] = useState<LendingPool | undefined>(undefined);
  /*  */
  const [amountValue, setAmountValue] = useState<any>('');
  const [validate, setValidate] = useState<Array<string>>([]);
  const [visibleValidate, setvisibleValidate] = useState(false);
  /*  */
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const [authorized, setAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirm, setIsConfirm] = useState(true);
  const [txId, setTxId] = useState<string>('');

  /* ==== */

  const getWalletBalance = async (token: LendingPool) => {
    if (!token) return;
    const [value] = await getBalanceOfUser(token.tokenAddress, token.decimals);
    setBalance(Number(value));
  };
  const getMaxValueInPool = async (token: LendingPool) => {
    if (!token) return;
    const [value] = await getBalanceOfToken(token.tokenAddress, token.decimals);
    setMaxValueInPool(Number(value));
  };
  const getPool = async (token: LendingPool) => {
    if (!token) return;
    const data = await Promise.all([
      pendingDToken(token),
      pendingToken(token),
      getAPYInfo(token),
      getCurrentSupply(token),
    ]);

    setPool({
      token,
      interestEarned: data[0][0],
      interestEarned2: data[1][0],
      APY: data[2][0],
      supplyBalance: data[3][0] || 0,
    });
  };

  /*  */

  const formatSupplyBalance = (value: any) => {
    const result = NumberToFixedFormater(value, 2, true);
    return value > 0 ? result : 0;
  };

  /* ==== */

  const maxAmount = async () => {
    try {
      let balance: any = 0;

      if (isTab === withdraw) {
        balance = pool.supplyBalance;
        if (balance > maxValueInPool) balance = maxValueInPool;
      } else if (isTab === supply) {
        balance = Balance as any;
        if ((pool?.token?.tokenAddress || tokenFake?.tokenAddress) === TOKEN_TYPES.ETH.tokenAddress) {
          const ETH = TOKEN_TYPES.ETH;
          const token: LendingPool = {
            id: 0,
            name: ETH.name,
            decimals: ETH.decimal,
            tokenAddress: ETH.tokenAddress,
            oracelTokenAddress: ETH.oracelTokenAddress,
          };
          let [gas, error]: any = await getEstimateGasOfDeposit(token, balance);
          if (error) gas = 0.01;
          balance = Number(balance) <= gas ? '0' : String(Number(balance) - gas);
        }
      }

      balance = Number(balance).toFixed(pool?.token?.decimals || tokenFake?.decimals || 0);
      balance = balance.split('.');
      if (balance[1].length > 0) {
        balance[1] = balance[1].slice(0, 6);
        balance = balance[0] + '.' + balance[1];
      }
      balance = balance.replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
      setAmountValue(balance);
    } catch (error) {
      console.error(error);
    } finally {
      setvisibleValidate(true);
    }
  };
  const handleOnInput = (e: ChangeEvent<HTMLInputElement>) => {
    const amount = e.currentTarget.value.replace(REGEX_GET_ALL_STRING, '').replace(REGEX_ONLY_DOT, '$1');
    const arr = amount.split('.');

    if (!arr[1] || (arr[1].length > 0 && arr[1].length <= 6)) {
      amount !== null ? setAmountValue(amount) : setAmountValue(amountValue);
    }
  };

  const submit = async () => {
    try {
      await loginRequired();
      if (isLoading || checkValid().length) return;
      setIsLoading(true);

      if (isTab === withdraw && amountValue > maxValueInPool) {
        message('error', 'Your input can not be higher than cash amount.');
        setIsLoading(false);
        return;
      }

      const [result, error]: any =
        isTab === withdraw
          ? await withdrawService(pool.token, amountValue)
          : await depositService(pool.token, amountValue);

      if (result === null) {
        message('error', '', error.code);
        setIsLoading(false);
        return;
      }

      setIsConfirm(false);
      setTxId(result.hash);
      await result.wait(1);
      // message('success', `You have successfully ${isTab === withdraw ? 'withdraw' : 'deposit'} this pool.`);
      setIsLoading(false);
      setIsConfirm(true);
      setVisible(false);

      refreshDataLendingPool();
      getPool(pool.token.tokenAddress);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const doClaimDToken = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      const [result, error] = (await claimDToken(pool.token.tokenAddress)) as any;

      if (result === null) {
        message('error', '', error.code);
        setIsLoading(false);
        return;
      }

      setIsConfirm(false);
      setTxId(result.hash);
      await result.wait(1);
      // message('success', `You have successfully claimed Dtoken to your wallet.`);
      setIsLoading(false);
      setIsConfirm(true);

      refreshDataLendingPool();
      getPool(pool.token.tokenAddress);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const doUserApproveERC20Token = async (tokenAddress: string) => {
    try {
      setIsLoading(true);
      const [result, error]: any = await handleUserApproveToken(tokenAddress);

      if (result === null) {
        message('error', '', error.code);
        setIsLoading(false);
        return;
      }

      setIsConfirm(false);
      setTxId(result.hash);
      await result.wait(1);
      // message('success', 'You have successfully approved this pool.');
      setIsLoading(false);
      checkUserApproveERC20Token(pool.token.tokenAddress);
      setIsConfirm(true);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const checkValid = () => {
    const value = [];
    if (amountValue === '') value.push('This field requires input.');
    if (Number(amountValue) === 0) value.push('Your input cannot be zero.');
    if ((isTab === withdraw && amountValue > pool.supplyBalance) || (isTab === supply && amountValue > Balance)) {
      value.push('Insufficient balance. Please enter a valid amount.');
    }

    setValidate(value);
    return value;
  };
  const checkUserApproveERC20Token = async (tokenAddress: string) => {
    let isApproved = false;
    if (tokenAddress === TOKEN_TYPES.ETH.tokenAddress) {
      isApproved = true;
    } else {
      isApproved = await isUserApprovedToken(tokenAddress);
    }
    setAuthorized(isApproved);
  };

  /* ==== */

  useImperativeHandle(refModal, () => ({
    async open(token: LendingPool) {
      setTokenFake(token);
      setVisible(true);
      await reloadData(token);
    },
    reloadData() {
      const address = pool?.token || tokenFake;
      if (visible && address) reloadData(address);
    },
  }));

  async function reloadData(token: LendingPool) {
    (async () => {
      const [exchange] = (await getExchangeRateWithUSD(token.tokenAddress)) as any;
      setExchangePrice(exchange);
    })();

    checkUserApproveERC20Token(token.tokenAddress);
    getMaxValueInPool(token);
    getWalletBalance(token);
    await getPool(token);
  }

  useEffect(() => {
    checkValid();
  }, [amountValue]);

  useEffect(() => {
    setAmountValue('');
    setValidate([]);
    setvisibleValidate(false);
  }, [isTab]);

  useEffect(() => {
    if (!visible) {
      setIsTab(supply);

      setExchangePrice(0);
      setMaxValueInPool(0);

      setBalance(0);
      setPool({ interestEarned: 0, interestEarned2: 0, APY: 0, supplyBalance: 0 });
      setTokenFake(undefined);

      setAmountValue('');
      setValidate([]);
      setvisibleValidate(false);

      setAuthorized(false);
    } else {
    }
  }, [visible]);

  useEffect(() => {
    if (!visibleValidate) setValidate([]);
  }, [visibleValidate]);

  return (
    <Modal
      visible={visible}
      closable={false}
      destroyOnClose={true}
      footer={null}
      bodyStyle={{ padding: 0, background: 'transparent', display: 'flex' }}
      maskStyle={{ background: '#6b7280bf' }}
      width={'576px'}
      zIndex={4}
    >
      <div className='bg-background text-white mx-auto inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg w-full sm:p-10 lg:max-w-xl'>
        <div className='mb-8 flex items-center justify-between'>
          <div className='flex items-center'>
            {getIconOfTokenAddress(pool?.token?.tokenAddress || tokenFake?.tokenAddress) && (
              <img
                src={getIconOfTokenAddress(pool?.token?.tokenAddress || tokenFake?.tokenAddress)}
                hidden={!getIconOfTokenAddress(pool?.token?.tokenAddress || tokenFake?.tokenAddress)}
                className={`w-7 h-7 mr-2`}
                draggable='false'
                loading='lazy'
                alt=''
              />
            )}
            <h1 className='text-white text-2xl leading-6 font-medium mb-0'>
              {pool?.token?.name || tokenFake?.name || ''}
            </h1>
          </div>

          <button className='flex w-8 h-8' onClick={() => setVisible(false)}>
            <IconClose className='w-3 h-3 m-auto' />
          </button>
        </div>

        <hr className='opacity-20' />

        <div className='mt-7 mb-5 flex justify-center space-x-3 mx-auto' style={{ maxWidth: '260px' }}>
          {tabs.map(tabName => (
            <div
              key={tabName}
              onClick={() => {
                if (pool.supplyBalance <= 0 && tabName === withdraw) return;
                setIsTab(tabName);
              }}
              className={`
                  ${isTab === tabName ? 'bg-secondary' : 'bg-tabInactive'}
                  flex-1 px-6 py-2 text-white font-medium text-sm rounded-t-lg text-center border-b-2 border-white cursor-pointer
                  ${pool.supplyBalance <= 0 && tabName === withdraw ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
              {tabName}
            </div>
          ))}
        </div>

        <div className='bg-background-2 border border-white border-opacity-20 rounded-lg px-14 py-5'>
          <div className='flex w-100 justify-start text-xs mb-3'>
            <div className='opacity-70'>Supply APY</div>
            <div className='ml-auto'>{`${NumberToFixedFormater(pool.APY * 100, 2, true)} %`}</div>
          </div>

          <div className='flex w-100 justify-start text-xs mb-3'>
            <div className='opacity-70'>Price</div>
            <div className='ml-auto'>{`$${NumberToFixedFormater(ExchangePrice, 2, true)}`}</div>
          </div>

          {isTab === withdraw ? (
            <div>
              <div className='flex w-100 justify-start text-xs mb-3'>
                <div className='opacity-70'>Currently Supplying</div>
                <div className='ml-auto'>{`${NumberToFixedFormater(
                  Number(pool.supplyBalance).toFixed(pool?.token?.decimals || tokenFake?.decimals || 0),
                  6,
                  false,
                  true,
                )} ${pool?.token?.name || tokenFake?.name || ''}`}</div>
              </div>

              <div className='flex w-100 justify-start text-xs mt-6 mb-3'>
                <div className='opacity-70'>Interest Earned</div>
                <div className='ml-auto text-right'>
                  {NumberToFixedFormater(
                    Number(pool.interestEarned).toFixed(TOKEN_TYPES.DTOKEN.decimal),
                    6,
                    false,
                    true,
                  )}{' '}
                  DToken
                  <br />
                  {NumberToFixedFormater(
                    Number(pool.interestEarned2).toFixed(pool?.token?.decimals || tokenFake?.decimals || 0),
                    6,
                    false,
                    true,
                  )}{' '}
                  {pool?.token?.name || tokenFake?.name || ''}
                </div>
              </div>

              <div className='text-right'>
                <p
                  onClick={doClaimDToken}
                  className='w-max text-xs mb-0 ml-auto text-gray-300 underline italic cursor-pointer'
                >
                  Claim Interest?
                </p>
              </div>
            </div>
          ) : (
            <div className='flex w-100 justify-start text-xs mb-3'>
              <div className='opacity-70'>Wallet Balance</div>
              <div className='ml-auto'>{`${
                userAddress
                  ? NumberToFixedFormater(
                      Number(Balance).toFixed(pool?.token?.decimals || tokenFake?.decimals || 0),
                      6,
                      false,
                      true,
                    )
                  : 0
              } ${pool?.token?.name || tokenFake?.name || ''}`}</div>
            </div>
          )}

          <div className='mt-6 mb-5 mx-auto relative' style={{ maxWidth: '260px' }}>
            <InputAmountTokens
              isError={!!(validate.length && visibleValidate)}
              placeholder='Enter Amount'
              suffix={pool?.token?.name || tokenFake?.name || ''}
              onInput={handleOnInput}
              value={amountValue}
              onChange={() => setvisibleValidate(true)}
              onClickButton={maxAmount}
              textButton='MAX'
            />
            <div className='text-red-500 text-xs my-2' hidden={!visibleValidate}>
              {validate[0]}
            </div>
          </div>

          {(amountValue > 0 || isTab === withdraw) && (
            <>
              <h3 className='text-white text-xs mt-6 mb-4'>Supply Balance</h3>
              <div className='text-white flex justify-between items-center text-xs mx-12'>
                <div>${formatSupplyBalance(pool.supplyBalance * ExchangePrice)}</div>
                {amountValue > 0 && (
                  <>
                    <IconArrowRight />
                    <div>
                      {isTab === withdraw
                        ? '$' + formatSupplyBalance((pool.supplyBalance - Number(amountValue)) * ExchangePrice)
                        : '$' + formatSupplyBalance((pool.supplyBalance + Number(amountValue)) * ExchangePrice)}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {isTab === withdraw && (
            <div className='mt-6 text-xs text-white'>
              <p className='text-left mb-2'>You will receive:</p>
              <div className='flex items-center justify-between opacity-70'>
                <p>Withdraw Amount</p>
                <p>
                  {amountValue
                    ? `${NumberToFixedFormater(amountValue, 6)} ${pool?.token?.name || tokenFake?.name || ''}`
                    : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {(pool?.token?.tokenAddress || tokenFake?.tokenAddress) !== TOKEN_TYPES.ETH.tokenAddress && (
          <>
            <hr className='opacity-20 mt-5' />
            <ApproveStepsModal
              isApproveToken={authorized}
              title1='Approve'
              title2={isTab === withdraw ? 'Withdraw' : 'Supply'}
            />
          </>
        )}

        <div className='mt-5 mb-0 text-center'>
          {authorized ? (
            <CustomButton
              customType='OkButton'
              type='submit'
              className={`${
                isLoading ||
                validate.length ||
                amountValue === undefined ||
                amountValue <= 0 ||
                String(amountValue).length <= 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={
                isLoading ||
                validate.length > 0 ||
                amountValue === undefined ||
                amountValue <= 0 ||
                String(amountValue).length <= 0
              }
              onClick={submit}
            >
              {isTab === withdraw && isLoading
                ? 'Withdrawing'
                : isTab === withdraw && !isLoading
                ? 'Withdraw'
                : isTab === supply && isLoading
                ? 'Supplying'
                : 'Supply'}
            </CustomButton>
          ) : (
            <CustomButton
              customType='OkButton'
              type='button'
              className={`${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => doUserApproveERC20Token(pool?.token?.tokenAddress || tokenFake?.tokenAddress)}
              disabled={isLoading}
            >
              {isLoading ? 'Approving' : 'Approve'}
            </CustomButton>
          )}
        </div>
      </div>

      <PendingModal open={isLoading} setOpen={setIsLoading} isConfirm={isConfirm} txId={txId} />
    </Modal>
  );
}
