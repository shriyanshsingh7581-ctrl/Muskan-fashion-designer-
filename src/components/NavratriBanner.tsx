import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

interface NavratriBannerProps {
  language: Language;
  onExploreNavratri: () => void;
}

export const NavratriBanner: React.FC<NavratriBannerProps> = ({
  language,
  onExploreNavratri,
}) => {
  const t = translations[language];

  return (
    <section className="bg-gradient-to-r from-[#6B1124] via-[#80182A] to-[#4A0A19] text-white py-6 px-4 sm:px-6 lg:px-8 border-y-2 border-[#D4AF37]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Thumbnail & Copy */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-[#ECC86B] shadow-md">
            <img
              src="/src/assets/images/festive_navratri_blouse_1791701481521.jpg"
              alt="Navratri 2026 Special Blouse"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-1 left-1 bg-[#D4AF37] text-[#4A0A19] text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
              2026
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F3E5AB]">
              <Sparkles className="w-3.5 h-3.5 text-[#ECC86B]" />
              <span>{t.navratri.badge}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[11px] text-[#FDFBF7]/80">
                <Calendar className="w-3 h-3" /> गरबा स्पेशल
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#FFF5E1]">
              {t.navratri.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#F7E7CE] max-w-2xl leading-relaxed">
              {t.navratri.desc}
            </p>
          </div>
        </div>

        {/* Right: CTA button */}
        <div className="shrink-0">
          <button
            onClick={onExploreNavratri}
            className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] hover:from-[#E6CA65] hover:to-[#D4AF37] text-[#3D0A14] font-bold text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>{t.navratri.cta}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
