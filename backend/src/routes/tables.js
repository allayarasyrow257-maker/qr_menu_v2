const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

function generateTableCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Lookup table by code or number
router.get('/lookup/:param', async (req, res) => {
  try {
    const { param } = req.params;
    let table;
    
    // Try lookup by tableCode first (8-char string)
    table = await prisma.table.findUnique({
      where: { tableCode: param },
      include: {
        orders: {
          where: { billClosedAt: null },
          include: { items: { include: { product: true, combo: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // If not found and it's a number, try lookup by number
    if (!table && !isNaN(parseInt(param))) {
      table = await prisma.table.findUnique({
        where: { number: parseInt(param) },
        include: {
          orders: {
            where: { billClosedAt: null, status: { not: 'cancelled' } },
            include: { items: { include: { product: true, combo: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ error: 'Failed to lookup table' });
  }
});

// Get all tables (public for gift target selection)
router.get('/', async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { billClosedAt: null },
          include: { items: { include: { product: true, combo: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Get single table
router.get('/:id', async (req, res) => {
  try {
    const table = await prisma.table.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        orders: {
          where: { billClosedAt: null },
          include: { items: { include: { product: true, combo: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch table' });
  }
});

// Get full order history for a table (admin) — includes combo items + billClosedAt
router.get('/:id/history', authenticateToken, async (req, res) => {
  try {
    const tableId = parseInt(req.params.id);
    const orders = await prisma.order.findMany({
      where: { tableId },
      include: {
        items: { include: { product: true, combo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch table history' });
  }
});

// Close table bill (admin) - archive current session's orders and reset the table
router.post('/:id/close-bill', authenticateToken, async (req, res) => {
  try {
    const tableId = parseInt(req.params.id);
    const closedAt = new Date();

    // Compute totals for the receipt before mutating
    const sessionOrders = await prisma.order.findMany({
      where: { tableId, billClosedAt: null },
      include: { items: { include: { product: true, combo: true } } },
    });
    const sessionTotal = sessionOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0,
    );

    // 1) Mark any still-pending orders as delivered (the bill is being settled)
    await prisma.order.updateMany({
      where: {
        tableId,
        billClosedAt: null,
        status: { in: ['pending', 'preparing', 'ready'] },
      },
      data: { status: 'delivered' },
    });

    // 2) Stamp every current-session order with the closure timestamp.
    //    These orders disappear from the active view and are tied together
    //    in history as one bill.
    await prisma.order.updateMany({
      where: { tableId, billClosedAt: null },
      data: { billClosedAt: closedAt },
    });

    // 3) Reset the table — ready for the next group of customers
    const table = await prisma.table.update({
      where: { id: tableId },
      data: { status: 'available' },
      include: {
        orders: {
          where: { billClosedAt: null },
          include: { items: { include: { product: true, combo: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Notify via socket
    const io = req.app.get('io');
    io.to('admin').emit('table-updated', table);
    io.to(`table-${tableId}`).emit('bill-closed', { tableId });

    res.json({
      message: 'Bill closed',
      table,
      bill: {
        closedAt,
        ordersCount: sessionOrders.length,
        total: sessionTotal,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to close bill' });
  }
});

// Create table (admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { number, name } = req.body;
    const tableCode = generateTableCode();
    const table = await prisma.table.create({
      data: { number, name, tableCode },
    });
    res.status(201).json(table);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Table number already exists' });
    }
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// Update table (admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { number, name, status } = req.body;
    const table = await prisma.table.update({
      where: { id: parseInt(req.params.id) },
      data: { number, name, status },
    });
    res.json(table);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// Delete table (admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.table.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

module.exports = router;
