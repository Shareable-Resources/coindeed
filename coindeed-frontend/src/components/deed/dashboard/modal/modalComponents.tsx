import { useState, Fragment } from 'react';
import moment from 'moment';
import Slider from 'react-input-slider';
import 'react-step-progress-bar/styles.css';
import DatePicker from 'react-datepicker';
import { DatePicker as AntdDatePicker, TimePicker as AntdTimePicker, Input, Button, message } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import { Listbox, Transition } from '@headlessui/react';
import { TokenFormat } from '../../type';
import './modalStyles.css';

import CopyGradient from '../../../../images/CopyGradient.svg';
import { BLOCKCHAIN_ERROR_MESSAGE } from '../../../../utils/Constants';

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

type TokenSelectProps = {
  title: string;
  token: string;
  tokenList: TokenFormat[];
  setToken: any;
};

interface InputWithIconForMinimumParticipantProps {
  formPlaceHolder: String;
  symbol: String;
  setInputWithIconForMinimumParticipantState: any;
}

interface InputWithIconForSizeProps {
  formPlaceHolder: String;
  symbol: String;
  setInputWithIconSizeState: any;
}

interface InputWithIconForStakingProps {
  formPlaceHolder: String;
  symbol: String;
  setInputWithIconForStakingAmountState: any;
}

interface SelectMenuProps {
  valid?: boolean;
  initialDate?: Date;
  value: String;
  handleSelectMenuChange: any;
}

interface InputWithoutIconProps {
  border?: string;
  formPlaceHolder: string;
  setInputWithoutIconState: any;
  swapRadioButtonState?: any;
  InputWithIconState?: string;
  disabled?: boolean;
}

interface InputWithTitleForSystemProps {
  validate?: boolean;
  title: string;
  setInputWithTitleForSystemState: any;
  placeholder: string;
}

interface InputCompleteDeedTokenPriceDropProps {
  validate?: boolean;
  title: string;
  setInputCompleteDeedTokenPriceDrop: any;
  placeholder: string;
}

interface InputWithTitleForManagerProps {
  title: string;
  setInputWithTitleForManagerState: any;
}

interface AddOrRemoveButtonProps {
  incrementValue: any;
  decrementValue: any;
  sliderValue: number;
}

interface AddOrRemoveButtonManagerLeverageProps {
  incrementValue: any;
  decrementValue: any;
  managerLeverageValue: number;
}

interface AddOrRemoveButtonSystemLeverageProps {
  incrementValue: any;
  decrementValue: any;
  systemLeverageValue: number;
}

interface ModalSliderProps {
  componentValue: number;
  setSliderValue: any;
  sliderValue: number;
}

interface SelectMenuForExitProps {
  originalAsset: string;
}

interface DeedContractAddressInfoProps {
  deedContractAddress: String;
}

interface ModalMainHeaderProps {
  title: String;
}

interface DeedDurationProps {
  recrutingEndDateOnly: any;
  recrutingEndTimeOnly: any;
  setRecruitingEndDateOnly: any;
  setRecruitingEndTimeOnly: any;
  recrutingEndDateValid: any;
  escrowEndDateOnly: any;
  escrowEndTimeOnly: any;
  setEscrowEndDateOnly: any;
  setEscrowEndTimeOnly: any;
  escrowEndDateValid: any;
  deedEndDateOnly: any;
  deedEndTimeOnly: any;
  setDeedEndDateOnly: any;
  setDeedEndTimeOnly: any;
  deedEndDateValid: any;
  deedEndDateValidWithLockTime?: any;
}

interface setRiskMitigationProps {
  leverageAdjustPurchaseDepositRatio: any;
  leverageAdjustPurchaseDepositRatioValid: any;
  setLeverageAdjustPurchaseDepositRatio: any;
  leverageAdjustMultiple: any;
  leverageAdjustMultipleValid: any;
  setLeverageAdjustMultiple: any;
  completeDeedPurchaseDepositRatio: any;
  completeDeedPurchaseDepositRatioValid: any;
  setCompleteDeedPurchaseDepositRatio: any;
  isSecondTriggerValid?: any;
  maxPriceDropWithLeverage: number;
}

