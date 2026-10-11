import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBStructure {
  designs: any[];
  orders: any[];
  settings: any;
}

const DEFAULT_DESIGNS = [
  {
    id: 'mfd-br-01',
    code: 'MFD-BR-01',
    nameHi: 'शाही दुल्हन जरदोजी ब्राइडल ब्लाउज़',
    nameEn: 'Royal Bridal Zardozi Silk Blouse',
    categoryId: 'bridal',
    price: 399,
    image: '/src/assets/images/bridal_red_zari_blouse_1791701492355.jpg',
    descriptionHi: 'रॉयल रेड रॉ-सिल्क पर मंदिर शैली की सोने की ज़री और जरदोजी की नक्काशी। स्वीटहार्ट नेकलाइन के साथ दुल्हन के लिए सर्वोत्तम विकल्प।',
    descriptionEn: 'Opulent crimson raw-silk tailored with temple jewelry-inspired golden zari and authentic zardozi embroidery. Premium padded finish with elegant sweetheart neck.',
    neckTypeHi: 'स्वीटहार्ट नेक (Sweetheart)',
    neckTypeEn: 'Sweetheart Neck',
    sleeveTypeHi: 'कोहनी तक (Elbow Sleeve) भारी बॉर्डर',
    sleeveTypeEn: 'Elbow Length Heavy Border',
    fabricRecommendationHi: 'शुद्ध रॉ सिल्क / बनारसी सिल्क',
    fabricRecommendationEn: 'Pure Raw Silk / Banarasi Silk',
    isFeatured: true,
    estimatedStitchingDays: 7,
  },
  {
    id: 'mfd-nv-01',
    code: 'MFD-NV-01',
    nameHi: 'नवरात्रि 2026 स्पेशल मिरर-वर्क चोली',
    nameEn: 'Navratri 2026 Mirror-Work Choli Blouse',
    categoryId: 'festive-navratri',
    price: 349,
    image: '/src/assets/images/festive_navratri_blouse_1791701481521.jpg',
    descriptionHi: 'गरबा और डांडिया रास के लिए हाथ से लगे असली कांच के शीशे और रंग-बिरंगे कुच्छी धागों का काम। पीछे पारंपरिक रंगीन लटकन व डोरी।',
    descriptionEn: 'Festive Navratri celebratory choli crafted with genuine mirror embroidery, vibrant geometric Kutchi threads and handcrafted multicolor pom-pom dori tassels.',
    neckTypeHi: 'डीप बैक डोरी व चौकोर फ्रंट नेक',
    neckTypeEn: 'Deep Back Dori & Square Front Neck',
    sleeveTypeHi: 'हाफ स्लीव मिरर बॉर्डर',
    sleeveTypeEn: 'Half Sleeve Mirror Border',
    fabricRecommendationHi: 'कॉटन सिल्क / खादी सिल्क',
    fabricRecommendationEn: 'Cotton Silk / Khadi Silk',
    isFeatured: true,
    isNavratriSpecial: true,
    estimatedStitchingDays: 5,
  },
  {
    id: 'mfd-bn-01',
    code: 'MFD-BN-01',
    nameHi: 'एमेरल्ड डीप-यू बैक लटकन ब्लाउज़',
    nameEn: 'Emerald Deep U Back Tassel Blouse',
    categoryId: 'back-neck',
    price: 299,
    image: '/src/assets/images/designer_back_neck_blouse_1791701504534.jpg',
    descriptionHi: 'रॉयल ग्रीन मखमली (वेलवेट) फैब्रिक पर महीन मोतियों और सुनहरी जरी के लटकन। डीप यू-कट बैक जो किसी भी लहंगे या साड़ी पर बेहद खूबसूरत लगता है।',
    descriptionEn: 'Royal emerald micro-velvet blouse featuring an arresting deep U-cut back framed in gold aari zardozi and artisanal cascading pearl-beaded dori hangings.',
    neckTypeHi: 'डीप यू-कट डिजाइनर बैक नेक',
    neckTypeEn: 'Deep U Designer Back Neck',
    sleeveTypeHi: 'स्लीवलेस / कैप स्लीव',
    sleeveTypeEn: 'Sleeveless / Cap Sleeve',
    fabricRecommendationHi: 'माइक्रो वेलवेट / रॉ सिल्क',
    fabricRecommendationEn: 'Micro Velvet / Raw Silk',
    isFeatured: true,
    estimatedStitchingDays: 4,
  },
  {
    id: 'mfd-pw-01',
    code: 'MFD-PW-01',
    nameHi: 'शैम्पेन गोल्ड सीक्विन पार्टी वियर ब्लाउज़',
    nameEn: 'Champagne Gold Sequin Glamour Blouse',
    categoryId: 'party-wear',
    price: 280,
    image: '/src/assets/images/party_wear_sequin_blouse_1791701514307.jpg',
    descriptionHi: 'शैम्पेन गोल्ड रंग में सूक्ष्म चमकते हुए सीक्विन और बोट नेकलाइन। कॉकटेल, रिसेप्शन और पार्टी साड़ियों के साथ आधुनिक लुक।',
    descriptionEn: 'Contemporary party wear blouse featuring micro champagne gold sequins, boat neckline and padded structured princess-cut silhouette.',
    neckTypeHi: 'बोट नेक (Boat Neck)',
    neckTypeEn: 'Boat Neck',
    sleeveTypeHi: 'हाफ स्लीव (Half Sleeve)',
    sleeveTypeEn: 'Half Sleeve',
    fabricRecommendationHi: 'जॉर्जेट / नेट विद इनर लाइनिंग',
    fabricRecommendationEn: 'Georgette / Net with Soft Inner Lining',
    isFeatured: true,
    estimatedStitchingDays: 4,
  },
  {
    id: 'mfd-ds-01',
    code: 'MFD-DS-01',
    nameHi: 'हेरिटेज मखमली कटवर्क बूटा ब्लाउज़',
    nameEn: 'Heritage Velvet Cutwork Boutique Blouse',
    categoryId: 'designer',
    price: 360,
    image: '/src/assets/images/hero_blouse_craft_1791701468425.jpg',
    descriptionHi: 'गहरे मैरून सिल्क पर विंटेज कटवर्क बैक, हाथ से बनी सुनहरी बूटी और मैचिंग लटकन। बुटीक का सबसे लोकप्रिय डिज़ाइन।',
    descriptionEn: 'Deep maroon silk masterpiece with circular artisanal cutout back, paisleys embroidered in fine antique zari, and custom gold tassels.',
    neckTypeHi: 'सर्कुलर कटवर्क बैक व राउंड फ्रंट',
    neckTypeEn: 'Circular Cutout Back & Round Front',
    sleeveTypeHi: '3/4th स्लीव जरदोजी बॉर्डर',
    sleeveTypeEn: '3/4th Sleeve Zardozi Border',
    fabricRecommendationHi: 'रॉ सिल्क / मखमली फैब्रिक',
    fabricRecommendationEn: 'Raw Silk / Velvet Fabric',
    isFeatured: true,
    estimatedStitchingDays: 6,
  },
  {
    id: 'mfd-sl-01',
    code: 'MFD-SL-01',
    nameHi: 'मॉडर्न स्वीटहार्ट स्लीवलेस ब्लाउज़',
    nameEn: 'Modern Sweetheart Sleeveless Blouse',
    categoryId: 'sleeveless',
    price: 220,
    image: '/src/assets/images/party_wear_sequin_blouse_1791701514307.jpg',
    descriptionHi: 'क्लीन फिनिशिंग, पैडेड कप्स और स्वीटहार्ट कट के साथ स्लीवलेस डिज़ाइन। आप अपना पसंदीदा कपड़ा भी भेज सकते हैं।',
    descriptionEn: 'Sleek sleeveless silhouette featuring padded cups, immaculate piping and sweetheart neckline for lightweight effortless drape.',
    neckTypeHi: 'डीप स्वीटहार्ट नेक',
    neckTypeEn: 'Deep Sweetheart Neck',
    sleeveTypeHi: 'स्लीवलेस (Sleeveless)',
    sleeveTypeEn: 'Sleeveless',
    fabricRecommendationHi: 'सिल्क, ब्रोकेड या क्रेप',
    fabricRecommendationEn: 'Silk, Brocade or Crepe',
    isFeatured: false,
    estimatedStitchingDays: 4,
  },
  {
    id: 'mfd-fs-01',
    code: 'MFD-FS-01',
    nameHi: 'शाही बनारसी फुल स्लीव हाई-नेक',
    nameEn: 'Royal Banarasi Full Sleeve High-Neck',
    categoryId: 'full-sleeve',
    price: 320,
    image: '/src/assets/images/bridal_red_zari_blouse_1791701492355.jpg',
    descriptionHi: 'विंटर वेडिंग्स और राजसी लुक के लिए कलाई तक कढ़ाई वाली फुल स्लीव और कॉलर स्टाइल हाई-नेक पैटर्न।',
    descriptionEn: 'Majestic full-sleeve blouse with wrist embroidery and high neck framing, engineered for regal winter celebrations and formal sarees.',
    neckTypeHi: 'हाई नेक / कॉलर नेक',
    neckTypeEn: 'High Neck / Mandarin Collar',
    sleeveTypeHi: 'फुल स्लीव (कलाई तक)',
    sleeveTypeEn: 'Full Sleeve (Wrist Length)',
    fabricRecommendationHi: 'बनारसी ब्रोकेड / चंदेरी सिल्क',
    fabricRecommendationEn: 'Banarasi Brocade / Chanderi Silk',
    isFeatured: false,
    estimatedStitchingDays: 6,
  },
  {
    id: 'mfd-tr-01',
    code: 'MFD-TR-01',
    nameHi: 'कांजीवरम टेंपल बॉर्डर पारंपरिक ब्लाउज़',
    nameEn: 'Kanjivaram Temple Border Traditional Blouse',
    categoryId: 'traditional',
    price: 250,
    image: '/src/assets/images/designer_back_neck_blouse_1791701504534.jpg',
    descriptionHi: 'दक्षिण भारतीय और पारंपरिक साड़ियों के लिए प्रामाणिक मंदिर बॉर्डर डिजाइन और सुई-धागे की शुद्ध फिनिशिंग।',
    descriptionEn: 'Authentic temple border accents tailored to sit flush against traditional silk sarees. Features reinforced armholes and double-stitch durability.',
    neckTypeHi: 'पारंपरिक राउंड नेक विथ पाइपिंग',
    neckTypeEn: 'Traditional Round Neck with Contrast Piping',
    sleeveTypeHi: 'एल्बो लेंथ (कोहनी तक)',
    sleeveTypeEn: 'Elbow Length',
    fabricRecommendationHi: 'कांजीवरम पल्लू फैब्रिक / कॉटन सिल्क',
    fabricRecommendationEn: 'Kanjivaram Pallu Fabric / Cotton Silk',
    isFeatured: false,
    estimatedStitchingDays: 5,
  },
];

