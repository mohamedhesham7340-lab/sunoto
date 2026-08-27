export interface Product {
  id: string;
  itemCode: string;
  name: string;
  nameEn?: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  shortDesc: string;
  images: string[];
  material: string;
  dimensions: string;
  weight: string;
  minQuantity: number;
  stockStatus: 'in_stock' | 'on_demand' | 'limited';
  isFeatured: boolean;
  wholesaleTiers?: { minQty: number; discountPercent: number }[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedOption?: string;
  customNotes?: string;
}

export interface QuoteRequest {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  companyName?: string;
  deliveryCity?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  notes: string;
  validUntil: string;
  status: 'draft' | 'sent_whatsapp' | 'approved' | 'fulfilled';
  createdAt: string;
}

export interface SiteSettings {
  storeName: string;
  storeTagline: string;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  commercialRecord?: string;
  taxId?: string;
  currency: 'EGP' | 'USD' | 'SAR' | 'AED';
  exchangeRates: {
    EGP: number;
    USD: number;
    SAR: number;
    AED: number;
  };
  taxRate: number;
  defaultQuoteValidityDays: number;
  quoteTerms: string[];
  logoUrl?: string;
  databaseConnected?: boolean;
}

export interface DatabaseStatus {
  connected: boolean;
  type: 'neon_postgres' | 'local_storage' | 'memory';
  message: string;
  productCount?: number;
  quoteCount?: number;
}