export const TokenSelect = ({ title, token, setToken, tokenList }: TokenSelectProps) => {
  return (
    <div className='flex flex-col w-full'>
      <label className='text-white'>{title}</label>
      <select
        id='location'
        name='location'
        className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md'
        defaultValue={token}
        onChange={setToken}
      >
        {tokenList.map(tokenOpt => {
          return <option value={tokenOpt.address}>{tokenOpt.name}</option>;
        })}
      </select>
    </div>
  );
};

export function ModalSlider({ componentValue, setSliderValue, sliderValue }: ModalSliderProps) {
  return (
    <div className='my-10 flex justify-center'>
      <span className='text-white m-2'>1x</span>
      <Slider
        axis='x'
        x={sliderValue * 4}
        styles={{
          track: {
            width: 400,
          },
        }}
        onChange={({ x }) => {
          if (x !== 0) {
            setSliderValue(Math.ceil(x / 4));
          }
        }}
      />
      <span className='text-white m-2'>25x</span>
    </div>
  );
}

export function AddOrRemoveButton({ decrementValue, incrementValue, sliderValue }: AddOrRemoveButtonProps) {
  return (
    <div className='custom-number-input pt-8'>
      <label htmlFor='custom-input-number' className='w-full text-white text-sm font-semibold'>
        Leverage X
      </label>
      <div className='flex flex-row h-10 w-full rounded-lg bg-transparent px-8 mt-4'>
        <button
          data-action='decrement'
          onClick={decrementValue}
          className=' bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none'
        >
          <span className='text-2xl font-thin'>−</span>
        </button>

        <div className='w-full flex justify-center bg-white font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700  outline-none'>
          {sliderValue}x
        </div>

        <button
          data-action='increment'
          onClick={incrementValue}
          className='bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer'
        >
          <span className='text-2xl font-thin'>+</span>
        </button>
      </div>
    </div>
  );
}

export function AddOrRemoveButtonManagerLeverage({
  decrementValue,
  incrementValue,
  managerLeverageValue,
}: AddOrRemoveButtonManagerLeverageProps) {
  return (
    <div className='custom-number-input h-10 w-48 mb-14 ml-24'>
      <div className='flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1'>
        <button
          data-action='decrement'
          onClick={decrementValue}
          className=' bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none'
        >
          <span className='m-auto text-2xl font-thin'>−</span>
        </button>
        <span className=' text-center w-full bg-white font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700  outline-none pl-8'>
          {managerLeverageValue}x
        </span>
        <button
          data-action='increment'
          onClick={incrementValue}
          className='bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer'
        >
          <span className='m-auto text-2xl font-thin'>+</span>
        </button>
      </div>
    </div>
  );
}

export function AddOrRemoveButtonSystemLeverage({
  decrementValue,
  incrementValue,
  systemLeverageValue,
}: AddOrRemoveButtonSystemLeverageProps) {
  return (
    <div className='custom-number-input '>
      <div className='flex flex-row rounded-lg relative bg-transparent h-10'>
        <button
          data-action='decrement'
          onClick={decrementValue}
          className=' bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none'
        >
          <span className='m-auto text-2xl font-thin'>−</span>
        </button>
        <span className='flex items-center justify-center w-full bg-white font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default text-gray outline-none'>
          {systemLeverageValue}x
        </span>
        <button
          data-action='increment'
          onClick={incrementValue}
          className='bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer'
        >
          <span className='m-auto text-2xl font-thin'>+</span>
        </button>
      </div>
    </div>
  );
}

export function InputWithoutIcon({
  formPlaceHolder,
  setInputWithoutIconState,
  swapRadioButtonState,
}: InputWithoutIconProps) {
  return (
    <input
      onChange={e => setInputWithoutIconState(e.target.value)}
      type='text'
      name='account-number'
      id='account-number'
      className={
        swapRadioButtonState === 'DEX'
          ? 'w-full ml-8 mb-2 opacity-10 pointer-events-none sm:text-sm border-gray-300 rounded-md text-gray-light'
          : 'w-full ml-8 mb-2 sm:text-sm border-gray-300 rounded-md text-gray-light'
      }
      placeholder={formPlaceHolder}
    />
  );
}

export function GrayInputWithoutIcon({
  formPlaceHolder,
  setInputWithoutIconState,
  swapRadioButtonState,
  InputWithIconState,
  border = '',
  disabled,
}: InputWithoutIconProps) {
  return (
    <>
      <input
        onChange={e => setInputWithoutIconState(e.target.value)}
        type='text'
        name='account-number'
        id='account-number'
        className={classNames('bg-modal', 'text-white-light border-white sm:text-sm rounded-md w-full', `${border}`)}
        placeholder={formPlaceHolder}
        value={InputWithIconState}
        disabled={disabled}
      />
    </>
  );
}

