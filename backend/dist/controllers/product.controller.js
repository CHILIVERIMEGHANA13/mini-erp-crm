"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockMovements = exports.adjustStock = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const db_1 = require("../db");
const getProducts = async (req, res) => {
    try {
        const { search, category, lowStock, page = '1', limit = '50' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (category) {
            where.category = category;
        }
        if (search) {
            const q = search.trim();
            where.OR = [
                { name: { contains: q } },
                { sku: { contains: q } },
                { category: { contains: q } },
                { location: { contains: q } },
            ];
        }
        let products = await db_1.prisma.product.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { updatedAt: 'desc' },
            include: {
                movements: {
                    take: 3,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (lowStock === 'true') {
            products = products.filter((p) => p.currentStock <= p.minStockAlert);
        }
        const total = await db_1.prisma.product.count({ where });
        return res.status(200).json({
            data: products,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch products', error: error.message });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await db_1.prisma.product.findUnique({
            where: { id },
            include: {
                movements: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product);
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch product detail', error: error.message });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const { name, sku, category, unitPrice, currentStock, minStockAlert, location, imageUrl } = req.body;
        if (!name || !sku || !category || unitPrice === undefined || currentStock === undefined) {
            return res.status(400).json({
                message: 'Missing required fields: name, sku, category, unitPrice, and currentStock are mandatory.',
            });
        }
        const existingSku = await db_1.prisma.product.findUnique({ where: { sku: sku.trim().toUpperCase() } });
        if (existingSku) {
            return res.status(400).json({ message: `SKU '${sku}' already exists in inventory.` });
        }
        const product = await db_1.prisma.product.create({
            data: {
                name,
                sku: sku.trim().toUpperCase(),
                category,
                unitPrice: parseFloat(unitPrice),
                currentStock: parseInt(currentStock, 10),
                minStockAlert: parseInt(minStockAlert || 5, 10),
                location: location || 'Warehouse Main',
                imageUrl: imageUrl || null,
            },
        });
        // Create initial stock movement log if initial stock > 0
        if (product.currentStock > 0) {
            await db_1.prisma.stockMovement.create({
                data: {
                    productId: product.id,
                    quantity: product.currentStock,
                    movementType: 'IN',
                    reason: 'Initial Product Stocking',
                    createdBy: req.user?.name || 'System',
                },
            });
        }
        return res.status(201).json({ message: 'Product created successfully', product });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to create product', error: error.message });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, unitPrice, minStockAlert, location, imageUrl } = req.body;
        const existing = await db_1.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = await db_1.prisma.product.update({
            where: { id },
            data: {
                name: name ?? existing.name,
                category: category ?? existing.category,
                unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : existing.unitPrice,
                minStockAlert: minStockAlert !== undefined ? parseInt(minStockAlert, 10) : existing.minStockAlert,
                location: location ?? existing.location,
                imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
            },
        });
        return res.status(200).json({ message: 'Product updated successfully', product });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
};
exports.updateProduct = updateProduct;
const adjustStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, movementType, reason } = req.body;
        if (!quantity || !movementType || !reason) {
            return res.status(400).json({ message: 'quantity, movementType (IN or OUT), and reason are required.' });
        }
        const qtyNum = parseInt(quantity, 10);
        if (isNaN(qtyNum) || qtyNum <= 0) {
            return res.status(400).json({ message: 'Quantity must be a positive integer.' });
        }
        const product = await db_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        let newStock = product.currentStock;
        if (movementType === 'IN') {
            newStock += qtyNum;
        }
        else if (movementType === 'OUT') {
            if (product.currentStock < qtyNum) {
                return res.status(400).json({
                    message: `Insufficient stock for '${product.name}'. Available: ${product.currentStock}, requested reduction: ${qtyNum}`,
                });
            }
            newStock -= qtyNum;
        }
        else {
            return res.status(400).json({ message: "movementType must be either 'IN' or 'OUT'." });
        }
        const [updatedProduct, movement] = await db_1.prisma.$transaction([
            db_1.prisma.product.update({
                where: { id },
                data: { currentStock: newStock },
            }),
            db_1.prisma.stockMovement.create({
                data: {
                    productId: id,
                    quantity: qtyNum,
                    movementType,
                    reason,
                    createdBy: req.user?.name || 'System',
                },
            }),
        ]);
        return res.status(200).json({
            message: `Stock successfully adjusted (${movementType} ${qtyNum})`,
            product: updatedProduct,
            movement,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to adjust stock', error: error.message });
    }
};
exports.adjustStock = adjustStock;
const getStockMovements = async (req, res) => {
    try {
        const movements = await db_1.prisma.stockMovement.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                product: {
                    select: { name: true, sku: true, category: true },
                },
            },
        });
        return res.status(200).json(movements);
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch stock movements', error: error.message });
    }
};
exports.getStockMovements = getStockMovements;
