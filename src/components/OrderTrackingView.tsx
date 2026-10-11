import React, { useState } from 'react';
import { Order, OrderStatus, Language } from '../types';
import { translations } from '../data/translations';
import { api } from '../services/api';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
import {
  Search,
  CheckCircle2,
  Clock,
  Scissors,
  Truck,
  PackageCheck,
  AlertCircle,
  MessageCircle,
  XCircle,
} from 'lucide-react';

interface OrderTrackingViewProps {
  language: Language;
}

const ORDER_STEPS: OrderStatus[] = [
  'Order Received',
  'Confirmation Pending',
  'Order Confirmed',
  'Stitching in Progress',
  'Ready for Dispatch',
  'Shipped',
  'Delivered',
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ language }) => {
  const t = translations[language];

  const [orderIdInput, setOrderIdInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim() || !mobileInput.trim()) {
      setError('कृपया दोनों फ़ील्ड भरें (Enter Order ID and Mobile)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const order = await api.trackOrder(orderIdInput.trim(), mobileInput.trim());
      setTrackedOrder(order);
    } catch (err: any) {
      setTrackedOrder(null);
      setError(err.message || t.tracking.notFound);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepName: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === 'Cancelled') {
      return 'cancelled';
    }
    const stepIdx = ORDER_STEPS.indexOf(stepName);
    const currentIdx = ORDER_STEPS.indexOf(currentStatus);

    if (currentIdx === -1) return 'pending';
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <section id="track-order-section" className="py-12 sm:py-16 bg-[#FAF5EC] border-t border-[#E8DFC8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#80182A] tracking-wider uppercase mb-1">
            <Search className="w-3.5 h-3.5 text-[#B38F2B]" />
            <span>सुरक्षित ग्राहक ट्रैकिंग</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A0A19]">
            {t.tracking.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D44] mt-2 leading-relaxed">
            {t.tracking.subtitle}
          </p>
        </div>

        {/* Tracking Lookup Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8DFC8] mb-8">
          <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-[#4A0A19] mb-1.5">
                {t.tracking.orderIdLabel} *
              </label>
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
                placeholder={t.tracking.orderIdPlaceholder}
                className="w-full px-4 py-3 text-xs sm:text-sm bg-[#FDFBF7] border border-[#D9CEB5] rounded-xl focus:border-[#80182A] focus:ring-2 focus:ring-[#80182A]/10 outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-[#4A0A19] mb-1.5">
                {t.tracking.mobileLabel} *
              </label>
              <input
                type="tel"
                maxLength={10}
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                placeholder={t.tracking.mobilePlaceholder}
                className="w-full px-4 py-3 text-xs sm:text-sm bg-[#FDFBF7] border border-[#D9CEB5] rounded-xl focus:border-[#80182A] focus:ring-2 focus:ring-[#80182A]/10 outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#80182A] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 border border-[#A62B3F] disabled:opacity-60"
              >
                {loading ? (
                  <span>{t.tracking.searching}</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{t.tracking.trackCta}</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracked Order Details Result */}
        {trackedOrder && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-[#D4AF37]/50 space-y-8 animate-in fade-in duration-300">
            
            {/* Header Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F2ECE1]">
              <div>
                <span className="text-[11px] font-semibold text-[#80182A] uppercase tracking-wider">
                  सत्यापित ग्राहक ऑर्डर (Verified)
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#4A0A19] flex items-center gap-2">
                  <span>{trackedOrder.id}</span>
                </h3>
                <span className="text-xs text-[#705E54]">
                  ग्राहक: {trackedOrder.customerName} · तारीख: {new Date(trackedOrder.createdAt).toLocaleDateString('hi-IN')}
                </span>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto">
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    trackedOrder.status === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : trackedOrder.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#FAF1E3] text-[#80182A] border border-[#DFC99D]'
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>{trackedOrder.status}</span>
                </span>
              </div>
            </div>

            {/* Visual Lifecycle Progress Tracker */}
            <div>
              <h4 className="text-xs font-semibold text-[#4A0A19] uppercase tracking-wider mb-6">
                {t.tracking.timeline}
              </h4>

              {trackedOrder.status === 'Cancelled' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs">
                  <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                  <div>
                    <span className="font-bold">ऑर्डर रद्द कर दिया गया है (Order Cancelled)</span>
                    <p className="text-red-700 mt-0.5">
                      अधिक जानकारी के लिए कृपया हमारे बुटीक हेल्पलाइन पर संपर्क करें।
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {ORDER_STEPS.map((st, i) => {
                      const state = getStepStatus(st, trackedOrder.status);
                      return (
                        <div
                          key={st}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            state === 'completed'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : state === 'active'
                              ? 'bg-[#80182A] border-[#80182A] text-white shadow-xs'
                              : 'bg-[#FAF6EE] border-[#E8DFC8] text-[#8C7A70]'
                          }`}
                        >
                          <div className="text-[10px] font-bold mb-0.5">चरण {i + 1}</div>
                          <div className="text-[11px] font-semibold leading-tight line-clamp-2">
                            {st}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Specifications Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF6EE] p-5 rounded-2xl border border-[#E8DFC8] text-xs">
              <div className="space-y-2">
                <div className="font-bold text-[#4A0A19] text-sm">ब्लाउज़ विवरण:</div>
                <div>• <span className="font-semibold">डिज़ाइन:</span> {trackedOrder.designName} ({trackedOrder.designCode})</div>
                <div>• <span className="font-semibold">रंग:</span> {trackedOrder.blouseColor}</div>
                <div>• <span className="font-semibold">कपड़ा:</span> {trackedOrder.fabricPreference}</div>
                <div>• <span className="font-semibold">आस्तीन:</span> {trackedOrder.sleeveStyle}</div>
                <div>• <span className="font-semibold">गला:</span> {trackedOrder.neckDesign}</div>
                <div>• <span className="font-semibold">संख्या:</span> {trackedOrder.quantity}</div>
                <div>• <span className="font-semibold">साइज़:</span> {trackedOrder.sizeType === 'standard' ? `${trackedOrder.standardSize}" तैयार` : 'कस्टम नाप'}</div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-[#4A0A19] text-sm">डिलीवरी व शुल्क स्थिति:</div>
                <div>• <span className="font-semibold">पता:</span> {trackedOrder.deliveryAddress}, {trackedOrder.city} - {trackedOrder.pinCode}</div>
                <div>
                  • <span className="font-semibold">सिलाई शुल्क:</span>{' '}
                  {trackedOrder.totalAmount ? (
                    <span className="font-bold text-[#80182A] font-mono">
                      ₹{trackedOrder.totalAmount.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    'बुटीक द्वारा कन्फर्म किया जाएगा'
                  )}
                </div>
                {trackedOrder.deliveryChargeNote && (
                  <div className="p-2 bg-white rounded-lg border border-[#EADBBE] text-[11px] text-[#705E54]">
                    📦 {trackedOrder.deliveryChargeNote}
                  </div>
                )}
                {trackedOrder.adminNotes && (
                  <div className="p-2 bg-white rounded-lg border border-[#DFC99D] text-[11px] text-[#4A0A19]">
                    💬 बुटीक संदेश: {trackedOrder.adminNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Direct WhatsApp Contact CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#705E54]">
                {t.tracking.helpText}
              </p>
              <a
                href={generateWhatsAppOrderUrl(trackedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.tracking.contactBoutique}</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
