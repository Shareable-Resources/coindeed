import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import {
  convertBigNumberValueToNumber,
  getTokenDecimalsV2,
  handleUserApproveToken,
  isUserApprovedToken,
} from '../../../../blockchain/utils';
import { createWholesale } from '../../../../blockchain/services/WholesaleService';
import { getBalanceOfUser } from '../../../../blockchain/utils';
import { message } from '../../../global/antd/Message';
import PendingModal from '../../../global/modal/PendingModal';
import { Modal, Form, Button, Radio, Space, Tooltip } from 'antd';
import './style.css';
import { CustomInput } from '../../../global/antd/CustomInput';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';
import _ from 'lodash';
import ImportTokenModal from '../../../global/modal/ImportTokenModal';
import moment from 'moment';
import { generateTokenNameByAddress } from '../../../../utils/helper';
import { NumberToFixedFormater } from '../../../../utils/Formatters';
import { TOKEN_TYPES } from '../../../../utils/Constants';
import { useSelector } from 'react-redux';
import infoIcon from '../../../../images/icons/infoIcon.svg';

type WholesaleCreateModalProps = {
  openCreate: boolean;
  setOpenCreate: Dispatch<SetStateAction<boolean>>;
  purchaseToken: any;
  depositToken: any;
  getWholesaleToken: any;
  setIsCreatedWS: Dispatch<SetStateAction<boolean>>;
};

const WHOLESALE_ADDRESS = process.env.REACT_APP_WHOLESALE_ADDRESS;

