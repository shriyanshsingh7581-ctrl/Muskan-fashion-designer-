import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { generateWhatsAppGeneralUrl } from '../utils/whatsapp';
import { MessageCircle, Scissors, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  language: Language;
  onExploreDesigns: () => void;
  onStartOrder: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  language,
  onExploreDesigns,
  onStartOrder,
}) => {
  const t = translations[language];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-[#FAF5EC] to-[#FDFBF7] pt-8 pb-14 lg:pt-14 lg:pb-20 border-b border-[#EADBBE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Trust Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF1E3] border border-[#DFC99D] rounded-full text-xs font-semibold text-[#80182A]">
              <Sparkles className="w-3.5 h-3.5 text-[#B38F2B]" />
              <span>{t.hero.badge}</span>
              <span className="text-[#B38F2B]">·</span>
              <span className="text-[#5A4A42]">Navratri & Wedding Season</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#4A0A19] leading-[1.25] text-balance">
              {t.hero.headline}
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-xl font-medium text-[#7A1E31] leading-relaxed text-balance">
              {t.hero.subheadline}
            </p>

            {/* Supporting Text */}
            <p className="text-xs sm:text-base text-[#5C4D44] leading-relaxed max-w-2xl">
              {t.hero.supporting}
            </p>

            {/* 3 Main Required CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4">
              {/* 1. अभी ऑर्डर करें */}
              <button
                onClick={onStartOrder}
                className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#80182A] via-[#9B111E] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 border border-[#B3273D] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Scissors className="w-4 h-4 text-[#F3E5AB]" />
                <span>{t.hero.ctaOrder}</span>
              </button>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
                {/* 2. डिज़ाइन देखें */}
                <button
                  onClick={onExploreDesigns}
                  className="px-4 sm:px-6 py-3 text-xs sm:text-base font-semibold text-[#6B1124] bg-white hover:bg-[#FAF5EC] border border-[#DFC99D] rounded-full shadow-xs hover:shadow-sm transition-all whitespace-nowrap active:scale-95 text-center flex items-center justify-center"
                >
                  {t.hero.ctaDesigns}
                </button>

                {/* 3. WhatsApp पर ऑर्डर करें */}
                <a
                  href={generateWhatsAppGeneralUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 sm:px-6 py-3 text-xs sm:text-base font-semibold text-[#14532D] bg-[#E8F5E9] hover:bg-[#D4EDDA] border border-[#A3D9A5] rounded-full shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 text-center"
                >
                  <MessageCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="truncate">{t.hero.ctaWhatsapp}</span>
                </a>
              </div>
            </div>

            {/* Trust Markers Adjacency */}
            <div className="pt-4 sm:pt-6 border-t border-[#EEDBCA] grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm text-[#5C4D44]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-medium">{t.hero.feature1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-medium">{t.hero.feature2}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-medium">{t.hero.feature3}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/50 bg-[#F4EBD9]">
                <img
                  src="/src/assets/images/hero_blouse_craft_1791701468425.jpg"
                  alt="Muskaan Fashion Designer Custom Bridal Blouse"
                  className="w-full h-auto object-cover transform hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Floating Tag */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[#DFC99D] shadow-lg flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] font-semibold text-[#80182A] tracking-wider uppercase">
                      Signature Handcrafted
                    </span>
                    <span className="block text-sm font-bold text-[#2C1810]">
                      मखमली जरदोजी ब्राइडल कटवर्क
                    </span>
                  </div>
                  <button
                    onClick={onStartOrder}
                    className="px-3 py-1.5 bg-[#80182A] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs"
                  >
                    सिलवाएं
                  </button>
                </div>
              </div>

              {/* Decorative Gold Accent Badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                100% फिटिंग सपोर्ट
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
