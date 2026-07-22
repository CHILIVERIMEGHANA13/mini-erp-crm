"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const challan_routes_1 = __importDefault(require("./routes/challan.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const db_1 = require("./db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        system: 'Mini ERP + CRM Operations Portal Backend API',
        timestamp: new Date().toISOString(),
    });
});
// Routes
app.use('/auth', auth_routes_1.default);
app.use('/customers', customer_routes_1.default);
app.use('/products', product_routes_1.default);
app.use('/challans', challan_routes_1.default);
// Dashboard Summary Endpoint
app.get('/dashboard/stats', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const [totalCustomers, activeCustomers, totalProducts, lowStockProducts, totalChallans, confirmedChallans] = await Promise.all([
            db_1.prisma.customer.count(),
            db_1.prisma.customer.count({ where: { status: 'Active' } }),
            db_1.prisma.product.count(),
            db_1.prisma.product.count({
                where: {
                    currentStock: { lte: db_1.prisma.product.fields.minStockAlert },
                },
            }),
            db_1.prisma.challan.count(),
            db_1.prisma.challan.count({ where: { status: 'CONFIRMED' } }),
        ]);
        const revenueResult = await db_1.prisma.challan.aggregate({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
    }
});
// Global 404
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});
app.listen(config_1.PORT, () => {
    console.log(`🚀 Mini ERP + CRM Backend running on http://localhost:${config_1.PORT}`);
});