const DEFAULT_SETTINGS = {
  boutiqueName: 'MUSKAAN FASHION DESIGNER',
  phone: '+91 97536 46417',
  whatsapp: '919753646417',
  adminPin: '9753',
  navratriBannerActive: true,
  noticeHindi: 'नवरात्रि 2026 स्पेशल: डांडिया व गरबा चोली की फास्ट स्टिचिंग उपलब्ध! सीमित स्लॉट।',
  noticeEnglish: 'Navratri 2026 Special: Fast stitching available for Garba & Dandiya cholis! Limited slots.',
  standardStitchingDays: 5,
  deliveryPolicyNoteHindi: 'होम डिलीवरी उपलब्धता, डिलीवरी शुल्क व समय आपके पते व पिन कोड के अनुसार बुटीक द्वारा कन्फर्म किया जाएगा।',
  deliveryPolicyNoteEnglish: 'Home delivery availability, delivery charges and estimated timeline will be confirmed by the boutique based on your PIN code.',
  cloudinaryCloudName: 'dxeuzdwkz',
  cloudinaryUploadPreset: 'Muskaan fashion designer',
};

function readDB(): DBStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to read db file:', err);
  }
  const initial: DBStructure = {
    designs: DEFAULT_DESIGNS,
    orders: [],
    settings: DEFAULT_SETTINGS,
  };
  writeDB(initial);
  return initial;
}

