import { Product, SiteSettings, QuoteRequest, DatabaseStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialProducts';

const STORAGE_KEYS = {
  PRODUCTS: 'pharaoh_products_v1',
  SETTINGS: 'pharaoh_settings_v1',
  QUOTES: 'pharaoh_quotes_v1'
};

// Helper for local storage fallback
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

export const api = {
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocal(STORAGE_KEYS.PRODUCTS, data);
          return data;
        }
      }
    } catch (err) {
      console.warn('API fetch products failed, using local storage:', err);
    }
    return getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: `ph-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        setLocal(STORAGE_KEYS.PRODUCTS, [saved, ...current.filter(p => p.id !== saved.id)]);
        return saved;
      }
    } catch (err) {
      console.warn('API save product failed, saving locally:', err);
    }

    const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const updated = [newProduct, ...current];
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
    return newProduct;
  },

  async updateProduct(product: Product): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const updated = current.map(p => p.id === saved.id ? saved : p);
        setLocal(STORAGE_KEYS.PRODUCTS, updated);
        return saved;
      }
    } catch (err) {
      console.warn('API update product failed, updating locally:', err);
    }

    const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const updated = current.map(p => p.id === product.id ? product : p);
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
    return product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        setLocal(STORAGE_KEYS.PRODUCTS, current.filter(p => p.id !== id));
        return true;
      }
    } catch (err) {
      console.warn('API delete product failed, deleting locally:', err);
    }

    const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setLocal(STORAGE_KEYS.PRODUCTS, current.filter(p => p.id !== id));
    return true;
  },

  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.SETTINGS, data);
        return data;
      }
    } catch (err) {
      console.warn('API fetch settings failed, using local storage:', err);
    }
    return getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateSettings(settings: SiteSettings): Promise<SiteSettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const saved = await res.json();
        setLocal(STORAGE_KEYS.SETTINGS, saved);
        return saved;
      }
    } catch (err) {
      console.warn('API update settings failed, updating locally:', err);
    }

    setLocal(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  async getQuotes(): Promise<QuoteRequest[]> {
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.QUOTES, data);
        return data;
      }
    } catch (err) {
      console.warn('API fetch quotes failed:', err);
    }
    return getLocal<QuoteRequest[]>(STORAGE_KEYS.QUOTES, []);
  },

  async saveQuote(quote: Omit<QuoteRequest, 'id' | 'quoteNumber' | 'createdAt'>): Promise<QuoteRequest> {
    const fullQuote: QuoteRequest = {
      ...quote,
      id: `quote-${Date.now()}`,
      quoteNumber: `PH-QT-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullQuote)
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<QuoteRequest[]>(STORAGE_KEYS.QUOTES, []);
        setLocal(STORAGE_KEYS.QUOTES, [saved, ...current]);
        return saved;
      }
    } catch (err) {
      console.warn('API save quote failed, saving locally:', err);
    }

    const current = getLocal<QuoteRequest[]>(STORAGE_KEYS.QUOTES, []);
    setLocal(STORAGE_KEYS.QUOTES, [fullQuote, ...current]);
    return fullQuote;
  },

  async getDbStatus(): Promise<DatabaseStatus> {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return {
      connected: false,
      type: 'local_storage',
      message: 'يعمل بالتخزين المحلي السريع في المتصفح'
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
      return { success: false, message: `فشل الاتصال: ${err.message}` };
    }
  },

  async resetToDefaults(): Promise<void> {
    try {
      await fetch('/api/seed', { method: 'POST' });
    } catch {
      // ignore
    }
    setLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
};
