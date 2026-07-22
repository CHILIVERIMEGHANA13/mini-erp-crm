import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus,
} from '../controllers/challan.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getChallans);
router.get('/:id', getChallanById);
router.post('/', requireRole(['ADMIN', 'SALES']), createChallan);
router.patch('/:id/status', requireRole(['ADMIN', 'SALES', 'ACCOUNTS']), updateChallanStatus);

export default router;
