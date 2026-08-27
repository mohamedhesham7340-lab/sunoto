import { Product, SiteSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'ph-01',
    itemCode: 'EGY-GOLD-701',
    name: 'قناع توت عنخ آمون الذهبي الملكي (نسخة طبق الأصل)',
    nameEn: 'Royal Tutankhamun Gold Mask Replica',
    category: 'تحف وتماثيل فرعونية',
    price: 3450,
    originalPrice: 4200,
    shortDesc: 'قطعة فنية نادرة مصنوعة من النحاس الخالص ومطلية بماء الذهب عيار 24 مع تطعيم باللازورد والعقيق.',
    description: 'تحفة طبق الأصل لقناع الملك الشاب توت عنخ آمون الأيقوني، مصممة يدوياً بأيدي أمهر النحاتين المصريين. صُنعت بتفاصيل دقيقة للغاية تعكس عبقرية الفن المصري القديم مع طلاء فاخر من الذهب عيار 24 وترصيع بالأحجار الكريمة الصناعية الدقيقة.',
    images: [
      'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80'
    ],
    material: 'نحاس مسبوك مطلي بماء الذهب عيار 24 وتطعيم راتنج زجاجي',
    dimensions: 'الارتفاع 32 سم × العرض 22 سم × العمق 18 سم',
    weight: '3.4 كجم',
    minQuantity: 1,
    stockStatus: 'in_stock',
    isFeatured: true,
    wholesaleTiers: [
      { minQty: 5, discountPercent: 10 },
      { minQty: 15, discountPercent: 18 },
      { minQty: 50, discountPercent: 25 }
    ],
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'ph-02',
    itemCode: 'EGY-STAT-302',
    name: 'تمثال نفرتيتي الملكي من حجر البازلت والذهب',
    nameEn: 'Queen Nefertiti Royal Bust Sculpture',
    category: 'تحف وتماثيل فرعونية',
    price: 2150,
    originalPrice: 2600,
    shortDesc: 'نحت بارز للملكة نفرتيتي يجسد الجمال الملكي الأبدي بتاجها الأزرق الشهير وزخارف الذهب.',
    description: 'تمثال نصفي بديع للملكة المصرية الشهيرة نفرتيتي، منحوت بدقة فائقة مع التركيز على الملامح الملكية المتناسقة. مطلي بألوان أصلية تحاكي المقتنيات الملكية بمتحف برلين والمتحف المصري الكبير.',
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=1000&q=80'
    ],
    material: 'مركب الألباستر والبازلت المصقول مع تفاصيل يدوية',
    dimensions: 'الارتفاع 28 سم × العرض 14 سم',
    weight: '1.9 كجم',
    minQuantity: 1,
    stockStatus: 'in_stock',
    isFeatured: true,
    wholesaleTiers: [
      { minQty: 10, discountPercent: 12 },
      { minQty: 30, discountPercent: 20 }
    ],
    createdAt: '2026-01-12T10:00:00Z'
  },
  {
    id: 'ph-03',
    itemCode: 'EGY-PAPY-504',
    name: 'لوحة ورق بردي طبيعي - موكب الإيزيس وحورس',
    nameEn: 'Authentic Hand-Painted Papyrus Art - Isis & Horus',
    category: 'برديات ولوحات أثرية',
    price: 890,
    originalPrice: 1100,
    shortDesc: 'بردي مصري أصلي 100% مرسوم ومذهب يدوياً ومرفق معه شهادة موثقة من وزارة الآثار.',
    description: 'لوحة جدارية مصنوعة يدوياً من نبات البردي الطبيعي المزروع على ضفاف النيل. مرسومة بألوان حجرية ثابتة وزخارف ذهبية بارزة تصور موكب الإلهة إيزيس والملك حورس، تجلب عظمة التاريخ للمنازل والمكاتب الفخمة.',
    images: [
      'https://images.unsplash.com/photo-1608481337062-4093bf3ed404?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=1000&q=80'
    ],
    material: 'ورق بردي مصري طبيعي 100% مع ألوان زيتية وماء الذهب',
    dimensions: '60 سم × 90 سم (تصلح للبراويز الفاخرة)',
    weight: '0.3 كجم',
    minQuantity: 2,
    stockStatus: 'in_stock',
    isFeatured: true,
    wholesaleTiers: [
      { minQty: 10, discountPercent: 15 },
      { minQty: 50, discountPercent: 30 }
    ],
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'ph-04',
    itemCode: 'EGY-OIL-108',
    name: 'زيت زهرة اللوتس الملكية النقية (خلاصة الفراعنة)',
    nameEn: 'Pure Royal Egyptian Blue Lotus Essential Oil',
    category: 'عطور وزيوت اللوتس',
    price: 650,
    originalPrice: 850,
    shortDesc: 'زيت عطري مركّز 100% مستخلص من زهرة اللوتس الزرقاء في زجاجة فرعونية مذهبة يدوياً.',
    description: 'الزيت العطري الملكي المقدس عند الفراعنة، مستخلص بالتقطير البارد لأزهار اللوتس النيلية النقية. يأتي في زجاجة كريستالية فرعونية منفوخة يدوياً ومزخرفة بنقوش الهيروغليفية الذهبية، يدوم عبيره لأيام ويمنح شعوراً بالسكينة والصفاء.',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80'
    ],
    material: 'خلاصة زيت اللوتس الصافي بدون كحول + زجاج معالج حرارياً',
    dimensions: 'سعة 50 مل / عبوة فاخرة',
    weight: '0.4 كجم',
    minQuantity: 3,
    stockStatus: 'in_stock',
    isFeatured: false,
    wholesaleTiers: [
      { minQty: 12, discountPercent: 20 },
      { minQty: 60, discountPercent: 35 }
    ],
    createdAt: '2026-01-18T10:00:00Z'
  },
  {
    id: 'ph-05',
    itemCode: 'EGY-JEW-909',
    name: 'قلادة عين حورس وخنفساء الجعران من الفضة الإسترليني والذهب',
    nameEn: 'Silver & Gold Eye of Horus & Scarab Talisman',
    category: 'مجوهرات وحلي ملكية',
    price: 1850,
    originalPrice: 2300,
    shortDesc: 'مجوهرات تراثية مصنوعة من الفضة عيار 925 مع طلاء الذهب وترصيع بحجر الفيروز السيناوي الطبيعي.',
    description: 'تميمة فرعونية مقدسة تجمع بين عين حورس (رمز الحماية والقوة) وجعران الشمس المجنح (رمز التجدد والخلود). صممت ونُفذت بدقة حرفية عالية في ورش الصاغة التراثية بالقاهرة القديمة.',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=1000&q=80'
    ],
    material: 'فضة إسترليني 925 + طلاء ذهب 18 قيراط + فيروز طبيعي',
    dimensions: 'سلسلة 55 سم + دلاية 4.5 سم',
    weight: '42 جرام',
    minQuantity: 1,
    stockStatus: 'in_stock',
    isFeatured: true,
    wholesaleTiers: [
      { minQty: 5, discountPercent: 10 },
      { minQty: 20, discountPercent: 22 }
    ],
    createdAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'ph-06',
    itemCode: 'EGY-ALAB-405',
    name: 'فازة ألباستر قناوي طبيعي مضيئة ومنقوشة يدوياً',
    nameEn: 'Hand-Carved Translucent Egyptian Alabaster Vase',
    category: 'أعمال نحاس وألباستر',
    price: 1200,
    originalPrice: 1500,
    shortDesc: 'حجر ألباستر مصري شفاف مستخرج من جبال الأقصر، ينفذ منه الضوء بجمال ساحر.',
    description: 'فازة منحوتة يدوياً من صخور الألباستر الأبيض المعرّق بالعسلي الطبيعي. تتميز بخاصية نفاذية الضوء الفريدة، مما يجعلها مثالية كوحدة إضاءة ديكورية أو قطعة مركزية تضفي دفئاً شرقياً ساحراً.',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
    ],
    material: 'حجر ألباستر طبيعي مصري 100% (أقصر / أسيوط)',
    dimensions: 'الارتفاع 25 سم × القطر 16 سم',
    weight: '2.5 كجم',
    minQuantity: 2,
    stockStatus: 'in_stock',
    isFeatured: false,
    wholesaleTiers: [
      { minQty: 6, discountPercent: 12 },
      { minQty: 24, discountPercent: 25 }
    ],
    createdAt: '2026-01-22T10:00:00Z'
  },
  {
    id: 'ph-07',
    itemCode: 'EGY-STAT-208',
    name: 'تمثال أنوبيس حارس الأسرار الملكية (أسود وذهب)',
    nameEn: 'Black & Gold Anubis Jackal Guardian Statue',
    category: 'تحف وتماثيل فرعونية',
    price: 1650,
    originalPrice: 1950,
    shortDesc: 'تمثال وقور لحارس المقابر الملكية أنوبيس باللون الأسود الملكي مع طوق ذهبي لامع.',
    description: 'تمثال متقن يمثل الإله أنوبيس برأس ابن آوى في وضعية الاستلقاء المهيبة على صندوق المومياء الذهبي. تشطيب فاخر مقاوم للعوامل الجوية مع تفاصيل مذهبة باليد.',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80'
    ],
    material: 'راتنج صلب مع مسحوق البازلت وتطعيم بالذهب',
    dimensions: 'الطول 35 سم × الارتفاع 20 سم',
    weight: '2.2 كجم',
    minQuantity: 1,
    stockStatus: 'in_stock',
    isFeatured: false,
    wholesaleTiers: [
      { minQty: 8, discountPercent: 15 },
      { minQty: 25, discountPercent: 25 }
    ],
    createdAt: '2026-01-25T10:00:00Z'
  },
  {
    id: 'ph-08',
    itemCode: 'EGY-CHESS-99',
    name: 'طاولة وشطرنج فرعوني ملكي مصنوع من العاج وخشب الأبنوس',
    nameEn: 'Handmade Pharaoh Luxury Chess Set',
    category: 'تحف وتماثيل فرعونية',
    price: 4900,
    originalPrice: 6200,
    shortDesc: 'شطرنج فاخر مجسم لشخصيات الملوك رمسيس ونفرتيتي والكهنة والجنود بطلاء الذهب والفضة.',
    description: 'طقم شطرنج استثنائي لكبار المقتنين والمهتمين بالنوادر. يضم 32 مجسماً فرعونياً دقيق الصنع مطليين بالذهب والبرونز، مع صندوق خشبي مطعم بالصدف الطبيعي وخشب الجوز يتحول إلى رقعة لعب راقية.',
    images: [
      'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=1000&q=80'
    ],
    material: 'خشب جوز طبيعي مطعم بالصدف + قطع معدنية مسبوكة ومطلية',
    dimensions: '45 سم × 45 سم × ارتفاع 10 سم',
    weight: '5.6 كجم',
    minQuantity: 1,
    stockStatus: 'limited',
    isFeatured: true,
    wholesaleTiers: [
      { minQty: 3, discountPercent: 10 },
      { minQty: 10, discountPercent: 20 }
    ],
    createdAt: '2026-01-28T10:00:00Z'
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  storeName: 'الفرعون الذهبي للتحف والمنتجات الملكية',
  storeTagline: 'عروض أسعار وكتالوج التوريدات والتحف المصرية الأصيلة للمصانع والمؤسسات والأفراد',
  whatsappNumber: '201000000000',
  phoneNumber: '+20 10 0000 0000',
  email: 'sales@pharaoh-luxury.com',
  address: 'شارع المعز لدين الله، خان الخليلي، القاهرة، جمهورية مصر العربية',
  commercialRecord: 'س.ت: 184920 - الجيزة',
  taxId: 'ب.ض: 492-381-092',
  currency: 'EGP',
  exchangeRates: {
    EGP: 1,
    USD: 0.02,
    SAR: 0.076,
    AED: 0.074
  },
  taxRate: 0,
  defaultQuoteValidityDays: 15,
  quoteTerms: [
    'الأسعار الموضحة في عرض السعر سارية لمدة 15 يوماً من تاريخ الإصدار.',
    'التوريد والشحن متاح لجميع أنحاء جمهورية مصر العربية وللشحن الدولي التصديري.',
    'شروط السداد: 50% دفعة مقدمة عند تأكيد الطلب، و50% قبل موعد التسليم والشحن.',
    'تتوفر خصومات خاصة للكميات الكبيرة وطلبات الجملة والتوريدات الفندقية والمؤسسية.',
    'جميع المنتجات مرفق معها شهادة أصالة وجودة وضمان ضد عيوب الصناعة.'
  ],
  logoUrl: 'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=200&q=80',
  databaseConnected: false
};

export const CATEGORIES = [
  'الكل',
  'تحف وتماثيل فرعونية',
  'مجوهرات وحلي ملكية',
  'عطور وزيوت اللوتس',
  'برديات ولوحات أثرية',
  'أعمال نحاس وألباستر'
];
