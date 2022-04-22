import './style.scss';

interface typeCustomButton
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  customType?: 'OkButton' | 'cancelButton';
}

export default function CustomButton(props: typeCustomButton) {
  return (
    <button
      {...props}
      className={`ant-btn ant-btn-primary coindeed__antd--button ${props.className || ''} ${props.customType || ''}`}
    />
  );
}
