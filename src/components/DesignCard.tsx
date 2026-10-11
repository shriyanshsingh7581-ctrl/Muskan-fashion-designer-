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
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#E8DFC8] hover:border-[#D4AF37] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* Product Image Slot (65-75% visual dominance) */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#FAF6EE] cursor-pointer" onClick={() => onViewDetails(design)}>
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF5EC] to-[#EEDBCA] p-6 text-center text-[#6B1124]">
            <Sparkles className="w-8 h-8 mb-2 text-[#D4AF37]" />
            <span className="font-serif font-bold text-sm">{design.code}</span>
            <span className="text-xs text-[#80182A] mt-1">{designName}</span>
          </div>
        )}

        {/* Floating Quick Action Overlay on Desktop */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 p-4">
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
          <div className="absolute top-3 left-3 bg-[#9B111E] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wider">
            नवरात्रि 2026
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        
        <div>
          {/* Metadata Row: Zero Pill unboxed text with subtle typographic separators */}
          <div className="flex items-center gap-1.5 text-xs text-[#80182A] font-semibold mb-1 tracking-wide">
            <span>{design.code}</span>
            <span aria-hidden="true" className="text-[#C8B896]">·</span>
            <span className="text-[#6B5A50] font-normal">{sleeveType}</span>
            <span aria-hidden="true" className="text-[#C8B896]">·</span>
            <span className="text-[#6B5A50] font-normal flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#B38F2B]" />
              {design.estimatedStitchingDays} दिन
            </span>
          </div>

          {/* Design Name */}
          <h3
            onClick={() => onViewDetails(design)}
            className="text-base font-serif font-bold text-[#2C1810] group-hover:text-[#80182A] transition-colors cursor-pointer line-clamp-1"
            title={designName}
          >
            {designName}
          </h3>

          {/* Neck Description */}
          <p className="text-xs text-[#705E54] mt-1 line-clamp-1">
            {neckType}
          </p>
        </div>

        {/* Pricing Baseline: Only when configured by admin */}
        <div className="pt-2 border-t border-[#F2ECE1] flex items-baseline justify-between">
          <span className="text-xs text-[#7A6B62]">{t.gallery.priceConfigured}:</span>
          <div>
            {design.price !== null && design.price !== undefined ? (
              <span className="text-lg font-bold font-mono text-[#80182A] tabular-nums">
                ₹{design.price.toLocaleString('en-IN')}
              </span>
            ) : (
              <span className="text-xs font-medium text-[#B38F2B] italic">
                {t.gallery.priceOnRequest}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* View Details */}
          <button
            onClick={() => onViewDetails(design)}
            className="py-2.5 px-3 text-xs font-semibold text-[#6B1124] bg-[#FAF5EB] hover:bg-[#F2E8D5] border border-[#DFC99D] rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 text-[#B38F2B]" />
            <span>{t.gallery.viewDetails}</span>
          </button>

          {/* Order This Design */}
          <button
            onClick={() => onOrderThis(design)}
            className="py-2.5 px-3 text-xs font-semibold text-white bg-gradient-to-r from-[#80182A] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1 border border-[#A62B3F]"
          >
            <Scissors className="w-3.5 h-3.5 text-[#F3E5AB]" />
            <span>{t.gallery.orderThis}</span>
          </button>
        </div>

        {/* Secondary WhatsApp Button */}
        <a
          href={generateWhatsAppDesignInquiryUrl(design)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-[11px] font-medium text-[#166534] hover:text-[#14532D] hover:underline flex items-center justify-center gap-1 pt-0.5"
        >
          <MessageCircle className="w-3 h-3 text-[#16A34A]" />
          <span>WhatsApp पर इस डिज़ाइन की जानकारी लें</span>
        </a>

      </div>

    </div>
  );
};
