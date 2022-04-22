import { Input } from 'antd';
import CustomButton from '../antd/CustomButton';
import style from './style.module.scss';

export interface typeOfInputAmountTokens {
  suffix?: string;
  className?: string;
  classNameInput?: string;
  value?: string;
  placeholder?: string;
  isError?: boolean;
  textButton?: string;
  buttonRelative?: boolean;
  onChange?: Function;
  onInput?: Function;
  onClickButton?: Function;
}

export default function InputAmountTokens(props: typeOfInputAmountTokens) {
  return (
    <div className={`${props.className || ''} ${props.buttonRelative ? '' : style.buttonAbsolute} flex items-center`}>
      <Input
        className={`${props.classNameInput || ''} ${style.InputAmountTokens} ${props.isError ? style.error : ''} ${
          props.suffix ? '' : style.noSuffix
        }`}
        suffix={props.suffix}
        value={props.value}
        placeholder={props.placeholder}
        onChange={e => {
          if (props.onChange) props.onChange(e);
        }}
        onInput={e => {
          if (props.onInput) props.onInput(e);
        }}
      />

      {props.textButton && (
        <CustomButton
          onClick={e => {
            if (props.onClickButton) props.onClickButton(e);
          }}
          className={`${style.button}`}
          customType='cancelButton'
        >
          {props.textButton}
        </CustomButton>
      )}
    </div>
  );
}
