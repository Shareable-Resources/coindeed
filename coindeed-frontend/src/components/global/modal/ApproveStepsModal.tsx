import React from 'react';
import 'react-step-progress-bar/styles.css';
import { ProgressBar, Step } from 'react-step-progress-bar';
import tick from '../../../images/tick.png';

interface ModalProgressBarProps {
  isApproveToken: boolean;
  title1?: string;
  title2: string;
}

export default function ApproveStepsModal({ isApproveToken, title1 = 'Approve', title2 }: ModalProgressBarProps) {
  //   const steps = [
  //     {
  //       status: "Authorization"
  //     },
  //     {
  //       status: "Create Deed"
  //     },
  //   ]
  //     // setup the step content
  // const step1Content = <h1>Step 1 Content</h1>;
  // const step2Content = <h1>Step 2 Content</h1>;
  // const step3Content = <h1>Step 3 Content</h1>;

  // setup step validators, will be called before proceeding to the next step
  //function step2Validator() {
  // return a boolean
  //  return true
  //}

  //function step3Validator() {
  // return a boolean
  //  return true
  //}

  //function onFormSubmit() {
  // handle the submit logic here
  // This function will be executed at the last step
  // when the submit button (next button in the previous steps) is pressed
  //}

  return (
    <div className='flex flex-col mt-8 mb-4'>
      <div className='w-max-full px-16'>
        <ProgressBar
          percent={isApproveToken ? 100 : 0}
          filledBackground='linear-gradient(to right, #00BEDF, #0068B3)'
          height='2px'
        >
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
                  color: isApproveToken ? 'white' : 'black',
                  backgroundColor: isApproveToken ? '#00BEDF' : 'white',
                }}
              >
                <div className='flex'>{isApproveToken ? <img src={tick} alt='tick' /> : <div>{1}</div>}</div>
              </div>
            )}
          />
          <Step
            position={0}
            transition='scale'
            children={({ accomplished }: any) => (
              <div
                className={
                  isApproveToken
                    ? 'text-gray bg-white border border-white'
                    : 'bg-modal border border-white-half text-white-half'
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                }}
              >
                <div className='flex'>{2}</div>
              </div>
            )}
          />
        </ProgressBar>
      </div>
      <div className='flex mt-4 text-white text-xs relative'>
        <div className='approve-steps-modal-title-left flex justify-center'>{isApproveToken ? 'Approve' : title1}</div>
        <div
          className={
            isApproveToken
              ? 'approve-steps-modal-title-right ml-auto flex justify-center'
              : 'approve-steps-modal-title-left text-white-half ml-auto flex justify-center'
          }
        >
          {title2}
        </div>
      </div>
    </div>
  );
}
