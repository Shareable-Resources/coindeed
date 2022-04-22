type EditGraphProps = {
  title: string;
  interestEarned?: number;
  interestPaid?: number;
  status?: number;
};

export default function EditGraph({ title, status, interestEarned, interestPaid }: EditGraphProps) {
  return (
    <div className='p-4 bg-panel bg-opacity-50 rounded-lg' style={{ height: '252px' }}>
      {status !== undefined && (status === 2 || status === 3) ? (
        <div className='flex flex-row justify-between'>
          <h2 className='text-white text-xs font-bold'>{title}</h2>
          <div>
            <span className='font-semibold text-xs'>
              Interest Earned:{' '}
              <span className='font-normal text-xs'>
                {' '}
                {interestEarned !== undefined ? interestEarned : null} Dtokens
              </span>
            </span>
            <span className='ml-3.5 font-semibold text-xs'>
              Interest Paid:{' '}
              <span className='font-normal text-xs'>{interestPaid !== undefined ? interestPaid : null} Dtokens </span>
            </span>
          </div>
        </div>
      ) : (
        <div className='flex flex-row'>
          <h2 className='text-white text-xs font-bold'>{title}</h2>
        </div>
      )}
    </div>
  );
}
