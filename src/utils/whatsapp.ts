import { Order, BlouseDesign } from '../types';
import { WHATSAPP_RAW } from '../data/initialData';

export function generateWhatsAppOrderUrl(order: Partial<Order>): string {
  const lines: string[] = [];
  lines.push('🌸 *नमस्ते मुस्‍कान फैशन डिज़ाइनर (MUSKAAN FASHION DESIGNER)* 🌸');
  lines.push('');
  lines.push('मैं अपनी ब्लाउज़ स्टिचिंग का ऑर्डर देना चाहती हूँ:');
  lines.push('');
  if (order.id) {
    lines.push(`📋 *ऑर्डर आईडी (Order ID):* ${order.id}`);
  }
  if (order.customerName) {
    lines.push(`👤 *ग्राहक का नाम (Name):* ${order.customerName}`);
  }
  if (order.mobileNumber) {
    lines.push(`📱 *मोबाइल नंबर (Mobile):* ${order.mobileNumber}`);
  }
  if (order.designName || order.designCode) {
    lines.push(`👗 *डिज़ाइन (Design):* ${order.designName} (${order.designCode || ''})`);
  }
  if (order.blouseColor) {
    lines.push(`🎨 *ब्लाउज़ का रंग (Color):* ${order.blouseColor}`);
  }
  if (order.fabricPreference) {
    lines.push(`🧵 *फैब्रिक (Fabric):* ${order.fabricPreference}`);
  }
  if (order.sleeveStyle) {
    lines.push(`✂️ *आस्तीन स्टाइल (Sleeve):* ${order.sleeveStyle}`);
  }
  if (order.neckDesign) {
    lines.push(`🪡 *गले का डिज़ाइन (Neck):* ${order.neckDesign}`);
  }
  if (order.quantity) {
    lines.push(`🔢 *संख्या (Quantity):* ${order.quantity}`);
  }

  lines.push('');
  if (order.sizeType === 'standard' && order.standardSize) {
    lines.push(`📏 *साइज़ (Size):* स्टैंडर्ड साइज़ ${order.standardSize} इंच`);
  } else if (order.sizeType === 'custom' && order.measurements) {
    lines.push('📏 *कस्टम नाप (Measurements - Inches):*');
    const m = order.measurements;
    if (m.bust) lines.push(`  • छाती (Bust): ${m.bust}"`);
    if (m.underbust) lines.push(`  • अंडरबस्ट (Underbust): ${m.underbust}"`);
    if (m.waist) lines.push(`  • कमर (Waist): ${m.waist}"`);
    if (m.shoulder) lines.push(`  • कंधा (Shoulder): ${m.shoulder}"`);
    if (m.blouseLength) lines.push(`  • लंबाई (Length): ${m.blouseLength}"`);
    if (m.sleeveLength) lines.push(`  • आस्तीन (Sleeve): ${m.sleeveLength}"`);
    if (m.armhole) lines.push(`  • आर्महोल (Armhole): ${m.armhole}"`);
  }

  lines.push('');
  if (order.deliveryAddress) {
    lines.push(`🏠 *डिलीवरी पता (Delivery Address):* ${order.deliveryAddress}, ${order.city || ''} - ${order.pinCode || ''}`);
  }
  if (order.additionalInstructions) {
    lines.push(`📝 *अतिरिक्त निर्देश (Special Notes):* ${order.additionalInstructions}`);
  }

  lines.push('');
  lines.push('कृपया सिलाई शुल्क (Price) और डिलीवरी समय कन्फर्म करें। धन्यवाद!');

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${WHATSAPP_RAW}?text=${text}`;
}

export function generateWhatsAppDesignInquiryUrl(design: BlouseDesign): string {
  const lines: string[] = [];
  lines.push('🌸 *नमस्ते मुस्‍कान फैशन डिज़ाइनर (MUSKAAN FASHION DESIGNER)* 🌸');
  lines.push('');
  lines.push(`मुझे आपका यह ब्लाउज़ डिज़ाइन पसंद आया है:`);
  lines.push(`• *डिज़ाइन:* ${design.nameHi} (${design.nameEn})`);
  lines.push(`• *कोड:* ${design.code}`);
  if (design.price) {
    lines.push(`• *अनुमानित शुल्क:* ₹${design.price}`);
  }
  lines.push('');
  lines.push('क्या मैं इस डिज़ाइन में अपना ब्लाउज़ सिलवा सकती हूँ? कृपया इसकी स्टिचिंग प्रक्रिया और कपड़े के विकल्प बताएं।');

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${WHATSAPP_RAW}?text=${text}`;
}

export function generateWhatsAppGeneralUrl(): string {
  const message = 'नमस्ते मुस्‍कान फैशन डिज़ाइनर! मुझे कस्टम ब्लाउज़ सिलाई और डिज़ाइन के बारे में जानकारी चाहिए।';
  return `https://wa.me/${WHATSAPP_RAW}?text=${encodeURIComponent(message)}`;
}

export function generateCustomerWhatsAppUpdateUrl(customerPhone: string, orderId: string, status: string, notes?: string): string {
  const cleanPhone = customerPhone.replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`;
  const lines: string[] = [];
  lines.push(`🌸 *मुस्‍कान फैशन डिज़ाइनर (MUSKAAN FASHION DESIGNER)* 🌸`);
  lines.push('');
  lines.push(`नमस्ते! आपके ब्लाउज़ ऑर्डर का स्टेटस अपडेट:`);
  lines.push(`📋 *ऑर्डर आईडी:* ${orderId}`);
  lines.push(`📍 *वर्तमान स्थिति:* ${status}`);
  if (notes) {
    lines.push(`💬 *अपडेट:* ${notes}`);
  }
  lines.push('');
  lines.push('किसी भी जानकारी के लिए आप हमें इसी नंबर पर संपर्क कर सकते हैं। धन्यवाद!');
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
}
