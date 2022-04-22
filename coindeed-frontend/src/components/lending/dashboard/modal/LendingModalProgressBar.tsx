import { ProgressBar, Step } from 'react-step-progress-bar';
import tick from '../../../../images/tick.png';

type LendingModalProgressBarProps = {
  percent?: number;
  stepTwo?: string;
};

export default function LendingModalProgressBar({ percent = 0, stepTwo = 'Supply' }: LendingModalProgressBarProps) {
  return (
    <div className='w-48 mt-8 mb-20 relative'>
      <ProgressBar percent={percent} filledBackground='linear-gradient(to right, #00BEDF, #0068B3)' height='2px'>
        <Step
          position={0}
          transition='scale'
          children={({ accomplished }: any) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                width: 20,
                height: 20,
                color: accomplished ? 'black' : 'white',
                backgroundColor: accomplished && percent === 100 ? '#444444' : accomplished ? 'white' : 'gray',
              }}
            >
              <span className='relative top-10 text-sm text-white'>Authorization</span>

              {percent === 100 ? (
                <img className='relative right-10' src={tick} alt='tick' />
              ) : (
                <span className='relative right-11'>{1}</span>
              )}
            </div>
          )}
        />

        <Step
          position={0}
          transition='scale'
          children={({ accomplished }: any) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                width: 20,
                height: 20,
                color: accomplished ? 'black' : 'white',
                backgroundColor: accomplished ? 'white' : 'gray',
              }}
            >
              <span className='relative top-10 text-sm text-white'>{stepTwo}</span>
              <span className='relative right-5 whitespace-nowrap'>{2}</span>
            </div>
          )}
        />
      </ProgressBar>
    </div>
  );
}
