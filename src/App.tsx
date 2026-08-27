import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QuoteDrawer } from './components/QuoteDrawer';
import { PharaonicPdfQuotation } from './components/PharaonicPdfQuotation';
import { AdminDashboard } from './components/AdminDashboard';
import { VercelGuideView } from './components/VercelGuideView';
import { WhatsAppFloatingWidget } from './components/WhatsAppFloatingWidget';
import { api } from './lib/api';
import { Product, SiteSettings, CartItem, QuoteRequest, DatabaseStatus } from './types';
import { INITIAL_SETTINGS } from './data/initialProducts';
import { CurrencyCode } from './lib/currency';
import { Sparkles, Phone, MessageSquare, ShieldCheck, Heart, ArrowUp, RefreshCw } from 'lucide-react';

export default function App() {
  // Main Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: false,
    type: 'local_storage',
    message: 'جاري الاتصال بالسيرفر...'
  });
  const [isLoading, setIsLoading] = useState(true);

  // UI Navigation & Filters
  const [activeTab, setActiveTab] = useState<'catalog' | 'admin' | 'guide'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [currency, setCurrency] = useState<CurrencyCode>('EGP');

  // Modals & Drawers
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [activePdfQuote, setActivePdfQuote] = useState<QuoteRequest | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart / Quotation Builder
  const [cart, setCart] = useState<CartItem[]>([]);

  // Function to sync all data directly from server
  const syncServerData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [fetchedProducts, fetchedSettings, fetchedQuotes, fetchedDb] = await Promise.all([
        api.getProducts(),
        api.getSettings(),
        api.getQuotes(),
        api.getDbStatus()
      ]);
      setProducts(fetchedProducts);
      setSettings(fetchedSettings);
      setQuotes(fetchedQuotes);
      setDbStatus(fetchedDb);

      // Keep detail modal in sync if a product is currently viewed
      setSelectedDetailProduct(prev => {
        if (!prev) return null;
        return fetchedProducts.find(p => p.id === prev.id) || null;
      });

      // Keep cart prices in sync with latest product prices
      setCart(prevCart => {
        return prevCart.map(item => {
          const freshProd = fetchedProducts.find(p => p.id === item.productId);
          return freshProd ? { ...item, product: freshProd } : item;
        });
      });

      return { fetchedProducts, fetchedSettings, fetchedQuotes, fetchedDb };
    } catch (err) {
      console.error('Error syncing server data:', err);
      return null;
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Initial Data Fetch & Periodic Live Sync
  useEffect(() => {
    syncServerData(true).then(res => {
      if (res && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product');
        if (productId) {
          const foundProduct = res.fetchedProducts.find(p => p.id === productId || p.itemCode === productId);
          if (foundProduct) {
            setSelectedDetailProduct(foundProduct);
          }
        }
      }
    });

    // Sync on tab focus or visibility change
    const onFocus = () => {
      syncServerData(false);
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onFocus);

    // Live background polling every 4 seconds to sync across multiple tabs/devices
    const timer = setInterval(() => {
      syncServerData(false);
    }, 4000);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onFocus);
      clearInterval(timer);
    };
  }, []);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1, customNotes?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity, customNotes: customNotes || item.customNotes }
            : item
        );
      }
      return [...prev, { productId: product.id, product, quantity, customNotes }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => item.productId === productId ? { ...item, quantity } : item)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Product Admin Operations (100% Server Driven)
  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const created = await api.createProduct(productData);
    await syncServerData(false);
    return created;
  };

  const handleUpdateProduct = async (updatedProduct: Product): Promise<Product> => {
    const saved = await api.updateProduct(updatedProduct);
    await syncServerData(false);
    return saved;
  };

  const handleDeleteProduct = async (id: string): Promise<boolean> => {
    const success = await api.deleteProduct(id);
    await syncServerData(false);
    return success;
  };

  // Settings Admin Operations
  const handleUpdateSettings = async (newSettings: SiteSettings): Promise<SiteSettings> => {
    const saved = await api.updateSettings(newSettings);
    await syncServerData(false);
    return saved;
  };

  // Quote Save Handler
  const handleSaveQuote = async (quoteData: Omit<QuoteRequest, 'id' | 'quoteNumber' | 'createdAt'>): Promise<QuoteRequest> => {
    const saved = await api.saveQuote(quoteData);
    await syncServerData(false);
    return saved;
  };

  // Reset to sample defaults
  const handleResetDefaults = async () => {
    await api.resetToDefaults();
    await syncServerData(true);
  };

  // Filtered Products for Catalog
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.material && product.material.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'الكل' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e0d6c3] flex flex-col font-cairo selection:bg-[#d4af37] selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        cartCount={totalCartCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCart={() => setIsCartOpen(true)}
        currency={currency}
        setCurrency={setCurrency}
        dbConnected={dbStatus.connected}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* TAB 1: Shopping & Quotation Catalog */}
        {activeTab === 'catalog' && (
          <div>
            {/* Hero & Search Banner */}
            <HeroBanner
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              totalProducts={products.length}
              openCart={() => setIsCartOpen(true)}
            />

            {/* Products Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-pharaoh gold-gradient-text">
                    {selectedCategory === 'الكل' ? 'كافة المعروضات والتحف المتاحة للتسعير' : selectedCategory}
                  </h2>
                  <p className="text-xs text-[#8f8572] mt-0.5">
                    عرض {filteredProducts.length} من أصل {products.length} منتج متاح للتوريد الفوري والتصنيع حسب الطلب
                  </p>
                </div>

                {/* Direct Quote Cart Summary Button if items in cart */}
                {cart.length > 0 && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#f3e0a2] border border-[#d4af37]/50 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                    <span>لديك {totalCartCount} قطع في سلة عرض السعر - استعراض العرض</span>
                  </button>
                )}
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-[#d4af37] animate-spin" />
                  <span className="text-sm font-bold font-pharaoh text-[#f7e4a8]">جاري تحميل قائمة الأسعار والمنتجات الملكية...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center bg-[#12141f] rounded-3xl border border-[#d4af37]/20 p-8 space-y-3">
                  <div className="text-4xl text-[#d4af37]/40">𓋹</div>
                  <h3 className="text-base font-bold text-[#f7e4a8] font-pharaoh">لم يتم العثور على منتجات مطابقة للبحث</h3>
                  <p className="text-xs text-[#8c826e]">
                    جرب البحث بكلمات أخرى أو اختر تصنيف "الكل" لعرض كافة المنتجات.
                  </p>
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedCategory('الكل'); }}
                    className="bg-[#d4af37] text-black font-bold text-xs px-4 py-2 rounded-xl mt-2"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      settings={settings}
                      currency={currency}
                      onOpenDetail={(p) => setSelectedDetailProduct(p)}
                      onAddToCart={(p, qty) => handleAddToCart(p, qty || 1)}
                      isInCart={cart.some(item => item.productId === product.id)}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboard
            products={products}
            settings={settings}
            quotes={quotes}
            dbStatus={dbStatus}
            currency={currency}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateSettings={handleUpdateSettings}
            onTestDb={(conn) => api.testDbConnection(conn)}
            onResetDefaults={handleResetDefaults}
            onOpenPdf={(q) => setActivePdfQuote(q)}
            onBackToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {/* TAB 3: Vercel & Neon Guide */}
        {activeTab === 'guide' && (
          <VercelGuideView />
        )}

      </main>

      {/* Product Detail Modal */}
      {selectedDetailProduct && (
        <ProductDetailModal
          product={selectedDetailProduct}
          settings={settings}
          currency={currency}
          onClose={() => setSelectedDetailProduct(null)}
          onAddToCart={(p, qty, notes) => handleAddToCart(p, qty, notes)}
        />
      )}

      {/* Quote Builder Drawer */}
      <QuoteDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        settings={settings}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onGeneratePdf={(q) => {
          setIsCartOpen(false);
          setActivePdfQuote(q);
        }}
        onSaveQuote={handleSaveQuote}
      />

      {/* Official Pharaonic PDF Printable Sheet */}
      {activePdfQuote && (
        <PharaonicPdfQuotation
          quote={activePdfQuote}
          settings={settings}
          currency={currency}
          onClose={() => setActivePdfQuote(null)}
        />
      )}

      {/* Footer */}
      <footer className="no-print bg-[#08090d] border-t border-[#d4af37]/25 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-[#a39884]">
            
            {/* Brand Column */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl text-[#d4af37] font-bold">𓋹</span>
                <span className="text-lg font-black font-pharaoh gold-gradient-text">
                  {settings.storeName || 'الفرعون الذهبي'}
                </span>
              </div>
              <p className="text-xs text-[#8f8573] leading-relaxed max-w-md">
                {settings.storeTagline || 'منصة متخصصة في توريد وعروض أسعار التحف والنوادر الفرعونية والمقتنيات التراثية للمصانع والمؤسسات والأفراد.'}
              </p>
              <div className="pt-2 text-[11px] text-[#736958]">
                {settings.commercialRecord} {settings.taxId && `| ${settings.taxId}`}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#f7e4a8] text-xs uppercase tracking-wider">روابط سريعة</h4>
              <ul className="space-y-1.5 text-[#b5aa96]">
                <li>
                  <button onClick={() => setActiveTab('catalog')} className="hover:text-[#d4af37] transition-colors">
                    🏛️ كتالوج المعروضات والأسعار
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsCartOpen(true)} className="hover:text-[#d4af37] transition-colors">
                    📜 سلة عرض السعر والتسعير الفوري
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('admin')} className="hover:text-[#d4af37] transition-colors">
                    🛡️ لوحة التحكم وإدارة المنتجات
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('guide')} className="hover:text-[#d4af37] transition-colors">
                    ⚡ دليل الرفع على Vercel و Neon
                  </button>
                </li>
              </ul>
            </div>

            {/* Direct Contact */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#f7e4a8] text-xs uppercase tracking-wider">التواصل والتوريدات</h4>
              <div className="space-y-1 text-[#b5aa96]">
                <div>📍 {settings.address}</div>
                <div>📞 <span dir="ltr">{settings.phoneNumber}</span></div>
                <div>✉️ {settings.email}</div>
              </div>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black px-3 py-1.5 rounded-lg font-bold transition-all border border-[#25D366]/40"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>محادثة واتساب مباشرة</span>
                </a>
              </div>
            </div>

          </div>

          <div className="border-t border-[#d4af37]/15 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6e6452] gap-2">
            <div>
              جميع الحقوق محفوظة © {new Date().getFullYear()} - {settings.storeName}
            </div>
            <div className="flex items-center gap-1 text-[#a89d89]">
              <span>مصمم بالستايل الفرعوني الملكي الفاخر</span>
              <Sparkles className="w-3 h-3 text-[#d4af37]" />
            </div>
          </div>

        </div>
      </footer>

      {/* Royal Floating WhatsApp Widget */}
      <WhatsAppFloatingWidget
        settings={settings}
        currentProduct={selectedDetailProduct}
      />

    </div>
  );
}
