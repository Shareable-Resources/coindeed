interface ProgressBarProps {
  progress: number;
  rounded?: boolean;
  large?: boolean;
}

export const ProgressBar = ({ progress, rounded = false, large = false }: ProgressBarProps) => (
  <>
    {large ? (
      <div className='flex flex-col justify-center'>
        <div className='relative h-2 rounded w-100 bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue'>
          {progress > 0 ? (
            <div
              className='h-full bg-white absolute rounded-br rounded-tr right-0'
              style={{ width: `${100 - progress}%` }}
            />
          ) : (
            <div className='h-full bg-white absolute rounded right-0' style={{ width: `${100 - progress}%` }} />
          )}
        </div>
      </div>
    ) : (
      <>
        {rounded ? (
          <div className='flex flex-col justify-center'>
            <div className='relative h-1 rounded w-24 bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue'>
              {progress > 0 ? (
                <div
                  className='h-full bg-white absolute rounded-br rounded-tr right-0'
                  style={{ width: `${100 - progress}%` }}
                />
              ) : (
                <div className='h-full bg-white absolute rounded right-0' style={{ width: `${100 - progress}%` }} />
              )}
            </div>
          </div>
        ) : (
          <div className='flex flex-col justify-center'>
            <div className='relative h-1 w-24 bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue'>
              <div className='h-full bg-gray-700 absolute right-0' style={{ width: `${100 - progress}%` }} />
            </div>
          </div>
        )}
      </>
    )}
  </>
);
