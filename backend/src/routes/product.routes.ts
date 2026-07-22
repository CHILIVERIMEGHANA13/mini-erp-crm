import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
  getStockMovements,
} from '../controllers/product.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getProducts);
router.get('/movements', getStockMovements);
router.get('/:id', getProductById);
router.post('/', requireRole(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', requireRole(['ADMIN', 'WAREHOUSE']), updateProduct);
router.post('/:id/adjust-stock', requireRole(['ADMIN', 'WAREHOUSE']), adjustStock);

export default router;
