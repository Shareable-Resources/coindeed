import openPage from '../../../images/OpenPageGradient.svg';
import shareLink from '../../../images/ShareGradient.svg';
import { ShareWholesaleModal } from '../../wholesales/modal/share';
import { useState } from 'react';

type EditLinksProps = {
  ethplorer: string;
  share: string;
  title2: string;
  shareId?: string;
  isDeed: boolean;
};

export default function EditLinks({ ethplorer, share, title2, shareId, isDeed }: EditLinksProps) {
  const [openShare, setOpenShare] = useState(false);
  return (
    <>
      <a
        href={`https://rinkeby.etherscan.io/address/${ethplorer}`}
        target='_blank'
        rel='noreferrer'
        className='mr-5 flex text-xs font-semibold items-center text-white hover:text-white'
      >
        View on Etherscan
        <img className='ml-2' src={openPage} alt='open' />
      </a>
      <div
        className='flex font-semibold text-xs items-center text-white hover:text-white cursor-pointer'
        onClick={() => setOpenShare(true)}
      >
        Share {title2}
        <img className='ml-2' src={shareLink} alt='share' />
      </div>

      {isDeed ? (
        <ShareWholesaleModal
          open={openShare}
          setOpen={setOpenShare}
          shareId={share as string}
          ethplorer={ethplorer}
          title={'Share Deed'}
        />
      ) : (
        <ShareWholesaleModal
          open={openShare}
          setOpen={setOpenShare}
          shareId={share as string}
          ethplorer={ethplorer}
          title={'Share Wholesale'}
        />
      )}
    </>
  );
}
