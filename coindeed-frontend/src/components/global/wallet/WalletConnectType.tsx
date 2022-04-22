import { LIST_WALLET } from '../../../utils/Constants';
import { getMobileOperatingSystem } from '../../../utils/helper';
import { typeWalletInfo } from './WalletButton';

type WalletConnectTypeProps = {
  name: string;
  img: string;
  connect: (data: typeWalletInfo) => void;
};

const metamask_deeplink = process.env.REACT_APP_METAMASK_DEEPLINK;

export default function WalletconnectType({ name, img, connect }: WalletConnectTypeProps) {
  const clickWallet = () => {
    if (name === LIST_WALLET.Metamask.name) {
      if (!window?.ethereum?.isMetaMask) {
        window.open(getMobileOperatingSystem() !== undefined ? metamask_deeplink : 'https://metamask.io/download.html');
        return;
      }
    }
    connect({ walletName: name, walletIcon: img });
  };

  return (
    <div className='flex items-center mb-6 py-4 px-6 rounded-xl bg-background-3 cursor-pointer' onClick={clickWallet}>
      <h1 className='text-lg truncate mb-0 text-white font-semibold flex-1'>{name}</h1>
      <div className='w-10 h-10 rounded-lg p-1 bg-white'>
        <img className='w-full h-full' src={img} draggable='false' loading='lazy' alt='' />
      </div>
    </div>
  );
}
