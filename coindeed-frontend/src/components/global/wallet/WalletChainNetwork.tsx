import { useWeb3React } from '@web3-react/core';
import { Modal } from 'antd';

const CHAIN_NETWORK = process.env.REACT_APP_CHAIN_NETWORK;

const IconError = (props: any) => (
  <svg
    width='80'
    height='80'
    viewBox='0 0 80 80'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={props.className}
  >
    <rect width='80' height='80' rx='40' fill='#FF6464' />
    <path
      fill-rule='evenodd'
      clip-rule='evenodd'
      d='M27.9795 23.7363L23.7369 27.9789L35.7579 39.9999L23.7368 52.021L27.9795 56.2636L40.0005 44.2426L52.0212 56.2632L56.2638 52.0205L44.2432 39.9999L56.2637 27.9794L52.0211 23.7367L40.0005 35.7573L27.9795 23.7363Z'
      fill='white'
    />
  </svg>
);

const ExitIcon = (props: any) => (
  <svg
    width='12'
    height='12'
    viewBox='0 0 12 12'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
    className={props.className}
  >
    <path d='M7.54278 6L11.6805 1.8623C12.1065 1.43627 12.1065 0.745546 11.6805 0.31952C11.2545 -0.106506 10.5637 -0.106507 10.1377 0.31952L6 4.45722L1.8623 0.31952C1.43627 -0.106506 0.745546 -0.106506 0.31952 0.31952C-0.106507 0.745547 -0.106507 1.43627 0.31952 1.8623L4.45722 6L0.31952 10.1377C-0.106507 10.5637 -0.106506 11.2545 0.31952 11.6805C0.745547 12.1065 1.43627 12.1065 1.8623 11.6805L6 7.54278L10.1377 11.6805C10.5637 12.1065 11.2545 12.1065 11.6805 11.6805C12.1065 11.2545 12.1065 10.5637 11.6805 10.1377L7.54278 6Z' />
  </svg>
);

export default function WalletChainNetwork() {
  const { chainId } = useWeb3React();
  //eslint-disable-next-line
  const getTextOfChainID = (chainId: number) => {
    if (chainId === 1) return 'Ethereum Main Network';
    if (chainId === 4) return 'Rinkeby Test Network';
    return undefined;
  };
  return (
    (chainId && (
      <Modal
        visible={chainId !== Number(CHAIN_NETWORK)}
        closable={false}
        footer={null}
        bodyStyle={{
          padding: 0,
          background: 'transparent',
          overflow: 'hidden',
        }}
        maskStyle={{ background: '#6b7280bf' }}
        width='auto'
        centered
      >
        <div className='p-10 bg-background' style={{ width: 600 }}>
          <div className='flex items-center mb-8'>
            <p className='flex-1 text-white font-semibold text-2xl mb-0'>Unsupported Network</p>
            <ExitIcon className='text-white cursor-pointer hidden' />
          </div>

          <hr className='opacity-20 mb-8' />

          <div className='bg-background-2 rounded-lg border border-opacity-10 p-5 flex items-center flex-col text-center'>
            <IconError className='w-20 h-20 mb-7' />
            {/* <h1 className='text-white capitalize font-bold text-2xl tracking-wide'>Wrong network</h1> */}
            <p className='mb-0 text-white font-normal text-xs leading-6 tracking-wide' style={{ maxWidth: 336 }}>
              CoinDeed is currently not supported on your network. Please switch to the Rinkeby Test Network to use
              CoinDeed.
            </p>
          </div>
        </div>
      </Modal>
    )) || <></>
  );
}
