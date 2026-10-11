import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { STANDARD_SIZES } from '../data/initialData';
import { X, HelpCircle, CheckCircle, Ruler } from 'lucide-react';

interface MeasurementGuideModalProps {
  language: Language;
  onClose: () => void;
}

export const MeasurementGuideModal: React.FC<MeasurementGuideModalProps> = ({
  language,
  onClose,
}) => {
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#FDFBF7] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#D4AF37]/50 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#6B1124] text-white p-5 flex items-center justify-between border-b border-[#D4AF37]/40">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#ECC86B]" />
            <h3 className="font-serif font-bold text-base sm:text-lg">
              {t.measurementGuidePage.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-[#5C4D44]">
          
          {/* Key Tips */}
          <div className="bg-[#FAF5EB] p-4 rounded-2xl border border-[#DFC99D] space-y-2">
            <h4 className="font-bold text-[#4A0A19] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#B38F2B]" />
              <span>{t.measurementGuidePage.tipHeadline}</span>
            </h4>
            <ul className="space-y-1 text-xs text-[#5C4D44]">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{t.measurementGuidePage.tip1}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{t.measurementGuidePage.tip2}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{t.measurementGuidePage.tip3}</span>
              </li>
            </ul>
          </div>

          {/* 7 Required Measurements Guide */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#4A0A19] mb-3">
              7 प्रमुख नाप एवं विधि (Inches):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {t.measurementGuidePage.diagrams.map((d, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-xl border border-[#E8DFC8] space-y-1"
                >
                  <span className="font-bold text-xs text-[#80182A]">{d.name}</span>
                  <p className="text-[11px] text-[#705E54] leading-relaxed">{d.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Sizing Table */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#4A0A19] mb-3">
              स्टैंडर्ड साइज़ चार्ट (Standard Size Reference):
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-white rounded-xl border border-[#E8DFC8] overflow-hidden">
                <thead className="bg-[#FAF1E3] text-[#4A0A19] font-bold">
                  <tr>
                    <th className="p-2 border-b border-[#E8DFC8]">साइज़ (Size)</th>
                    <th className="p-2 border-b border-[#E8DFC8]">छाती (Bust)</th>
                    <th className="p-2 border-b border-[#E8DFC8]">अंडरबस्ट</th>
                    <th className="p-2 border-b border-[#E8DFC8]">कमर (Waist)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE1]">
                  {STANDARD_SIZES.map((row) => (
                    <tr key={row.size} className="hover:bg-[#FAF6EE]">
                      <td className="p-2 font-bold text-[#80182A]">{row.size}" ({row.noteEn})</td>
                      <td className="p-2 font-mono tabular-nums">{row.bust}</td>
                      <td className="p-2 font-mono tabular-nums">{row.underbust}</td>
                      <td className="p-2 font-mono tabular-nums">{row.waist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#FAF3E8] p-4 border-t border-[#EADBBE] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#80182A] text-white text-xs font-semibold rounded-xl hover:bg-[#9B111E]"
          >
            समझ गए (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