function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db file:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Ensure initial data is loaded
  readDB();

  // API Endpoints
  // 1. Blouse Designs
  app.get('/api/designs', (_req: Request, res: Response) => {
    const db = readDB();
    res.json(db.designs || []);
  });

  app.post('/api/designs', (req: Request, res: Response) => {
    const db = readDB();
    const newDesign = {
      ...req.body,
      id: req.body.id || `mfd-${Date.now().toString(36)}`,
      code: req.body.code || `MFD-DS-${(db.designs.length + 1).toString().padStart(2, '0')}`,
    };
    db.designs.unshift(newDesign);
    writeDB(db);
    res.status(201).json(newDesign);
  });

  app.put('/api/designs/:id', (req: Request, res: Response) => {
    const db = readDB();
    const idx = db.designs.findIndex((d) => d.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Design not found' });
    }
    db.designs[idx] = { ...db.designs[idx], ...req.body };
    writeDB(db);
    res.json(db.designs[idx]);
  });

  app.delete('/api/designs/:id', (req: Request, res: Response) => {
    const db = readDB();
    const beforeCount = db.designs.length;
    db.designs = db.designs.filter((d) => d.id !== req.params.id);
    if (db.designs.length === beforeCount) {
      return res.status(404).json({ error: 'Design not found' });
    }
    writeDB(db);
    res.json({ success: true });
  });

  // 2. Orders
  app.get('/api/orders', (_req: Request, res: Response) => {
    const db = readDB();
    res.json(db.orders || []);
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const db = readDB();
    const body = req.body;

    // Strict validation
    if (!body.customerName || !body.customerName.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const cleanPhone = (body.mobileNumber || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number is required' });
    }

    const cleanPin = (body.pinCode || '').replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      return res.status(400).json({ error: 'Valid 6-digit PIN code is required' });
    }

    if (!body.deliveryAddress || !body.deliveryAddress.trim()) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    // Generate unique human-readable Order ID e.g. MFD-ORD-8492
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `MFD-ORD-${randomSuffix}`;
    const now = new Date().toISOString();

    const newOrder = {
      ...body,
      id: orderId,
      createdAt: now,
      updatedAt: now,
      status: 'Order Received',
      statusHistory: [
        {
          status: 'Order Received',
          timestamp: now,
          note: 'ऑर्डर दर्ज किया गया (Order placed by customer via website)',
        },
      ],
      quantity: Number(body.quantity) || 1,
    };

    db.orders.unshift(newOrder);
    writeDB(db);

    res.status(201).json(newOrder);
  });

  // Track Order endpoint with strict authentication check
  app.post('/api/orders/track', (req: Request, res: Response) => {
    const { orderId, mobileNumber } = req.body;

    if (!orderId || !mobileNumber) {
      return res.status(400).json({ error: 'Order ID and Mobile Number are required' });
    }

    const db = readDB();
    const cleanSearchOrder = orderId.trim().toUpperCase();
    const cleanSearchPhone = mobileNumber.replace(/\D/g, '').slice(-10);

    const found = db.orders.find((o) => {
      const matchId = (o.id || '').trim().toUpperCase() === cleanSearchOrder;
      const oPhone = (o.mobileNumber || '').replace(/\D/g, '').slice(-10);
      return matchId && oPhone === cleanSearchPhone;
    });

    if (!found) {
      return res.status(404).json({
        error: 'Order not found. Please verify Order ID and registered mobile number.',
      });
    }

    res.json(found);
  });

  // Update order status & notes
  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status, note, pricePerItem, totalAmount, deliveryChargeNote, adminNotes } = req.body;
    const db = readDB();
    const order = db.orders.find((o) => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const now = new Date().toISOString();
    if (status && status !== order.status) {
      order.status = status;
      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status,
        timestamp: now,
        note: note || `Status updated to ${status}`,
      });
    }

    if (pricePerItem !== undefined) order.pricePerItem = pricePerItem;
    if (totalAmount !== undefined) order.totalAmount = totalAmount;
    if (deliveryChargeNote !== undefined) order.deliveryChargeNote = deliveryChargeNote;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    order.updatedAt = now;

    writeDB(db);
    res.json(order);
  });

  // 3. Admin Authentication
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { pin } = req.body;
    const db = readDB();
    const configuredPin = db.settings?.adminPin || '9753';

    if (pin === configuredPin) {
      return res.json({ success: true, token: 'mfd_admin_session_auth' });
    }
    return res.status(401).json({ error: 'गलत पिन कोड (Invalid Admin PIN)' });
  });

  // 4. Admin Stats
  app.get('/api/admin/stats', (_req: Request, res: Response) => {
    const db = readDB();
    const orders = db.orders || [];

    const stats = {
      totalOrders: orders.length,
      pending: orders.filter((o) => o.status === 'Order Received' || o.status === 'Confirmation Pending').length,
      inStitching: orders.filter((o) => o.status === 'Stitching in Progress' || o.status === 'Order Confirmed').length,
      completed: orders.filter((o) => o.status === 'Delivered').length,
      totalDesigns: (db.designs || []).length,
    };

    res.json(stats);
  });

  // 5. Settings
  app.get('/api/settings', (_req: Request, res: Response) => {
    const db = readDB();
    // Do not return raw admin pin to unauthenticated clients
    const safeSettings = { ...db.settings };
    delete safeSettings.adminPin;
    res.json(safeSettings);
  });

  app.post('/api/settings', (req: Request, res: Response) => {
    const db = readDB();
    db.settings = { ...db.settings, ...req.body };
    writeDB(db);
    res.json({ success: true, settings: db.settings });
  });

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Muskaan Fashion Designer server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
