import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, type, status, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (type) {
      where.type = type as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { mobile: { contains: q } },
        { email: { contains: q } },
        { businessName: { contains: q } },
        { gstNumber: { contains: q } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          customerNotes: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return res.status(200).json({
      data: customers,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        customerNotes: {
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json(customer);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch customer detail', error: error.message });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, email, businessName, gstNumber, type, address, status, followUpDate, notes } = req.body;

    if (!name || !mobile || !email || !businessName || !type || !address) {
      return res.status(400).json({
        message: 'Missing required fields: name, mobile, email, businessName, type, and address are mandatory.',
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber: gstNumber || null,
        type,
        address,
        status: status || 'Lead',
        followUpDate: followUpDate || null,
        notes: notes || null,
      },
    });

    if (notes) {
      await prisma.customerNote.create({
        data: {
          customerId: customer.id,
          note: notes,
          createdBy: req.user?.name || 'System',
        },
      });
    }

    return res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create customer', error: error.message });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, mobile, email, businessName, gstNumber, type, address, status, followUpDate, notes } = req.body;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        mobile: mobile ?? existing.mobile,
        email: email ?? existing.email,
        businessName: businessName ?? existing.businessName,
        gstNumber: gstNumber !== undefined ? gstNumber : existing.gstNumber,
        type: type ?? existing.type,
        address: address ?? existing.address,
        status: status ?? existing.status,
        followUpDate: followUpDate !== undefined ? followUpDate : existing.followUpDate,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    return res.status(200).json({ message: 'Customer updated successfully', customer });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update customer', error: error.message });
  }
};

export const addFollowUpNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { note, followUpDate } = req.body;

    if (!note) {
      return res.status(400).json({ message: 'Note text is required.' });
    }

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const newNote = await prisma.customerNote.create({
      data: {
        customerId: id,
        note,
        createdBy: req.user?.name || 'System',
      },
    });

    if (followUpDate) {
      await prisma.customer.update({
        where: { id },
        data: { followUpDate },
      });
    }

    return res.status(201).json({ message: 'Follow-up note added', note: newNote });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to add note', error: error.message });
  }
};