export function InputWithTitleForManager({ title, setInputWithTitleForManagerState }: InputWithTitleForManagerProps) {
  return (
    <div className='relative bottom-6'>
      <div className='rounded-md shadow-sm'>
        <h4 className='text-white ml-24'>{title}</h4>
        <input
          onChange={e => setInputWithTitleForManagerState(e.target.value)}
          type='text'
          name='account-number'
          id='account-number'
          className='bottom-8 block w-48 ml-24 sm:text-sm border-gray-300 rounded-md'
          placeholder='10%'
        />
      </div>
    </div>
  );
}

export function InputCompleteDeedTokenPriceDrop({
  validate = true,
  title,
  setInputCompleteDeedTokenPriceDrop,
  placeholder,
}: InputCompleteDeedTokenPriceDropProps) {
  return (
    <div>
      <h4 className='text-white'>{title}</h4>
      <input
        onChange={e => setInputCompleteDeedTokenPriceDrop(e.target.value)}
        type='text'
        name='account-number'
        id='account-number'
        className={classNames(
          validate ? ' border-gray-300' : 'border-red-500',
          'w-full text-gray placeholder-gray   sm:text-sm rounded-md',
        )}
        placeholder={placeholder}
      />
    </div>
  );
}

export function InputWithTitleForSystem({
  title,
  setInputWithTitleForSystemState,
  placeholder,
  validate = true,
}: InputWithTitleForSystemProps) {
  return (
    <div>
      <h4 className='text-white'>{title}</h4>
      <input
        onChange={e => setInputWithTitleForSystemState(e.target.value)}
        type='text'
        name='account-number'
        id='account-number'
        className={classNames(
          validate ? 'border-gray-300' : 'border-red-500',
          'w-full text-gray placeholder-gray sm:text-sm border-gray-300 rounded-md',
        )}
        placeholder={placeholder}
      />
    </div>
  );
}

export function InputWithIconForSize({
  formPlaceHolder,
  symbol,
  setInputWithIconSizeState,
}: InputWithIconForSizeProps) {
  return (
    <div>
      <label htmlFor='account-number' className='text-sm font-medium text-white mb-1'>
        {formPlaceHolder ? formPlaceHolder : 'No placeHolder'}
      </label>
      <div className='relative w-full'>
        <input
          onChange={e => setInputWithIconSizeState(e.target.value)}
          type='text'
          name='account-number'
          id='account-number'
          className='text-gray placeholder-gray w-full sm:text-sm border-gray-300 rounded-md'
          placeholder='Amount'
        />
        <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-light'>
          {symbol ? symbol : ''}
        </div>
      </div>
    </div>
  );
}

export function InputWithIconForMinimumParticipant({
  formPlaceHolder,
  symbol,
  setInputWithIconForMinimumParticipantState,
}: InputWithIconForMinimumParticipantProps) {
  return (
    <div>
      <label htmlFor='account-number' className='block text-sm font-medium text-white'>
        {formPlaceHolder ? formPlaceHolder : 'No placeHolder'}
      </label>
      <div className='mt-1 relative w-full'>
        <input
          onChange={e => setInputWithIconForMinimumParticipantState(e.target.value)}
          type='text'
          name='account-number'
          id='account-number'
          className='text-gray placeholder-gray w-full sm:text-sm border-gray-300 rounded-md'
          placeholder='Amount'
        />
        <div className='absolute inset-y-0 right-0 mr-3 flex items-center pointer-events-none text-gray-light'>
          {symbol ? symbol : ''}
        </div>
      </div>
    </div>
  );
}

export function InputWithIconForStaking({
  formPlaceHolder,
  symbol,
  setInputWithIconForStakingAmountState,
}: InputWithIconForStakingProps) {
  return (
    <div className='flex flex-col mt-auto w-auto col-span-2'>
      <label htmlFor='account-number' className='text-sm font-medium text-white'>
        {formPlaceHolder ? formPlaceHolder : 'No placeHolder'}
      </label>
      <div className='mt-1 flex items-center'>
        <input
          onChange={e => setInputWithIconForStakingAmountState(e.target.value)}
          type='text'
          name='account-number'
          id='account-number'
          className={classNames('bg-gray', 'text-gray-400 border-none block sm:text-sm rounded-md pl-0')}
          placeholder='Amount'
        />
        <div className='text-gray-400 ml-auto'>{symbol ? symbol : ''}</div>
      </div>
    </div>
  );
}

