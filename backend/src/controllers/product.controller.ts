import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, lowStock, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { category: { contains: q } },
        { location: { contains: q } },
      ];
    }

    let products = await prisma.product.findMany({
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

    const total = await prisma.product.count({ where });

    return res.status(200).json({
      data: products,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch product detail', error: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, sku, category, unitPrice, currentStock, minStockAlert, location, imageUrl } = req.body;

    if (!name || !sku || !category || unitPrice === undefined || currentStock === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: name, sku, category, unitPrice, and currentStock are mandatory.',
      });
    }

    const existingSku = await prisma.product.findUnique({ where: { sku: sku.trim().toUpperCase() } });
    if (existingSku) {
      return res.status(400).json({ message: `SKU '${sku}' already exists in inventory.` });
    }

    const product = await prisma.product.create({
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
      await prisma.stockMovement.create({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, unitPrice, minStockAlert, location, imageUrl } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await prisma.product.update({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response) => {
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

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let newStock = product.currentStock;
    if (movementType === 'IN') {
      newStock += qtyNum;
    } else if (movementType === 'OUT') {
      if (product.currentStock < qtyNum) {
        return res.status(400).json({
          message: `Insufficient stock for '${product.name}'. Available: ${product.currentStock}, requested reduction: ${qtyNum}`,
        });
      }
      newStock -= qtyNum;
    } else {
      return res.status(400).json({ message: "movementType must be either 'IN' or 'OUT'." });
    }

    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { currentStock: newStock },
      }),
      prisma.stockMovement.create({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to adjust stock', error: error.message });
  }
};

export const getStockMovements = async (req: AuthRequest, res: Response) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        product: {
          select: { name: true, sku: true, category: true },
        },
      },
    });

    return res.status(200).json(movements);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch stock movements', error: error.message });
  }
};
