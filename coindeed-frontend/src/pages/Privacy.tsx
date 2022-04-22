import Top from '../components/global/Top';
import Footer from '../components/global/Footer';

export default function Privacy() {
  return (
    <>
      <Top />
      <main className='min-h-screen bg-black text-white flex flex-col items-center justify-center'>
        <div className='flex flex-col'>
          <h1 className='text-5xl font-bold'>Privacy Policy</h1>
          <Footer />
        </div>
      </main>
    </>
  );
}
