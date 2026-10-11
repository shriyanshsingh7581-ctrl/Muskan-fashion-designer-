import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { BUSINESS_PHONE } from '../data/initialData';
import { generateWhatsAppGeneralUrl } from '../utils/whatsapp';
import { Phone, MessageCircle, Clock, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  language: Language;
  onNavigate: (sectionId: string) => void;
  onOpenPolicies: (tab: 'shipping' | 'returns' | 'privacy' | 'terms') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onNavigate,
  onOpenPolicies,
  onOpenAdmin,
}) => {
  const t = translations[language];

  return (
    <footer className="bg-[#3D0A14] text-[#F5EFE3] pt-14 pb-8 border-t-4 border-[#D4AF37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-[#5E1222]">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="block font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#ECC86B]">
                {t.footer.brand}
              </span>
              <p className="text-sm font-medium text-[#F7E7CE] mt-1 italic">
                “{t.footer.catchphrase}”
              </p>
            </div>

            <p className="text-xs text-[#E8DFC8]/80 leading-relaxed max-w-sm">
              भारतीय पारंपरिक और आधुनिक महिलाओं के लिए प्रीमियम ऑनलाइन ब्लाउज़ सिलाई सेवा। शादी, पार्टी और नवरात्रि उत्सव के लिए मनपसंद डिज़ाइन घर बैठे सिलवाएं।
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={generateWhatsAppGeneralUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-full shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {BUSINESS_PHONE}</span>
              </a>
              <a
                href={`tel:${BUSINESS_PHONE.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-[#F5EFE3] text-xs font-medium rounded-full transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#ECC86B]" />
                <span>{BUSINESS_PHONE}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-[#ECC86B] uppercase tracking-wider">
              नेविगेशन लिंक्स (Navigation)
            </h4>
            <ul className="space-y-2 text-xs text-[#E8DFC8]">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  {t.nav.home} (Home)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors"
                >
                  {t.nav.designs} (Blouse Designs)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-to-order')}
                  className="hover:text-white transition-colors"
                >
                  {t.nav.howToOrder} (How to Order)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('measurement-guide')}
                  className="hover:text-white transition-colors"
                >
                  {t.nav.measurementGuide} (Measurement Guide)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track-order')}
                  className="hover:text-white transition-colors font-semibold text-[#ECC86B]"
                >
                  {t.nav.trackOrder} (Track Order)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home-delivery')}
                  className="hover:text-white transition-colors"
                >
                  {t.nav.delivery} (Home Delivery)
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Help */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold text-[#ECC86B] uppercase tracking-wider">
              नीतियां व संपर्क (Policies & Support)
            </h4>
            <ul className="space-y-2 text-xs text-[#E8DFC8]">
              <li>
                <button
                  onClick={() => onOpenPolicies('shipping')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t.footer.shipping}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicies('returns')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t.footer.returns}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicies('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t.footer.privacy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicies('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t.footer.terms}
                </button>
              </li>
            </ul>

            <div className="pt-2 text-xs text-[#E8DFC8]/70 space-y-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#ECC86B]" />
                <span>{t.footer.hours}</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>100% भारतीय महिलाओं द्वारा विश्वसनीय बुटीक</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Admin link */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8DFC8]/60">
          <div>
            © {new Date().getFullYear()} MUSKAAN FASHION DESIGNER. {t.footer.rights}
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[11px]">
              विशिष्ट हस्तकला <Heart className="w-3 h-3 text-[#E11D48] fill-current" /> भारतीय परंपरा
            </span>
            <span>·</span>
            <button
              onClick={onOpenAdmin}
              className="text-xs text-[#ECC86B] hover:underline hover:text-white transition-colors"
            >
              बुटीक एडमिन पोर्टल
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
