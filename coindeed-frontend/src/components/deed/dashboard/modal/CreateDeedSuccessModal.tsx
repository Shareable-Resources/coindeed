import { Fragment } from 'react';

import { Modal } from 'antd';

import { ModalHorizontalRule, ModalMainHeader } from './modalComponents';

import CloseModal from '../../../../images/icons/CloseModal.svg';
import CustomButton from '../../../global/antd/CustomButton';

interface CreateDeedSuccessModalProps {
  shoudShowCreateDeedSuccessModalToggled: boolean;
  toggleCreateDeedSuccessModal: any;
}

function CreateDeedSuccessModal({
  shoudShowCreateDeedSuccessModalToggled,
  toggleCreateDeedSuccessModal,
}: CreateDeedSuccessModalProps) {
  return (
    <Fragment>
      <Modal
        className=''
        centered
        visible={shoudShowCreateDeedSuccessModalToggled}
        onOk={toggleCreateDeedSuccessModal}
        onCancel={toggleCreateDeedSuccessModal}
        footer={null}
        width={600}
        maskClosable={false}
        closeIcon={
          <img
            className='absolute top-40px right-40px'
            onClick={toggleCreateDeedSuccessModal}
            alt='close'
            src={CloseModal}
            width='12px'
            height='12px'
          />
        }
      >
        <ModalMainHeader title='Create Deed' />
        <ModalHorizontalRule />

        <p className='bg-background-2 text-modal-message text-center mb-10 text-white border border-opacity-20 rounded-lg py-20px px-60px mb-20px'>
          Your Deed is currently processing and may take a moment to be verified on the chain.
          <br />
          <br />
          Please check back in a few minutes.
        </p>

        <ModalHorizontalRule />

        <div className='mt-4 text-center'>
          <CustomButton customType='OkButton' onClick={toggleCreateDeedSuccessModal}>
            Close
          </CustomButton>
        </div>
      </Modal>
    </Fragment>
  );
}

export default CreateDeedSuccessModal;
