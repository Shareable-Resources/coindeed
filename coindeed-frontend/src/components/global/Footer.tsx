import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <div className='mt-8 flex flex-row justify-center'>
      <Link to='/faq' className='mr-2'>
        FAQ
      </Link>{' '}
      |{' '}
      <Link to='/privacy' className='ml-2 mr-2'>
        Privacy Policy
      </Link>{' '}
      |{' '}
      <Link to='/terms' className='ml-2'>
        Terms of Service
      </Link>
    </div>
  );
}
