import React from 'react';
import { BlouseDesign, Language } from '../types';
import { translations } from '../data/translations';
import { generateWhatsAppDesignInquiryUrl } from '../utils/whatsapp';
import { X, Scissors, MessageCircle, Clock, Sparkles } from 'lucide-react';

interface DesignDetailModalProps {
  design: BlouseDesign | null;
  language: Language;
  onClose: () => void;
  onOrderThis: (design: BlouseDesign) => void;
}

export const DesignDetailModal: React.FC<DesignDetailModalProps> = ({
  design,
  language,
  onClose,
  onOrderThis,
}) => {
  if (!design) return null;

  const t = translations[language];
  const designName = language === 'hi' ? design.nameHi : design.nameEn;
  const description = language === 'hi' ? design.descriptionHi : design.descriptionEn;
  const neckType = language === 'hi' ? design.neckTypeHi : design.neckTypeEn;
  const sleeveType = language === 'hi' ? design.sleeveTypeHi : design.sleeveTypeEn;
  const fabric = language === 'hi' ? design.fabricRecommendationHi : design.fabricRecommendationEn;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div className="relative bg-[#FDFBF7] rounded-t-3xl sm:rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border-t sm:border border-[#D4AF37]/50 max-h-[92vh] sm:max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Mobile Pull Indicator */}
        <div className="w-10 h-1 bg-black/20 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-white/80 hover:bg-white text-[#4A0A19] rounded-full shadow-md transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Left Column: Image */}
        <div className="md:w-1/2 relative bg-[#F5EFE3] shrink-0">
          <img
            src={design.image}
            alt={designName}
            className="w-full h-56 sm:h-72 md:h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {design.isNavratriSpecial && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#9B111E] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-sm shadow-xs uppercase tracking-wider">
              नवरात्रि 2026 स्पेशल
            </div>
          )}
        </div>

        {/* Right Column: Details & Order CTA */}
        <div className="md:w-1/2 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-4 sm:space-y-6">
          
          <div>
            {/* Design Code & Meta */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#80182A] tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{design.code}</span>
              <span className="text-[#C8B896]">·</span>
              <span className="flex items-center gap-1 text-[#6B5A50] font-normal">
                <Clock className="w-3 h-3 text-[#B38F2B]" />
                {design.estimatedStitchingDays} दिन स्टिचिंग समय
              </span>
            </div>

            {/* Design Name */}
            <h2 className="text-lg sm:text-2xl font-serif font-bold text-[#4A0A19] leading-tight">
              {designName}
            </h2>

            {/* Price Row */}
            <div className="mt-2.5 sm:mt-3 py-2 px-3 bg-[#FAF3E8] rounded-xl border border-[#EADBBE] flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B5A50]">
                {t.gallery.priceConfigured}:
              </span>
              <div>
                {design.price ? (
                  <span className="text-lg sm:text-xl font-bold font-mono text-[#80182A] tabular-nums">
                    ₹{design.price.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-[#B38F2B] italic">
                    {t.gallery.priceOnRequest}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="mt-3 text-xs sm:text-sm text-[#5C4D44] leading-relaxed">
              {description}
            </p>

            {/* Specifications List */}
            <div className="mt-3.5 space-y-1.5 text-xs sm:text-sm border-t border-[#EEDBCA] pt-3">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-[#4A0A19] min-w-20 sm:min-w-24">गला (Neck):</span>
                <span className="text-[#5C4D44]">{neckType}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-[#4A0A19] min-w-20 sm:min-w-24">आस्तीन:</span>
                <span className="text-[#5C4D44]">{sleeveType}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-[#4A0A19] min-w-20 sm:min-w-24">कपड़ा:</span>
                <span className="text-[#5C4D44]">{fabric}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-3 border-t border-[#EEDBCA] shrink-0">
            <button
              onClick={() => {
                onClose();
                onOrderThis(design);
              }}
              className="w-full py-3 sm:py-3.5 px-4 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#80182A] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-[#B3273D] active:scale-95"
            >
              <Scissors className="w-4 h-4 text-[#F3E5AB]" />
              <span>{t.gallery.orderThis}</span>
            </button>

            <a
              href={generateWhatsAppDesignInquiryUrl(design)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 text-xs font-semibold text-[#14532D] bg-[#E8F5E9] hover:bg-[#D4EDDA] border border-[#A3D9A5] rounded-xl transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>WhatsApp पर पूछताछ करें</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};