export function DateSelect({ value, valid, initialDate, handleSelectMenuChange }: SelectMenuProps) {
  const [startDate, setStartDate] = useState(initialDate);
  return (
    <DatePicker
      className={classNames(valid ? 'border-gray-300' : 'border-red-500', 'text-gray max-w-full sm:text-sm rounded-md')}
      selected={startDate}
      onChange={(date: any) => {
        setStartDate(date);
        handleSelectMenuChange(date);
      }}
    />
  );
}

export function SelectMenuForDeed({ handleSelectMenuChange }: SelectMenuProps) {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <DatePicker
      className='text-gray max-w-full border-gray-300 sm:text-sm rounded-md'
      selected={startDate}
      onChange={(date: any) => {
        setStartDate(date);
        handleSelectMenuChange(date);
      }}
    />
  );
}

export function SelectMenuForRecruiting({ handleSelectMenuChange }: SelectMenuProps) {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <DatePicker
      className='text-gray max-w-full border-gray-300 sm:text-sm rounded-md'
      selected={startDate}
      onChange={(date: any) => {
        setStartDate(date);
        handleSelectMenuChange(date);
      }}
    />
  );
}

export function SelectMenuForEscrow({ handleSelectMenuChange }: SelectMenuProps) {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <DatePicker
      className='text-gray max-w-full border-gray-300 sm:text-sm rounded-md'
      selected={startDate}
      onChange={(date: any) => {
        setStartDate(date);
        handleSelectMenuChange(date);
      }}
    />
  );
}

