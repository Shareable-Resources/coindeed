import { Wholesale } from '../dashboard/WholesaleTable';

type ViewWholesaleButtonsProps = {
  wholesale: Wholesale;
  wholesaler?: boolean;
  deedManager?: boolean;
  pub?: boolean;
  priv?: boolean;
  canceled?: boolean;
  reserved?: boolean;
};

export const ViewWholesaleButtons = ({
  wholesale,
  wholesaler = false,
  deedManager = false,
  pub = false,
  priv = false,
  canceled = false,
  reserved = false,
}: ViewWholesaleButtonsProps) => {
  return (
    <div className='mb-auto ml-auto'>
      {wholesaler && (
        <>
          <button className='ml-4 px-6 py-2 text-xs bg-white text-black border-2 border-white rounded-md'>
            Claim
          </button>
          <button className='ml-4 px-6 py-2 text-xs border-2 border-red-500 text-red-500 rounded-md'>
            Cancel
          </button>
        </>
      )}
      {deedManager && (pub || priv) && !canceled && !reserved && (
        <button className='ml-4 px-6 py-2 text-xs bg-white text-black border-2 border-white rounded-md'>
          Reserve
        </button>
      )}
      {deedManager && pub && canceled && <></>}
      {deedManager && pub && reserved && !canceled && (
        <button className='ml-4 px-6 py-2 text-xs bg-white text-black border-2 border-white rounded-md'>
          Reserve
        </button>
      )}
    </div>
  );
};
