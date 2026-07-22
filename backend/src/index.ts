import express, { Request, Response } from 'express';
import cors from 'cors';
import { PORT } from './config';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import challanRoutes from './routes/challan.routes';
import { authenticateToken, AuthRequest } from './middleware/auth.middleware';
import { prisma } from './db';

const app = express();

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    system: 'Mini ERP + CRM Operations Portal Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/challans', challanRoutes);

// Dashboard Summary Endpoint
app.get('/dashboard/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [totalCustomers, activeCustomers, totalProducts, lowStockProducts, totalChallans, confirmedChallans] =
      await Promise.all([
        prisma.customer.count(),
        prisma.customer.count({ where: { status: 'Active' } }),
        prisma.product.count(),
        prisma.product.count({
          where: {
            currentStock: { lte: prisma.product.fields.minStockAlert },
          },
        }),
        prisma.challan.count(),
        prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      ]);

    const revenueResult = await prisma.challan.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'CONFIRMED' },
    });

    return res.status(200).json({
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProducts,
      totalChallans,
      confirmedChallans,
      totalRevenue: revenueResult._sum.totalAmount || 0,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

// Global 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

app.listen(PORT, () => {
  console.log(`🚀 Mini ERP + CRM Backend running on http://localhost:${PORT}`);
});
