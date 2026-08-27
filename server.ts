import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import pg from 'pg';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './src/data/initialProducts';
import { Product, SiteSettings, QuoteRequest } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory fallback store
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memorySettings: SiteSettings = { ...INITIAL_SETTINGS };
let memoryQuotes: QuoteRequest[] = [];

// PostgreSQL / Neon Client Pool Setup
const dbConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
let pool: pg.Pool | null = null;

if (dbConnectionString) {
  try {
    pool = new pg.Pool({
      connectionString: dbConnectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('PostgreSQL / Neon connection pool initialized.');
    initDbTables();
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool:', err);
  }
}

async function initDbTables() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS pharaoh_products (
          id VARCHAR(100) PRIMARY KEY,
          item_code VARCHAR(100),
          name VARCHAR(255) NOT NULL,
          name_en VARCHAR(255),
          category VARCHAR(100) NOT NULL,
          price NUMERIC(12, 2) NOT NULL,
          original_price NUMERIC(12, 2),
          description TEXT,
          short_desc TEXT,
          images JSONB,
          material TEXT,
          dimensions VARCHAR(255),
          weight VARCHAR(100),
          min_quantity INTEGER DEFAULT 1,
          stock_status VARCHAR(50) DEFAULT 'in_stock',
          is_featured BOOLEAN DEFAULT false,
          wholesale_tiers JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS pharaoh_settings (
          key VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pharaoh_quotes (
          id VARCHAR(100) PRIMARY KEY,
          quote_number VARCHAR(100),
          client_name VARCHAR(255) NOT NULL,
          client_phone VARCHAR(100) NOT NULL,
          client_email VARCHAR(255),
          company_name VARCHAR(255),
          delivery_city VARCHAR(100),
          items JSONB NOT NULL,
          subtotal NUMERIC(12, 2) NOT NULL,
          discount NUMERIC(12, 2) DEFAULT 0,
          tax NUMERIC(12, 2) DEFAULT 0,
          total NUMERIC(12, 2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'EGP',
          notes TEXT,
          valid_until VARCHAR(100),
          status VARCHAR(50) DEFAULT 'sent_whatsapp',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS pharaoh_customers (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(100) NOT NULL,
          email VARCHAR(255),
          company VARCHAR(255),
          city VARCHAR(100),
          total_quotes INTEGER DEFAULT 1,
          last_inquiry TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Check if products exist, seed if empty
      const prodCountRes = await client.query('SELECT COUNT(*) FROM pharaoh_products');
      if (parseInt(prodCountRes.rows[0].count, 10) === 0) {
        for (const p of INITIAL_PRODUCTS) {
          await client.query(`
            INSERT INTO pharaoh_products (
              id, item_code, name, name_en, category, price, original_price,
              description, short_desc, images, material, dimensions, weight,
              min_quantity, stock_status, is_featured, wholesale_tiers, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (id) DO NOTHING
          `, [
            p.id, p.itemCode, p.name, p.nameEn || '', p.category, p.price, p.originalPrice || null,
            p.description, p.shortDesc, JSON.stringify(p.images), p.material, p.dimensions, p.weight,
            p.minQuantity, p.stockStatus, p.isFeatured, JSON.stringify(p.wholesaleTiers || []), p.createdAt
          ]);
        }
      }

      // Check settings
      const setRes = await client.query('SELECT data FROM pharaoh_settings WHERE key = $1', ['main_settings']);
      if (setRes.rows.length === 0) {
        await client.query('INSERT INTO pharaoh_settings (key, data) VALUES ($1, $2)', ['main_settings', JSON.stringify(INITIAL_SETTINGS)]);
      }

      console.log('Neon / PostgreSQL tables verified and initial products loaded successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating database schema:', error);
  }
}

// ----------------- API ROUTES ----------------- //

// Database Status & Diagnostics
app.get('/api/db-status', async (req, res) => {
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const prodCountRes = await client.query('SELECT COUNT(*) FROM pharaoh_products');
        const quoteCountRes = await client.query('SELECT COUNT(*) FROM pharaoh_quotes');
        res.json({
          connected: true,
          type: 'neon_postgres',
          message: 'متصل بنجاح بقاعدة بيانات Neon PostgreSQL على Vercel/Cloud',
          productCount: parseInt(prodCountRes.rows[0].count, 10),
          quoteCount: parseInt(quoteCountRes.rows[0].count, 10),
        });
      } finally {
        client.release();
      }
    } catch (err: any) {
      res.json({
        connected: false,
        type: 'memory',
        message: `تعذر الاتصال بـ Postgres: ${err.message || 'خطأ غير معروف'}. تم التحويل التلقائي للذاكرة والتخزين المحلي.`,
        productCount: memoryProducts.length
      });
    }
  } else {
    res.json({
      connected: false,
      type: 'local_storage',
      message: 'يعمل حالياً في وضع المعاينة والتخزين السريع. لتوصيل Neon على Vercel، أضف DATABASE_URL في متغيرات البيئة.',
      productCount: memoryProducts.length
    });
  }
});

// Test custom connection string
app.post('/api/test-db-connection', async (req, res) => {
  const { connectionString } = req.body;
  if (!connectionString) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال رابط اتصال Neon' });
  }

  try {
    const testPool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    const client = await testPool.connect();
    await client.query('SELECT 1');
    client.release();
    await testPool.end();

    res.json({ success: true, message: 'تم الاتصال بقاعدة بيانات Neon بنجاح! الرابط صالح ويعمل.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: `فشل الاتصال: ${err.message}` });
  }
});

// GET all products
app.get('/api/products', async (req, res) => {
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM pharaoh_products ORDER BY created_at DESC');
        const products: Product[] = result.rows.map(row => ({
          id: row.id,
          itemCode: row.item_code,
          name: row.name,
          nameEn: row.name_en,
          category: row.category,
          price: parseFloat(row.price),
          originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
          description: row.description,
          shortDesc: row.short_desc,
          images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images || [],
          material: row.material,
          dimensions: row.dimensions,
          weight: row.weight,
          minQuantity: row.min_quantity || 1,
          stockStatus: row.stock_status || 'in_stock',
          isFeatured: !!row.is_featured,
          wholesaleTiers: typeof row.wholesale_tiers === 'string' ? JSON.parse(row.wholesale_tiers) : row.wholesale_tiers || [],
          createdAt: row.created_at
        }));
        return res.json(products);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Database query error, falling back to memory:', err);
    }
  }
  res.json(memoryProducts);
});

// POST new product
app.post('/api/products', async (req, res) => {
  const newProduct: Product = {
    ...req.body,
    id: req.body.id || `ph-${Date.now().toString(36)}`,
    createdAt: req.body.createdAt || new Date().toISOString()
  };

  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          INSERT INTO pharaoh_products (
            id, item_code, name, name_en, category, price, original_price,
            description, short_desc, images, material, dimensions, weight,
            min_quantity, stock_status, is_featured, wholesale_tiers, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        `, [
          newProduct.id,
          newProduct.itemCode || `EGY-${Date.now().toString().slice(-4)}`,
          newProduct.name,
          newProduct.nameEn || '',
          newProduct.category,
          newProduct.price,
          newProduct.originalPrice || null,
          newProduct.description,
          newProduct.shortDesc,
          JSON.stringify(newProduct.images || []),
          newProduct.material,
          newProduct.dimensions,
          newProduct.weight,
          newProduct.minQuantity || 1,
          newProduct.stockStatus || 'in_stock',
          newProduct.isFeatured || false,
          JSON.stringify(newProduct.wholesaleTiers || []),
          newProduct.createdAt
        ]);
        return res.status(201).json(newProduct);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error inserting into database:', err);
    }
  }

  memoryProducts.unshift(newProduct);
  res.status(201).json(newProduct);
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData: Product = req.body;

  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          UPDATE pharaoh_products SET
            item_code = $2,
            name = $3,
            name_en = $4,
            category = $5,
            price = $6,
            original_price = $7,
            description = $8,
            short_desc = $9,
            images = $10,
            material = $11,
            dimensions = $12,
            weight = $13,
            min_quantity = $14,
            stock_status = $15,
            is_featured = $16,
            wholesale_tiers = $17
          WHERE id = $1
        `, [
          id,
          updatedData.itemCode,
          updatedData.name,
          updatedData.nameEn || '',
          updatedData.category,
          updatedData.price,
          updatedData.originalPrice || null,
          updatedData.description,
          updatedData.shortDesc,
          JSON.stringify(updatedData.images || []),
          updatedData.material,
          updatedData.dimensions,
          updatedData.weight,
          updatedData.minQuantity || 1,
          updatedData.stockStatus || 'in_stock',
          updatedData.isFeatured || false,
          JSON.stringify(updatedData.wholesaleTiers || [])
        ]);
        return res.json(updatedData);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error updating in database:', err);
    }
  }

  const idx = memoryProducts.findIndex(p => p.id === id);
  if (idx !== -1) {
    memoryProducts[idx] = { ...memoryProducts[idx], ...updatedData };
    res.json(memoryProducts[idx]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query('DELETE FROM pharaoh_products WHERE id = $1', [id]);
        return res.json({ success: true, id });
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error deleting from database:', err);
    }
  }

  memoryProducts = memoryProducts.filter(p => p.id !== id);
  res.json({ success: true, id });
});

