import express, { Router } from 'express';
import {
  deleteDepositToken,
  deletePurchaseToken,
  // getWholesales,
  getWholesale,
  getWholesalesV2,
  importDepositToken,
  importToken,
  updateDepositToken,
  updatePurchseToken,
} from '../config/controllers/wholesaleController';
import { getDepositToken, getDepositTokens, getPurchaseToken, getPurchaseTokens } from '../config/controllers/deedController';
const router: Router = express.Router();

// return all deeds
router.get('/', getWholesalesV2);
router.get('/deposit-tokens', getDepositTokens);
router.get('/purchase-tokens', getPurchaseTokens);
router.get('/purchase-token', getPurchaseToken);
router.get('/deposit-token', getDepositToken);
// return a single deed
router.get('/:wholesaleAddress', getWholesale);

// import new token
router.post('/import-token', importToken);
router.post('/import-deposit-token', importDepositToken);
router.delete('/delete-purchase-token', deletePurchaseToken);
router.delete('/delete-deposit-token', deleteDepositToken);
router.put('/update-purchase-token', updatePurchseToken);
router.put('/update-deposit-token', updateDepositToken);

export default router;
