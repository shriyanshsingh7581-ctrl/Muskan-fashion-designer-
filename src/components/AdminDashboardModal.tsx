import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, BlouseDesign, AdminSettings } from '../types';
import { api } from '../services/api';
import { CATEGORIES, FABRIC_OPTIONS, SLEEVE_STYLES, NECK_DESIGNS } from '../data/initialData';
import { generateCustomerWhatsAppUpdateUrl } from '../utils/whatsapp';
import {
  X,
  Search,
  Lock,
  Download,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  Package,
  CheckCircle,
  Eye,
  MessageCircle,
  TrendingUp,
  Settings as SettingsIcon,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminDashboardModalProps {
  onClose: () => void;
  onDesignsUpdated: () => void;
}

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'Order Received',
  'Confirmation Pending',
  'Order Confirmed',
  'Stitching in Progress',
  'Ready for Dispatch',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
  onDesignsUpdated,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab State: 'orders' | 'designs' | 'settings'
  const [activeTab, setActiveTab] = useState<'orders' | 'designs' | 'settings'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);

  // Status Update state for selected order
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus>('Order Received');
  const [statusNote, setStatusNote] = useState('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [deliveryNote, setDeliveryNote] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('');

  // Designs State
  const [designs, setDesigns] = useState<BlouseDesign[]>([]);
  const [editingDesign, setEditingDesign] = useState<Partial<BlouseDesign> | null>(null);
  const [isCreatingNewDesign, setIsCreatingNewDesign] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [navratriBannerActive, setNavratriBannerActive] = useState(true);
  const [noticeHindi, setNoticeHindi] = useState('');
  const [noticeEnglish, setNoticeEnglish] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const ok = await api.adminLogin(pinInput.trim());
    if (ok) {
      setIsAuthenticated(true);
      loadAllData();
    } else {
      setAuthError('गलत एडमिन पिन (Incorrect Admin PIN).');
    }
  };

  const loadAllData = async () => {
    setLoadingOrders(true);
    try {
      const [fetchedOrders, fetchedDesigns, fetchedSettings] = await Promise.all([
        api.getOrders(),
        api.getDesigns(),
        api.getSettings(),
      ]);
      setOrders(fetchedOrders);
      setDesigns(fetchedDesigns);
      setSettings(fetchedSettings);
      setNavratriBannerActive(fetchedSettings.navratriBannerActive);
      setNoticeHindi(fetchedSettings.noticeHindi);
      setNoticeEnglish(fetchedSettings.noticeEnglish);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      if (!matchesStatus) return false;

      if (!orderSearchQuery.trim()) return true;
      const q = orderSearchQuery.toLowerCase().trim();

      const matchId = (o.id || '').toLowerCase().includes(q);
      const matchName = (o.customerName || '').toLowerCase().includes(q);
      const matchPhone = (o.mobileNumber || '').includes(q);
      const matchDesign = (o.designName || '').toLowerCase().includes(q);

      return matchId || matchName || matchPhone || matchDesign;
    });
  }, [orders, statusFilter, orderSearchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(
      (o) => o.status === 'Order Received' || o.status === 'Confirmation Pending'
    ).length;
    const stitching = orders.filter((o) => o.status === 'Stitching in Progress').length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { total, pending, stitching, delivered, revenue };
  }, [orders]);

  // Open Order Detail Drawer
  const handleSelectOrder = (order: Order) => {
    setSelectedOrderForView(order);
    setUpdatingStatus(order.status);
    setStatusNote('');
    setCustomPrice(order.totalAmount ? String(order.totalAmount) : '');
    setDeliveryNote(order.deliveryChargeNote || '');
    setAdminNote(order.adminNotes || '');
  };

  // Update Status of Current Order
  const handleSaveOrderStatus = async () => {
    if (!selectedOrderForView) return;
    try {
      const updated = await api.updateOrderStatus(selectedOrderForView.id, {
        status: updatingStatus,
        note: statusNote || undefined,
        totalAmount: customPrice ? Number(customPrice) : undefined,
        deliveryChargeNote: deliveryNote || undefined,
        adminNotes: adminNote || undefined,
      });

      // Update in state
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setSelectedOrderForView(updated);
      setSaveSuccessMsg('ऑर्डर सफलतापूर्वक अपडेट किया गया (Updated)');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('अपडेट करने में समस्या: ' + err.message);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('एक्सपोर्ट करने के लिए कोई ऑर्डर नहीं है');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Status',
      'Customer Name',
      'Mobile',
      'Design Code',
      'Design Name',
      'Quantity',
      'Size Type',
      'Standard Size',
      'Fabric',
      'Sleeve',
      'Neck',
      'Color',
      'Address',
      'City',
      'PIN',
      'Amount',
    ];

    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      o.status,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.mobileNumber,
      o.designCode,
      `"${o.designName.replace(/"/g, '""')}"`,
      o.quantity,
      o.sizeType,
      o.standardSize || '',
      `"${o.fabricPreference || ''}"`,
      `"${o.sleeveStyle || ''}"`,
      `"${o.neckDesign || ''}"`,
      `"${o.blouseColor || ''}"`,
      `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
      o.city,
      o.pinCode,
      o.totalAmount || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `muskaan_boutique_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Design (New or Edit)
  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesign) return;

    try {
      if (editingDesign.id && !isCreatingNewDesign) {
        await api.updateDesign(editingDesign.id, editingDesign);
      } else {
        await api.createDesign(editingDesign);
      }
      setEditingDesign(null);
      setIsCreatingNewDesign(false);
      const updated = await api.getDesigns();
      setDesigns(updated);
      onDesignsUpdated();
    } catch (err: any) {
      alert('डिज़ाइन सेव करने में त्रुटि: ' + err.message);
    }
  };

  // Delete Design
  const handleDeleteDesign = async (id: string) => {
    if (!confirm('क्या आप वाकई इस डिज़ाइन को हटाना चाहते हैं?')) return;
    try {
      await api.deleteDesign(id);
      const updated = await api.getDesigns();
      setDesigns(updated);
      onDesignsUpdated();
    } catch (err: any) {
      alert('हटाने में समस्या: ' + err.message);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    try {
      await api.updateSettings({
        navratriBannerActive,
        noticeHindi,
        noticeEnglish,
      });
      setSaveSuccessMsg('सेटिंग्स सफलतापूर्वक सेव हो गईं!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (e: any) {
      alert('सेटिंग्स सेव करने में समस्या: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#FDFBF7] rounded-3xl max-w-6xl w-full overflow-hidden shadow-2xl border border-[#D4AF37]/50 flex flex-col max-h-[94vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#6B1124] to-[#4A0A19] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#D4AF37]/40 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#ECC86B]" />
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                मुस्कान फैशन डिज़ाइनर – एडमिन डैशबोर्ड
              </h2>
              <span className="text-[10px] tracking-wider text-[#F3E5AB]">
                सुरक्षित बुटीक प्रबंधन पैनल
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-16 h-16 bg-[#FAF1E3] rounded-2xl mx-auto flex items-center justify-center text-[#80182A] border border-[#DFC99D]">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-[#4A0A19]">
                बुटीक ओनर लॉगिन (Admin Login)
              </h3>
              <p className="text-xs text-[#5C4D44] mt-1">
                सुरक्षा के लिए 4-अंकों का एडमिन पिन दर्ज करें (डिफ़ॉल्ट पिन: 9753)
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="पिन कोड दर्ज करें (Enter PIN)"
                className="w-full text-center tracking-widest text-xl font-mono py-3 px-4 bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none"
                autoFocus
              />

              {authError && (
                <div className="text-xs text-red-600 font-medium">{authError}</div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#80182A] hover:bg-[#9B111E] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                लॉगिन करें (Unlock Dashboard)
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Sub-nav Tabs & Actions Bar */}
            <div className="bg-[#FAF3E8] border-b border-[#EADBBE] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'orders'
                      ? 'bg-[#80182A] text-white shadow-xs'
                      : 'text-[#5A4A42] hover:bg-[#EADBBE]'
                  }`}
                >
                  📦 ऑर्डर्स ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('designs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'designs'
                      ? 'bg-[#80182A] text-white shadow-xs'
                      : 'text-[#5A4A42] hover:bg-[#EADBBE]'
                  }`}
                >
                  👗 डिज़ाइन कैटलॉग ({designs.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'settings'
                      ? 'bg-[#80182A] text-white shadow-xs'
                      : 'text-[#5A4A42] hover:bg-[#EADBBE]'
                  }`}
                >
                  ⚙️ बैनर व सेटिंग्स
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={loadAllData}
                  title="रिफ्रेश करें"
                  className="p-1.5 bg-white border border-[#D9CEB5] rounded-lg text-[#5A4A42] hover:bg-[#FAF6EE]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-white border border-[#D9CEB5] hover:bg-[#FAF6EE] text-[#4A0A19] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#B38F2B]" />
                  <span>CSV एक्सपोर्ट</span>
                </button>
              </div>

            </div>

            {/* Main Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* TAB 1: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  
                  {/* Summary Metric KPI Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFC8]">
                      <span className="text-[11px] text-[#705E54]">कुल ऑर्डर्स</span>
                      <div className="text-xl font-mono font-bold text-[#4A0A19]">
                        {stats.total}
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFC8]">
                      <span className="text-[11px] text-[#705E54]">पेंडिंग / न्यू</span>
                      <div className="text-xl font-mono font-bold text-[#EAB308]">
                        {stats.pending}
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFC8]">
                      <span className="text-[11px] text-[#705E54]">सिलाई जारी (Stitching)</span>
                      <div className="text-xl font-mono font-bold text-[#80182A]">
                        {stats.stitching}
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFC8]">
                      <span className="text-[11px] text-[#705E54]">डिलीवर हो चुके</span>
                      <div className="text-xl font-mono font-bold text-[#16A34A]">
                        {stats.delivered}
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8DFC8]">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C7A70]" />
                      <input
                        type="text"
                        placeholder="नाम, मोबाइल या ID खोजें..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF6EE] border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                      <span className="text-xs text-[#705E54] shrink-0">स्थिति:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs py-1.5 px-2 bg-[#FAF6EE] border border-[#D9CEB5] rounded-xl outline-none"
                      >
                        <option value="all">सभी ऑर्डर्स</option>
                        {ORDER_STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF1E3] text-[#4A0A19] font-bold border-b border-[#E8DFC8]">
                          <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">ग्राहक</th>
                            <th className="p-3">डिज़ाइन</th>
                            <th className="p-3">साइज़</th>
                            <th className="p-3">स्थिति</th>
                            <th className="p-3">सिलाई शुल्क</th>
                            <th className="p-3 text-right">एक्शन</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F2ECE1]">
                          {filteredOrders.length > 0 ? (
                            filteredOrders.map((o) => (
                              <tr
                                key={o.id}
                                className="hover:bg-[#FAF6EE] transition-colors cursor-pointer"
                                onClick={() => handleSelectOrder(o)}
                              >
                                <td className="p-3 font-mono font-bold text-[#80182A]">
                                  {o.id}
                                </td>
                                <td className="p-3">
                                  <div className="font-semibold text-[#2C1810]">
                                    {o.customerName}
                                  </div>
                                  <div className="text-[11px] text-[#705E54] font-mono">
                                    {o.mobileNumber}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="font-medium">{o.designName}</div>
                                  <div className="text-[10px] text-[#80182A]">{o.designCode}</div>
                                </td>
                                <td className="p-3">
                                  {o.sizeType === 'standard' ? (
                                    <span className="font-semibold">{o.standardSize}" Std</span>
                                  ) : (
                                    <span className="text-[#80182A] font-semibold">कस्टम नाप</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      o.status === 'Delivered'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : o.status === 'Cancelled'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-[#FAF1E3] text-[#80182A] border border-[#DFC99D]'
                                    }`}
                                  >
                                    {o.status}
                                  </span>
                                </td>
                                <td className="p-3 font-mono font-bold text-[#2C1810]">
                                  {o.totalAmount ? `₹${o.totalAmount}` : 'निर्णयाधीन'}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectOrder(o);
                                    }}
                                    className="px-2.5 py-1 bg-[#FAF1E3] hover:bg-[#F2E8D5] text-[#80182A] rounded-lg font-semibold text-[11px] transition-colors"
                                  >
                                    विवरण देखें
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-xs text-[#705E54]">
                                कोई ऑर्डर नहीं मिला।
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: DESIGNS CATALOG */}
              {activeTab === 'designs' && (
                <div className="space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-serif font-bold text-[#4A0A19]">
                        ब्लाउज़ डिज़ाइन कैटलॉग
                      </h3>
                      <p className="text-xs text-[#705E54]">
                        नए डिज़ाइन जोड़ें, फोटो अपडेट करें या सिलाई शुल्क निर्धारित करें
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsCreatingNewDesign(true);
                        setEditingDesign({
                          code: `MFD-DS-${(designs.length + 1).toString().padStart(2, '0')}`,
                          nameHi: '',
                          nameEn: '',
                          categoryId: 'designer',
                          price: 350,
                          image: '/src/assets/images/hero_blouse_craft_1791701468425.jpg',
                          descriptionHi: '',
                          descriptionEn: '',
                          neckTypeHi: 'स्वीटहार्ट नेक',
                          neckTypeEn: 'Sweetheart Neck',
                          sleeveTypeHi: 'एल्बो लेंथ',
                          sleeveTypeEn: 'Elbow Length',
                          fabricRecommendationHi: 'सिल्क / वेलवेट',
                          fabricRecommendationEn: 'Silk / Velvet',
                          estimatedStitchingDays: 5,
                        });
                      }}
                      className="px-4 py-2 bg-[#80182A] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>नया डिज़ाइन जोड़ें</span>
                    </button>
                  </div>

                  {/* Add / Edit Design Modal Sub-Form */}
                  {editingDesign && (
                    <div className="bg-white p-5 rounded-2xl border-2 border-[#D4AF37] space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                        <h4 className="font-serif font-bold text-sm text-[#4A0A19]">
                          {isCreatingNewDesign ? 'नया ब्लाउज़ डिज़ाइन जोड़ें' : 'डिज़ाइन संपादित करें'}
                        </h4>
                        <button
                          onClick={() => setEditingDesign(null)}
                          className="text-xs text-[#705E54] hover:text-[#4A0A19]"
                        >
                          रद्द करें
                        </button>
                      </div>

                      <form onSubmit={handleSaveDesign} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold mb-1">डिज़ाइन कोड *</label>
                          <input
                            type="text"
                            value={editingDesign.code || ''}
                            onChange={(e) => setEditingDesign({ ...editingDesign, code: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">श्रेणी (Category) *</label>
                          <select
                            value={editingDesign.categoryId || 'designer'}
                            onChange={(e) => setEditingDesign({ ...editingDesign, categoryId: e.target.value as any })}
                            className="w-full p-2 border rounded-lg"
                          >
                            {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nameHi}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">डिज़ाइन नाम (हिंदी) *</label>
                          <input
                            type="text"
                            value={editingDesign.nameHi || ''}
                            onChange={(e) => setEditingDesign({ ...editingDesign, nameHi: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Design Name (English) *</label>
                          <input
                            type="text"
                            value={editingDesign.nameEn || ''}
                            onChange={(e) => setEditingDesign({ ...editingDesign, nameEn: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">सिलाई शुल्क (₹) - खाली छोड़ें यदि संपर्क पर तय करना हो</label>
                          <input
                            type="number"
                            value={editingDesign.price ?? ''}
                            onChange={(e) =>
                              setEditingDesign({
                                ...editingDesign,
                                price: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            placeholder="उदा: 1850 (या खाली छोड़ें)"
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">स्टिचिंग समय (दिन)</label>
                          <input
                            type="number"
                            value={editingDesign.estimatedStitchingDays || 5}
                            onChange={(e) =>
                              setEditingDesign({
                                ...editingDesign,
                                estimatedStitchingDays: Number(e.target.value),
                              })
                            }
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold mb-1">फोटो URL / पाथ</label>
                          <input
                            type="text"
                            value={editingDesign.image || ''}
                            onChange={(e) => setEditingDesign({ ...editingDesign, image: e.target.value })}
                            className="w-full p-2 border rounded-lg font-mono text-[11px]"
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold mb-1">विवरण (हिंदी)</label>
                          <textarea
                            rows={2}
                            value={editingDesign.descriptionHi || ''}
                            onChange={(e) => setEditingDesign({ ...editingDesign, descriptionHi: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingDesign(null)}
                            className="px-4 py-2 border rounded-lg"
                          >
                            रद्द करें
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-[#80182A] text-white font-semibold rounded-lg"
                          >
                            सेव करें
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Designs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {designs.map((d) => (
                      <div
                        key={d.id}
                        className="bg-white p-3.5 rounded-2xl border border-[#E8DFC8] flex items-center gap-3"
                      >
                        <img
                          src={d.image}
                          alt={d.nameHi}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#D4AF37]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-[#80182A]">{d.code}</span>
                          <h4 className="text-xs font-bold text-[#2C1810] truncate">{d.nameHi}</h4>
                          <span className="text-[11px] font-mono text-[#705E54]">
                            {d.price ? `₹${d.price}` : 'मूल्य संपर्क पर'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setIsCreatingNewDesign(false);
                              setEditingDesign(d);
                            }}
                            className="p-1.5 text-[#5A4A42] hover:text-[#80182A] hover:bg-[#FAF6EE] rounded-lg"
                            title="एडिट करें"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDesign(d.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="डिलीट करें"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 3: SETTINGS & BANNER MANAGER */}
              {activeTab === 'settings' && (
                <div className="bg-white p-6 rounded-2xl border border-[#E8DFC8] space-y-6 max-w-2xl">
                  <h3 className="font-serif font-bold text-base text-[#4A0A19]">
                    वेबसाइट घोषणाएं एवं उत्सव बैनर प्रबंधन
                  </h3>

                  <div className="space-y-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#4A0A19]">
                      <input
                        type="checkbox"
                        checked={navratriBannerActive}
                        onChange={(e) => setNavratriBannerActive(e.target.checked)}
                        className="rounded text-[#80182A]"
                      />
                      <span>नवरात्रि 2026 स्पेशल फेस्टिव बैनर दिखाएं (Show Navratri 2026 Banner)</span>
                    </label>

                    <div>
                      <label className="block font-semibold mb-1">अनाउंसमेंट नोटिस (हिंदी)</label>
                      <input
                        type="text"
                        value={noticeHindi}
                        onChange={(e) => setNoticeHindi(e.target.value)}
                        className="w-full p-2.5 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Announcement Notice (English)</label>
                      <input
                        type="text"
                        value={noticeEnglish}
                        onChange={(e) => setNoticeEnglish(e.target.value)}
                        className="w-full p-2.5 border rounded-xl"
                      />
                    </div>

                    {saveSuccessMsg && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                        ✓ {saveSuccessMsg}
                      </div>
                    )}

                    <button
                      onClick={handleSaveSettings}
                      className="px-5 py-2.5 bg-[#80182A] text-white font-semibold rounded-xl hover:bg-[#9B111E]"
                    >
                      सेटिंग्स सेव करें
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* Selected Order Detailed Drawer (Modal on top of modal) */}
        {selectedOrderForView && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <div className="bg-[#FDFBF7] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border-2 border-[#D4AF37] space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                <div>
                  <span className="text-xs font-mono font-bold text-[#80182A]">
                    {selectedOrderForView.id}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#4A0A19]">
                    {selectedOrderForView.customerName} का ऑर्डर
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrderForView(null)}
                  className="p-1 rounded-full hover:bg-[#FAF6EE] text-[#705E54]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-[#E8DFC8]">
                <div>
                  <span className="font-semibold text-[#4A0A19]">डिज़ाइन:</span>
                  <p>{selectedOrderForView.designName} ({selectedOrderForView.designCode})</p>
                </div>
                <div>
                  <span className="font-semibold text-[#4A0A19]">रंग व फैब्रिक:</span>
                  <p>{selectedOrderForView.blouseColor} · {selectedOrderForView.fabricPreference}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#4A0A19]">आस्तीन व गला:</span>
                  <p>{selectedOrderForView.sleeveStyle} · {selectedOrderForView.neckDesign}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#4A0A19]">संख्या (Qty):</span>
                  <p>{selectedOrderForView.quantity}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-[#4A0A19]">डिलीवरी पता:</span>
                  <p>{selectedOrderForView.deliveryAddress}, {selectedOrderForView.city} - {selectedOrderForView.pinCode}</p>
                </div>
              </div>

              {/* Custom Measurements Card */}
              <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#E8DFC8] text-xs">
                <span className="font-bold text-[#4A0A19]">नाप विवरण (Sizing):</span>
                {selectedOrderForView.sizeType === 'standard' ? (
                  <p className="mt-1 font-semibold text-[#80182A]">
                    स्टैंडर्ड साइज़ {selectedOrderForView.standardSize}"
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                    {Object.entries(selectedOrderForView.measurements || {}).map(([k, v]) => (
                      <div key={k} className="bg-white p-1.5 rounded-lg border">
                        <span className="font-bold uppercase text-[9px] text-[#80182A]">{k}:</span>
                        <div className="font-mono">{v || '-'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reference Image Preview */}
              {selectedOrderForView.referenceImageUrl && (
                <div className="bg-white p-3 rounded-xl border border-[#E8DFC8] text-xs">
                  <span className="font-bold text-[#4A0A19] block mb-1">
                    ग्राहक द्वारा अपलोड किया गया रेफरेंस फोटो:
                  </span>
                  <img
                    src={selectedOrderForView.referenceImageUrl}
                    alt="Customer Reference"
                    className="max-h-48 rounded-lg object-contain border"
                  />
                </div>
              )}

              {/* Status & Pricing Updater */}
              <div className="bg-white p-4 rounded-xl border-2 border-[#D4AF37]/50 space-y-3 text-xs">
                <span className="font-bold text-[#4A0A19] block">
                  स्थिति एवं सिलाई शुल्क अपडेट करें:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">ऑर्डर स्थिति:</label>
                    <select
                      value={updatingStatus}
                      onChange={(e) => setUpdatingStatus(e.target.value as OrderStatus)}
                      className="w-full p-2 border rounded-lg font-semibold"
                    >
                      {ORDER_STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">कुल तय शुल्क (₹):</label>
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder="उदा: 1850"
                      className="w-full p-2 border rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">होम डिलीवरी शुल्क नोट:</label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="उदा: ₹80 कूरियर शुल्क या लोकल डिलीवरी"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">बुटीक मास्टर जी नोट (Internal / Customer Update):</label>
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="जैसे: कपड़ा आ गया है, कल तक कटिंग पूरी होगी..."
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                {saveSuccessMsg && (
                  <div className="text-xs text-emerald-700 font-semibold">{saveSuccessMsg}</div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={generateCustomerWhatsAppUpdateUrl(
                      selectedOrderForView.mobileNumber,
                      selectedOrderForView.id,
                      updatingStatus,
                      adminNote
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp पर ग्राहक को अपडेट भेजें</span>
                  </a>

                  <button
                    onClick={handleSaveOrderStatus}
                    className="px-4 py-2 bg-[#80182A] hover:bg-[#9B111E] text-white rounded-lg font-semibold"
                  >
                    सेव करें (Save Changes)
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