// GET site settings
app.get('/api/settings', async (req, res) => {
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT data FROM pharaoh_settings WHERE key = $1', ['main_settings']);
        if (result.rows.length > 0) {
          const settings = result.rows[0].data;
          settings.databaseConnected = true;
          return res.json(settings);
        }
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error getting settings from DB:', err);
    }
  }
  res.json({ ...memorySettings, databaseConnected: !!pool });
});

// PUT update site settings
app.put('/api/settings', async (req, res) => {
  const newSettings: SiteSettings = req.body;
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          INSERT INTO pharaoh_settings (key, data)
          VALUES ('main_settings', $1)
          ON CONFLICT (key) DO UPDATE SET data = $1
        `, [JSON.stringify(newSettings)]);
        return res.json(newSettings);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error saving settings to DB:', err);
    }
  }
  memorySettings = { ...newSettings };
  res.json(memorySettings);
});

// GET quotes
app.get('/api/quotes', async (req, res) => {
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM pharaoh_quotes ORDER BY created_at DESC');
        const quotes: QuoteRequest[] = result.rows.map(r => ({
          id: r.id,
          quoteNumber: r.quote_number,
          clientName: r.client_name,
          clientPhone: r.client_phone,
          clientEmail: r.client_email,
          companyName: r.company_name,
          deliveryCity: r.delivery_city,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
          subtotal: parseFloat(r.subtotal),
          discount: parseFloat(r.discount || '0'),
          tax: parseFloat(r.tax || '0'),
          total: parseFloat(r.total),
          currency: r.currency || 'EGP',
          notes: r.notes || '',
          validUntil: r.valid_until,
          status: r.status,
          createdAt: r.created_at
        }));
        return res.json(quotes);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error loading quotes from DB:', err);
    }
  }
  res.json(memoryQuotes);
});

// POST new quote
app.post('/api/quotes', async (req, res) => {
  const quote: QuoteRequest = {
    ...req.body,
    id: req.body.id || `quote-${Date.now()}`,
    quoteNumber: req.body.quoteNumber || `PH-QT-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString()
  };

  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          INSERT INTO pharaoh_quotes (
            id, quote_number, client_name, client_phone, client_email,
            company_name, delivery_city, items, subtotal, discount, tax,
            total, currency, notes, valid_until, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
          quote.id, quote.quoteNumber, quote.clientName, quote.clientPhone, quote.clientEmail || '',
          quote.companyName || '', quote.deliveryCity || '', JSON.stringify(quote.items),
          quote.subtotal, quote.discount || 0, quote.tax || 0, quote.total, quote.currency,
          quote.notes || '', quote.validUntil || '', quote.status || 'sent_whatsapp', quote.createdAt
        ]);
        return res.status(201).json(quote);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error saving quote to DB:', err);
    }
  }

  memoryQuotes.unshift(quote);
  res.status(201).json(quote);
});

