import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { BUSINESS_PHONE } from '../data/initialData';
import { X, ShieldCheck, Truck, RefreshCw, FileText } from 'lucide-react';

interface PoliciesModalProps {
  initialTab?: 'shipping' | 'returns' | 'privacy' | 'terms';
  language: Language;
  onClose: () => void;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  initialTab = 'shipping',
  language,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'shipping' | 'returns' | 'privacy' | 'terms'>(
    initialTab
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#FDFBF7] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#D4AF37]/50 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#6B1124] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#D4AF37]/40 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#ECC86B]" />
            <h3 className="font-serif font-bold text-base sm:text-lg">
              मुस्कान फैशन डिज़ाइनर – नीतियां (Policies & Terms)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-[#FAF3E8] p-2 border-b border-[#EADBBE] overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'shipping'
                ? 'bg-[#80182A] text-white shadow-xs'
                : 'text-[#5A4A42] hover:bg-[#EADBBE]'
            }`}
          >
            📦 शिपिंग व होम डिलीवरी नीति
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'returns'
                ? 'bg-[#80182A] text-white shadow-xs'
                : 'text-[#5A4A42] hover:bg-[#EADBBE]'
            }`}
          >
            ✂️ रिटर्न व ऑल्ट्रेशन गारंटी
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'privacy'
                ? 'bg-[#80182A] text-white shadow-xs'
                : 'text-[#5A4A42] hover:bg-[#EADBBE]'
            }`}
          >
            🔒 गोपनीयता नीति (Privacy)
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'terms'
                ? 'bg-[#80182A] text-white shadow-xs'
                : 'text-[#5A4A42] hover:bg-[#EADBBE]'
            }`}
          >
            📜 नियम व शर्तें (Terms)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#5C4D44] leading-relaxed">
          
          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base text-[#4A0A19]">
                होम डिलीवरी एवं शिपिंग नीति (Home Delivery Policy)
              </h4>
              <p>
                1. <strong>डिलीवरी उपलब्धता:</strong> मुस्कान फैशन डिज़ाइनर द्वारा होम डिलीवरी की सुविधा आपके पिन कोड और सेवा क्षेत्र की उपलब्धता के अनुसार प्रदान की जाती है।
              </p>
              <p>
                2. <strong>डिलीवरी शुल्क:</strong> किसी भी ऑर्डर पर डिलीवरी शुल्क या कूरियर चार्ज आपके स्थान के अनुसार बुटीक द्वारा ऑर्डर कन्फर्मेशन के समय स्पष्ट बताया जाएगा।
              </p>
              <p>
                3. <strong>अनुमानित समय:</strong> सामान्य ब्लाउज़ स्टिचिंग में 4 से 7 कार्यदिवस लगते हैं, जिसके बाद स्थानीय डिलीवरी 1-2 दिन या कूरियर द्वारा 3-5 दिन में पहुंचाई जाती है।
              </p>
              <p>
                4. <strong>कपड़ा प्रेषण (Sending Fabric):</strong> यदि आप अपनी साड़ी का ब्लाउज़ पीस हमें कूरियर करते हैं, तो ट्रैकिंग नंबर हमारे WhatsApp ({BUSINESS_PHONE}) पर साझा करें।
              </p>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base text-[#4A0A19]">
                रिटर्न, फिटिंग व ऑल्ट्रेशन गारंटी (Alteration & Fit Guarantee)
              </h4>
              <p>
                1. <strong>2-इंच अतिरिक्त मार्जिन:</strong> हमारे द्वारा सिले गए प्रत्येक ब्लाउज़ में दोनों तरफ 2 इंच का अतिरिक्त मार्जिन दिया जाता है ताकि ग्राहक अपनी सुविधा अनुसार कभी भी ढीला या टाइट कर सकें।
              </p>
              <p>
                2. <strong>मुफ्त ऑल्ट्रेशन:</strong> यदि हमारे नाप के अनुसार सिलाई में कोई त्रुटि पाई जाती है, तो डिलीवरी के 7 दिनों के भीतर निःशुल्क ऑल्ट्रेशन (Free Alteration) किया जाएगा।
              </p>
              <p>
                3. <strong>कस्टम सिलाई पर रिटर्न:</strong> चूँकि प्रत्येक ब्लाउज़ विशेष रूप से आपके शरीर के नाप या चुनी गई पसंद के अनुसार काटा और सिला जाता है, इसलिए एक बार सिला हुआ ब्लाउज़ वापस नहीं लिया जाता, बल्कि परफेक्ट फिटिंग तक ऑल्टर किया जाता है।
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base text-[#4A0A19]">
                गोपनीयता नीति (Privacy Policy)
              </h4>
              <p>
                1. <strong>डेटा सुरक्षा:</strong> आपका नाम, मोबाइल नंबर, व्हाट्सएप नंबर, डिलीवरी का पता और शरीर के नाप पूरी तरह गोपनीय रखे जाते हैं।
              </p>
              <p>
                2. <strong>उपयोग का उद्देश्य:</strong> आपकी जानकारी का उपयोग केवल आपके ब्लाउज़ की स्टिचिंग, डिलीवरी और व्हाट्सएप पर ऑर्डर अपडेट देने के लिए किया जाता है।
              </p>
              <p>
                3. हम किसी भी तीसरे पक्ष (Third party) को आपका डेटा साझा या विक्रय नहीं करते हैं।
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base text-[#4A0A19]">
                नियम व शर्तें (Terms & Conditions)
              </h4>
              <p>
                1. ऑर्डर दर्ज होने के बाद बुटीक द्वारा फोन या WhatsApp पर ऑर्डर की पुष्टि की जाती है।
              </p>
              <p>
                2. नवरात्रि व शादी के व्यस्त सीज़न में काम की अधिकता के कारण स्टिचिंग समय में 1-2 दिन का अंतर हो सकता है, जिसकी सूचना आपको पहले ही दी जाएगी।
              </p>
              <p>
                3. किसी भी विवाद या विशेष सहायता के लिए हमारे आधिकारिक हेल्पलाइन नंबर {BUSINESS_PHONE} पर संपर्क करें।
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#FAF3E8] p-3 border-t border-[#EADBBE] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#80182A] text-white text-xs font-semibold rounded-lg hover:bg-[#9B111E]"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
