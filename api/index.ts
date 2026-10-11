import express, { Request, Response } from 'express';
import { INITIAL_DESIGNS, DEFAULT_SETTINGS } from '../src/data/initialData';

const app = express();
app.use(express.json({ limit: '15mb' }));

// In-memory / serverless storage initialized with default data
let inMemoryDesigns = [...INITIAL_DESIGNS];
let inMemoryOrders: any[] = [];
let inMemorySettings = { ...DEFAULT_SETTINGS };

// 1. Blouse Designs
app.get('/api/designs', (_req: Request, res: Response) => {
  res.json(inMemoryDesigns);
});

app.post('/api/designs', (req: Request, res: Response) => {
  const newDesign = {
    ...req.body,
    id: req.body.id || `mfd-${Date.now().toString(36)}`,
    code: req.body.code || `MFD-DS-${(inMemoryDesigns.length + 1).toString().padStart(2, '0')}`,
  };
  inMemoryDesigns.unshift(newDesign);
  res.status(201).json(newDesign);
});

app.put('/api/designs/:id', (req: Request, res: Response) => {
  const idx = inMemoryDesigns.findIndex((d) => d.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Design not found' });
  }
  inMemoryDesigns[idx] = { ...inMemoryDesigns[idx], ...req.body };
  res.json(inMemoryDesigns[idx]);
});

app.delete('/api/designs/:id', (req: Request, res: Response) => {
  inMemoryDesigns = inMemoryDesigns.filter((d) => d.id !== req.params.id);
  res.json({ success: true });
});

// 2. Orders Endpoints
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json(inMemoryOrders);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const body = req.body;

  if (!body.customerName || !body.customerName.trim()) {
    return res.status(400).json({ error: 'Customer name is required' });
  }

  const cleanPhone = (body.mobileNumber || '').replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number is required' });
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = body.id || `MFD-ORD-${randomSuffix}`;
  const now = new Date().toISOString();

  const newOrder = {
    ...body,
    id: orderId,
    createdAt: body.createdAt || now,
    updatedAt: now,
    status: body.status || 'Order Received',
    statusHistory: body.statusHistory || [
      {
        status: body.status || 'Order Received',
        timestamp: now,
        note: 'Order placed successfully',
      },
    ],
    quantity: Number(body.quantity) || 1,
  };

  inMemoryOrders.unshift(newOrder);
  res.status(201).json(newOrder);
});

app.post('/api/orders/track', (req: Request, res: Response) => {
  const { orderId, mobileNumber } = req.body;

  if (!orderId || !mobileNumber) {
    return res.status(400).json({ error: 'Order ID and Mobile Number are required' });
  }

  const cleanSearchOrder = orderId.trim().toUpperCase();
  const cleanSearchPhone = mobileNumber.replace(/\D/g, '').slice(-10);

  const found = inMemoryOrders.find((o) => {
    const matchId = (o.id || '').trim().toUpperCase() === cleanSearchOrder;
    const oPhone = (o.mobileNumber || '').replace(/\D/g, '').slice(-10);
    return matchId && oPhone === cleanSearchPhone;
  });

  if (!found) {
    return res.status(404).json({
      error: 'Order not found. Please verify Order ID and registered mobile number.',
    });
  }

  res.json(found);
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, note, pricePerItem, totalAmount, deliveryChargeNote, adminNotes } = req.body;
  const order = inMemoryOrders.find((o) => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const now = new Date().toISOString();
  if (status && status !== order.status) {
    order.status = status;
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status,
      timestamp: now,
      note: note || `Status updated to ${status}`,
    });
  }

  if (pricePerItem !== undefined) order.pricePerItem = pricePerItem;
  if (totalAmount !== undefined) order.totalAmount = totalAmount;
  if (deliveryChargeNote !== undefined) order.deliveryChargeNote = deliveryChargeNote;
  if (adminNotes !== undefined) order.adminNotes = adminNotes;
  order.updatedAt = now;

  res.json(order);
});

// 3. Admin Authentication
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === (inMemorySettings.adminPin || '9753')) {
    return res.json({ success: true, token: 'mfd_admin_session_auth' });
  }
  return res.status(401).json({ error: 'गलत पिन कोड (Invalid Admin PIN)' });
});

// 4. Admin Stats
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const stats = {
    totalOrders: inMemoryOrders.length,
    pending: inMemoryOrders.filter((o) => o.status === 'Order Received' || o.status === 'Confirmation Pending').length,
    inStitching: inMemoryOrders.filter((o) => o.status === 'Stitching in Progress' || o.status === 'Order Confirmed').length,
    completed: inMemoryOrders.filter((o) => o.status === 'Delivered').length,
    totalDesigns: inMemoryDesigns.length,
  };
  res.json(stats);
});

// 5. Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  const safe = { ...inMemorySettings };
  delete (safe as any).adminPin;
  res.json(safe);
});

app.post('/api/settings', (req: Request, res: Response) => {
  inMemorySettings = { ...inMemorySettings, ...req.body };
  res.json({ success: true, settings: inMemorySettings });
});

export default app;
