import express, { Router } from 'express';
import {
  getListLendingPools, getLendingPoolByTokenAddress, createPool, updatePool, getLendingPoolByID, getLendingPoolByOracelTokenAddress, deletePool,
} from '../config/controllers/lendingPoolController';

const router: Router = express.Router();

router.get('/', getListLendingPools);
router.get('/:id', getLendingPoolByID);
router.get('/token-address/:tokenAddress', getLendingPoolByTokenAddress);
router.get('/oracel-token-address/:oracelTokenAddress', getLendingPoolByOracelTokenAddress);

router.post('/', createPool);
router.put('/', updatePool);
router.delete('/:id', deletePool);

export default router;
