import { useState } from 'react';
import { WHOLESALE_COMPLETED, WHOLESALE_OPEN } from '../../../utils/Constants';
import CustomButton from '../../global/antd/CustomButton';
import { CancelWholesaleModal } from '../modal/cancel';
import { ClaimWholesaleModal } from '../modal/claim';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

type WholesaleActionProps = {
  isWholesaler: boolean;
  isPublic: boolean;
  wholesale: any;
};

export default function WholesaleAction({ wholesale, isPublic, isWholesaler }: WholesaleActionProps) {
  // CURRENT USER ADDRESSC CONNECTED WALLET
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const dispatch = useDispatch();
  const [openCancel, setOpenCancel] = useState(false);
  const [openClaim, setOpenClaim] = useState(false);
  const endDate = moment.unix(wholesale.deadline);
  const diffTime = moment().diff(endDate) * -1;
  const wholesaleState = useSelector((state: any) => state.wholesale.state);
  return (
    <div>
      {isWholesaler && wholesale.status === WHOLESALE_OPEN && diffTime > 0 && wholesaleState === wholesale.status && (
        <div className='flex'>
          <div className='actionButton'>
            <CustomButton
              customType='cancelButton'
              onClick={() => {
                if (userAddress) {
                  return setOpenCancel(true);
                } else {
                  return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
                }
              }}
            >
              Cancel
            </CustomButton>
          </div>
        </div>
      )}
      {isWholesaler && wholesale.status === WHOLESALE_COMPLETED && wholesaleState === wholesale.status && (
        <div className='flex'>
          <div className='actionButton'>
            <CustomButton
              customType='OkButton'
              onClick={() => {
                if (userAddress) {
                  return setOpenClaim(true);
                } else {
                  return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
                }
              }}
            >
              Claim
            </CustomButton>
          </div>
        </div>
      )}
      {isWholesaler && wholesale.status === WHOLESALE_OPEN && diffTime < 0 && wholesaleState === wholesale.status && (
        <div className='flex'>
          <div className='actionButton'>
            <CustomButton
              customType='OkButton'
              onClick={() => {
                if (userAddress) {
                  return setOpenClaim(true);
                } else {
                  return dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
                }
              }}
            >
              Claim
            </CustomButton>
          </div>
        </div>
      )}
      <CancelWholesaleModal open={openCancel} setOpen={setOpenCancel} saleId={wholesale.saleId} />
      <ClaimWholesaleModal open={openClaim} setOpen={setOpenClaim} wholesale={wholesale} />
    </div>
  );
}
