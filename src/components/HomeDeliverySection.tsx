import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Truck, Home, ShieldCheck, MapPin } from 'lucide-react';

interface HomeDeliverySectionProps {
  language: Language;
  onStartOrder: () => void;
}

export const HomeDeliverySection: React.FC<HomeDeliverySectionProps> = ({
  language,
  onStartOrder,
}) => {
  const t = translations[language];

  return (
    <section id="home-delivery-section" className="py-12 sm:py-16 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Box with Royal Border */}
        <div className="bg-gradient-to-br from-[#FAF5EC] via-[#FFFDF9] to-[#FAF5EC] rounded-3xl p-8 sm:p-12 border-2 border-[#D4AF37]/40 shadow-sm">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#80182A] tracking-wider uppercase">
              <Truck className="w-4 h-4 text-[#B38F2B]" />
              <span>डोरस्टेप सिलाई एवं डिलीवरी सेवा</span>
            </div>

            {/* Exact Required Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#4A0A19] leading-tight text-balance">
              {t.deliverySection.headline}
            </h2>

            <p className="text-sm sm:text-base text-[#5C4D44] leading-relaxed">
              {t.deliverySection.subtitle}
            </p>
          </div>

          {/* 4 Feature Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF1E3] flex items-center justify-center text-[#80182A]">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4A0A19]">
                {t.deliverySection.point1Title}
              </h3>
              <p className="text-xs text-[#5C4D44] leading-relaxed">
                {t.deliverySection.point1Desc}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF1E3] flex items-center justify-center text-[#80182A]">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4A0A19]">
                {t.deliverySection.point2Title}
              </h3>
              <p className="text-xs text-[#5C4D44] leading-relaxed">
                {t.deliverySection.point2Desc}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF1E3] flex items-center justify-center text-[#80182A]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4A0A19]">
                {t.deliverySection.point3Title}
              </h3>
              <p className="text-xs text-[#5C4D44] leading-relaxed">
                {t.deliverySection.point3Desc}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF1E3] flex items-center justify-center text-[#80182A]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4A0A19]">
                {t.deliverySection.point4Title}
              </h3>
              <p className="text-xs text-[#5C4D44] leading-relaxed">
                {t.deliverySection.point4Desc}
              </p>
            </div>

          </div>

          {/* Delivery Note Box */}
          <div className="mt-8 p-4 bg-[#FAF1E3] rounded-2xl border border-[#DFC99D] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#5C4D44] text-center sm:text-left leading-relaxed">
              🔔 <span className="font-semibold text-[#4A0A19]">महत्वपूर्ण सूचना:</span> होम डिलीवरी की उपलब्धता, डिलीवरी शुल्क व अनुमानित डिलीवरी समय ऑर्डर सबमिट करने के बाद बुटीक द्वारा आपके पिन कोड के आधार पर कन्फर्म किया जाएगा।
            </p>
            <button
              onClick={onStartOrder}
              className="px-5 py-2.5 bg-[#80182A] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-full shadow-xs whitespace-nowrap transition-colors"
            >
              घर बैठे ऑर्डर करें
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
