"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    // 1. Clear existing data
    await prisma.challanItem.deleteMany();
    await prisma.challan.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.customerNote.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    // 2. Create Users for all 4 required roles
    const hashedPassword = await bcryptjs_1.default.hash('Password123!', 10);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@minierp.com',
            password: hashedPassword,
            name: 'Alex Admin',
            role: 'ADMIN',
        },
    });
    const salesUser = await prisma.user.create({
        data: {
            email: 'sales@minierp.com',
            password: hashedPassword,
            name: 'Sarah Sales',
            role: 'SALES',
        },
    });
    const warehouseUser = await prisma.user.create({
        data: {
            email: 'warehouse@minierp.com',
            password: hashedPassword,
            name: 'Willy Warehouse',
            role: 'WAREHOUSE',
        },
    });
    const accountsUser = await prisma.user.create({
        data: {
            email: 'accounts@minierp.com',
            password: hashedPassword,
            name: 'Adam Accounts',
            role: 'ACCOUNTS',
        },
    });
    console.log('Created Users for Admin, Sales, Warehouse, and Accounts roles.');
    // 3. Create Customers
    const customer1 = await prisma.customer.create({
        data: {
            name: 'Rajesh Kumar',
            mobile: '+91 9876543210',
            email: 'rajesh@apexdistributors.com',
            businessName: 'Apex Electronics Distributors',
            gstNumber: '27AAACA12341ZV',
            type: 'Distributor',
            address: 'Plot 42, Industrial Area Phase II, Mumbai',
            status: 'Active',
            followUpDate: '2026-07-28',
            notes: 'Interested in bulk orders of industrial switches and power supplies.',
        },
    });
    const customer2 = await prisma.customer.create({
        data: {
            name: 'Priya Sharma',
            mobile: '+91 9123456789',
            email: 'priya@techmart.in',
            businessName: 'TechMart Retail Outlets',
            gstNumber: '07BBBPB98762ZX',
            type: 'Wholesale',
            address: 'Shop 104, Connaught Place, New Delhi',
            status: 'Active',
            followUpDate: '2026-07-25',
            notes: 'Monthly recurring order client. Requires 15-day credit cycle.',
        },
    });
    const customer3 = await prisma.customer.create({
        data: {
            name: 'Vikram Singh',
            mobile: '+91 9988776655',
            email: 'vikram@singh hardware.com',
            businessName: 'Singh Hardware Store',
            gstNumber: '19CCCCS45673ZY',
            type: 'Retail',
            address: 'Main Road, Sector 17, Chandigarh',
            status: 'Lead',
            followUpDate: '2026-07-23',
            notes: 'Requested sample catalog for wireless routers.',
        },
    });
    // Add initial customer note
    await prisma.customerNote.create({
        data: {
            customerId: customer1.id,
            note: 'Initial meeting completed. Discussed 10% volume discount for orders over 100 units.',
            createdBy: salesUser.name,
        },
    });
    console.log('Created sample Customers and CRM notes.');
    // 4. Create Products
    const prod1 = await prisma.product.create({
        data: {
            name: 'Enterprise Wi-Fi 6 Router',
            sku: 'NET-ROUT-W6',
            category: 'Networking',
            unitPrice: 4500,
            currentStock: 45,
            minStockAlert: 10,
            location: 'Rack A-12, Main Warehouse',
            imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300',
        },
    });
    const prod2 = await prisma.product.create({
        data: {
            name: '24-Port Managed Gigabit Switch',
            sku: 'NET-SWT-24P',
            category: 'Networking',
            unitPrice: 12500,
            currentStock: 12,
            minStockAlert: 15, // Currently below alert threshold!
            location: 'Rack B-04, Main Warehouse',
            imageUrl: 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8b?w=300',
        },
    });
    const prod3 = await prisma.product.create({
        data: {
            name: 'CAT6 Cable Reel 305m',
            sku: 'CBL-CAT6-305M',
            category: 'Cabling',
            unitPrice: 6200,
            currentStock: 80,
            minStockAlert: 20,
            location: 'Pallet C-01, Annex Warehouse',
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300',
        },
    });
    const prod4 = await prisma.product.create({
        data: {
            name: 'Uninterruptible Power Supply (UPS) 1000VA',
            sku: 'PWR-UPS-1KVA',
            category: 'Power Supply',
            unitPrice: 8900,
            currentStock: 5, // Low stock alert!
            minStockAlert: 8,
            location: 'Rack D-02, Main Warehouse',
            imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300',
        },
    });
    console.log('Created sample Products.');
    // 5. Initial Stock Movement Logs
    await prisma.stockMovement.createMany({
        data: [
            {
                productId: prod1.id,
                quantity: 50,
                movementType: 'IN',
                reason: 'Initial Vendor Delivery PO-9041',
                createdBy: warehouseUser.name,
            },
            {
                productId: prod2.id,
                quantity: 20,
                movementType: 'IN',
                reason: 'Initial Inventory Stocking',
                createdBy: warehouseUser.name,
            },
            {
                productId: prod2.id,
                quantity: 8,
                movementType: 'OUT',
                reason: 'Manual adjustment due to damaged unit test',
                createdBy: warehouseUser.name,
            },
        ],
    });
    // 6. Create Initial Sample Challan
    const sampleChallan = await prisma.challan.create({
        data: {
            challanNumber: 'CH-202607-0001',
            customerId: customer1.id,
            customerSnapshot: JSON.stringify({
                name: customer1.name,
                businessName: customer1.businessName,
                email: customer1.email,
                mobile: customer1.mobile,
                gstNumber: customer1.gstNumber,
                address: customer1.address,
            }),
            totalQuantity: 5,
            totalAmount: 22500,
            status: 'CONFIRMED',
            createdBy: salesUser.name,
            items: {
                create: [
                    {
                        productId: prod1.id,
                        productSnapshot: JSON.stringify({
                            name: prod1.name,
                            sku: prod1.sku,
                            unitPrice: prod1.unitPrice,
                        }),
                        quantity: 5,
                        unitPrice: 4500,
                        lineTotal: 22500,
                    },
                ],
            },
        },
    });
    console.log(`Created Sample Challan ${sampleChallan.challanNumber}.`);
    console.log('Database seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
