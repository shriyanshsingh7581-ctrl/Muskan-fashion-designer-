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
  Upload,
  Tag,
  Cloud,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  uploadToCloudinary,
  testCloudinaryConnection,
  DEFAULT_CLOUDINARY_CONFIG,
} from '../utils/cloudinary';

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

  // Manual Order Creation State (Admin can place orders)
  const [isCreatingNewOrder, setIsCreatingNewOrder] = useState(false);
  const [newOrderCustomerName, setNewOrderCustomerName] = useState('');
  const [newOrderMobile, setNewOrderMobile] = useState('');
  const [newOrderWhatsapp, setNewOrderWhatsapp] = useState('');
  const [newOrderDesignId, setNewOrderDesignId] = useState('');
  const [newOrderColor, setNewOrderColor] = useState('शाही मैरून');
  const [newOrderFabric, setNewOrderFabric] = useState(FABRIC_OPTIONS[0].nameHi);
  const [newOrderSleeve, setNewOrderSleeve] = useState(SLEEVE_STYLES[2].nameHi);
  const [newOrderNeck, setNewOrderNeck] = useState(NECK_DESIGNS[0].nameHi);
  const [newOrderQuantity, setNewOrderQuantity] = useState(1);
  const [newOrderSizeType, setNewOrderSizeType] = useState<'standard' | 'custom'>('standard');
  const [newOrderStandardSize, setNewOrderStandardSize] = useState('36');
  const [newOrderBust, setNewOrderBust] = useState('');
  const [newOrderUnderbust, setNewOrderUnderbust] = useState('');
  const [newOrderWaist, setNewOrderWaist] = useState('');
  const [newOrderShoulder, setNewOrderShoulder] = useState('');
  const [newOrderLength, setNewOrderLength] = useState('');
  const [newOrderSleeveLength, setNewOrderSleeveLength] = useState('');
  const [newOrderArmhole, setNewOrderArmhole] = useState('');
  const [newOrderAddress, setNewOrderAddress] = useState('');
  const [newOrderCity, setNewOrderCity] = useState('');
  const [newOrderPin, setNewOrderPin] = useState('');
  const [newOrderAmount, setNewOrderAmount] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('Order Confirmed');
  const [newOrderNotes, setNewOrderNotes] = useState('');

  // Designs State
  const [designs, setDesigns] = useState<BlouseDesign[]>([]);
  const [editingDesign, setEditingDesign] = useState<Partial<BlouseDesign> | null>(null);
  const [isCreatingNewDesign, setIsCreatingNewDesign] = useState(false);
  const [quickPriceModalDesign, setQuickPriceModalDesign] = useState<BlouseDesign | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');

  // Settings State
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [navratriBannerActive, setNavratriBannerActive] = useState(true);
  const [noticeHindi, setNoticeHindi] = useState('');
  const [noticeEnglish, setNoticeEnglish] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Cloudinary State (Configured with User's Cloud Name & Preset)
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState<string>(
    DEFAULT_CLOUDINARY_CONFIG.cloudName
  );
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState<string>(
    DEFAULT_CLOUDINARY_CONFIG.uploadPreset
  );
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false);
  const [cloudinaryUploadPercent, setCloudinaryUploadPercent] = useState<number>(0);
  const [cloudinaryTestResult, setCloudinaryTestResult] = useState<{
    testing: boolean;
    message?: string;
    isError?: boolean;
    sampleUrl?: string;
  } | null>(null);

  // Quick Catalogue Direct Upload State
  const [showQuickCatalogueBox, setShowQuickCatalogueBox] = useState(false);
  const [quickCatImage, setQuickCatImage] = useState<string>('');
  const [quickCatNameHi, setQuickCatNameHi] = useState<string>('');
  const [quickCatNameEn, setQuickCatNameEn] = useState<string>('');
  const [quickCatPrice, setQuickCatPrice] = useState<number>(350);
  const [quickCatCategory, setQuickCatCategory] = useState<string>('designer');
  const [quickCatDescription, setQuickCatDescription] = useState<string>('');

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
      if (fetchedSettings.cloudinaryCloudName) {
        setCloudinaryCloudName(fetchedSettings.cloudinaryCloudName);
      }
      if (fetchedSettings.cloudinaryUploadPreset) {
        setCloudinaryUploadPreset(fetchedSettings.cloudinaryUploadPreset);
      }
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

  // Direct Order Creation by Admin
  const handleAdminCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderCustomerName.trim()) {
      alert('कृपया ग्राहक का नाम भरें');
      return;
    }
    const cleanMobile = newOrderMobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      alert('कृपया 10 अंकों का वैध मोबाइल नंबर भरें');
      return;
    }

    const chosenDesign =
      designs.find((d) => d.id === newOrderDesignId) || designs[0] || ({ id: 'mfd-custom', code: 'MFD-CUSTOM', nameHi: 'कस्टम ब्लाउज़', price: 350, image: '/src/assets/images/hero_blouse_craft_1791701468425.jpg' } as any);

    const calcTotal = newOrderAmount
      ? Number(newOrderAmount)
      : (chosenDesign.price || 350) * (Number(newOrderQuantity) || 1);

    const payload: Partial<Order> = {
      customerName: newOrderCustomerName.trim(),
      mobileNumber: newOrderMobile.trim(),
      whatsappNumber: newOrderWhatsapp.trim() || newOrderMobile.trim(),
      designId: chosenDesign.id,
      designCode: chosenDesign.code,
      designName: chosenDesign.nameHi,
      designImage: chosenDesign.image,
      blouseColor: newOrderColor,
      fabricPreference: newOrderFabric,
      sleeveStyle: newOrderSleeve,
      neckDesign: newOrderNeck,
      quantity: Number(newOrderQuantity) || 1,
      sizeType: newOrderSizeType,
      standardSize: newOrderSizeType === 'standard' ? newOrderStandardSize : undefined,
      measurements:
        newOrderSizeType === 'custom'
          ? {
              bust: newOrderBust,
              underbust: newOrderUnderbust,
              waist: newOrderWaist,
              shoulder: newOrderShoulder,
              blouseLength: newOrderLength,
              sleeveLength: newOrderSleeveLength,
              armhole: newOrderArmhole,
            }
          : undefined,
      deliveryAddress: newOrderAddress.trim() || 'दुकान से पिकअप (Boutique Pickup)',
      city: newOrderCity.trim() || 'इंदौर',
      pinCode: newOrderPin.trim() || '452001',
      totalAmount: calcTotal,
      pricePerItem: chosenDesign.price || 350,
      status: newOrderStatus,
      adminNotes: newOrderNotes.trim() || 'बुटीक एडमिन द्वारा सीधे दर्ज किया गया ऑर्डर',
    };

    try {
      const saved = await api.createOrder(payload);
      setOrders((prev) => [saved, ...prev]);
      setIsCreatingNewOrder(false);
      setSaveSuccessMsg(`ऑर्डर ${saved.id} सफलतापूर्वक दर्ज किया गया!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);

      // Reset
      setNewOrderCustomerName('');
      setNewOrderMobile('');
      setNewOrderWhatsapp('');
      setNewOrderAddress('');
      setNewOrderAmount('');
      setNewOrderNotes('');
      setNewOrderBust('');
      setNewOrderWaist('');
    } catch (err: any) {
      alert('ऑर्डर दर्ज करने में समस्या: ' + err.message);
    }
  };

  // Upload Photo for Catalogue / Design using Cloudinary
  const handleDesignImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('फ़ाइल का साइज़ 15MB से कम होना चाहिए (Max 15MB file size)');
      return;
    }

    // Set immediate local preview
    const localUrl = URL.createObjectURL(file);
    setEditingDesign((prev) => ({
      ...prev,
      image: localUrl,
    }));

    setIsUploadingToCloudinary(true);
    setCloudinaryUploadPercent(0);

    try {
      const res = await uploadToCloudinary(file, {
        cloudName: cloudinaryCloudName,
        uploadPreset: cloudinaryUploadPreset,
        onProgress: (pct) => setCloudinaryUploadPercent(pct),
      });

      setEditingDesign((prev) => ({
        ...prev,
        image: res.secure_url,
      }));
      setSaveSuccessMsg('✓ फोटो Cloudinary पर सुरक्षित अपलोड हो गई!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      // Fallback to local base64
      const reader = new FileReader();
      reader.onload = () => {
        setEditingDesign((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
      alert('Cloudinary अपलोड संदेश: ' + err.message + ' (लोकल फ़ोटो सुरक्षित रखी गई)');
    } finally {
      setIsUploadingToCloudinary(false);
      setCloudinaryUploadPercent(0);
    }
  };

  // Quick Catalogue Direct Cloudinary Upload
  const handleQuickCatalogueUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setQuickCatImage(localUrl);
    setIsUploadingToCloudinary(true);
    setCloudinaryUploadPercent(0);

    try {
      const res = await uploadToCloudinary(file, {
        cloudName: cloudinaryCloudName,
        uploadPreset: cloudinaryUploadPreset,
        onProgress: (pct) => setCloudinaryUploadPercent(pct),
      });

      setQuickCatImage(res.secure_url);
      setSaveSuccessMsg('✓ कैटलॉग फोटो Cloudinary पर सुरक्षित अपलोड हो गई!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setQuickCatImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      alert('Cloudinary अपलोड संदेश: ' + err.message);
    } finally {
      setIsUploadingToCloudinary(false);
      setCloudinaryUploadPercent(0);
    }
  };

  // Save Quick Catalogue to Website
  const handleSaveQuickCatalogue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatImage) {
      alert('कृपया पहले कैटलॉग की फोटो चुनें');
      return;
    }
    if (!quickCatNameHi.trim()) {
      alert('कृपया डिज़ाइन का नाम दर्ज करें');
      return;
    }

    const nextIdx = designs.length + 1;
    const code = `MFD-CAT-${nextIdx.toString().padStart(2, '0')}`;
    const newDesign: Partial<BlouseDesign> = {
      code,
      nameHi: quickCatNameHi.trim(),
      nameEn: quickCatNameEn.trim() || quickCatNameHi.trim(),
      categoryId: quickCatCategory as any,
      price: Number(quickCatPrice) || 350,
      image: quickCatImage,
      descriptionHi:
        quickCatDescription.trim() ||
        `${quickCatNameHi.trim()} - मुस्कान फैशन डिज़ाइनर का नवीनतम कैटलॉग। उत्तम सिलाई व फिनिशिंग।`,
      descriptionEn:
        quickCatNameEn.trim() ||
        'Premium bespoke boutique blouse handcrafted to your exact fit.',
      neckTypeHi: 'पसंदीदा डिज़ाइन अनुसार',
      neckTypeEn: 'Custom Neckline',
      sleeveTypeHi: 'पसंदीदा आस्तीन अनुसार',
      sleeveTypeEn: 'Custom Sleeve Style',
      fabricRecommendationHi: 'सिल्क / ब्रोकेड / वेलवेट',
      fabricRecommendationEn: 'Silk / Brocade / Velvet',
      estimatedStitchingDays: 5,
    };

    try {
      await api.createDesign(newDesign);
      const updated = await api.getDesigns();
      setDesigns(updated);
      onDesignsUpdated();
      setSaveSuccessMsg(`नया कैटलॉग ${code} सफलतापूर्वक वेबसाइट पर जुड़ गया!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);

      // Reset
      setQuickCatImage('');
      setQuickCatNameHi('');
      setQuickCatNameEn('');
      setQuickCatPrice(350);
      setQuickCatDescription('');
      setShowQuickCatalogueBox(false);
    } catch (err: any) {
      alert('कैटलॉग सेव करने में त्रुटि: ' + err.message);
    }
  };

  // Inline Quick Price Change (1-Click for Boutique Owner)
  const handleQuickInlinePrice = async (design: BlouseDesign, newPrice: number) => {
    try {
      await api.updateDesign(design.id, { price: newPrice });
      const updated = await api.getDesigns();
      setDesigns(updated);
      onDesignsUpdated();
      setSaveSuccessMsg(`डिज़ाइन ${design.code} की कीमत ₹${newPrice} कर दी गई!`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('कीमत बदलने में समस्या: ' + err.message);
    }
  };

  // Test Cloudinary Connection
  const handleTestCloudinary = async () => {
    setCloudinaryTestResult({ testing: true });
    const res = await testCloudinaryConnection(cloudinaryCloudName, cloudinaryUploadPreset);
    setCloudinaryTestResult({
      testing: false,
      message: res.message,
      isError: !res.success,
      sampleUrl: res.sampleUrl,
    });
  };

  // Quick Price Save Modal
  const handleQuickPriceSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPriceModalDesign) return;

    const newP = quickPriceValue ? Number(quickPriceValue) : null;
    try {
      await api.updateDesign(quickPriceModalDesign.id, { price: newP });
      const updated = await api.getDesigns();
      setDesigns(updated);
      onDesignsUpdated();
      setSaveSuccessMsg(
        `डिज़ाइन ${quickPriceModalDesign.code} की कीमत ₹${newP || 'संपर्क पर'} अपडेट हो गई!`
      );
      setTimeout(() => setSaveSuccessMsg(''), 3500);
      setQuickPriceModalDesign(null);
    } catch (err: any) {
      alert('कीमत बदलने में समस्या: ' + err.message);
    }
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
      setSaveSuccessMsg('डिज़ाइन सफलतापूर्वक सहेजा गया!');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
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
        cloudinaryCloudName: cloudinaryCloudName.trim(),
        cloudinaryUploadPreset: cloudinaryUploadPreset.trim(),
      });
      setSaveSuccessMsg('सेटिंग्स एवं Cloudinary कॉन्फ़िगरेशन सफलतापूर्वक सेव हो गईं!');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (e: any) {
      alert('सेटिंग्स सेव करने में समस्या: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#FDFBF7] rounded-t-3xl sm:rounded-3xl max-w-6xl w-full overflow-hidden shadow-2xl border-t sm:border border-[#D4AF37]/50 flex flex-col max-h-[96vh] sm:max-h-[94vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#6B1124] to-[#4A0A19] text-white px-4 pt-3 pb-4 sm:p-5 flex flex-col border-b border-[#D4AF37]/40 shrink-0">
          {/* Mobile Pull Indicator */}
          <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-2.5 sm:hidden" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#ECC86B] shrink-0" />
              <div>
                <h2 className="text-sm sm:text-lg font-serif font-bold text-white">
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
                सुरक्षा के लिए 4-अंकों का एडमिन पिन दर्ज करें
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF1E3] border border-[#DFC99D] rounded-full text-xs text-[#80182A]">
                <span>डिफ़ॉल्ट पिन: <strong>9753</strong></span>
                <button
                  type="button"
                  onClick={() => setPinInput('9753')}
                  className="ml-1 text-[11px] underline font-semibold text-[#B38F2B] hover:text-[#80182A]"
                >
                  (यहाँ क्लिक करके भरें)
                </button>
              </div>
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

            <div className="pt-3 border-t border-[#EADBBE] text-[11px] text-[#7A6A60] space-y-1">
              <div className="font-semibold text-[#4A0A19]">एडमिन पोर्टल डायरेक्ट URL:</div>
              <code className="inline-block px-2.5 py-1 bg-white border border-[#D9CEB5] rounded-md font-mono text-[11px] text-[#80182A]">
                {typeof window !== 'undefined' ? `${window.location.origin}/#admin` : '/#admin'}
              </code>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Sub-nav Tabs & Actions Bar */}
            <div className="bg-[#FAF3E8] border-b border-[#EADBBE] px-3 sm:px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'orders'
                      ? 'bg-[#80182A] text-white shadow-xs'
                      : 'text-[#5A4A42] hover:bg-[#EADBBE]'
                  }`}
                >
                  📦 ऑर्डर्स ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('designs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'designs'
                      ? 'bg-[#80182A] text-white shadow-xs'
                      : 'text-[#5A4A42] hover:bg-[#EADBBE]'
                  }`}
                >
                  👗 डिज़ाइन कैटलॉग ({designs.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'bg-[#80182A] text-white shadow-xs'
                      : 'text-[#5A4A42] hover:bg-[#EADBBE]'
                  }`}
                >
                  ⚙️ सेटिंग्स
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

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
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

                      <button
                        onClick={() => setIsCreatingNewOrder(true)}
                        className="px-3 py-1.5 bg-[#80182A] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs whitespace-nowrap transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ नया ऑर्डर जोड़ें</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Order Creation Form (When Admin clicks New Order) */}
                  {isCreatingNewOrder && (
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-[#D4AF37] space-y-4 shadow-md">
                      <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                        <div>
                          <h4 className="font-serif font-bold text-base text-[#4A0A19]">
                            नया ग्राहक ऑर्डर दर्ज करें (Create Manual Order)
                          </h4>
                          <span className="text-[11px] text-[#705E54]">
                            दुकान या फोन पर आए ग्राहक का ऑर्डर सीधे डेटाबेस में जोड़ें
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsCreatingNewOrder(false)}
                          className="text-xs text-[#705E54] hover:text-[#4A0A19]"
                        >
                          ✕ बंद करें
                        </button>
                      </div>

                      <form onSubmit={handleAdminCreateOrder} className="space-y-4 text-xs">
                        {/* Row 1: Customer Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">ग्राहक का नाम *</label>
                            <input
                              type="text"
                              value={newOrderCustomerName}
                              onChange={(e) => setNewOrderCustomerName(e.target.value)}
                              placeholder="जैसे: नीता वर्मा (Neeta Verma)"
                              className="w-full p-2 border rounded-lg"
                              required
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">मोबाइल नंबर (10 अंक) *</label>
                            <input
                              type="tel"
                              maxLength={10}
                              value={newOrderMobile}
                              onChange={(e) => setNewOrderMobile(e.target.value.replace(/\D/g, ''))}
                              placeholder="9876543210"
                              className="w-full p-2 border rounded-lg font-mono"
                              required
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">WhatsApp नंबर</label>
                            <input
                              type="tel"
                              maxLength={10}
                              value={newOrderWhatsapp}
                              onChange={(e) => setNewOrderWhatsapp(e.target.value.replace(/\D/g, ''))}
                              placeholder="खाली छोड़ें यदि मोबाइल ही है"
                              className="w-full p-2 border rounded-lg font-mono"
                            />
                          </div>
                        </div>

                        {/* Row 2: Design Selection & Sizing */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#FAF6EE] p-3 rounded-xl border border-[#E8DFC8]">
                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">डिज़ाइन चुनें *</label>
                            <select
                              value={newOrderDesignId}
                              onChange={(e) => setNewOrderDesignId(e.target.value)}
                              className="w-full p-2 border rounded-lg bg-white"
                            >
                              <option value="">-- कैटलॉग से चुनें --</option>
                              {designs.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.code} - {d.nameHi} (₹{d.price || 350})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">ब्लाउज़ का रंग</label>
                            <input
                              type="text"
                              value={newOrderColor}
                              onChange={(e) => setNewOrderColor(e.target.value)}
                              placeholder="जैसे: शाही मैरून / रानी पिंक"
                              className="w-full p-2 border rounded-lg bg-white"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">कपड़ा (फैब्रिक)</label>
                            <select
                              value={newOrderFabric}
                              onChange={(e) => setNewOrderFabric(e.target.value)}
                              className="w-full p-2 border rounded-lg bg-white"
                            >
                              {FABRIC_OPTIONS.map((fab) => (
                                <option key={fab.id} value={fab.nameHi}>
                                  {fab.nameHi}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">संख्या (Qty)</label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={newOrderQuantity}
                              onChange={(e) => setNewOrderQuantity(Number(e.target.value))}
                              className="w-full p-2 border rounded-lg bg-white font-mono"
                            />
                          </div>
                        </div>

                        {/* Row 3: Sleeve & Neck & Size Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">आस्तीन स्टाइल</label>
                            <select
                              value={newOrderSleeve}
                              onChange={(e) => setNewOrderSleeve(e.target.value)}
                              className="w-full p-2 border rounded-lg"
                            >
                              {SLEEVE_STYLES.map((sl) => (
                                <option key={sl.id} value={sl.nameHi}>
                                  {sl.nameHi}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">गले का डिज़ाइन</label>
                            <select
                              value={newOrderNeck}
                              onChange={(e) => setNewOrderNeck(e.target.value)}
                              className="w-full p-2 border rounded-lg"
                            >
                              {NECK_DESIGNS.map((nk) => (
                                <option key={nk.id} value={nk.nameHi}>
                                  {nk.nameHi}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">साइज़ प्रकार</label>
                            <div className="flex items-center gap-2 pt-1">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name="sizeTypeAdmin"
                                  checked={newOrderSizeType === 'standard'}
                                  onChange={() => setNewOrderSizeType('standard')}
                                />
                                <span>स्टैंडर्ड ({newOrderStandardSize}")</span>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer ml-2">
                                <input
                                  type="radio"
                                  name="sizeTypeAdmin"
                                  checked={newOrderSizeType === 'custom'}
                                  onChange={() => setNewOrderSizeType('custom')}
                                />
                                <span>कस्टम नाप</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Custom Measurements Grid if Custom Selected */}
                        {newOrderSizeType === 'custom' && (
                          <div className="p-3 bg-white rounded-xl border border-[#DFC99D] space-y-2">
                            <span className="font-semibold text-[#80182A] block">कस्टम नाप (Inches):</span>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              <div>
                                <label className="block text-[10px]">छाती (Bust)</label>
                                <input
                                  type="text"
                                  value={newOrderBust}
                                  onChange={(e) => setNewOrderBust(e.target.value)}
                                  placeholder='36"'
                                  className="w-full p-1.5 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px]">कमर (Waist)</label>
                                <input
                                  type="text"
                                  value={newOrderWaist}
                                  onChange={(e) => setNewOrderWaist(e.target.value)}
                                  placeholder='30"'
                                  className="w-full p-1.5 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px]">कंधा (Shoulder)</label>
                                <input
                                  type="text"
                                  value={newOrderShoulder}
                                  onChange={(e) => setNewOrderShoulder(e.target.value)}
                                  placeholder='14"'
                                  className="w-full p-1.5 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px]">लंबाई (Length)</label>
                                <input
                                  type="text"
                                  value={newOrderLength}
                                  onChange={(e) => setNewOrderLength(e.target.value)}
                                  placeholder='14.5"'
                                  className="w-full p-1.5 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px]">आस्तीन</label>
                                <input
                                  type="text"
                                  value={newOrderSleeveLength}
                                  onChange={(e) => setNewOrderSleeveLength(e.target.value)}
                                  placeholder='10"'
                                  className="w-full p-1.5 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px]">आर्महोल</label>
                                <input
                                  type="text"
                                  value={newOrderArmhole}
                                  onChange={(e) => setNewOrderArmhole(e.target.value)}
                                  placeholder='16"'
                                  className="w-full p-1.5 border rounded"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Row 4: Delivery, Price & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">डिलीवरी पता / पिकअप</label>
                            <input
                              type="text"
                              value={newOrderAddress}
                              onChange={(e) => setNewOrderAddress(e.target.value)}
                              placeholder="दुकान से पिकअप या पता"
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">कुल शुल्क (₹ Amount) *</label>
                            <input
                              type="number"
                              value={newOrderAmount}
                              onChange={(e) => setNewOrderAmount(e.target.value)}
                              placeholder="जैसे: 350"
                              className="w-full p-2 border rounded-lg font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">प्रारंभिक स्थिति (Status)</label>
                            <select
                              value={newOrderStatus}
                              onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                              className="w-full p-2 border rounded-lg font-semibold"
                            >
                              {ORDER_STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-[#4A0A19] mb-1">बुटीक नोट्स / विशेष निर्देश</label>
                          <input
                            type="text"
                            value={newOrderNotes}
                            onChange={(e) => setNewOrderNotes(e.target.value)}
                            placeholder="जैसे: ग्राहक ने फोन पर ऑर्डर दिया, 3 दिन में तैयार करना है..."
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#F2ECE1]">
                          <button
                            type="button"
                            onClick={() => setIsCreatingNewOrder(false)}
                            className="px-4 py-2 border rounded-lg text-[#5A4A42] hover:bg-[#FAF6EE]"
                          >
                            रद्द करें
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 bg-[#80182A] hover:bg-[#9B111E] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>ऑर्डर सेव करें (Create Order)</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

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
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-serif font-bold text-[#4A0A19]">
                          ब्लाउज़ डिज़ाइन कैटलॉग
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF1E3] text-[#80182A] border border-[#DFC99D] flex items-center gap-1">
                          <Cloud className="w-3 h-3 text-[#B38F2B]" />
                          Cloudinary पावर्ड ({designs.length})
                        </span>
                      </div>
                      <p className="text-xs text-[#705E54] mt-0.5">
                        कैटलॉग फोटो अपलोड करें, कीमत (₹200-₹400) बदलें और वेबसाइट पर तुरंत लाइव करें
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowQuickCatalogueBox((prev) => !prev)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors ${
                          showQuickCatalogueBox
                            ? 'bg-[#4A0A19] text-white ring-2 ring-[#D4AF37]'
                            : 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-black hover:brightness-105'
                        }`}
                      >
                        <Cloud className="w-4 h-4 text-white" />
                        <span className="text-white font-bold">⚡ Cloudinary कैटलॉग अपलोड</span>
                      </button>

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
                        className="px-3.5 py-2 bg-[#80182A] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ पूरा फॉर्म</span>
                      </button>
                    </div>
                  </div>

                  {/* QUICK CLOUDINARY CATALOGUE UPLOADER CARD */}
                  {showQuickCatalogueBox && (
                    <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FAF4E8] p-5 sm:p-6 rounded-3xl border-2 border-[#D4AF37] space-y-4 shadow-lg">
                      <div className="flex items-center justify-between pb-3 border-b border-[#EADBBE]">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-[#80182A] text-white rounded-xl shadow-xs">
                            <Cloud className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-base text-[#4A0A19]">
                              झटपट कैटलॉग अपलोड (Cloudinary Direct Uploader)
                            </h4>
                            <p className="text-[11px] text-[#705E54]">
                              Cloud Name: <span className="font-mono font-bold text-[#80182A]">{cloudinaryCloudName}</span> · Preset: <span className="font-bold text-[#80182A]">{cloudinaryUploadPreset}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowQuickCatalogueBox(false)}
                          className="text-xs text-[#705E54] hover:text-[#4A0A19] px-2 py-1 bg-white rounded-lg border border-[#D9CEB5]"
                        >
                          ✕ बंद करें
                        </button>
                      </div>

                      <form onSubmit={handleSaveQuickCatalogue} className="space-y-4">
                        {/* File Upload Zone */}
                        <div className="border-2 border-dashed border-[#D4AF37] rounded-2xl p-4 sm:p-6 bg-white text-center space-y-3">
                          {quickCatImage ? (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-md shrink-0 bg-black/5">
                                <img
                                  src={quickCatImage}
                                  alt="Uploaded Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-left space-y-1.5 max-w-md">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-700" />
                                  Cloudinary पर फ़ोटो तैयार है!
                                </span>
                                <div className="text-xs font-mono text-[#5A4A42] truncate max-w-sm">
                                  {quickCatImage}
                                </div>
                                <label className="inline-block cursor-pointer text-xs text-[#80182A] font-semibold underline hover:text-[#4A0A19]">
                                  दूसरी फोटो चुनें (Change Photo)
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleQuickCatalogueUpload}
                                    className="hidden"
                                    disabled={isUploadingToCloudinary}
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label className="cursor-pointer inline-flex flex-col items-center justify-center p-4 bg-[#FAF5EB] hover:bg-[#F2E8D5] border border-[#DFC99D] rounded-2xl transition-colors group">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xs text-[#80182A] group-hover:scale-105 transition-transform">
                                  <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-[#4A0A19] mt-2">
                                  ब्लाउज़ कैटलॉग फोटो चुनें (Select Blouse Photo)
                                </span>
                                <span className="text-[10px] text-[#705E54]">
                                  कैमरा, मोबाइल गैलरी या कंप्यूटर से सीधे Cloudinary में अपलोड करें
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleQuickCatalogueUpload}
                                  className="hidden"
                                  disabled={isUploadingToCloudinary}
                                />
                              </label>

                              {isUploadingToCloudinary && (
                                <div className="max-w-xs mx-auto space-y-1">
                                  <div className="flex items-center justify-between text-xs text-[#80182A] font-bold">
                                    <span>Cloudinary पर अपलोड हो रहा है...</span>
                                    <span>{cloudinaryUploadPercent}%</span>
                                  </div>
                                  <div className="w-full bg-[#EADBBE] h-2 rounded-full overflow-hidden">
                                    <div
                                      className="bg-[#80182A] h-full transition-all duration-300"
                                      style={{ width: `${cloudinaryUploadPercent}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Catalogue Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">
                              डिज़ाइन / कैटलॉग का नाम *
                            </label>
                            <input
                              type="text"
                              value={quickCatNameHi}
                              onChange={(e) => setQuickCatNameHi(e.target.value)}
                              placeholder="जैसे: रॉयल कुंदन जरदोजी ब्लाउज़"
                              className="w-full p-2.5 bg-white border border-[#D9CEB5] rounded-xl outline-none focus:border-[#80182A]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">
                              श्रेणी (Category) *
                            </label>
                            <select
                              value={quickCatCategory}
                              onChange={(e) => setQuickCatCategory(e.target.value)}
                              className="w-full p-2.5 bg-white border border-[#D9CEB5] rounded-xl outline-none"
                            >
                              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.nameHi}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A0A19] mb-1">
                              सिलाई शुल्क (₹ Rate) *
                            </label>
                            <input
                              type="number"
                              min={100}
                              max={2000}
                              value={quickCatPrice}
                              onChange={(e) => setQuickCatPrice(Number(e.target.value))}
                              className="w-full p-2.5 bg-white border border-[#D9CEB5] rounded-xl font-mono font-bold text-sm outline-none focus:border-[#80182A]"
                              required
                            />
                            {/* Quick Price Buttons */}
                            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                              <span className="text-[10px] text-[#705E54]">त्वरित चयन:</span>
                              {[200, 250, 300, 350, 399, 400].map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setQuickCatPrice(p)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border transition-colors ${
                                    quickCatPrice === p
                                      ? 'bg-[#80182A] text-white border-[#80182A]'
                                      : 'bg-white text-[#4A0A19] border-[#DFC99D] hover:bg-[#FAF1E3]'
                                  }`}
                                >
                                  ₹{p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-[#4A0A19] mb-1 text-xs">
                            संक्षिप्त विवरण (वैकल्पिक)
                          </label>
                          <input
                            type="text"
                            value={quickCatDescription}
                            onChange={(e) => setQuickCatDescription(e.target.value)}
                            placeholder="जैसे: आरी वर्क, स्वीटहार्ट नेक, शुद्ध सिल्क पर विशेष कारीगरी"
                            className="w-full p-2 bg-white border border-[#D9CEB5] rounded-xl text-xs outline-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#EADBBE]">
                          <button
                            type="button"
                            onClick={() => setShowQuickCatalogueBox(false)}
                            className="px-4 py-2 border border-[#D9CEB5] text-[#5A4A42] text-xs font-semibold rounded-xl bg-white"
                          >
                            रद्द करें
                          </button>
                          <button
                            type="submit"
                            disabled={!quickCatImage || isUploadingToCloudinary}
                            className="px-6 py-2.5 bg-[#80182A] hover:bg-[#9B111E] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#ECC86B]" />
                            <span>कैटलॉग में लाइव प्रकाशित करें (Publish Now)</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

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
                          <label className="block font-semibold mb-1">सिलाई शुल्क (₹ Price)</label>
                          <input
                            type="number"
                            min={100}
                            max={2000}
                            value={editingDesign.price ?? ''}
                            onChange={(e) =>
                              setEditingDesign({
                                ...editingDesign,
                                price: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            placeholder="उदा: 350"
                            className="w-full p-2 border rounded-lg font-mono font-bold text-sm"
                          />
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-[#705E54]">त्वरित चयन (₹200-₹400):</span>
                            {[200, 250, 300, 350, 399, 400].map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setEditingDesign({ ...editingDesign, price: p })}
                                className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold font-mono transition-colors ${
                                  editingDesign.price === p
                                    ? 'bg-[#80182A] text-white border-[#80182A]'
                                    : 'bg-[#FAF1E3] hover:bg-[#F2E8D5] text-[#80182A]'
                                }`}
                              >
                                ₹{p}
                              </button>
                            ))}
                          </div>
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

                        {/* File Upload & Live Preview */}
                        <div className="sm:col-span-2 p-3.5 bg-[#FAF6EE] rounded-xl border border-[#E8DFC8] space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block font-bold text-[#4A0A19]">
                              ब्लाउज़ फ़ोटो / कैटलॉग अपलोड करें (Cloudinary पावर्ड) *
                            </label>
                            <span className="text-[10px] font-mono font-semibold text-[#80182A] bg-white px-2 py-0.5 rounded border border-[#DFC99D] flex items-center gap-1">
                              <Cloud className="w-3 h-3 text-[#B38F2B]" />
                              {cloudinaryCloudName}
                            </span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <label className="cursor-pointer px-4 py-2.5 bg-white hover:bg-[#FAF1E3] border-2 border-dashed border-[#D4AF37] rounded-xl text-xs font-semibold text-[#80182A] flex items-center gap-2 shadow-xs transition-colors">
                              <Upload className="w-4 h-4 text-[#B38F2B]" />
                              <span>कैमरा या गैलरी से फ़ोटो चुनें (Upload to Cloudinary)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleDesignImageUpload}
                                className="hidden"
                                disabled={isUploadingToCloudinary}
                              />
                            </label>

                            <span className="text-[11px] text-[#705E54]">या इमेज URL डालें:</span>
                            <input
                              type="text"
                              value={editingDesign.image || ''}
                              onChange={(e) => setEditingDesign({ ...editingDesign, image: e.target.value })}
                              placeholder="/src/assets/images/... या https://res.cloudinary.com/..."
                              className="flex-1 p-2 border rounded-lg font-mono text-[11px] bg-white"
                            />
                          </div>

                          {isUploadingToCloudinary && (
                            <div className="p-2 bg-white rounded-lg border border-[#DFC99D] space-y-1">
                              <div className="flex items-center justify-between text-xs text-[#80182A] font-bold">
                                <span>Cloudinary पर अपलोड हो रहा है...</span>
                                <span>{cloudinaryUploadPercent}%</span>
                              </div>
                              <div className="w-full bg-[#FAF1E3] h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#80182A] h-full transition-all duration-300"
                                  style={{ width: `${cloudinaryUploadPercent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {editingDesign.image && (
                            <div className="flex items-center gap-3 pt-2">
                              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#D4AF37] shrink-0 bg-white shadow-xs">
                                <img
                                  src={editingDesign.image}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <span className="text-xs text-emerald-700 font-semibold block">
                                  ✓ फ़ोटो लोड हो गई है और कैटलॉग में दिखाई देगी!
                                </span>
                                {editingDesign.image.includes('cloudinary') && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF1E3] text-[#80182A] border border-[#DFC99D] inline-flex items-center gap-1">
                                    <Cloud className="w-3 h-3 text-[#B38F2B]" />
                                    Cloudinary पर सुरक्षित होस्टेड
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
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
                        className="bg-white p-3.5 rounded-2xl border border-[#E8DFC8] flex flex-col justify-between shadow-xs hover:border-[#D4AF37] transition-all space-y-2.5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={d.image}
                              alt={d.nameHi}
                              className="w-16 h-16 rounded-xl object-cover border border-[#D4AF37]"
                              referrerPolicy="no-referrer"
                            />
                            {d.image.includes('cloudinary') && (
                              <span
                                title="Cloudinary पर होस्टेड"
                                className="absolute -top-1.5 -right-1.5 bg-[#80182A] text-white rounded-full p-0.5 shadow-xs"
                              >
                                <Cloud className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#80182A]">{d.code}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setIsCreatingNewDesign(false);
                                    setEditingDesign(d);
                                  }}
                                  className="p-1 text-[#5A4A42] hover:text-[#80182A] hover:bg-[#FAF6EE] rounded-lg"
                                  title="एडिट करें"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDesign(d.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="डिलीट करें"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-xs font-bold text-[#2C1810] truncate" title={d.nameHi}>
                              {d.nameHi}
                            </h4>
                            
                            <div className="flex items-center justify-between pt-0.5">
                              <span className="text-xs font-mono font-bold text-[#80182A]">
                                {d.price ? `₹${d.price}` : 'संपर्क पर'}
                              </span>
                              
                              {/* Custom Price Modal Trigger */}
                              <button
                                onClick={() => {
                                  setQuickPriceModalDesign(d);
                                  setQuickPriceValue(d.price ? String(d.price) : '350');
                                }}
                                className="px-1.5 py-0.5 bg-[#FAF1E3] hover:bg-[#F2E8D5] text-[#80182A] rounded text-[10px] font-semibold flex items-center gap-1 border border-[#DFC99D]"
                                title="कस्टम कीमत दर्ज करें"
                              >
                                <Tag className="w-3 h-3 text-[#B38F2B]" />
                                <span>कस्टम कीमत</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 1-Click Fast Price Selector Pills (₹200 to ₹400) */}
                        <div className="pt-2 border-t border-[#F2ECE1] space-y-1">
                          <span className="text-[9px] text-[#705E54] font-medium block">
                            1-क्लिक कीमत बदलें (₹200 - ₹400):
                          </span>
                          <div className="grid grid-cols-6 gap-1">
                            {[200, 250, 300, 350, 399, 400].map((pr) => (
                              <button
                                key={pr}
                                type="button"
                                onClick={() => handleQuickInlinePrice(d, pr)}
                                className={`py-1 text-[10px] font-mono font-bold rounded-md border text-center transition-all ${
                                  d.price === pr
                                    ? 'bg-[#80182A] text-white border-[#80182A] shadow-xs'
                                    : 'bg-[#FAF6EE] hover:bg-[#F2E8D5] text-[#4A0A19] border-[#E0D4BA]'
                                }`}
                                title={`कीमत ₹${pr} सेट करें`}
                              >
                                ₹{pr}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* QUICK PRICE EDIT MODAL */}
                  {quickPriceModalDesign && (
                    <div className="fixed inset-0 z-70 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-[#FDFBF7] rounded-3xl max-w-sm w-full p-5 shadow-2xl border-2 border-[#D4AF37] space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE1]">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-4 h-4 text-[#80182A]" />
                            <h4 className="font-serif font-bold text-sm text-[#4A0A19]">
                              कीमत बदलें (Change Price)
                            </h4>
                          </div>
                          <button
                            onClick={() => setQuickPriceModalDesign(null)}
                            className="text-[#705E54] hover:text-[#4A0A19]"
                          >
                            ✕
                          </button>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-[#80182A]">
                            {quickPriceModalDesign.code}
                          </span>
                          <h5 className="text-xs font-semibold text-[#2C1810]">
                            {quickPriceModalDesign.nameHi}
                          </h5>
                        </div>

                        <form onSubmit={handleQuickPriceSave} className="space-y-3 text-xs">
                          <div>
                            <label className="block font-semibold mb-1">
                              नई कीमत (₹200 से ₹400 या कोई भी राशि):
                            </label>
                            <input
                              type="number"
                              min={100}
                              max={2000}
                              value={quickPriceValue}
                              onChange={(e) => setQuickPriceValue(e.target.value)}
                              placeholder="जैसे: 350"
                              className="w-full p-2.5 border rounded-xl font-mono text-base font-bold bg-white focus:border-[#80182A] outline-none"
                              autoFocus
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] text-[#705E54]">त्वरित चयन (₹200 - ₹400):</span>
                            <div className="grid grid-cols-6 gap-1">
                              {[200, 250, 300, 350, 399, 400].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setQuickPriceValue(String(val))}
                                  className={`py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                                    quickPriceValue === String(val)
                                      ? 'bg-[#80182A] text-white border-[#80182A]'
                                      : 'bg-white text-[#4A0A19] border-[#DFC99D] hover:bg-[#FAF1E3]'
                                  }`}
                                >
                                  ₹{val}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-[#F2ECE1]">
                            <button
                              type="button"
                              onClick={() => setQuickPriceModalDesign(null)}
                              className="px-3 py-1.5 border rounded-lg"
                            >
                              रद्द करें
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-1.5 bg-[#80182A] hover:bg-[#9B111E] text-white font-semibold rounded-lg shadow-xs"
                            >
                              कीमत सेव करें
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: SETTINGS & BANNER MANAGER */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  {/* Banner & Notice Card */}
                  <div className="bg-white p-6 rounded-2xl border border-[#E8DFC8] space-y-4">
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
                    </div>
                  </div>

                  {/* Cloudinary Integration Settings Card */}
                  <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FAF4E8] p-6 rounded-2xl border-2 border-[#D4AF37] space-y-4 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EADBBE]">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-[#80182A] text-white rounded-xl shadow-xs">
                          <Cloud className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-base text-[#4A0A19]">
                            Cloudinary इमेज होस्टिंग इंटीग्रेशन
                          </h4>
                          <span className="text-[11px] text-[#705E54]">
                            ब्लाउज़ कैटलॉग व कस्टमर रेफरेंस फोटो स्टोरेज
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        सक्रिय (Connected)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-[#4A0A19] mb-1">
                          Cloud Name *
                        </label>
                        <input
                          type="text"
                          value={cloudinaryCloudName}
                          onChange={(e) => setCloudinaryCloudName(e.target.value)}
                          placeholder="dxeuzdwkz"
                          className="w-full p-2.5 bg-white border border-[#D9CEB5] rounded-xl font-mono text-xs outline-none focus:border-[#80182A]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#4A0A19] mb-1">
                          Upload Preset Name *
                        </label>
                        <input
                          type="text"
                          value={cloudinaryUploadPreset}
                          onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                          placeholder="Muskaan fashion designer"
                          className="w-full p-2.5 bg-white border border-[#D9CEB5] rounded-xl text-xs outline-none focus:border-[#80182A]"
                        />
                      </div>
                    </div>

                    {/* Test Connection Button & Result */}
                    <div className="p-3 bg-white rounded-xl border border-[#DFC99D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-[#4A0A19] block">
                          कनेक्शन जांचें (Test Cloudinary API)
                        </span>
                        <span className="text-[11px] text-[#705E54]">
                          जांचें कि Cloudinary में फोटो अपलोड सही ढंग से काम कर रहा है
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestCloudinary}
                        disabled={cloudinaryTestResult?.testing}
                        className="px-3.5 py-1.5 bg-[#FAF1E3] hover:bg-[#F2E8D5] text-[#80182A] border border-[#DFC99D] rounded-xl font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${cloudinaryTestResult?.testing ? 'animate-spin' : ''}`} />
                        <span>{cloudinaryTestResult?.testing ? 'जांच हो रही है...' : 'टेस्ट कनेक्शन'}</span>
                      </button>
                    </div>

                    {cloudinaryTestResult && (
                      <div
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                          cloudinaryTestResult.isError
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        {cloudinaryTestResult.isError ? '✕ ' : '✓ '}
                        <div className="space-y-1">
                          <span>{cloudinaryTestResult.message}</span>
                          {cloudinaryTestResult.sampleUrl && (
                            <a
                              href={cloudinaryTestResult.sampleUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-700 underline flex items-center gap-1 font-mono"
                            >
                              <span>टेस्ट इमेज लिंक देखें</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {saveSuccessMsg && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                        ✓ {saveSuccessMsg}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={handleSaveSettings}
                        className="px-6 py-2.5 bg-[#80182A] text-white font-semibold rounded-xl hover:bg-[#9B111E] shadow-sm transition-colors text-xs"
                      >
                        सेटिंग्स व Cloudinary सेव करें
                      </button>
                    </div>
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
