import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { BUSINESS_PHONE } from '../data/initialData';
import { generateWhatsAppGeneralUrl } from '../utils/whatsapp';
import { Phone, MessageCircle, Menu, X, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onStartOrder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  onNavigate,
  onOpenAdmin,
  onStartOrder,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language];

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8DFC8]">
      {/* Top 3-Zone Contract Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-18 flex items-center justify-between gap-2 sm:gap-8">
        
        {/* Zone 1: Single Wordmark Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('home')}
            className="text-left group focus:outline-none"
          >
            <span className="block font-serif text-sm sm:text-lg lg:text-xl font-bold tracking-wider text-[#6B1124] group-hover:text-[#9B111E] transition-colors whitespace-nowrap">
              MUSKAAN FASHION
            </span>
            <span className="block text-[9px] sm:text-[10px] tracking-widest text-[#B38F2B] font-medium uppercase whitespace-nowrap">
              {t.brandSubtitle}
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#5A4A42]">
          <button
            onClick={() => handleNavClick('gallery')}
            className="hover:text-[#9B111E] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.designs}
          </button>
          <button
            onClick={() => handleNavClick('how-to-order')}
            className="hover:text-[#9B111E] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.howToOrder}
          </button>
          <button
            onClick={() => handleNavClick('measurement-guide')}
            className="hover:text-[#9B111E] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.measurementGuide}
          </button>
          <button
            onClick={() => handleNavClick('home-delivery')}
            className="hover:text-[#9B111E] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.delivery}
          </button>
          <button
            onClick={() => handleNavClick('track-order')}
            className="hover:text-[#9B111E] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 font-semibold text-[#80182A]"
          >
            {t.nav.trackOrder}
          </button>
        </nav>

        {/* Zone 3: Primary Action + Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#F3EDE0] p-0.5 sm:p-1 rounded-full border border-[#D9CEB5]">
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                language === 'hi'
                  ? 'bg-[#6B1124] text-white shadow-xs'
                  : 'text-[#6B1124] hover:text-[#9B111E]'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                language === 'en'
                  ? 'bg-[#6B1124] text-white shadow-xs'
                  : 'text-[#6B1124] hover:text-[#9B111E]'
              }`}
            >
              EN
            </button>
          </div>

          {/* Quick Call on mobile */}
          <a
            href={`tel:${BUSINESS_PHONE.replace(/\s+/g, '')}`}
            className="lg:hidden p-2 text-[#80182A] bg-[#FAF1E3] hover:bg-[#F2E8D5] border border-[#DFC99D] rounded-full transition-colors"
            title="कॉल करें"
          >
            <Phone className="w-3.5 h-3.5 text-[#B38F2B]" />
          </a>

          {/* WhatsApp Direct Inquiry */}
          <a
            href={generateWhatsAppGeneralUrl()}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1B663E] bg-[#E8F5E9] hover:bg-[#D4EDDA] border border-[#C3E6CB] rounded-full transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{BUSINESS_PHONE}</span>
          </a>

          {/* Boutique Admin / Backend Portal */}
          <button
            onClick={onOpenAdmin}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#80182A] bg-[#FAF1E3] hover:bg-[#F2E8D5] border border-[#DFC99D] rounded-full transition-colors whitespace-nowrap"
            title="बुटीक एडमिन व ऑर्डर मैनेजमेंट पोर्टल"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#B38F2B]" />
            <span>एडमिन पोर्टल</span>
          </button>

          {/* Primary CTA */}
          <button
            onClick={onStartOrder}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#80182A] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-full shadow-xs hover:shadow-sm transition-all whitespace-nowrap shrink-0 border border-[#A62B3F] active:scale-95"
          >
            {t.nav.orderNow}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#6B1124] hover:bg-[#F3EDE0] rounded-lg transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FDFBF7] border-b border-[#E8DFC8] px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm font-medium text-[#5A4A42]">
            <button
              onClick={() => handleNavClick('gallery')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#F5EFE3] hover:text-[#9B111E]"
            >
              {t.nav.designs}
            </button>
            <button
              onClick={() => handleNavClick('how-to-order')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#F5EFE3] hover:text-[#9B111E]"
            >
              {t.nav.howToOrder}
            </button>
            <button
              onClick={() => handleNavClick('measurement-guide')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#F5EFE3] hover:text-[#9B111E]"
            >
              {t.nav.measurementGuide}
            </button>
            <button
              onClick={() => handleNavClick('home-delivery')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#F5EFE3] hover:text-[#9B111E]"
            >
              {t.nav.delivery}
            </button>
            <button
              onClick={() => handleNavClick('track-order')}
              className="col-span-2 text-left py-2.5 px-3 rounded-lg bg-[#FAF3E8] font-semibold text-[#80182A] border border-[#EADBBE]"
            >
              🔍 {t.nav.trackOrder}
            </button>
          </div>

          <div className="pt-2 border-t border-[#E8DFC8] flex items-center justify-between">
            <a
              href={`tel:${BUSINESS_PHONE.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A4A42]"
            >
              <Phone className="w-3.5 h-3.5 text-[#B38F2B]" />
              <span>{BUSINESS_PHONE}</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="inline-flex items-center gap-1 text-xs text-[#80182A] hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.nav.admin}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
