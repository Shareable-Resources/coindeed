import express, { Router } from 'express';
import { getDeed, createDeed, updateDeed, getDeedsV2, getDepositTokens, getPurchaseTokens, createTokens } from '../config/controllers/deedController';
const router: Router = express.Router();

// return all deeds
router.get('/', getDeedsV2);
// this is to deposit tokens for testing
router.get('/createTokens', createTokens);
router.get('/deposit-tokens', getDepositTokens);
router.get('/purchase-tokens', getPurchaseTokens);
router.get('/:deedAddress', getDeed);

// create deed
router.post('/create', createDeed);
router.put('/update', updateDeed);

export default router;
