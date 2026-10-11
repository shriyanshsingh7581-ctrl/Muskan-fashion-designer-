import { BlouseDesign, Order, AdminSettings } from '../types';
import { INITIAL_DESIGNS, DEFAULT_SETTINGS } from '../data/initialData';

const LOCAL_STORAGE_ORDERS_KEY = 'mfd_boutique_orders_v1';
const LOCAL_STORAGE_DESIGNS_KEY = 'mfd_boutique_designs_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'mfd_boutique_settings_v1';

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

export const api = {
  async getDesigns(): Promise<BlouseDesign[]> {
    try {
      const res = await fetch('/api/designs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_DESIGNS_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // Fallback below
    }

    const cached = localStorage.getItem(LOCAL_STORAGE_DESIGNS_KEY);
    return cached ? JSON.parse(cached) : INITIAL_DESIGNS;
  },

  async createDesign(design: Partial<BlouseDesign>): Promise<BlouseDesign> {
    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback below
    }

    const current = await this.getDesigns();
    const newDesign = {
      ...design,
      id: design.id || `mfd-${Date.now().toString(36)}`,
      code: design.code || `MFD-DS-${(current.length + 1).toString().padStart(2, '0')}`,
    } as BlouseDesign;
    const updated = [newDesign, ...current];
    localStorage.setItem(LOCAL_STORAGE_DESIGNS_KEY, JSON.stringify(updated));
    return newDesign;
  },

  async updateDesign(id: string, design: Partial<BlouseDesign>): Promise<BlouseDesign> {
    try {
      const res = await fetch(`/api/designs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback below
    }

    const current = await this.getDesigns();
    const idx = current.findIndex((d) => d.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...design };
      localStorage.setItem(LOCAL_STORAGE_DESIGNS_KEY, JSON.stringify(current));
      return current[idx];
    }
    throw new Error('Design not found');
  },

  async deleteDesign(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/designs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        return true;
      }
    } catch {
      // Fallback below
    }

    const current = await this.getDesigns();
    const filtered = current.filter((d) => d.id !== id);
    localStorage.setItem(LOCAL_STORAGE_DESIGNS_KEY, JSON.stringify(filtered));
    return true;
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        const saved = await res.json();
        // Also keep in localStorage for resilience
        const local = getLocalOrders();
        saveLocalOrders([saved, ...local]);
        return saved;
      }
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to place order');
    } catch (err: any) {
      // If server error, let's create locally so customer never loses their order
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderId = `MFD-ORD-${randomSuffix}`;
      const now = new Date().toISOString();
      const newOrder: Order = {
        ...orderData,
        id: orderId,
        createdAt: now,
        updatedAt: now,
        status: 'Order Received',
        statusHistory: [
          {
            status: 'Order Received',
            timestamp: now,
            note: 'Order placed by customer via website',
          },
        ],
        quantity: Number(orderData.quantity) || 1,
      } as Order;

      const local = getLocalOrders();
      saveLocalOrders([newOrder, ...local]);
      return newOrder;
    }
  },

  async trackOrder(orderId: string, mobileNumber: string): Promise<Order> {
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, mobileNumber }),
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json();
      throw new Error(err.error || 'Order not found');
    } catch (e: any) {
      // Check local storage fallback
      const local = getLocalOrders();
      const cleanSearchOrder = orderId.trim().toUpperCase();
      const cleanSearchPhone = mobileNumber.replace(/\D/g, '').slice(-10);

      const found = local.find((o) => {
        const matchId = (o.id || '').trim().toUpperCase() === cleanSearchOrder;
        const oPhone = (o.mobileNumber || '').replace(/\D/g, '').slice(-10);
        return matchId && oPhone === cleanSearchPhone;
      });

      if (found) return found;
      throw new Error(e.message || 'Order not found');
    }
  },

  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch {
      // Fallback
    }
    return getLocalOrders();
  },

  async updateOrderStatus(id: string, payload: any): Promise<Order> {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const local = getLocalOrders();
    const order = local.find((o) => o.id === id);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();
    if (payload.status && payload.status !== order.status) {
      order.status = payload.status;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: payload.status,
        timestamp: now,
        note: payload.note || `Status updated to ${payload.status}`,
      });
    }
    if (payload.pricePerItem !== undefined) order.pricePerItem = payload.pricePerItem;
    if (payload.totalAmount !== undefined) order.totalAmount = payload.totalAmount;
    if (payload.deliveryChargeNote !== undefined) order.deliveryChargeNote = payload.deliveryChargeNote;
    if (payload.adminNotes !== undefined) order.adminNotes = payload.adminNotes;
    order.updatedAt = now;

    saveLocalOrders(local);
    return order;
  },

  async adminLogin(pin: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // Fallback
    }
    return pin === '9753';
  },

  async getSettings(): Promise<AdminSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const cached = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
  },

  async updateSettings(settings: Partial<AdminSettings>): Promise<boolean> {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(updated));
    return true;
  },
};
