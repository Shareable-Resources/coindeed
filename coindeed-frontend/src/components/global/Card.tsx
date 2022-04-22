import { ReactElement } from 'react';

interface CardProps {
  title?: string;
  children?: ReactElement | ReactElement[];
  type?: string;
  className?: string;
}

export const Card = ({ title, children, type, className }: CardProps) => (
  <>
    {title && <h2 className='mb-1 text-left text-white font-semibold text-base'>{title}</h2>}
    <div className={`${type === 'fixed' ? 'h-96' : ''} bg-panel bg-opacity-40 px-6 py-4 rounded-lg ${className || ''}`}>
      {children}
    </div>
  </>
);
