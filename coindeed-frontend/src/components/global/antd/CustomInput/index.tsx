import { Input, DatePicker, Select, TimePicker } from 'antd';
import { ChangeEvent } from 'react';
import { REGEX_GET_ALL_STRING, REGEX_ONLY_DOT } from '../../../../utils/Constants';
import './style.css';

const { Option } = Select;

type CustomInputProps = {
  handleChange?: any;
  dataOption?: any;
  classNameCustom?: string;
  type?: string;
  title?: string;
  setInputValue?: any;
  inputValue?: string;
  placeholder?: string;
  suffix?: string;
  disabled?: boolean;
  style?: any;
  decimal?: number;
};

export const CustomInput = ({
  type,
  title,
  handleChange,
  classNameCustom,
  dataOption,
  setInputValue,
  inputValue,
  placeholder,
  disabled,
  suffix,
  decimal,
  ...props
}: CustomInputProps) => {
  const handeleOnInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (!decimal) decimal = 6;
    const amount = e.currentTarget.value.replace(REGEX_GET_ALL_STRING, '').replace(REGEX_ONLY_DOT, '$1');
    const arr = amount.split('.');
    if (!arr[1] || (arr[1].length > 0 && arr[1].length <= decimal)) {
      amount !== null ? setInputValue(amount) : setInputValue(inputValue);
    }
  };

  return (
    <>
      {title && (
        <label htmlFor={title} className='label mb-2'>
          {title}
        </label>
      )}
      {type === 'text' ? (
        <Input
          {...props}
          className={classNameCustom}
          placeholder={placeholder}
          value={inputValue}
          disabled={disabled}
          suffix={suffix}
          onInput={e => setInputValue(e.currentTarget.value.replace(/\s/g, ''))}
        />
      ) : type === 'numeric' ? (
        <Input
          {...props}
          className={classNameCustom}
          onInput={handeleOnInput}
          value={inputValue}
          placeholder={placeholder}
          suffix={suffix}
          disabled={disabled}
        />
      ) : type === 'select' ? (
        <Select {...props} className={classNameCustom} size='large'>
          {dataOption &&
            dataOption.map((e: any) => {
              return <Option value={e.value}>{e.title}</Option>;
            })}
        </Select>
      ) : type === 'date' ? (
        <DatePicker {...props} className={classNameCustom} placeholder='mm/dd/yyyy' format='MM/DD/YYYY' />
      ) : type === 'time' ? (
        <TimePicker {...props} className={classNameCustom} placeholder='hh:mm:ss' />
      ) : (
        <Input {...props} />
      )}
    </>
  );
};
