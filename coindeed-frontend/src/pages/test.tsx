import { useWeb3React } from '@web3-react/core';
import { Header } from '../components/global/header/Header';
import { injected } from '../services/wallet';

export default function TestPage() {
  const web3 = useWeb3React();
  const { activate, active, deactivate, account, chainId } = web3;

  async function signInOut() {
    try {
      if (active) {
        deactivate();
      } else {
        await activate(injected);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function testClick() {}

  return (
    <>
      <Header />
      <div>active: {active.toString()}</div>
      <div>account: {account}</div>
      <div>chainId: {chainId}</div>
      {/* <div>error: {error}</div> */}
      {/* <div>connector: {connector}</div> */}
      {/* <div>library: {library}</div> */}
      <div className='mb-8' />
      <button onClick={signInOut}>{active ? 'Disconnect' : 'Connect'}</button>
      <br />
      <button onClick={testClick}>Click</button>
      <br />
    </>
  );
}