export function SelectMenuForExit({ originalAsset }: SelectMenuForExitProps) {
  const people = [
    { id: '1', name: '123' },
    { id: '2', name: '124' },
    { id: '3', name: '125' },
    { id: '4', name: '126' },
    { id: '5', name: '127' },
  ];
  const [selected, setSelected] = useState(people[3]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      {/* <Listbox.Label className='block text-md font-medium text-white mb-2 '>
        Loan Pay-Off Asset
      </Listbox.Label> */}
      <div className='mt-1 relative w-full'>
        <Listbox.Button className='bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default  focus:ring-1   sm:text-sm'>
          <span className='block truncate text-black-light font-light'>{selected.name}</span>
          <span className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
            {/* <SelectorIcon className='h-5 w-5 text-gray-400' aria-hidden='true' /> */}
            <span className='mr-4 text-gray-500 font-light'>Balance</span>
            <svg
              className='text-black'
              height='8'
              width='8'
              viewBox='0 0 8 8'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M4 6.5L0 0.5H8L4 6.5Z' fill='currentColor' />
            </svg>
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave='transition ease-in duration-100' leaveFrom='opacity-100' leaveTo='opacity-0'>
          <Listbox.Options className='absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm'>
            {people.map(person => (
              <Listbox.Option
                key={person.id}
                className={({ active }) =>
                  classNames(
                    active ? 'text-white bg-indigo-600' : 'text-gray-900',
                    'cursor-default select-none relative py-2 pl-3 pr-9',
                  )
                }
                value={person}
              >
                {({ selected, active }) => (
                  <>
                    <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                      {person.name}
                    </span>

                    {selected ? (
                      <span
                        className={classNames(
                          active ? 'text-white' : 'text-indigo-600',
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                        )}
                      >
                        <svg
                          className='text-black bg-black'
                          height='8'
                          width='8'
                          viewBox='0 0 8 8'
                          fill='black'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path d='M4 6.5L0 0.5H8L4 6.5Z' fill='currentColor' />
                        </svg>
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
        <div className='text-white-light mt-2 text-sm font-light'>
          X Original Asset {originalAsset} = Y {selected.name}
        </div>
      </div>
    </Listbox>
  );
}

const handleCopy = (deedContractAddress: any) => {
  navigator.clipboard.writeText(deedContractAddress);
  message.success('Successfully copied');
};
export function DeedContractAddressInfo({ deedContractAddress }: DeedContractAddressInfoProps) {
  return (
    <Fragment>
      <h2 className='text-modal-subheader text-white mb-14px font-semibold'>Deed Contract Address</h2>
      <div className='flex '>
        <div className='bg-modal flex items-center p-14px text-white text-deed-address-text w-440px h-43px border border-opacity-20 rounded-lg'>
          {deedContractAddress}
        </div>
        <img
          className='ml-20px w-20px h-20px cursor-pointer'
          src={CopyGradient}
          alt='copy deed address'
          onClick={() => handleCopy(deedContractAddress)}
        />
      </div>
    </Fragment>
  );
}

export function ModalHorizontalRule() {
  return <hr className='mb-25px border-1 border-opacity-20' />;
}

export function ModalMainHeader({ title }: ModalMainHeaderProps) {
  return <h1 className='text-modal-title leading-6 text-white  mb-34px'>{title}</h1>;
}

export function DeedDuration({
  recrutingEndDateOnly,
  recrutingEndTimeOnly,
  setRecruitingEndDateOnly,
  setRecruitingEndTimeOnly,
  recrutingEndDateValid,
  escrowEndDateOnly,
  escrowEndTimeOnly,
  setEscrowEndDateOnly,
  setEscrowEndTimeOnly,
  escrowEndDateValid,
  deedEndDateOnly,
  deedEndTimeOnly,
  setDeedEndDateOnly,
  setDeedEndTimeOnly,
  deedEndDateValid,
  deedEndDateValidWithLockTime,
}: DeedDurationProps) {
  const onChangeEndDateOnly = (value: any, setDateOnly: any) => {
    if (value) {
      const dateobj = value._d;
      setDateOnly({ day: dateobj.getDate(), month: dateobj.getMonth(), year: dateobj.getFullYear() });
    } else {
      setDateOnly(null);
    }
  };

  const onChangeEndTimeOnly = (value: any, setTimeOnly: any) => {
    if (value) {
      const dateobj = value._d;
      setTimeOnly({ hours: dateobj.getHours(), minutes: dateobj.getMinutes(), seconds: dateobj.getSeconds() });
    } else {
      setTimeOnly(null);
    }
  };

  return (
    <Fragment>
      <h1 className='text-white text-modal-sub-title font-semibold'>Duration</h1>
      <div className='flex flex-col  text-gray-400 text-xs mx-10px'>
        <div className='flex justify-between items-center w-full mb-20px'>
          <div className='text-duration-label text-white '>Recruting End Date</div>
          <div className='flex items-center'>
            <div className='text-duration-label mr-10px'>UTC</div>
            <AntdDatePicker
              value={
                recrutingEndDateOnly
                  ? moment(
                      new Date(
                        recrutingEndDateOnly.year,
                        recrutingEndDateOnly.month,
                        recrutingEndDateOnly.day,
                        0,
                        0,
                        0,
                      ),
                    )
                  : null
              }
              style={{ borderRadius: '8px', width: '150px', height: '43px', marginRight: '10px' }}
              onChange={(d: any) => {
                onChangeEndDateOnly(d, setRecruitingEndDateOnly);
              }}
              placeholder='yyyy/mm/dd'
            />
            <AntdTimePicker
              style={{ borderRadius: '8px', width: '150px', height: '43px' }}
              value={
                recrutingEndTimeOnly
                  ? moment(
                      new Date(
                        0,
                        0,
                        0,
                        recrutingEndTimeOnly.hours,
                        recrutingEndTimeOnly.minutes,
                        recrutingEndTimeOnly.seconds,
                      ),
                    )
                  : null
              }
              onChange={(d: any) => {
                onChangeEndTimeOnly(d, setRecruitingEndTimeOnly);
              }}
              placeholder='hh:mm:ss'
            />
          </div>
        </div>
        {!recrutingEndDateValid ? (
          <p className='text-errorRed text-modal-error-text'>
            {BLOCKCHAIN_ERROR_MESSAGE.ERROR_RECRUITING_TIMESTAMP.message}
          </p>
        ) : null}
        <div className='flex justify-between items-center w-full  mb-20px'>
          <div className='text-duration-label text-white'>Escrow End Date</div>
          <div className='flex items-center'>
            <div className='text-duration-label mr-10px'>UTC</div>
            <AntdDatePicker
              value={
                escrowEndDateOnly
                  ? moment(new Date(escrowEndDateOnly.year, escrowEndDateOnly.month, escrowEndDateOnly.day, 0, 0, 0))
                  : null
              }
              style={{ borderRadius: '8px', width: '150px', height: '43px', marginRight: '10px' }}
              onChange={(d: any) => {
                onChangeEndDateOnly(d, setEscrowEndDateOnly);
              }}
              placeholder='yyyy/mm/dd'
            />
            <AntdTimePicker
              value={
                escrowEndTimeOnly
                  ? moment(
                      new Date(0, 0, 0, escrowEndTimeOnly.hours, escrowEndTimeOnly.minutes, escrowEndTimeOnly.seconds),
                    )
                  : null
              }
              style={{ borderRadius: '8px', width: '150px', height: '43px' }}
              onChange={(d: any) => {
                onChangeEndTimeOnly(d, setEscrowEndTimeOnly);
              }}
              placeholder='hh:mm:ss'
            />
          </div>
        </div>
        {!escrowEndDateValid ? (
          <p className='text-errorRed text-modal-error-text'>
            Your escrow end date must be greater than your recruting end date
          </p>
        ) : null}
        <div className='flex justify-between items-center w-full'>
          <div className='text-duration-label text-white'>Deed End Date</div>
          <div className='flex items-center'>
            <div className='text-duration-label mr-10px'>UTC</div>
            <AntdDatePicker
              value={
                deedEndDateOnly
                  ? moment(new Date(deedEndDateOnly.year, deedEndDateOnly.month, deedEndDateOnly.day, 0, 0, 0))
                  : null
              }
              style={{ borderRadius: '8px', width: '150px', height: '43px', marginRight: '10px' }}
              onChange={(d: any) => {
                onChangeEndDateOnly(d, setDeedEndDateOnly);
              }}
              placeholder='yyyy/mm/dd'
            />
            <AntdTimePicker
              value={
                deedEndTimeOnly
                  ? moment(new Date(0, 0, 0, deedEndTimeOnly.hours, deedEndTimeOnly.minutes, deedEndTimeOnly.seconds))
                  : null
              }
              style={{ borderRadius: '8px', width: '150px', height: '43px' }}
              onChange={(d: any) => {
                onChangeEndTimeOnly(d, setDeedEndTimeOnly);
              }}
              placeholder='hh:mm:ss'
            />
          </div>
        </div>
        {!deedEndDateValid ? (
          <p className='text-errorRed text-modal-error-text mt-10px'>
            Your deed end date must be later than the escrow end date
          </p>
        ) : null}

        {!deedEndDateValidWithLockTime ? (
          <p className='text-errorRed text-modal-error-text mt-10px'>
            Your deed end date must be later than the escrow end date plus the wholesale locked time
          </p>
        ) : null}
      </div>
    </Fragment>
  );
}

export function RiskMitigation({
  leverageAdjustPurchaseDepositRatio,
  leverageAdjustPurchaseDepositRatioValid,
  setLeverageAdjustPurchaseDepositRatio,
  leverageAdjustMultiple,
  leverageAdjustMultipleValid,
  setLeverageAdjustMultiple,
  completeDeedPurchaseDepositRatio,
  completeDeedPurchaseDepositRatioValid,
  setCompleteDeedPurchaseDepositRatio,
  isSecondTriggerValid,
  maxPriceDropWithLeverage,
}: setRiskMitigationProps) {
  return (
    <Fragment>
      <h1 className='text-white text-modal-sub-title mb-20px font-semibold'>Risk Mitigation</h1>
      <div className='px-10px'>
        <div className='flex justify-between mb-20px'>
          <div className='flex text-risk-mitigation-label text-gray-400 text-xs'>
            <div className='flex items-center'>If</div>{' '}
            <div className='flex flex-col justify-center mx-2'>
              {' '}
              <div className='border-b w-22'>Purchase Value</div>
              <div>Deposit Value</div>{' '}
            </div>{' '}
            <div className='flex items-center'>drops:</div>
          </div>
          <div>
            <Input
              onChange={e => setLeverageAdjustPurchaseDepositRatio(e.target.value)}
              value={leverageAdjustPurchaseDepositRatio}
              type='text'
              name='account-number'
              id='account-number'
              className='text-black placeholder-black sm:text-sm  '
              placeholder='     Amount'
              style={{
                width: '160px',
                height: '43px',
                backgroundColor: 'white',
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
                borderTopRightRadius: '0px',
                borderBottomRightRadius: '0px',
                textAlign: 'center',
                border: 'none',
              }}
            />
            <Input
              type='text'
              name='account-number-percent'
              id='account-number-percent'
              className='text-black placeholder-black sm:text-sm '
              placeholder='%'
              style={{
                width: '40px',
                height: '43px',
                backgroundColor: 'white',
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                borderTopLeftRadius: '0px',
                borderBottomLeftRadius: '0px',
                textAlign: 'center',
                border: 'none',
              }}
              disabled
            />
          </div>
        </div>
        {!leverageAdjustPurchaseDepositRatioValid ? (
          <p className='text-errorRed text-modal-error-text mt-10px'>
            {' '}
            Please enter a valid percentage amount that's between 1.00 and 100.00
          </p>
        ) : null}
        <div className='flex  items-center justify-between mb-20px'>
          <div className='text-risk-mitigation-label text-gray-400 text-xs'>Leverage will adjust to: </div>
          <Input.Group compact style={{ width: '200px' }}>
            <Button
              onClick={() => {
                setLeverageAdjustMultiple(Math.max(leverageAdjustMultiple - 1, 1));
              }}
              style={{
                width: '30px',
                height: '43px',
                borderRadius: '8px',
                border: 'none',
                borderTopRightRadius: '0px',
                borderBottomRightRadius: '0px',
              }}
            >
              -
            </Button>
            <Input
              onChange={e => setLeverageAdjustMultiple(parseInt(e.target.value))}
              value={leverageAdjustMultiple + 'x'}
              className='text-black  sm:text-sm'
              style={{
                color: 'rgb(68,68,68)',
                width: '140px',
                height: '43px',
                backgroundColor: 'white',
                border: 'none',
                textAlign: 'center',
              }}
              disabled
            />
            <Button
              onClick={() => {
                setLeverageAdjustMultiple(Math.min(leverageAdjustMultiple + 1, 25));
              }}
              style={{
                flex: 'row',
                alignItems: 'center',
                width: '30px',
                height: '43px',
                borderRadius: '8px',
                border: 'none',
                borderTopLeftRadius: '0px',
                borderBottomLeftRadius: '0px',
              }}
            >
              +
            </Button>
          </Input.Group>
        </div>
        {!leverageAdjustMultipleValid ? (
          <p className='text-errorRed text-modal-error-text mt-10px'>
            Please enter a valid leverage that's lower than the position's leverage
          </p>
        ) : null}
        <div className='flex justify-between '>
          <div className='flex-col text-risk-mitigation-label text-gray-400 text-xs'>
            System will complete the deed:
            <div className='flex'>
              <div className='flex items-center'>if adjusted</div>{' '}
              <div className='mx-2'>
                {' '}
                <div className='border-b w-22'>Purchase Value</div>
                <div>Deposit Value</div>{' '}
              </div>{' '}
              <div className='flex items-center'>drops:</div>
            </div>
          </div>
          <div>
            <Input
              onChange={e => setCompleteDeedPurchaseDepositRatio(e.target.value)}
              value={completeDeedPurchaseDepositRatio}
              type='text'
              name='account-number'
              id='account-number'
              className='text-black placeholder-black sm:text-sm  '
              placeholder='     Amount'
              style={{
                color: 'black',
                width: '160px',
                height: '43px',
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
                borderTopRightRadius: '0px',
                borderBottomRightRadius: '0px',
                textAlign: 'center',
                border: 'none',
              }}
            />
            <Input
              type='text'
              name='account-number-percent'
              id='account-number-percent'
              className='text-black placeholder-black sm:text-sm '
              placeholder='%'
              style={{
                width: '40px',
                height: '43px',
                backgroundColor: 'white',
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                borderTopLeftRadius: '0px',
                borderBottomLeftRadius: '0px',
                textAlign: 'center',
                border: 'none',
              }}
              disabled
            />
          </div>
        </div>
        {!completeDeedPurchaseDepositRatioValid ? (
          <p className='text-errorRed text-modal-error-text mt-10px'>
            Please enter a valid second trigger amount between 1.00 and 100.00 and larger than the second trigger level
            1.
          </p>
        ) : null}
        {!isSecondTriggerValid && maxPriceDropWithLeverage > 0 ? (
          <p className='text-errorRed text-modal-error-text mt-10px'>
            Please enter a second trigger must be less or equal than {maxPriceDropWithLeverage} %
          </p>
        ) : null}
      </div>
    </Fragment>
  );
}
