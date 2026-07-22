import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addFollowUpNote,
} from '../controllers/customer.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', requireRole(['ADMIN', 'SALES']), createCustomer);
router.put('/:id', requireRole(['ADMIN', 'SALES']), updateCustomer);
router.post('/:id/notes', requireRole(['ADMIN', 'SALES']), addFollowUpNote);

export default router;
