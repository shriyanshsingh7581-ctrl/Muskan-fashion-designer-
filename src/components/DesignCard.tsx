import React, { useState } from 'react';
import { BlouseDesign, Language } from '../types';
import { translations } from '../data/translations';
import { generateWhatsAppDesignInquiryUrl } from '../utils/whatsapp';
import { Eye, Scissors, MessageCircle, Clock, Sparkles } from 'lucide-react';

interface DesignCardProps {
  design: BlouseDesign;
  language: Language;
  onViewDetails: (design: BlouseDesign) => void;
  onOrderThis: (design: BlouseDesign) => void;
}

export const DesignCard: React.FC<DesignCardProps> = ({
  design,
  language,
  onViewDetails,
  onOrderThis,
}) => {
  const [imageError, setImageError] = useState(false);
  const t = translations[language];

  const designName = language === 'hi' ? design.nameHi : design.nameEn;
  const neckType = language === 'hi' ? design.neckTypeHi : design.neckTypeEn;
  const sleeveType = language === 'hi' ? design.sleeveTypeHi : design.sleeveTypeEn;

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#E8DFC8] hover:border-[#D4AF37] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* Product Image Slot (65-75% visual dominance) */}
      <div className="relative aspect-square sm:aspect-4/3 overflow-hidden bg-[#FAF6EE] cursor-pointer" onClick={() => onViewDetails(design)}>
        {!imageError ? (
          <img
            src={design.image}
            alt={designName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Styled Fallback Container (Zero-Broken-Image Policy) */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF5EC] to-[#EEDBCA] p-3 sm:p-6 text-center text-[#6B1124]">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-[#D4AF37]" />
            <span className="font-serif font-bold text-xs sm:text-sm">{design.code}</span>
            <span className="text-[10px] sm:text-xs text-[#80182A] mt-0.5 line-clamp-1">{designName}</span>
          </div>
        )}

        {/* Floating Quick Action Overlay on Desktop */}
        <div className="hidden sm:flex absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center justify-center gap-3 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(design);
            }}
            className="px-3.5 py-2 bg-white text-[#4A0A19] font-medium text-xs rounded-full shadow-md hover:bg-[#FDFBF7] transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-[#B38F2B]" />
            <span>{t.gallery.viewDetails}</span>
          </button>
        </div>

        {/* Top Kicker Label (Single Text, No Pill Enclosure) */}
        {design.isNavratriSpecial && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#9B111E] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-xs shadow-xs uppercase tracking-wider">
            नवरात्रि 2026
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-2.5 sm:p-5 flex flex-col flex-1 justify-between gap-2.5 sm:gap-4">
        
        <div>
          {/* Metadata Row: Zero Pill unboxed text with subtle typographic separators */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#80182A] font-semibold mb-1 tracking-wide truncate">
            <span>{design.code}</span>
            <span aria-hidden="true" className="text-[#C8B896]">·</span>
            <span className="text-[#6B5A50] font-normal truncate">{sleeveType}</span>
            <span aria-hidden="true" className="text-[#C8B896]">·</span>
            <span className="text-[#6B5A50] font-normal shrink-0">
              {design.estimatedStitchingDays}d
            </span>
          </div>

          {/* Design Name */}
          <h3
            onClick={() => onViewDetails(design)}
            className="text-xs sm:text-base font-serif font-bold text-[#2C1810] group-hover:text-[#80182A] transition-colors cursor-pointer line-clamp-1"
            title={designName}
          >
            {designName}
          </h3>

          {/* Neck Description */}
          <p className="text-[10px] sm:text-xs text-[#705E54] mt-0.5 line-clamp-1">
            {neckType}
          </p>
        </div>

        {/* Pricing Baseline: Only when configured by admin */}
        <div className="pt-1.5 sm:pt-2 border-t border-[#F2ECE1] flex items-baseline justify-between">
          <span className="text-[10px] sm:text-xs text-[#7A6B62]">{t.gallery.priceConfigured}:</span>
          <div>
            {design.price !== null && design.price !== undefined ? (
              <span className="text-sm sm:text-lg font-bold font-mono text-[#80182A] tabular-nums">
                ₹{design.price.toLocaleString('en-IN')}
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-medium text-[#B38F2B] italic">
                {t.gallery.priceOnRequest}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
          {/* View Details */}
          <button
            onClick={() => onViewDetails(design)}
            className="py-1.5 sm:py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-semibold text-[#6B1124] bg-[#FAF5EB] hover:bg-[#F2E8D5] border border-[#DFC99D] rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1 active:scale-95"
          >
            <Eye className="w-3 h-3 text-[#B38F2B] shrink-0" />
            <span className="truncate">{t.gallery.viewDetails}</span>
          </button>

          {/* Order This Design */}
          <button
            onClick={() => onOrderThis(design)}
            className="py-1.5 sm:py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-semibold text-white bg-gradient-to-r from-[#80182A] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-lg sm:rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1 border border-[#A62B3F] active:scale-95"
          >
            <Scissors className="w-3 h-3 text-[#F3E5AB] shrink-0" />
            <span className="truncate">{t.gallery.orderThis}</span>
          </button>
        </div>

        {/* Secondary WhatsApp Button */}
        <a
          href={generateWhatsAppDesignInquiryUrl(design)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-[10px] sm:text-[11px] font-medium text-[#166534] hover:text-[#14532D] hover:underline flex items-center justify-center gap-1 pt-0.5 truncate"
        >
          <MessageCircle className="w-3 h-3 text-[#16A34A] shrink-0" />
          <span className="truncate">WhatsApp पूछताछ</span>
        </a>

      </div>

    </div>
  );
};
