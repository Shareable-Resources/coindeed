import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { handleUserApproveToken, isUserApprovedToken } from '../../../../blockchain/utils';
import { message as mes } from '../../../global/antd/Message';
import { message } from 'antd';
import PendingModal from '../../../global/modal/PendingModal';
import { Modal, Form, Button, Radio, Space } from 'antd';
import './style.css';
import { CustomInput } from '../../../global/antd/CustomInput';
import ApproveStepsModal from '../../../global/modal/ApproveStepsModal';
import _ from 'lodash';
import { TOKEN_TYPES } from '../../../../utils/Constants';
// import { WholesalePayWith } from './WholesalePayWith';
import moment from 'moment';

type WholesaleEditModalProps = {
  openEdit: boolean;
  setOpenEdit: Dispatch<SetStateAction<boolean>>;
};

const WHOLESALE_ADDRESS = process.env.REACT_APP_WHOLESALE_ADDRESS;

export const WholesaleEditModal = ({ openEdit, setOpenEdit }: WholesaleEditModalProps) => {
  // const [form] = Form.useForm();
  const [authorized, setAuthorized] = useState<boolean>(false);
  // inputs
  const [priv, setPriv] = useState<number>(1);
  const [tokenOffer, setTokenOffer] = useState<string | undefined>(TOKEN_TYPES.USDT.tokenAddress);
  const [tokenRequest, setTokenRequest] = useState<string | undefined>(TOKEN_TYPES.ETH.tokenAddress);
  const [isApproving, setIsApproving] = useState(false);
  const [isUpdating] = useState(false);
  const [isOpenPendingModal, setIsOpenPendingModal] = useState(false);
  const [isConfirm, setIsConfirm] = useState(true);
  const [txId, setTxId] = useState<string>('');
  const [endDate, setEndDate] = useState<number>(new Date().getTime());
  const [size] = useState<string>('');
  const [pricePer, setPricePer] = useState<string>('');
  const [miniumReq, setMiniumReq] = useState<string>('');

  useEffect(() => {
    const checkUserApprove = async () => {
      if (tokenOffer) {
        const isApproved = await isUserApprovedToken(tokenOffer, WHOLESALE_ADDRESS);
        setAuthorized(isApproved);
      }
    };
    checkUserApprove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproving, tokenOffer]);

  // useEffect(() => {
  //   form.resetFields();
  // }, [openEdit]);

  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }

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
      mes('error', '', error.code);
      setIsOpenPendingModal(false);
      setIsApproving(false);
      return;
    }
    setIsConfirm(false);
    setTxId(result.hash);
    await result.wait(1);
    mes('success', 'You have successfully approved this token.');
    setIsOpenPendingModal(false);
    setIsConfirm(true);
    setIsApproving(false);
  };

  const layout = {
    wrapperCol: { span: 24 },
  };

  /* eslint-disable no-template-curly-in-string */
  const validateMessages = {
    required: 'This field is required',
  };

  const onFinish = async (values: any) => {
    const wholesale = values.wholesale;
    const offer = tokenOffer;
    const request = '0x0000000000000000000000000000000000000000';
    let requestAmount = 0;
    if (wholesale.size && wholesale.sizePricePer) {
      requestAmount = parseFloat(size) * parseFloat(pricePer);
    }
    const data = {
      tokenOffered: offer,
      tokenRequested: request,
      offeredAmount: parseFloat(size),
      requestedAmount: requestAmount,
      minSaleAmount: parseFloat(miniumReq),
      deadline: endDate,
      reservedTo: request,
    };
    console.log(data);
  };

  return (
    <Modal
      className='edit-wholesale'
      centered
      visible={openEdit}
      onOk={() => setOpenEdit(false)}
      onCancel={() => setOpenEdit(false)}
      footer={null}
      width={600}
      zIndex={4}
      maskClosable={false}
      maskStyle={{ background: '#6b7280bf' }}
      closeIcon={
        <button
          type='button'
          className='px-2 py-1 rounded-md text-gray-400 hover:text-red-500 focus:outline-none'
          onClick={() => setOpenEdit(false)}
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
          <div className='text-2xl leading-6 font-medium text-white'>Edit Wholesale</div>
          <div className='hr-tag-fake' />
          <div className='mt-10 text-left box-id'>
            <div className='flex'>
              <div className='left'>
                <CustomInput
                  title='Wholesale Contract ID'
                  type='text'
                  classNameCustom='input-address'
                  placeholder='Deed Address'
                  disabled={true}
                />
              </div>
              <div className='right text-right copy-address'>
                <svg
                  className='mt-6 cursor-pointer'
                  width='20'
                  height='21'
                  viewBox='0 0 20 21'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  onClick={() => {
                    navigator.clipboard.writeText('xxxxxx');
                    message.success('Copy successful');
                  }}
                >
                  <path
                    d='M11.9998 20.4988H2.00093C1.46507 20.5175 0.945532 20.3127 0.566391 19.9336C0.18725 19.5545 -0.0174533 19.0349 0.0011681 18.4991V8.50023C-0.0174533 7.96437 0.18725 7.44483 0.566391 7.06569C0.945532 6.68655 1.46507 6.48185 2.00093 6.50047H6.00047V2.50093C5.98185 1.96507 6.18655 1.44553 6.56569 1.06639C6.94483 0.68725 7.46437 0.482547 8.00023 0.501168H17.9991C18.5349 0.482547 19.0545 0.68725 19.4336 1.06639C19.8127 1.44553 20.0175 1.96507 19.9988 2.50093V12.4998C20.0172 13.0355 19.8124 13.5549 19.4333 13.934C19.0542 14.3131 18.5348 14.5179 17.9991 14.4995H13.9995V18.4991C14.0179 19.0348 13.8131 19.5542 13.434 19.9333C13.0549 20.3124 12.5355 20.5172 11.9998 20.4988ZM2.00093 8.50023V18.4991H11.9998V14.4995H8.00023C7.46446 14.5179 6.94509 14.3131 6.56602 13.934C6.18695 13.5549 5.98215 13.0355 6.00047 12.4998V8.50023H2.00093ZM8.00023 2.50093V12.4998H17.9991V2.50093H8.00023Z'
                    fill='url(#paint0_linear_5898_810)'
                  />
                  <defs>
                    <linearGradient
                      id='paint0_linear_5898_810'
                      x1='-8.90529e-07'
                      y1='0.243595'
                      x2='22.6799'
                      y2='3.98103'
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
          <Form
            {...layout}
            layout='vertical'
            // form={form}
            onFinish={onFinish}
            validateMessages={validateMessages}
            fields={[
              {
                name: ['wholesale', 'tokenOffer'],
                value: tokenOffer,
              },
              {
                name: ['wholesale', 'tokenRequest'],
                value: tokenRequest,
              },
              {
                name: ['wholesale', 'size'],
                value: size,
              },
            ]}
            onValuesChange={(changeValue: any, allValues: any) => {
              if (_.keys(changeValue.wholesale)[0] === 'tokenOffer') {
                setTokenOffer(changeValue.wholesale.tokenOffer);
              }
              if (_.keys(changeValue.wholesale)[0] === 'tokenRequest') {
                setTokenRequest(changeValue.wholesale.tokenRequest);
              }
              if (allValues.wholesale.endTime && allValues.wholesale.endDate) {
                const time = moment(allValues.wholesale.endTime._d).format('hh:mm:ss');
                const date = moment(allValues.wholesale.endDate._d).format('MM/DD/YYYY');
                setEndDate(moment(`${date} ${time}`).unix());
              }
            }}
          >
            <div className='mt-8'>
              <div className='box-form'>
                <div className='grid grid-cols-1 mb-1 sm:grid-cols-2'>
                  <div className='label text-left text-sm mt-3'>Wholesale Type</div>
                </div>

                <div className='flex flex-col md:flex-row items-start md:items-center justify-center'>
                  <Radio.Group
                    onChange={e => {
                      setPriv(e.target.value);
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
                      <Form.Item name={['wholesale', 'deedAddress']}>
                        <CustomInput
                          type='text'
                          classNameCustom={`input-custom`}
                          placeholder='Deed Manager Address'
                          disabled={priv === 0 ? true : false}
                          suffix='Required'
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
                  <Form.Item name={['wholesale', 'endDate']} rules={[{ required: true }]}>
                    <CustomInput title='End Date' type='date' classNameCustom='input-custom-picker' />
                  </Form.Item>
                  <Form.Item name={['wholesale', 'endTime']} className='test' rules={[{ required: true }]}>
                    <CustomInput type='time' classNameCustom='input-custom-picker' />
                  </Form.Item>
                </div>
                <div className='grid gap-4 grid-cols-1 mt-2 md:grid-cols-1'>
                  <label className='label-minium' htmlFor=''>
                    Minimum Deed Requirement
                  </label>
                </div>
                <div className='grid gap-4 grid-cols-1 mt-4 md:grid-cols-2 '>
                  <Form.Item name={['wholesale', 'miniumReq']} rules={[{ required: true }]}>
                    <CustomInput
                      type='numeric'
                      classNameCustom='input-custom'
                      setInputValue={setMiniumReq}
                      inputValue={miniumReq}
                    />
                  </Form.Item>
                </div>
              </div>
              {/* <WholesalePayWith /> */}
              <div className='hr-tag-fake' />
              <div>
                <ApproveStepsModal isApproveToken={authorized} title1='Approve' title2='Update Wholesale' />
              </div>
              <div className='mt-8 text-center'>
                <Form.Item>
                  {authorized ? (
                    <Button
                      className={`button-edit ${isApproving ? 'disabled:opacity-50 cursor-not-allowed' : ''}`}
                      htmlType='submit'
                      disabled={isApproving}
                    >
                      {isUpdating ? 'Updating' : 'Update'}
                    </Button>
                  ) : (
                    <button
                      type='button'
                      className={classNames(
                        'text-gray',
                        'px-4 py-2 text-sm font-medium bg-white border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
                        `${isApproving ? 'disabled:opacity-50 cursor-not-allowed' : ''}`,
                      )}
                      onClick={doUserApprove}
                      disabled={isApproving}
                    >
                      {isApproving ? 'Authorizing' : 'Authorize'}
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
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
};