// POST reset to initial sample data
app.post('/api/seed', async (req, res) => {
  memoryProducts = [...INITIAL_PRODUCTS];
  memorySettings = { ...INITIAL_SETTINGS };

  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query('TRUNCATE pharaoh_products');
        for (const p of INITIAL_PRODUCTS) {
          await client.query(`
            INSERT INTO pharaoh_products (
              id, item_code, name, name_en, category, price, original_price,
              description, short_desc, images, material, dimensions, weight,
              min_quantity, stock_status, is_featured, wholesale_tiers, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          `, [
            p.id, p.itemCode, p.name, p.nameEn || '', p.category, p.price, p.originalPrice || null,
            p.description, p.shortDesc, JSON.stringify(p.images), p.material, p.dimensions, p.weight,
            p.minQuantity, p.stockStatus, p.isFeatured, JSON.stringify(p.wholesaleTiers || []), p.createdAt
          ]);
        }
        await client.query(`
          INSERT INTO pharaoh_settings (key, data)
          VALUES ('main_settings', $1)
          ON CONFLICT (key) DO UPDATE SET data = $1
        `, [JSON.stringify(INITIAL_SETTINGS)]);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error seeding DB:', err);
    }
  }

  res.json({ success: true, message: 'تمت استعادة البيانات الافتراضية بنجاح' });
});

// ----------------- VITE & STATIC HANDLING ----------------- //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pharaoh Luxury Quotation server running on http://localhost:${PORT}`);
  });
}

startServer();
