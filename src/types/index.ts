export type Language = 'hi' | 'en';

export type CategoryId =
  | 'all'
  | 'bridal'
  | 'party-wear'
  | 'designer'
  | 'traditional'
  | 'sleeveless'
  | 'full-sleeve'
  | 'back-neck'
  | 'festive-navratri';

export interface BlouseCategory {
  id: CategoryId;
  nameHi: string;
  nameEn: string;
  descriptionHi: string;
  descriptionEn: string;
}

export interface BlouseDesign {
  id: string;
  code: string;
  nameHi: string;
  nameEn: string;
  categoryId: CategoryId;
  price: number | null; // null if configured as "Price on request / संपर्क करें"
  image: string;
  secondaryImage?: string;
  descriptionHi: string;
  descriptionEn: string;
  neckTypeHi: string;
  neckTypeEn: string;
  sleeveTypeHi: string;
  sleeveTypeEn: string;
  fabricRecommendationHi: string;
  fabricRecommendationEn: string;
  isFeatured?: boolean;
  isNavratriSpecial?: boolean;
  estimatedStitchingDays: number;
}

export type OrderStatus =
  | 'Order Received'
  | 'Confirmation Pending'
  | 'Order Confirmed'
  | 'Stitching in Progress'
  | 'Ready for Dispatch'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface CustomMeasurements {
  bust?: string; // छाती / Bust
  underbust?: string; // अंडरबस्ट
  waist?: string; // कमर / Waist
  shoulder?: string; // कंधा / Shoulder
  blouseLength?: string; // ब्लाउज़ की लंबाई / Length
  sleeveLength?: string; // आस्तीन की लंबाई / Sleeve Length
  armhole?: string; // आर्महोल / Armhole
  frontNeckDepth?: string;
  backNeckDepth?: string;
}

export interface Order {
  id: string; // e.g. MFD-ORD-8492
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];

  // Customer
  customerName: string;
  mobileNumber: string;
  whatsappNumber: string;

  // Selected Design
  designId: string;
  designCode: string;
  designName: string;
  designImage: string;

  // Customization
  blouseColor: string;
  fabricPreference: string;
  sleeveStyle: string;
  neckDesign: string;
  quantity: number;

  // Sizing
  sizeType: 'standard' | 'custom';
  standardSize?: string; // 32, 34, 36, 38, 40, 42, 44, 46
  measurements?: CustomMeasurements;

  // Delivery
  deliveryAddress: string;
  city: string;
  pinCode: string;
  additionalInstructions?: string;
  referenceImageUrl?: string;

  // Admin Configured Pricing & Delivery
  pricePerItem?: number | null;
  totalAmount?: number | null;
  deliveryChargeNote?: string;
  adminNotes?: string;
}

export interface AdminSettings {
  boutiqueName: string;
  phone: string;
  whatsapp: string;
  adminPin: string;
  navratriBannerActive: boolean;
  noticeHindi: string;
  noticeEnglish: string;
  standardStitchingDays: number;
  deliveryPolicyNoteHindi: string;
  deliveryPolicyNoteEnglish: string;
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
}