export const WholesaleCreateModal = ({
  openCreate,
  setOpenCreate,
  purchaseToken,
  depositToken,
  getWholesaleToken,
  setIsCreatedWS,
}: WholesaleCreateModalProps) => {
  const [form] = Form.useForm();
  const [authorized, setAuthorized] = useState<boolean>(false);
  // inputs
  const [priv, setPriv] = useState<number>(0);
  const [enableTimeLock, setEnableTimeLock] = useState<number>(0);
  const [tokenOffer, setTokenOffer] = useState<string | undefined>(TOKEN_TYPES.BNB_TOKEN.tokenAddress);
  const [tokenRequest, setTokenRequest] = useState<string | undefined>(TOKEN_TYPES.ETH.tokenAddress);
  const [isApproving, setIsApproving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isOpenPendingModal, setIsOpenPendingModal] = useState(false);
  const [isConfirm, setIsConfirm] = useState(true);
  const [txId, setTxId] = useState<string>('');
  const [openImport, setOpenImport] = useState(false);
  const [size, setSize] = useState<string>('');
  const [pricePer, setPricePer] = useState<string>('');
  const [timeLock, setTimeLock] = useState<string>('');
  const [miniumReq, setMiniumReq] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<any>(0);
  const [dataTokenOffer, setDataTokenOffer] = useState<any>([]);
  const [dataTokenRequest, setDataTokenRequest] = useState<any>([]);
  const [deedManager, setDeedManager] = useState<string>('');

  const userLogin = useSelector((state: any) => state.wallet.userAddress);

  useEffect(() => {
    const data = purchaseToken.map((e: any) => {
      return {
        ...e,
        title: e.name,
        value: e.address,
      };
    });
    setDataTokenOffer(data.filter((e: any) => e.isActive === true));
  }, [purchaseToken]);

  useEffect(() => {
    const data = depositToken.map((e: any) => {
      return {
        ...e,
        title: e.name,
        value: e.address,
      };
    });
    setDataTokenRequest(data);
  }, [depositToken]);

  useEffect(() => {
    const checkUserApprove = async () => {
      if (tokenOffer) {
        const isApproved = await isUserApprovedToken(tokenOffer, WHOLESALE_ADDRESS);
        setAuthorized(isApproved);
      }
    };
    const getDecimal = async () => {
      const [result] = await getTokenDecimalsV2(tokenOffer as string);
      if (result !== null) {
        checkWalletBalance(result as any);
      }
    };
    const checkWalletBalance = async (decimal: number) => {
      if (userLogin && decimal) {
        const [value] = await getBalanceOfUser(tokenOffer as string, userLogin);
        if (value !== null) {
          setWalletBalance(convertBigNumberValueToNumber((value as any).toString(), decimal));
        }
      }
    };
    getDecimal();
    checkUserApprove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproving, tokenOffer, openCreate]);

  const doUserApprove = async () => {
    setIsApproving(true);
    setIsOpenPendingModal(true);
    let result;
    let error;
    if (tokenOffer) {
      const [res, errorApprove]: any = await handleUserApproveToken(tokenOffer, WHOLESALE_ADDRESS);
      result = res;
      error = errorApprove;
    }

    if (result === null) {
      message('error', '', error.code);
      setIsOpenPendingModal(false);
      setIsApproving(false);
      return;
    }

    setIsConfirm(false);
    setTxId(result.hash);
    await result.wait(1);
    message('success', 'You have successfully approved this pool.');
    setIsOpenPendingModal(false);
    setIsConfirm(true);
    setIsApproving(false);
  };

  const layout = {
    wrapperCol: { span: 24 },
  };

  const onFinish = async (values: any) => {
    const offer = tokenOffer;
    const request = '0x0000000000000000000000000000000000000000';
    let requestAmount = 0;
    if (values.size && values.sizePricePer) {
      requestAmount = parseFloat(size) * parseFloat(pricePer);
    }
    const data = {
      tokenOffered: offer,
      tokenRequested: tokenRequest,
      offeredAmount: parseFloat(size),
      requestedAmount: requestAmount,
      minSaleAmount: parseFloat(miniumReq),
      deadline: moment(values.endDate).unix(),
      reservedTo: priv === 0 ? request : deedManager,
      timeLock: enableTimeLock === 0 ? 0 : parseFloat(timeLock) * 86400,
    };

    setIsCreating(true);
    setIsOpenPendingModal(true);
    const [result, error]: any = await createWholesale(data);
    if (error) {
      setIsCreating(false);
      setIsOpenPendingModal(false);

      // show error message from blockchain
      if (error?.error?.message) {
        return message('error', JSON.stringify(error.error.message), Number(JSON.stringify(error.error.code)));
      }

      return message('error', '', error?.code);
    }
    setIsConfirm(false);
    setTxId(result.hash);
    await result.wait(1);
    message('success', 'You have successfully created wholesale.');
    setIsOpenPendingModal(false);
    setIsConfirm(true);
    setIsCreating(false);
    setOpenCreate(false);
    setIsCreatedWS(true);
  };

  const validateAmount = (_: any, value: any) => {
    const regex = /[A-Za-z]/g;
    if (parseFloat(value) <= parseFloat(walletBalance)) {
      if (value.length === 0) {
        return Promise.reject(new Error('This field requires input.'));
      }
      if (parseFloat(value) === 0) {
        return Promise.reject(new Error('Your input cannot be zero.'));
      }
      return Promise.resolve();
    }
    if (value === undefined || value === '' || value === ' ' || (value.length === 1 && regex.test(value)))
      return Promise.reject(new Error('This field requires input.'));
    return Promise.reject(new Error('Insufficient wallet balance.'));
  };

  const validatePrice = (_: any, value: any) => {
    const regex = /[A-Za-z]/g;
    if (parseFloat(value) === 0) {
      return Promise.reject(new Error('Your input cannot be zero.'));
    }
    if (value === undefined || value === '' || value === ' ' || (value.length === 1 && regex.test(value)))
      return Promise.reject(new Error('This field requires input.'));
    return Promise.resolve();
  };

  const validateDuration = (_: any, value: any) => {
    const regex = /[A-Za-z]/g;
    if (enableTimeLock) {
      if (parseFloat(value) === 0) {
        return Promise.reject(new Error('Your input cannot be zero.'));
      }
      if (value === undefined || value === '' || value === ' ' || (value.length === 1 && regex.test(value)))
        return Promise.reject(new Error('This field requires input.'));
    }
    return Promise.resolve();
  };

  const validateMin = (_: any, value: any) => {
    const regex = /[A-Za-z]/g;

    if (parseFloat(value) > parseFloat(size) * parseFloat(pricePer)) {
      return Promise.reject(
        new Error('Your minimum deed requirement cannot exceed the number of tokens you are providing.'),
      );
    }
    if (value === undefined || value === '' || value === ' ' || (value.length === 1 && regex.test(value))) {
      return Promise.reject(new Error('This field requires input.'));
    }
    if (parseFloat(value) === 0) {
      return Promise.reject(new Error('Your input cannot be zero.'));
    }
    return Promise.resolve();
  };

  const validateWholesaleType = (_: any, value: any) => {
    if (priv) {
      if (value === undefined || value.length === 0 || value === '' || value === ' ')
        return Promise.reject(new Error('This field requires input.'));
      // if (value.length !== 42) return Promise.reject(new Error('Invalid address.'));
    }
    return Promise.resolve();
  };

  const validateDate = (_: any, value: any) => {
    const diffTime = moment().diff(value) * -1;
    if (diffTime > 0) return Promise.resolve();
    if (value === undefined) return Promise.reject(new Error('Please select date.'));
    return Promise.reject(new Error('Please select a later date.'));
  };

  const validateTokenOffer = (_: any, value: any) => {
    if (value && value.toLowerCase() === tokenRequest?.toLowerCase()) {
      return Promise.reject(new Error('Please select another token.'));
    }
    return Promise.resolve();
  };

  const validateTokenRequest = (_: any, value: any) => {
    if (value && value.toLowerCase() === tokenOffer?.toLowerCase()) {
      return Promise.reject(new Error('Please select another token.'));
    }
    return Promise.resolve();
  };

  useEffect(() => {
    form.resetFields();
    setPriv(0);
    setDeedManager('');
    setTokenOffer(TOKEN_TYPES.BNB_TOKEN.tokenAddress);
    setTokenRequest(TOKEN_TYPES.ETH.tokenAddress);
    setSize('');
    setPricePer('');
    setMiniumReq('');
    setTimeLock('');
    // eslint-disable-next-line
  }, [openCreate]);

  useEffect(() => {
    form.validateFields(['tokenOffer']);
    form.validateFields(['tokenRequest']);
    // eslint-disable-next-line
  }, [tokenOffer, tokenRequest]);

  useEffect(() => {
    if (size && pricePer && miniumReq) {
      form.validateFields(['miniumReq']);
    }
    // eslint-disable-next-line
  }, [size, pricePer]);

  return (
    <Modal
      className='create-wholesale'
      centered
      visible={openCreate}
      onOk={() => setOpenCreate(false)}
      onCancel={() => setOpenCreate(false)}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      maskStyle={{ background: '#6b7280bf' }}
      closeIcon={
        <button
          type='button'
          className='px-2 py-1 rounded-md text-gray-400 hover:text-red-500 focus:outline-none'
          onClick={() => setOpenCreate(false)}
        >
          <span className='sr-only'>Close</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 text-white'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      }
    >
      <div className='hidden sm:block absolute top-0 right-0 pt-4 pr-4'></div>
      <div className='sm:flex sm:items-start text-white'>
        <div className='mt-3'>
          <div className='text-2xl leading-6 font-medium text-white'>Create Wholesale</div>
          <div className='hr-tag-fake' />
          <Form
            {...layout}
            layout='vertical'
            name='wholesale'
            form={form}
            onFinish={onFinish}
            fields={[
              {
                name: ['tokenOffer'],
                value: tokenOffer?.toLowerCase(),
              },
              {
                name: ['tokenRequest'],
                value: tokenRequest,
              },
              {
                name: ['size'],
                value: size,
              },
            ]}
            onValuesChange={(changeValue: any) => {
              if (_.keys(changeValue)[0] === 'tokenOffer') {
                setTokenOffer(changeValue.tokenOffer);
              }
              if (_.keys(changeValue)[0] === 'tokenRequest') {
                setTokenRequest(changeValue.tokenRequest);
              }
            }}
          >
            <div className='mt-8'>
              <div className='box-form'>
                <div className='grid grid-cols-1 mb-1 sm:grid-cols-2'>
                  <div className='label text-left text-sm mt-3'>Wholesale Type</div>
                </div>

                <div className='flex flex-col md:flex-row items-start md:items-center justify-center mb-6'>
                  <Radio.Group
                    onChange={e => {
                      setPriv(e.target.value);
                      setDeedManager('');
                    }}
                    value={priv}
                  >
                    <Space direction='vertical'>
                      <Radio className='first-radio' value={0}>
                        Public
                      </Radio>
                      <Radio value={1}>Private</Radio>
                    </Space>
                  </Radio.Group>
                  <div className={`w-full mt-4`}>
                    <div className='relative rounded-md shadow-sm'>
                      <Form.Item name={['deedAddress']} rules={[{ validator: validateWholesaleType }]}>
                        <CustomInput
                          type='text'
                          classNameCustom={`input-custom`}
                          placeholder='Deed Manager Address'
                          disabled={priv === 0 ? true : false}
                          suffix='Required'
                          inputValue={deedManager}
                          setInputValue={setDeedManager}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className='grid gap-4 grid-cols-1 mt-4 md:grid-cols-2'>
                  <Form.Item name={['tokenOffer']} rules={[{ validator: validateTokenOffer }]}>
                    <CustomInput title='Wholesale Token' type='select' dataOption={dataTokenOffer} />
                  </Form.Item>
                  <Form.Item name={['tokenRequest']} rules={[{ validator: validateTokenRequest }]}>
                    <CustomInput title='Received Token' type='select' dataOption={dataTokenRequest} />
                  </Form.Item>
                </div>
                <div className='grid gap-4 grid-cols-1 mb-4 md:grid-cols-24'>
                  <div className='import_your_token'>
                    Don’t see your token?&nbsp;&nbsp;
                    <div className='cursor-pointer' onClick={() => setOpenImport(true)}>
                      <i>Import tokens here</i>
                      <svg
                        className='inline mx-1'
                        width='11'
                        height='10'
                        viewBox='0 0 11 10'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M9.38889 8.88889H1.61111V1.11111H5.5V0H1.61111C0.994444 0 0.5 0.5 0.5 1.11111V8.88889C0.5 9.5 0.994444 10 1.61111 10H9.38889C10 10 10.5 9.5 10.5 8.88889V5H9.38889V8.88889ZM6.61111 0V1.11111H8.60556L3.14444 6.57222L3.92778 7.35556L9.38889 1.89444V3.88889H10.5V0H6.61111Z'
                          fill='url(#paint0_linear_6018_1559)'
                        />
                        <defs>
                          <linearGradient
                            id='paint0_linear_6018_1559'
                            x1='0.5'
                            y1='-0.128202'
                            x2='11.84'
                            y2='1.74051'
                            gradientUnits='userSpaceOnUse'
                          >
                            <stop stop-color='#00BEDF' />
                            <stop offset='1' stop-color='#0068B3' />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className='grid gap-4 grid-cols-1 mt-6 md:grid-cols-2'>
                  <Form.Item name={['size']} rules={[{ validator: validateAmount }]}>
                    <CustomInput
                      title='Size'
                      type='numeric'
                      classNameCustom='input-custom font-small'
                      setInputValue={setSize}
                      inputValue={size}
                      placeholder='Amount'
                      suffix={''}
                    />
                  </Form.Item>
                  <Form.Item name={['sizePricePer']} rules={[{ required: true, validator: validatePrice }]}>
                    <CustomInput
                      title='Price Per Token'
                      type='numeric'
                      classNameCustom='input-custom'
                      setInputValue={setPricePer}
                      inputValue={pricePer}
                      placeholder='Amount'
                      suffix={generateTokenNameByAddress(tokenRequest as string)}
                    />
                  </Form.Item>
                </div>
                <div className='mb-3 flex justify-end wallet-balance'>{`Wallet Balance: ${NumberToFixedFormater(
                  Number(walletBalance),
                  6,
                  false,
                  true,
                )} ${generateTokenNameByAddress(tokenOffer as string)}`}</div>
                <div className='grid gap-4 grid-cols-1 mt-1 md:grid-cols-2'>
                  <Form.Item name={['endDate']} rules={[{ validator: validateDate }]}>
                    <CustomInput title='End Date' type='date' classNameCustom='input-custom-picker' />
                  </Form.Item>
                  <Form.Item name={['endDate']} className='test' rules={[{ validator: validateDate }]}>
                    <CustomInput type='time' classNameCustom='input-custom-picker' />
                  </Form.Item>
                </div>
                <div className='grid grid-cols-1 mb-3 sm:grid-cols-2'>
                  <div className='text-xs truncate mt-4 text-white minimum'>
                    {' '}
                    <Tooltip placement='bottom' title='Minimum size of a deed before this wholesale can be reserved.'>
                      Minimum Deed Requirement
                    </Tooltip>
                  </div>
                  <div>
                    <div className='relative rounded-md shadow-sm'>
                      <Form.Item name={['miniumReq']} rules={[{ validator: validateMin }]}>
                        <CustomInput
                          type='numeric'
                          classNameCustom='input-custom'
                          setInputValue={setMiniumReq}
                          inputValue={miniumReq}
                          placeholder='Amount'
                          suffix={generateTokenNameByAddress(tokenRequest as string)}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-1 mb-1 sm:grid-cols-2'>
                  <div className='label text-left text-sm flex'>
                    Time Locked{' '}
                    <Tooltip
                      placement='bottom'
                      title='The Deed will be locked for a certain amount of time and prevent Buyers from exiting once the deed enters the Open phase to prevent arbitrage.'
                    >
                      <img className='ml-2' src={infoIcon} alt='info' />
                    </Tooltip>
                  </div>
                </div>
                <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-6'>
                  <div className={`w-full mt-4`}>
                    <div className='relative rounded-md shadow-sm flex justify-between'>
                      <Radio.Group
                        onChange={e => {
                          setEnableTimeLock(e.target.value);
                        }}
                        value={enableTimeLock}
                      >
                        <Space direction='vertical'>
                          <Radio className='first-radio' value={0}>
                            No
                          </Radio>
                          <Radio value={1}>Yes</Radio>
                        </Space>
                      </Radio.Group>
                      <Form.Item name={['timeLock']} rules={[{ validator: validateDuration }]}>
                        <CustomInput
                          type='numeric'
                          classNameCustom={`input-custom-duration`}
                          placeholder='Duration'
                          disabled={enableTimeLock === 0 ? true : false}
                          suffix={(<i>DAYS</i>) as unknown as string}
                          inputValue={timeLock}
                          setInputValue={setTimeLock}
                          decimal={2}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
              <div className='hr-tag-fake' />
              <div>
                <ApproveStepsModal isApproveToken={authorized} title1='Approve' title2='Create Wholesale' />
              </div>
              <div className='mt-8 text-center'>
                <Form.Item>
                  {authorized ? (
                    <Button className='button-create' htmlType='submit' disabled={isCreating}>
                      {isCreating ? 'Creating' : 'Create'}
                    </Button>
                  ) : (
                    <button type='button' className='button-create' onClick={doUserApprove} disabled={isApproving}>
                      {isApproving ? 'Approving' : 'Approve'}
                    </button>
                  )}
                </Form.Item>
              </div>

              {isOpenPendingModal && (
                <PendingModal
                  open={isOpenPendingModal}
                  setOpen={setIsOpenPendingModal}
                  isConfirm={isConfirm}
                  txId={txId}
                />
              )}
              {openImport && (
                <ImportTokenModal open={openImport} setOpen={setOpenImport} getWholesaleToken={getWholesaleToken} />
              )}
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
};
