import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Search, Sliders, MapPin, Sparkles, MessageCircle } from 'lucide-react';

interface HowToOrderSectionProps {
  language: Language;
  onStartOrder: () => void;
}

export const HowToOrderSection: React.FC<HowToOrderSectionProps> = ({
  language,
  onStartOrder,
}) => {
  const t = translations[language];

  const steps = [
    {
      num: '01',
      icon: Search,
      title: t.howToOrderPage.step1Title,
      desc: t.howToOrderPage.step1Desc,
    },
    {
      num: '02',
      icon: Sliders,
      title: t.howToOrderPage.step2Title,
      desc: t.howToOrderPage.step2Desc,
    },
    {
      num: '03',
      icon: MapPin,
      title: t.howToOrderPage.step3Title,
      desc: t.howToOrderPage.step3Desc,
    },
    {
      num: '04',
      icon: MessageCircle,
      title: t.howToOrderPage.step4Title,
      desc: t.howToOrderPage.step4Desc,
    },
  ];

  return (
    <section id="how-to-order-section" className="py-12 sm:py-16 bg-[#FAF5EC] border-t border-[#E8DFC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#80182A] tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#B38F2B]" />
            <span>सरल ऑनलाइन प्रक्रिया</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A0A19]">
            {t.howToOrderPage.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D44] mt-1.5 leading-relaxed">
            {t.howToOrderPage.subtitle}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="bg-white rounded-2xl p-6 border border-[#E8DFC8] relative shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-serif font-bold text-2xl text-[#DFC99D]">
                      {st.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF1E3] flex items-center justify-center text-[#80182A]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#4A0A19] mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#5C4D44] leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <button
            onClick={onStartOrder}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#80182A] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-full shadow-md hover:shadow-lg transition-all border border-[#A62B3F]"
          >
            अभी ऑर्डर शुरू करें
          </button>
        </div>

      </div>
    </section>
  );
};
