"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChallanStatus = exports.createChallan = exports.getChallanById = exports.getChallans = void 0;
const db_1 = require("../db");
// Helper to generate serial Challan Number CH-YYYYMM-XXXX
async function generateChallanNumber() {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `CH-${yearMonth}-`;
    const lastChallan = await db_1.prisma.challan.findFirst({
        where: { challanNumber: { startsWith: prefix } },
        orderBy: { createdAt: 'desc' },
    });
    let seq = 1;
    if (lastChallan) {
        const parts = lastChallan.challanNumber.split('-');
        if (parts.length === 3) {
            const lastSeq = parseInt(parts[2], 10);
            if (!isNaN(lastSeq)) {
                seq = lastSeq + 1;
            }
        }
    }
    return `${prefix}${String(seq).padStart(4, '0')}`;
}
const getChallans = async (req, res) => {
    try {
        const { status, search, page = '1', limit = '50' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            const q = search.trim();
            where.OR = [
                { challanNumber: { contains: q } },
                { customerSnapshot: { contains: q } },
                { createdBy: { contains: q } },
            ];
        }
        const [challans, total] = await Promise.all([
            db_1.prisma.challan.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true,
                    customer: {
                        select: { name: true, businessName: true, email: true, mobile: true },
                    },
                },
            }),
            db_1.prisma.challan.count({ where }),
        ]);
        // Parse JSON snapshots for response
        const parsedChallans = challans.map((c) => ({
            ...c,
            customerSnapshot: JSON.parse(c.customerSnapshot),
            items: c.items.map((item) => ({
                ...item,
                productSnapshot: JSON.parse(item.productSnapshot),
            })),
        }));
        return res.status(200).json({
            data: parsedChallans,
            meta: { total, page: pageNum, limit: limitNum },
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch challans', error: error.message });
    }
};
exports.getChallans = getChallans;
const getChallanById = async (req, res) => {
    try {
        const { id } = req.params;
        const challan = await db_1.prisma.challan.findUnique({
            where: { id },
            include: {
                items: true,
                customer: true,
            },
        });
        if (!challan) {
            return res.status(404).json({ message: 'Challan not found' });
        }
        const parsed = {
            ...challan,
            customerSnapshot: JSON.parse(challan.customerSnapshot),
            items: challan.items.map((item) => ({
                ...item,
                productSnapshot: JSON.parse(item.productSnapshot),
            })),
        };
        return res.status(200).json(parsed);
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch challan details', error: error.message });
    }
};
exports.getChallanById = getChallanById;
const createChallan = async (req, res) => {
    try {
        const { customerId, items, status = 'DRAFT' } = req.body;
        if (!customerId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Invalid request payload. customerId and non-empty items array are required.',
            });
        }
        // 1. Fetch Customer
        const customer = await db_1.prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            return res.status(404).json({ message: 'Selected customer does not exist.' });
        }
        // Snapshot of Customer
        const customerSnapshot = {
            id: customer.id,
            name: customer.name,
            businessName: customer.businessName,
            email: customer.email,
            mobile: customer.mobile,
            gstNumber: customer.gstNumber,
            address: customer.address,
            type: customer.type,
        };
        // 2. Fetch all products in line items
        const productIds = items.map((i) => i.productId);
        const products = await db_1.prisma.product.findMany({
            where: { id: { in: productIds } },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));
        // Validate all items exist
        for (const item of items) {
            if (!productMap.has(item.productId)) {
                return res.status(400).json({ message: `Product ID '${item.productId}' not found in inventory.` });
            }
            if (!item.quantity || item.quantity <= 0) {
                return res.status(400).json({ message: 'Quantity for all items must be greater than 0.' });
            }
        }
        // 3. Check stock sufficiency if status is CONFIRMED
        if (status === 'CONFIRMED') {
            for (const item of items) {
                const prod = productMap.get(item.productId);
                if (prod.currentStock < item.quantity) {
                    return res.status(400).json({
                        message: `Insufficient stock for product '${prod.name}' (SKU: ${prod.sku}). Available: ${prod.currentStock}, requested in challan: ${item.quantity}`,
                    });
                }
            }
        }
        // 4. Generate Challan Number
        const challanNumber = await generateChallanNumber();
        // Calculate totals & build item array with product snapshots
        let totalQuantity = 0;
        let totalAmount = 0;
        const challanItemsData = items.map((item) => {
            const prod = productMap.get(item.productId);
            const unitPrice = item.unitPrice !== undefined ? parseFloat(item.unitPrice) : prod.unitPrice;
            const lineTotal = unitPrice * item.quantity;
            totalQuantity += item.quantity;
            totalAmount += lineTotal;
            const productSnapshot = {
                id: prod.id,
                name: prod.name,
                sku: prod.sku,
                category: prod.category,
                unitPrice: prod.unitPrice,
                location: prod.location,
            };
            return {
                productId: prod.id,
                productSnapshot: JSON.stringify(productSnapshot),
                quantity: item.quantity,
                unitPrice,
                lineTotal,
            };
        });
        // 5. Execute creation within a transaction
        const newChallan = await db_1.prisma.$transaction(async (tx) => {
            // Create Challan Record
            const created = await tx.challan.create({
                data: {
                    challanNumber,
                    customerId,
                    customerSnapshot: JSON.stringify(customerSnapshot),
                    totalQuantity,
                    totalAmount,
                    status,
                    createdBy: req.user?.name || 'System',
                    items: {
                        create: challanItemsData,
                    },
                },
                include: { items: true },
            });
            // If status is CONFIRMED, reduce stock and record stock movements
            if (status === 'CONFIRMED') {
                for (const item of items) {
                    const prod = productMap.get(item.productId);
                    const updatedStock = prod.currentStock - item.quantity;
                    await tx.product.update({
                        where: { id: prod.id },
                        data: { currentStock: updatedStock },
                    });
                    await tx.stockMovement.create({
                        data: {
                            productId: prod.id,
                            quantity: item.quantity,
                            movementType: 'OUT',
                            reason: `Sales Challan #${challanNumber}`,
                            createdBy: req.user?.name || 'System',
                        },
                    });
                }
            }
            return created;
        });
        return res.status(201).json({
            message: `Challan ${challanNumber} created successfully as ${status}`,
            challan: {
                ...newChallan,
                customerSnapshot: JSON.parse(newChallan.customerSnapshot),
                items: newChallan.items.map((i) => ({
                    ...i,
                    productSnapshot: JSON.parse(i.productSnapshot),
                })),
            },
        });
    }
    catch (error) {
        console.error('Error creating challan:', error);
        return res.status(500).json({ message: 'Failed to create challan', error: error.message });
    }
};
exports.createChallan = createChallan;
const updateChallanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // CONFIRMED or CANCELLED
        if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ message: "Status must be either 'CONFIRMED' or 'CANCELLED'." });
        }
        const challan = await db_1.prisma.challan.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!challan) {
            return res.status(404).json({ message: 'Challan not found' });
        }
        if (challan.status === status) {
            return res.status(400).json({ message: `Challan is already in status '${status}'.` });
        }
        if (challan.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Cancelled challans cannot be re-opened.' });
        }
        // If changing from DRAFT to CONFIRMED
        if (challan.status === 'DRAFT' && status === 'CONFIRMED') {
            // Validate stock for all line items
            const productIds = challan.items.map((i) => i.productId);
            const products = await db_1.prisma.product.findMany({
                where: { id: { in: productIds } },
            });
            const productMap = new Map(products.map((p) => [p.id, p]));
            for (const item of challan.items) {
                const prod = productMap.get(item.productId);
                if (!prod) {
                    return res.status(400).json({ message: `Product ID '${item.productId}' no longer exists in DB.` });
                }
                if (prod.currentStock < item.quantity) {
                    return res.status(400).json({
                        message: `Insufficient stock for product '${prod.name}' (SKU: ${prod.sku}). Available: ${prod.currentStock}, required: ${item.quantity}`,
                    });
                }
            }
            // Execute stock update transaction
            await db_1.prisma.$transaction(async (tx) => {
                for (const item of challan.items) {
                    const prod = productMap.get(item.productId);
                    await tx.product.update({
                        where: { id: prod.id },
                        data: { currentStock: prod.currentStock - item.quantity },
                    });
                    await tx.stockMovement.create({
                        data: {
                            productId: prod.id,
                            quantity: item.quantity,
                            movementType: 'OUT',
                            reason: `Sales Challan #${challan.challanNumber} Confirmation`,
                            createdBy: req.user?.name || 'System',
                        },
                    });
                }
                await tx.challan.update({
                    where: { id },
                    data: { status: 'CONFIRMED' },
                });
            });
        }
        else if (challan.status === 'CONFIRMED' && status === 'CANCELLED') {
            // Return stock back to inventory on cancellation of confirmed challan
            await db_1.prisma.$transaction(async (tx) => {
                for (const item of challan.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { currentStock: { increment: item.quantity } },
                    });
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            quantity: item.quantity,
                            movementType: 'IN',
                            reason: `Restock due to Challan #${challan.challanNumber} Cancellation`,
                            createdBy: req.user?.name || 'System',
                        },
                    });
                }
                await tx.challan.update({
                    where: { id },
                    data: { status: 'CANCELLED' },
                });
            });
        }
        else {
            await db_1.prisma.challan.update({
                where: { id },
                data: { status },
            });
        }
        return res.status(200).json({ message: `Challan status updated to ${status}` });
    }
    catch (error) {
        console.error('Error updating challan status:', error);
        return res.status(500).json({ message: 'Failed to update challan status', error: error.message });
    }
};
exports.updateChallanStatus = updateChallanStatus;
