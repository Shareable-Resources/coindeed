import { ReactElement } from 'react';

interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button contents
   */
  label?: string;
  /**
   * Button contents
   */
  children?: ReactElement | ReactElement[];
  /**
   * Optional click handler
   */
  onClick?: () => void;
  className?: string;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  children,
  className,
  ...props
}: ButtonProps) => {
  const mode = primary
    ? // ? 'bg-gradient-to-r from-gradient-purple via-gradient-purple to-gradient-blue hover:from-gradient-blue hover:to-gradient-purple'
      'bg-grad-button'
    : 'bg-black border-2 border-white hover:bg-black-light';
  return (
    <button
      type='button'
      className={`inline-flex items-center px-5 py-2 text-sm leading-4 font-medium rounded-md shadow-sm text-white ${mode} ${className}`}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
      {children}
    </button>
  );
};
