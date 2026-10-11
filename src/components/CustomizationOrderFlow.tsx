import React, { useState } from 'react';
import { BlouseDesign, Language, Order, CustomMeasurements } from '../types';
import {
  FABRIC_OPTIONS,
  SLEEVE_STYLES,
  NECK_DESIGNS,
  COLOR_PRESETS,
  STANDARD_SIZES,
  BUSINESS_PHONE,
} from '../data/initialData';
import { translations } from '../data/translations';
import { api } from '../services/api';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
import { uploadToCloudinary } from '../utils/cloudinary';
import {
  Scissors,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  RotateCcw,
  PackageCheck,
  Sparkles,
  Cloud,
} from 'lucide-react';

interface CustomizationOrderFlowProps {
  designs: BlouseDesign[];
  initialDesign?: BlouseDesign | null;
  language: Language;
  onClose: () => void;
  onOpenMeasurementGuide: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CustomizationOrderFlow: React.FC<CustomizationOrderFlowProps> = ({
  designs,
  initialDesign,
  language,
  onClose,
  onOpenMeasurementGuide,
  onOrderCompleted,
}) => {
  const t = translations[language];

  // Flow State: 1 = Design, 2 = Customization & Size, 3 = Delivery, 4 = Review, 5 = Confirmation
  const [step, setStep] = useState<number>(initialDesign ? 2 : 1);
  const [selectedDesign, setSelectedDesign] = useState<BlouseDesign>(
    initialDesign || designs[0] || ({} as BlouseDesign)
  );

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const [blouseColor, setBlouseColor] = useState('शाही मैरून (Royal Maroon)');
  const [customColorName, setCustomColorName] = useState('');
  const [fabricPreference, setFabricPreference] = useState(FABRIC_OPTIONS[0].nameHi);
  const [sleeveStyle, setSleeveStyle] = useState(SLEEVE_STYLES[2].nameHi);
  const [neckDesign, setNeckDesign] = useState(NECK_DESIGNS[0].nameHi);
  const [quantity, setQuantity] = useState<number>(1);

  // Sizing
  const [sizeType, setSizeType] = useState<'standard' | 'custom'>('standard');
  const [standardSize, setStandardSize] = useState<string>('36');
  const [measurements, setMeasurements] = useState<CustomMeasurements>({
    bust: '',
    underbust: '',
    waist: '',
    shoulder: '',
    blouseLength: '',
    sleeveLength: '',
    armhole: '',
  });

  // Delivery
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [referenceImageBase64, setReferenceImageBase64] = useState<string>('');
  const [referenceFileName, setReferenceFileName] = useState<string>('');
  const [uploadedCloudinaryUrl, setUploadedCloudinaryUrl] = useState<string>('');
  const [isUploadingRefImage, setIsUploadingRefImage] = useState(false);

  // UI / Submission state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Handle Image Upload with Cloudinary Support
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        referenceImage: 'फ़ाइल का साइज़ 10MB से कम होना चाहिए (Max 10MB)',
      }));
      return;
    }

    setReferenceFileName(file.name);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.referenceImage;
      return copy;
    });

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary in background
    setIsUploadingRefImage(true);
    try {
      const res = await uploadToCloudinary(file);
      setUploadedCloudinaryUrl(res.secure_url);
    } catch (err) {
      console.warn('Cloudinary ref image upload fallback to local base64:', err);
    } finally {
      setIsUploadingRefImage(false);
    }
  };

  // Validation functions
  const validateStep2 = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!blouseColor && !customColorName) {
      errs.blouseColor = 'कृपया ब्लाउज़ का रंग चुनें (Select color)';
    }

    if (sizeType === 'custom') {
      if (!measurements.bust) {
        errs.bust = 'छाती का नाप आवश्यक है (Bust is required)';
      }
      if (!measurements.waist) {
        errs.waist = 'कमर का नाप आवश्यक है (Waist is required)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errs.customerName = 'कृपया अपना नाम दर्ज करें (Enter your name)';
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      errs.mobileNumber = 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें';
    }

    if (!whatsappSame) {
      const cleanWa = whatsappNumber.replace(/\D/g, '');
      if (cleanWa.length < 10) {
        errs.whatsappNumber = 'कृपया वैध WhatsApp नंबर दर्ज करें';
      }
    }

    if (!deliveryAddress.trim()) {
      errs.deliveryAddress = 'कृपया डिलीवरी का पूरा पता लिखें';
    }

    if (!city.trim()) {
      errs.city = 'कृपया शहर / जिला लिखें';
    }

    const cleanPin = pinCode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      errs.pinCode = 'कृपया 6 अंकों का सही पिन कोड दर्ज करें (6-digit PIN)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Order Submission
  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const effectiveWhatsApp = whatsappSame ? mobileNumber : whatsappNumber;
    const finalColor = customColorName ? `${customColorName} (${blouseColor})` : blouseColor;

    const payload: Partial<Order> = {
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      whatsappNumber: effectiveWhatsApp.trim(),
      designId: selectedDesign.id,
      designCode: selectedDesign.code,
      designName: selectedDesign.nameHi,
      designImage: selectedDesign.image,
      blouseColor: finalColor,
      fabricPreference,
      sleeveStyle,
      neckDesign,
      quantity,
      sizeType,
      standardSize: sizeType === 'standard' ? standardSize : undefined,
      measurements: sizeType === 'custom' ? measurements : undefined,
      deliveryAddress: deliveryAddress.trim(),
      city: city.trim(),
      pinCode: pinCode.trim(),
      additionalInstructions: additionalInstructions.trim(),
      referenceImageUrl: uploadedCloudinaryUrl || referenceImageBase64 || undefined,
      pricePerItem: selectedDesign.price || null,
      totalAmount: selectedDesign.price ? selectedDesign.price * quantity : null,
    };

    try {
      const savedOrder = await api.createOrder(payload);
      setConfirmedOrder(savedOrder);
      setStep(5); // Confirmation Step
      onOrderCompleted(savedOrder);
    } catch (err: any) {
      console.error('Order submission failed:', err);
      setSubmitError(
        err.message || 'ऑर्डर सेव करने में समस्या हुई। कृपया दोबारा प्रयास करें।'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#FDFBF7] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#D4AF37]/40 flex flex-col max-h-[92vh]">
        
        {/* Header with Title and Step Progression */}
        <div className="bg-gradient-to-r from-[#6B1124] to-[#4A0A19] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#D4AF37]/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F3E5AB]">
              <Sparkles className="w-3.5 h-3.5 text-[#ECC86B]" />
              <span>MUSKAAN FASHION DESIGNER</span>
            </div>
            <h2 className="text-base sm:text-xl font-serif font-bold text-white mt-0.5">
              {step === 5 ? t.confirmation.successTitle : t.customization.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#FDFBF7] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator (Steps 1 to 4) */}
        {step < 5 && (
          <div className="bg-[#FAF3E8] border-b border-[#EADBBE] px-4 py-2.5 flex items-center justify-between text-xs font-medium text-[#5A4A42] overflow-x-auto">
            <span className={step === 1 ? 'font-bold text-[#80182A] underline' : ''}>
              {t.customization.step1}
            </span>
            <span className="text-[#C8B896]">→</span>
            <span className={step === 2 ? 'font-bold text-[#80182A] underline' : ''}>
              {t.customization.step2}
            </span>
            <span className="text-[#C8B896]">→</span>
            <span className={step === 3 ? 'font-bold text-[#80182A] underline' : ''}>
              {t.customization.step3}
            </span>
            <span className="text-[#C8B896]">→</span>
            <span className={step === 4 ? 'font-bold text-[#80182A] underline' : ''}>
              {t.customization.step4}
            </span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Select Blouse Design */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#4A0A19]">
                अपना पसंदीदा ब्लाउज़ डिज़ाइन चुनें:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {designs.map((d) => {
                  const isSelected = selectedDesign.id === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDesign(d)}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-2 flex flex-col ${
                        isSelected
                          ? 'border-[#80182A] bg-[#FAF1E3] shadow-md ring-2 ring-[#80182A]/20'
                          : 'border-[#E8DFC8] bg-white hover:border-[#D4AF37]'
                      }`}
                    >
                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-[#FAF6EE] mb-2">
                        <img
                          src={d.image}
                          alt={d.nameHi}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[#80182A]">{d.code}</span>
                      <span className="text-xs font-bold text-[#2C1810] line-clamp-1">{d.nameHi}</span>
                      {d.price && (
                        <span className="text-xs font-mono font-bold text-[#6B1124] mt-1">
                          ₹{d.price}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Customization & Sizing */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Selected Design Preview Badge */}
              <div className="flex items-center gap-3 p-3 bg-[#FAF5EB] rounded-2xl border border-[#DFC99D]">
                <img
                  src={selectedDesign.image}
                  alt={selectedDesign.nameHi}
                  className="w-16 h-16 rounded-xl object-cover border border-[#D4AF37]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-[#80182A]">{selectedDesign.code}</span>
                  <h4 className="text-sm font-bold text-[#2C1810] truncate">{selectedDesign.nameHi}</h4>
                  <p className="text-xs text-[#705E54]">
                    {selectedDesign.price ? `₹${selectedDesign.price} अनुमानित स्टिचिंग` : 'मूल्य संपर्क पर'}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="px-2.5 py-1 text-xs font-semibold text-[#80182A] bg-white border border-[#D4AF37] rounded-lg hover:bg-[#FDFBF7]"
                >
                  बदलें
                </button>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#4A0A19] uppercase tracking-wider mb-2">
                  {t.customization.blouseColor} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
                  {COLOR_PRESETS.map((color) => {
                    const isSelected = blouseColor.includes(color.nameHi);
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => {
                          setBlouseColor(`${color.nameHi} (${color.nameEn})`);
                          setCustomColorName('');
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs transition-all ${
                          isSelected
                            ? 'border-[#80182A] bg-[#FAF1E3] font-bold shadow-xs'
                            : 'border-[#E8DFC8] bg-white hover:bg-[#FDFBF7]'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="truncate">{color.nameHi}</span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder={t.customization.customColor}
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none"
                />
              </div>

              {/* Fabric Preference */}
              <div>
                <label className="block text-xs font-semibold text-[#4A0A19] uppercase tracking-wider mb-2">
                  {t.customization.fabricPreference} *
                </label>
                <select
                  value={fabricPreference}
                  onChange={(e) => setFabricPreference(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none text-[#2C1810]"
                >
                  {FABRIC_OPTIONS.map((fab) => (
                    <option key={fab.id} value={fab.nameHi}>
                      {fab.nameHi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sleeve Style & Neck Design Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A0A19] uppercase tracking-wider mb-2">
                    {t.customization.sleeveStyle} *
                  </label>
                  <select
                    value={sleeveStyle}
                    onChange={(e) => setSleeveStyle(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none"
                  >
                    {SLEEVE_STYLES.map((sl) => (
                      <option key={sl.id} value={sl.nameHi}>
                        {sl.nameHi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A0A19] uppercase tracking-wider mb-2">
                    {t.customization.neckDesign} *
                  </label>
                  <select
                    value={neckDesign}
                    onChange={(e) => setNeckDesign(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none"
                  >
                    {NECK_DESIGNS.map((nk) => (
                      <option key={nk.id} value={nk.nameHi}>
                        {nk.nameHi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-[#4A0A19] uppercase tracking-wider mb-1">
                  {t.customization.quantity}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center bg-white border border-[#D9CEB5] rounded-lg font-bold text-sm text-[#4A0A19] hover:bg-[#F5EFE3]"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-base text-[#2C1810] min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-9 h-9 flex items-center justify-center bg-white border border-[#D9CEB5] rounded-lg font-bold text-sm text-[#4A0A19] hover:bg-[#F5EFE3]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Sizing Choice: Standard vs Custom Measurements */}
              <div className="pt-4 border-t border-[#EEDBCA]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#4A0A19] uppercase tracking-wider">
                    {t.customization.sizeChoice} *
                  </span>
                  <button
                    type="button"
                    onClick={onOpenMeasurementGuide}
                    className="text-xs text-[#80182A] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{t.customization.openGuide}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setSizeType('standard')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      sizeType === 'standard'
                        ? 'border-[#80182A] bg-[#FAF1E3] font-bold shadow-xs'
                        : 'border-[#E8DFC8] bg-white'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold text-[#4A0A19]">
                      {t.customization.standardSize}
                    </div>
                    <div className="text-[11px] text-[#705E54] mt-0.5">
                      तैयार ब्लाउज़ साइज़ (32 से 46)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSizeType('custom')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      sizeType === 'custom'
                        ? 'border-[#80182A] bg-[#FAF1E3] font-bold shadow-xs'
                        : 'border-[#E8DFC8] bg-white'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold text-[#4A0A19]">
                      {t.customization.customMeasurements}
                    </div>
                    <div className="text-[11px] text-[#705E54] mt-0.5">
                      इंच टेप से सटीक नाप भरें
                    </div>
                  </button>
                </div>

                {/* Option A: Standard Size Selector */}
                {sizeType === 'standard' ? (
                  <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] space-y-3">
                    <label className="block text-xs font-semibold text-[#4A0A19]">
                      {t.customization.standardSizeSelect}:
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {STANDARD_SIZES.map((sz) => {
                        const isSelected = standardSize === sz.size;
                        return (
                          <button
                            key={sz.size}
                            type="button"
                            onClick={() => setStandardSize(sz.size)}
                            className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#80182A] text-white border-[#80182A] shadow-xs'
                                : 'bg-[#FAF6EE] text-[#4A0A19] border-[#E8DFC8] hover:bg-[#F2ECE1]'
                            }`}
                          >
                            <span className="block text-sm">{sz.size}"</span>
                            <span className="block text-[9px] font-normal opacity-80">{sz.noteEn}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-[#705E54] bg-[#FAF5EB] p-2 rounded-lg border border-[#EADBBE]">
                      💡 चुने गए साइज़ {standardSize}": छाती ~ {standardSize} इंच, कमर ~ {Number(standardSize) - 6} इंच (2-इंच अतिरिक्त मार्जिन शामिल)।
                    </div>
                  </div>
                ) : (
                  /* Option B: Custom Measurements */
                  <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] space-y-3">
                    <div className="text-xs font-medium text-[#705E54] mb-2">
                      {t.customization.measurementsNotice}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A0A19] mb-1">
                          {t.customization.bust} *
                        </label>
                        <input
                          type="text"
                          placeholder='उदा: 36"'
                          value={measurements.bust || ''}
                          onChange={(e) =>
                            setMeasurements({ ...measurements, bust: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#FDFBF7] border border-[#D9CEB5] rounded-lg focus:border-[#80182A] outline-none"
                        />
                        {errors.bust && (
                          <span className="text-[10px] text-red-600">{errors.bust}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A0A19] mb-1">
                          {t.customization.underbust}
                        </label>
                        <input
                          type="text"
                          placeholder='उदा: 31"'
                          value={measurements.underbust || ''}
                          onChange={(e) =>
                            setMeasurements({ ...measurements, underbust: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#FDFBF7] border border-[#D9CEB5] rounded-lg focus:border-[#80182A] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A0A19] mb-1">
                          {t.customization.waist} *
                        </label>
                        <input
                          type="text"
                          placeholder='उदा: 30"'
                          value={measurements.waist || ''}
                          onChange={(e) =>
                            setMeasurements({ ...measurements, waist: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#FDFBF7] border border-[#D9CEB5] rounded-lg focus:border-[#80182A] outline-none"
                        />
                        {errors.waist && (
                          <span className="text-[10px] text-red-600">{errors.waist}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A0A19] mb-1">
                          {t.customization.shoulder}
                        </label>
                        <input
                          type="text"
                          placeholder='उदा: 14"'
                          value={measurements.shoulder || ''}
                          onChange={(e) =>
                            setMeasurements({ ...measurements, shoulder: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#FDFBF7] border border-[#D9CEB5] rounded-lg focus:border-[#80182A] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A0A19] mb-1">
                          {t.customization.blouseLength}
                        </label>
                        <input
                          type="text"
                          placeholder='उदा: 14.5"'
                          value={measurements.blouseLength || ''}
                          onChange={(e) =>
                            setMeasurements({ ...measurements, blouseLength: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#FDFBF7] border border-[#D9CEB5] rounded-lg focus:border-[#80182A] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A0A19] mb-1">
                          {t.customization.sleeveLength}
                        </label>
                        <input
                          type="text"
                          placeholder='उदा: 10"'
                          value={measurements.sleeveLength || ''}
                          onChange={(e) =>
                            setMeasurements({ ...measurements, sleeveLength: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#FDFBF7] border border-[#D9CEB5] rounded-lg focus:border-[#80182A] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A0A19] mb-1">
                          {t.customization.armhole}
                        </label>
                        <input
                          type="text"
                          placeholder='उदा: 16"'
                          value={measurements.armhole || ''}
                          onChange={(e) =>
                            setMeasurements({ ...measurements, armhole: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#FDFBF7] border border-[#D9CEB5] rounded-lg focus:border-[#80182A] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 3: Customer and Delivery Info */}
          {step === 3 && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A0A19] mb-1">
                    {t.customization.customerName} *
                  </label>
                  <input
                    type="text"
                    placeholder="जैसे: अनिता शर्मा (Anita Sharma)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none"
                  />
                  {errors.customerName && (
                    <span className="text-[11px] text-red-600">{errors.customerName}</span>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A0A19] mb-1">
                    {t.customization.mobileNumber} *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none font-mono"
                  />
                  {errors.mobileNumber && (
                    <span className="text-[11px] text-red-600">{errors.mobileNumber}</span>
                  )}
                </div>
              </div>

              {/* WhatsApp Checkbox & Input */}
              <div className="p-3 bg-[#FAF5EB] rounded-xl border border-[#DFC99D] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#4A0A19]">
                  <input
                    type="checkbox"
                    checked={whatsappSame}
                    onChange={(e) => setWhatsappSame(e.target.checked)}
                    className="rounded text-[#80182A] focus:ring-[#80182A]"
                  />
                  <span>{t.customization.whatsappSame}</span>
                </label>

                {!whatsappSame && (
                  <div>
                    <label className="block text-xs font-semibold text-[#4A0A19] mb-1">
                      {t.customization.whatsappNumber} *
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="WhatsApp नंबर (10 अंक)"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none font-mono"
                    />
                    {errors.whatsappNumber && (
                      <span className="text-[11px] text-red-600">{errors.whatsappNumber}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-[#4A0A19] mb-1">
                  {t.customization.deliveryAddress} *
                </label>
                <textarea
                  rows={2}
                  placeholder="मकान संख्या, गली, मोहल्ला, लैंडमार्क..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none"
                />
                {errors.deliveryAddress && (
                  <span className="text-[11px] text-red-600">{errors.deliveryAddress}</span>
                )}
              </div>

              {/* City and PIN Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A0A19] mb-1">
                    {t.customization.city} *
                  </label>
                  <input
                    type="text"
                    placeholder="जैसे: इंदौर / भोपाल / मुंबई"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none"
                  />
                  {errors.city && (
                    <span className="text-[11px] text-red-600">{errors.city}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A0A19] mb-1">
                    {t.customization.pinCode} *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="452001"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none font-mono"
                  />
                  {errors.pinCode && (
                    <span className="text-[11px] text-red-600">{errors.pinCode}</span>
                  )}
                </div>
              </div>

              {/* Additional Instructions */}
              <div>
                <label className="block text-xs font-semibold text-[#4A0A19] mb-1">
                  {t.customization.additionalInstructions}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.customization.additionalPlaceholder}
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D9CEB5] rounded-xl focus:border-[#80182A] outline-none"
                />
              </div>

              {/* Reference Image Upload (Optional) */}
              <div className="p-3.5 bg-white rounded-2xl border border-[#E8DFC8]">
                <label className="block text-xs font-semibold text-[#4A0A19] mb-1">
                  {t.customization.referenceImage}
                </label>
                <p className="text-[11px] text-[#705E54] mb-2">{t.customization.uploadHelp}</p>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-[#FAF5EB] hover:bg-[#F2E8D5] border border-[#DFC99D] rounded-xl text-xs font-semibold text-[#80182A] flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>फोटो चुनें (Choose Image)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {referenceFileName && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-[#2C1810] truncate max-w-48 font-medium">
                        ✓ {referenceFileName}
                      </span>
                      {isUploadingRefImage && (
                        <span className="text-[10px] text-[#80182A] animate-pulse font-medium">
                          (Cloudinary पर अपलोड हो रहा है...)
                        </span>
                      )}
                      {uploadedCloudinaryUrl && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                          <Cloud className="w-2.5 h-2.5" />
                          Cloudinary सुरक्षित
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {referenceImageBase64 && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#D4AF37] shrink-0 bg-white shadow-xs">
                      <img
                        src={referenceImageBase64}
                        alt="Reference Upload"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {uploadedCloudinaryUrl && (
                      <span className="text-[11px] text-emerald-800 font-medium">
                        ✓ बुटीक को उच्च गुणवत्ता वाली Cloudinary फ़ोटो प्राप्त होगी!
                      </span>
                    )}
                  </div>
                )}
                {errors.referenceImage && (
                  <span className="text-[11px] text-red-600 mt-1 block">
                    {errors.referenceImage}
                  </span>
                )}
              </div>

            </div>
          )}

          {/* STEP 4: Review Order Summary */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FAF5EB] rounded-2xl border border-[#DFC99D] text-xs text-[#5C4D44]">
                {t.review.notice}
              </div>

              {/* Itemized Card */}
              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] space-y-4">
                
                {/* Design and Image */}
                <div className="flex items-center gap-4 pb-4 border-b border-[#F2ECE1]">
                  <img
                    src={selectedDesign.image}
                    alt={selectedDesign.nameHi}
                    className="w-20 h-20 rounded-xl object-cover border border-[#D4AF37]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#80182A]">{selectedDesign.code}</span>
                    <h4 className="text-base font-serif font-bold text-[#2C1810]">
                      {selectedDesign.nameHi}
                    </h4>
                    <span className="text-xs text-[#705E54]">संख्या (Qty): {quantity}</span>
                  </div>
                </div>

                {/* Sizing & Tailoring Specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-[#4A0A19]">ब्लाउज़ का रंग:</span>
                    <p className="text-[#5C4D44]">{customColorName || blouseColor}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#4A0A19]">फैब्रिक:</span>
                    <p className="text-[#5C4D44]">{fabricPreference}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#4A0A19]">आस्तीन:</span>
                    <p className="text-[#5C4D44]">{sleeveStyle}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#4A0A19]">गला:</span>
                    <p className="text-[#5C4D44]">{neckDesign}</p>
                  </div>
                </div>

                {/* Size Details */}
                <div className="pt-2 border-t border-[#F2ECE1] text-xs">
                  <span className="font-semibold text-[#4A0A19]">नाप विवरण:</span>
                  {sizeType === 'standard' ? (
                    <p className="text-[#5C4D44] mt-0.5 font-medium">
                      स्टैंडर्ड साइज़ {standardSize} इंच (Bust ~{standardSize}")
                    </p>
                  ) : (
                    <div className="mt-1 grid grid-cols-3 sm:grid-cols-4 gap-2 text-[11px] bg-[#FAF6EE] p-2 rounded-lg">
                      {measurements.bust && <div>छाती: {measurements.bust}"</div>}
                      {measurements.underbust && <div>अंडरबस्ट: {measurements.underbust}"</div>}
                      {measurements.waist && <div>कमर: {measurements.waist}"</div>}
                      {measurements.shoulder && <div>कंधा: {measurements.shoulder}"</div>}
                      {measurements.blouseLength && <div>लंबाई: {measurements.blouseLength}"</div>}
                      {measurements.sleeveLength && <div>आस्तीन: {measurements.sleeveLength}"</div>}
                      {measurements.armhole && <div>आर्महोल: {measurements.armhole}"</div>}
                    </div>
                  )}
                </div>

                {/* Delivery Information */}
                <div className="pt-2 border-t border-[#F2ECE1] text-xs">
                  <span className="font-semibold text-[#4A0A19]">डिलीवरी पता:</span>
                  <p className="text-[#5C4D44] mt-0.5">
                    {customerName} · 📱 {mobileNumber}
                    <br />
                    {deliveryAddress}, {city} - <span className="font-mono">{pinCode}</span>
                  </p>
                  {additionalInstructions && (
                    <p className="mt-1 text-[11px] text-[#705E54] italic">
                      नोट: {additionalInstructions}
                    </p>
                  )}
                </div>

                {/* Price and Home Delivery Availability Notice */}
                <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#4A0A19]">
                    {t.review.estimatedPrice}:
                  </span>
                  <div>
                    {selectedDesign.price ? (
                      <span className="text-lg font-mono font-bold text-[#80182A]">
                        ₹{(selectedDesign.price * quantity).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-xs text-[#B38F2B] italic">
                        {t.gallery.priceOnRequest}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-[#705E54] bg-[#FAF1E3] p-2 rounded-lg border border-[#DFC99D]">
                  📌 {t.review.deliveryChargeNote}
                </div>

              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

            </div>
          )}

          {/* STEP 5: Order Confirmation Page */}
          {step === 5 && confirmedOrder && (
            <div className="text-center py-6 sm:py-8 space-y-6">
              
              {/* Celebration Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-full mx-auto flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-block text-xs font-semibold text-[#B38F2B] tracking-widest uppercase mb-1">
                  मुस्कान फैशन डिज़ाइनर
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#4A0A19]">
                  {t.confirmation.successTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C4D44] mt-1">
                  {t.confirmation.thankYou}
                </p>
              </div>

              {/* Order ID Box */}
              <div className="max-w-md mx-auto p-4 bg-[#FAF5EB] rounded-2xl border-2 border-[#D4AF37] shadow-xs">
                <div className="text-xs text-[#705E54]">{t.confirmation.orderId}:</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-[#80182A] tracking-wider my-1">
                  {confirmedOrder.id}
                </div>
                <div className="text-xs text-[#16A34A] font-semibold flex items-center justify-center gap-1">
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>स्थिति: {confirmedOrder.status}</span>
                </div>
              </div>

              {/* WhatsApp Notice & Direct Send Button */}
              <div className="max-w-md mx-auto space-y-3">
                <p className="text-xs text-[#5C4D44] leading-relaxed">
                  {t.confirmation.whatsappNotice}
                </p>

                <a
                  href={generateWhatsAppOrderUrl(confirmedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#166534] rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span>{t.confirmation.sendToWhatsapp}</span>
                </a>
              </div>

              {/* Order Summary Snapshot */}
              <div className="max-w-md mx-auto text-left p-3.5 bg-white rounded-xl border border-[#E8DFC8] text-xs text-[#5C4D44] space-y-1">
                <div>• <span className="font-semibold">डिज़ाइन:</span> {confirmedOrder.designName} ({confirmedOrder.designCode})</div>
                <div>• <span className="font-semibold">साइज़:</span> {confirmedOrder.sizeType === 'standard' ? `${confirmedOrder.standardSize}" स्टैंडर्ड` : 'कस्टम नाप'}</div>
                <div>• <span className="font-semibold">पता:</span> {confirmedOrder.deliveryAddress}, {confirmedOrder.city} - {confirmedOrder.pinCode}</div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions / Navigation Buttons */}
        <div className="bg-[#FAF3E8] border-t border-[#EADBBE] p-4 flex items-center justify-between">
          {step === 5 ? (
            /* Confirmation Actions */
            <div className="w-full flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#80182A] bg-white border border-[#D4AF37] rounded-xl hover:bg-[#FDFBF7]"
              >
                बंद करें
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setConfirmedOrder(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#80182A] rounded-xl hover:bg-[#9B111E] flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.confirmation.orderAnother}</span>
              </button>
            </div>
          ) : (
            /* Steps 1-4 Navigation */
            <>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-xs font-semibold text-[#5A4A42] bg-white border border-[#D9CEB5] rounded-xl hover:bg-[#FDFBF7] flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.customization.back}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#5A4A42] hover:text-[#4A0A19]"
                >
                  रद्द करें
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#80182A] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-xl shadow-xs flex items-center gap-1.5 border border-[#A62B3F]"
                >
                  <span>कस्टमाइज़ करें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#80182A] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-xl shadow-xs flex items-center gap-1.5 border border-[#A62B3F]"
                >
                  <span>डिलीवरी विवरण भरें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep3()) setStep(4);
                  }}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#80182A] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-xl shadow-xs flex items-center gap-1.5 border border-[#A62B3F]"
                >
                  <span>{t.customization.proceedReview}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 4 && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitOrder}
                  className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#80182A] via-[#9B111E] to-[#6B1124] hover:from-[#9B111E] hover:to-[#80182A] rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 border border-[#B3273D] disabled:opacity-60 transition-all"
                >
                  {isSubmitting ? (
                    <span>{t.customization.submitting}</span>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4 text-[#F3E5AB]" />
                      <span>{t.customization.submitOrder}</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
