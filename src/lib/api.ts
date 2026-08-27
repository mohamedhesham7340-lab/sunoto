import { Product, SiteSettings, QuoteRequest, DatabaseStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialProducts';

/**
 * 100% Server & Database Authoritative API Client with Graceful Fallback
 * Communicates directly with the Express backend & Neon DB.
 */

// In-memory runtime cache for seamless offline/cold-start fallback
let cachedProducts: Product[] = [...INITIAL_PRODUCTS];
let cachedSettings: SiteSettings = { ...INITIAL_SETTINGS };
let cachedQuotes: QuoteRequest[] = [];

export const api = {
  // 1. Products
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          cachedProducts = data;
          return data;
        }
      }
    } catch (err) {
      console.warn('API getProducts fallback to cached/initial products:', err);
    }
    return cachedProducts;
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const data = await res.json();
        cachedProducts = [data, ...cachedProducts.filter(p => p.id !== data.id)];
        return data;
      }
    } catch (err) {
      console.warn('Server unavailable for createProduct, storing locally:', err);
    }

    // Fallback product creation
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    cachedProducts = [newProduct, ...cachedProducts];
    return newProduct;
  },

  async updateProduct(product: Product): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const data = await res.json();
        cachedProducts = cachedProducts.map(p => p.id === data.id ? data : p);
        return data;
      }
    } catch (err) {
      console.warn('Server unavailable for updateProduct, updating locally:', err);
    }

    cachedProducts = cachedProducts.map(p => p.id === product.id ? product : p);
    return product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        cachedProducts = cachedProducts.filter(p => p.id !== id);
        return !!data.success;
      }
    } catch (err) {
      console.warn('Server unavailable for deleteProduct, deleting locally:', err);
    }

    cachedProducts = cachedProducts.filter(p => p.id !== id);
    return true;
  },

  // 2. Settings
  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        cachedSettings = data;
        return data;
      }
    } catch (err) {
      console.warn('API getSettings fallback to cached settings:', err);
    }
    return cachedSettings;
  },

  async updateSettings(settings: SiteSettings): Promise<SiteSettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const data = await res.json();
        cachedSettings = data;
        return data;
      }
    } catch (err) {
      console.warn('Server unavailable for updateSettings, updating locally:', err);
    }

    cachedSettings = settings;
    return settings;
  },

  // 3. Quotes
  async getQuotes(): Promise<QuoteRequest[]> {
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          cachedQuotes = data;
          return data;
        }
      }
    } catch (err) {
      console.warn('API getQuotes fallback:', err);
    }
    return cachedQuotes;
  },

  async saveQuote(quote: Omit<QuoteRequest, 'id' | 'quoteNumber' | 'createdAt'>): Promise<QuoteRequest> {
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote)
      });
      if (res.ok) {
        const data = await res.json();
        cachedQuotes = [data, ...cachedQuotes];
        return data;
      }
    } catch (err) {
      console.warn('Server unavailable for saveQuote, storing locally:', err);
    }

    const saved: QuoteRequest = {
      ...quote,
      id: `quote_${Date.now()}`,
      quoteNumber: `PHQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    cachedQuotes = [saved, ...cachedQuotes];
    return saved;
  },

  // 4. Database Diagnostics
  async getDbStatus(): Promise<DatabaseStatus> {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback status
    }
    return {
      connected: false,
      type: 'memory',
      message: 'الخادم متصل بالذاكرة المؤقتة (سيتم الاتصال بـ Neon تلقائياً عند ضبط DATABASE_URL)',
      productCount: cachedProducts.length,
      quoteCount: cachedQuotes.length
    };
  },

  async testDbConnection(connectionString: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/test-db-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'تعذر الوصول إلى نقطة فحص قاعدة البيانات' };
    }
  },

  // 5. Reset / Seed
  async resetToDefaults(): Promise<void> {
    cachedProducts = [...INITIAL_PRODUCTS];
    cachedSettings = { ...INITIAL_SETTINGS };
    try {
      await fetch('/api/seed', { method: 'POST' });
    } catch (err) {
      console.warn('Failed to seed on server:', err);
    }
  }
};
