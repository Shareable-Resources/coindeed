import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Modal, Form } from 'antd';
import { CustomInput } from '../antd/CustomInput/index';
import './style/style.css';
import CustomButton from '../antd/CustomButton';
import { importToken } from '../../../APIs/WholesaleApi';
import { message as messages } from '../antd/Message';
import { getTokenDecimalsV2, getTokenSymbol } from '../../../blockchain/utils';

type ImportTokenModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  txId?: string;
  getWholesaleToken: any;
};

export default function ImportTokenModal({ open, setOpen, txId, getWholesaleToken }: ImportTokenModalProps) {
  const [address, setAddress] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [decimal, setDecimal] = useState<string>('');
  const [notice, setNotice] = useState(false);
  const onFinish = async (values: any) => {
    const data = {
      name: values.token.symbol,
      decimals: Number(values.token.decimal),
      address: values.token.address.toLowerCase(),
    };
    const api = await importToken(data);
    if (api.status === 200) {
      getWholesaleToken();
      setNotice(true);
      return messages('success', api.data.message);
    }
    return messages('error', api.data.error);
  };

  const validateAddress = (_: any, value: any) => {
    if (value === undefined || value === ' ' || value === '') {
      return Promise.reject(new Error('Please enter token address.'));
    }
    return Promise.resolve();
  };

  const validateSymbol = (_: any, value: any) => {
    if (value === undefined || value === ' ' || value === '') {
      return Promise.reject(new Error('Please enter symbol.'));
    }
    return Promise.resolve();
  };

  const validateDecimal = (_: any, value: any) => {
    const regex = /[A-Za-z]/g;
    if (value === undefined || value === ' ' || (value.length === 1 && regex.test(value)) || value === '') {
      return Promise.reject(new Error('Please enter decimal.'));
    }
    return Promise.resolve();
  };

  useEffect(() => {
    const getSymbol = async () => {
      const [result] = await getTokenSymbol(address);
      if (result !== null) {
        setSymbol(result as any);
      }
    };
    const getDecimal = async () => {
      const [result] = await getTokenDecimalsV2(address);
      if (result !== null) {
        setDecimal(result as any);
      }
    };
    if (address.length === 42) {
      getSymbol();
      getDecimal();
    }
  }, [address]);

  return (
    <Modal
      className='IPM'
      centered
      visible={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      footer={null}
      width={400}
      closeIcon={
        <button
          type='button'
          className='px-2 py-1 rounded-md text-gray-400 hover:text-red-500 focus:outline-none'
          onClick={() => setOpen(false)}
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
      <div className='sm:items-start text-white justify-center'>
        <div className='mt-3'>
          {!notice ? (
            <>
              <div className='IPM-title'>Custom Token</div>
              <div className='hr-tag-fake' />
              <Form
                layout='vertical'
                onFinish={onFinish}
                fields={[
                  {
                    name: ['token', 'symbol'],
                    value: symbol,
                  },
                  {
                    name: ['token', 'decimal'],
                    value: decimal,
                  },
                ]}
              >
                <div className='box-form-import mt-7'>
                  <Form.Item
                    name={['token', 'address']}
                    className='first-input'
                    rules={[{ validator: validateAddress }]}
                  >
                    <CustomInput
                      title='Token Contract Address'
                      type='text'
                      placeholder='Token Contract Address'
                      inputValue={address}
                      setInputValue={setAddress}
                    />
                  </Form.Item>
                  <Form.Item name={['token', 'symbol']} rules={[{ validator: validateSymbol }]}>
                    <CustomInput
                      type='text'
                      title='Token Symbol'
                      placeholder='Token Symbol'
                      inputValue={symbol}
                      setInputValue={setSymbol}
                    />
                  </Form.Item>
                  <Form.Item name={['token', 'decimal']} rules={[{ validator: validateDecimal }]}>
                    <CustomInput
                      type='numeric'
                      inputValue={decimal}
                      setInputValue={setDecimal}
                      title='Decimal'
                      placeholder='Decimal'
                    />
                  </Form.Item>
                </div>
                <div className='hr-tag-fake' />
                <Form.Item className='form-button'>
                  <CustomButton customType='OkButton'>Import Token</CustomButton>
                </Form.Item>
              </Form>
            </>
          ) : (
            <div className='text-center'>
              <div className='IPM-title mb-4'>This token is pending. Please wait for the token to be approved</div>
              <CustomButton customType='OkButton' onClick={() => setOpen(false)}>
                Close
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
