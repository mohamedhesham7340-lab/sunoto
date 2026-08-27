import { Product, SiteSettings, QuoteRequest, DatabaseStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialProducts';

/**
 * 100% Server & Database Authoritative API Client
 * No client-side / local storage caching.
 * Everything communicates directly with the Express backend & Neon DB.
 */

export const api = {
  // 1. Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    if (!res.ok) {
      throw new Error(`فشل جلب المنتجات من السيرفر: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) {
      throw new Error(`فشل إضافة المنتج على السيرفر: ${res.statusText}`);
    }
    return await res.json();
  },

  async updateProduct(product: Product): Promise<Product> {
    const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) {
      throw new Error(`فشل تحديث المنتج على السيرفر: ${res.statusText}`);
    }
    return await res.json();
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error(`فشل حذف المنتج من السيرفر: ${res.statusText}`);
    }
    const data = await res.json();
    return !!data.success;
  },

  // 2. Settings
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) {
      throw new Error(`فشل جلب الإعدادات من السيرفر: ${res.statusText}`);
    }
    return await res.json();
  },

  async updateSettings(settings: SiteSettings): Promise<SiteSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      throw new Error(`فشل حفظ الإعدادات على السيرفر: ${res.statusText}`);
    }
    return await res.json();
  },

  // 3. Quotes
  async getQuotes(): Promise<QuoteRequest[]> {
    const res = await fetch('/api/quotes');
    if (!res.ok) {
      throw new Error(`فشل جلب عروض الأسعار: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async saveQuote(quote: Omit<QuoteRequest, 'id' | 'quoteNumber' | 'createdAt'>): Promise<QuoteRequest> {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });
    if (!res.ok) {
      throw new Error(`فشل حفظ عرض السعر على السيرفر: ${res.statusText}`);
    }
    return await res.json();
  },

  // 4. Database Diagnostics
  async getDbStatus(): Promise<DatabaseStatus> {
    const res = await fetch('/api/db-status');
    if (!res.ok) {
      throw new Error(`فشل فحص حالة قاعدة البيانات: ${res.statusText}`);
    }
    return await res.json();
  },

  async testDbConnection(connectionString: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/test-db-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionString })
    });
    return await res.json();
  },

  // 5. Reset / Seed
  async resetToDefaults(): Promise<void> {
    const res = await fetch('/api/seed', { method: 'POST' });
    if (!res.ok) {
      throw new Error('فشل استعادة البيانات الافتراضية على السيرفر');
    }
  }
};
