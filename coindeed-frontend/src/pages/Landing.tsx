import { Link } from 'react-router-dom';
import { Button } from '../components/global/Button';
import Top from '../components/global/Top';
import Footer from '../components/global/Footer';

export default function Landing() {
  return (
    <>
      <Top />
      <main className='min-h-screen bg-black text-white flex flex-col items-center justify-center'>
        <div className='flex flex-col'>
          <h1 className='text-5xl font-bold'>Coindeed</h1>
          <Link to='/deed' className='mt-8'>
            <Button label='Start Application' primary />
          </Link>

          <Footer />
        </div>
      </main>
    </>
  );
}
