import React from 'react';
import { Language } from '../types';
import { Home, Sparkles, Scissors, Search, ShieldCheck } from 'lucide-react';

interface MobileBottomNavProps {
  language: Language;
  activeSection?: string;
  onNavigate: (sectionId: string) => void;
  onOpenOrder: () => void;
  onOpenAdmin: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  language,
  activeSection = 'home',
  onNavigate,
  onOpenOrder,
  onOpenAdmin,
}) => {
  const isHi = language === 'hi';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#E8DFC8] shadow-[0_-4px_25px_rgba(107,17,36,0.08)] px-2 py-1.5"
      style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1">
        
        {/* 1. Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeSection === 'home'
              ? 'text-[#80182A] font-bold'
              : 'text-[#6B5A50] hover:text-[#80182A]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight tracking-tight">
            {isHi ? 'होम' : 'Home'}
          </span>
        </button>

        {/* 2. Catalog / Designs */}
        <button
          onClick={() => onNavigate('gallery')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeSection === 'gallery'
              ? 'text-[#80182A] font-bold'
              : 'text-[#6B5A50] hover:text-[#80182A]'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-[#B38F2B]" />
          <span className="text-[10px] leading-tight tracking-tight">
            {isHi ? 'डिज़ाइन' : 'Designs'}
          </span>
        </button>

        {/* 3. Center CTA: Custom Order */}
        <button
          onClick={onOpenOrder}
          className="flex flex-col items-center justify-center -mt-4 group active:scale-95 transition-transform"
          title={isHi ? 'नया ऑर्डर दें' : 'Start Order'}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#80182A] via-[#9B111E] to-[#6B1124] text-white shadow-lg flex items-center justify-center border-2 border-[#FDFBF7] ring-2 ring-[#B38F2B]/40 group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5 text-[#F3E5AB]" />
          </div>
          <span className="text-[10px] font-bold text-[#80182A] mt-0.5 leading-tight tracking-tight">
            {isHi ? 'ऑर्डर करें' : 'Order'}
          </span>
        </button>

        {/* 4. Track Order */}
        <button
          onClick={() => onNavigate('track-order')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeSection === 'track-order'
              ? 'text-[#80182A] font-bold'
              : 'text-[#6B5A50] hover:text-[#80182A]'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight tracking-tight">
            {isHi ? 'ट्रैकिंग' : 'Track'}
          </span>
        </button>

        {/* 5. Admin Portal */}
        <button
          onClick={onOpenAdmin}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 text-[#6B5A50] hover:text-[#80182A]"
        >
          <ShieldCheck className="w-5 h-5 mb-0.5 text-[#B38F2B]" />
          <span className="text-[10px] leading-tight tracking-tight">
            {isHi ? 'एडमिन' : 'Admin'}
          </span>
        </button>

      </div>
    </nav>
  );
};
