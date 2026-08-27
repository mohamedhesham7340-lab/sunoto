import React, { useState } from 'react';
import { 
  Package, Settings, Database, FileText, Plus, Edit2, Trash2, Check, 
  Sparkles, AlertCircle, RefreshCw, Upload, Download, ExternalLink, 
  Layers, Phone, Save, Search, ArrowRight, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { Product, SiteSettings, QuoteRequest, DatabaseStatus } from '../types';
import { CurrencyCode, formatPrice } from '../lib/currency';
import { CATEGORIES } from '../data/initialProducts';

interface AdminDashboardProps {
  products: Product[];
  settings: SiteSettings;
  quotes: QuoteRequest[];
  dbStatus: DatabaseStatus;
  currency: CurrencyCode;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  onUpdateProduct: (product: Product) => Promise<Product>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onUpdateSettings: (settings: SiteSettings) => Promise<SiteSettings>;
  onTestDb: (connStr: string) => Promise<{ success: boolean; message: string }>;
  onResetDefaults: () => Promise<void>;
  onOpenPdf: (quote: QuoteRequest) => void;
  onBackToCatalog: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  settings,
  quotes,
  dbStatus,
  currency,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateSettings,
  onTestDb,
  onResetDefaults,
  onOpenPdf,
  onBackToCatalog
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'database' | 'quotes'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSaveError, setProductSaveError] = useState<string | null>(null);

  // Form State for Product
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[1]);
  const [formPrice, setFormPrice] = useState<number>(1000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | undefined>(undefined);
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formMaterial, setFormMaterial] = useState('');
  const [formDimensions, setFormDimensions] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formMinQty, setFormMinQty] = useState(1);
  const [formStockStatus, setFormStockStatus] = useState<'in_stock' | 'on_demand' | 'limited'>('in_stock');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formWholesaleTiers, setFormWholesaleTiers] = useState<{ minQty: number; discountPercent: number }[]>([
    { minQty: 5, discountPercent: 10 },
    { minQty: 20, discountPercent: 20 }
  ]);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({ ...settings });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // DB Test State
  const [testConnStr, setTestConnStr] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  // Open Add Product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductSaveError(null);
    setFormName('');
    setFormNameEn('');
    setFormCode(`EGY-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategory(CATEGORIES[1]);
    setFormPrice(1200);
    setFormOriginalPrice(undefined);
    setFormShortDesc('');
    setFormDesc('');
    setFormImageUrl('https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=800&q=80');
    setFormMaterial('نحاس مطلي بماء الذهب عيار 24');
    setFormDimensions('الارتفاع 25 سم × العرض 15 سم');
    setFormWeight('1.5 كجم');
    setFormMinQty(1);
    setFormStockStatus('in_stock');
    setFormIsFeatured(false);
    setFormWholesaleTiers([
      { minQty: 5, discountPercent: 10 },
      { minQty: 15, discountPercent: 20 }
    ]);
    setIsProductModalOpen(true);
  };

  // Open Edit Product
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setProductSaveError(null);
    setFormName(p.name);
    setFormNameEn(p.nameEn || '');
    setFormCode(p.itemCode);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice);
    setFormShortDesc(p.shortDesc);
    setFormDesc(p.description);
    setFormImageUrl(p.images?.[0] || '');
    setFormMaterial(p.material);
    setFormDimensions(p.dimensions);
    setFormWeight(p.weight);
    setFormMinQty(p.minQuantity || 1);
    setFormStockStatus(p.stockStatus);
    setFormIsFeatured(p.isFeatured);
    setFormWholesaleTiers(p.wholesaleTiers || []);
    setIsProductModalOpen(true);
  };

  // Submit Product Add / Edit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setProductSaveError('يرجى إدخال اسم المنتج باللغة العربية');
      return;
    }

    setIsSavingProduct(true);
    setProductSaveError(null);

    try {
      const payload = {
        name: formName.trim(),
        nameEn: formNameEn.trim(),
        itemCode: formCode.trim() || `EGY-${Math.floor(100 + Math.random() * 900)}`,
        category: formCategory,
        price: Number(formPrice) || 1,
        originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        shortDesc: formShortDesc,
        description: formDesc,
        images: [formImageUrl || 'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=800&q=80'],
        material: formMaterial,
        dimensions: formDimensions,
        weight: formWeight,
        minQuantity: Number(formMinQty) || 1,
        stockStatus: formStockStatus,
        isFeatured: formIsFeatured,
        wholesaleTiers: formWholesaleTiers
      };

      if (editingProduct) {
        await onUpdateProduct({ ...editingProduct, ...payload });
      } else {
        await onAddProduct(payload);
      }

      setIsProductModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setProductSaveError(err.message || 'حدث خطأ أثناء حفظ المنتج على السيرفر');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings(settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 2500);
  };

  // Test Neon DB connection
  const handleTestNeon = async () => {
    if (!testConnStr.trim()) {
      alert('يرجى لصق رابط اتصال Neon (DATABASE_URL)');
      return;
    }
    setIsTestingDb(true);
    setTestResult(null);
    try {
      const res = await onTestDb(testConnStr);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'فشل الاتصال' });
    } finally {
      setIsTestingDb(false);
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      products,
      settings,
      quotes,
      exportedAt: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pharaoh-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1A1A] p-5 rounded border-2 border-[#D4AF37] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-pharaoh text-[#D4AF37]">𓋹</span>
            <h1 className="text-xl sm:text-2xl font-black font-pharaoh text-[#D4AF37]">
              لوحة التحكم والإدارة الملكية
            </h1>
          </div>
          <p className="text-xs text-[#C5BBAF]">
            تحكم كامل في قائمة المنتجات، الأسعار، الصور، عروض الأسعار، وتكامل قاعدة بيانات Neon على Vercel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToCatalog}
            className="flex items-center gap-1.5 bg-[#2D241E] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] text-xs sm:text-sm font-bold px-4 py-2.5 rounded border border-[#D4AF37] transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لكتالوج المنتجات</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-[#D4AF37]/30 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs sm:text-sm uppercase tracking-wider font-extrabold transition-all ${
            activeTab === 'products'
              ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-md border border-[#D4AF37]'
              : 'bg-[#1A1A1A] text-[#C5BBAF] hover:text-[#D4AF37] border border-[#D4AF37]/30'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>إدارة المنتجات والأسعار ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs sm:text-sm uppercase tracking-wider font-extrabold transition-all ${
            activeTab === 'settings'
              ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-md border border-[#D4AF37]'
              : 'bg-[#1A1A1A] text-[#C5BBAF] hover:text-[#D4AF37] border border-[#D4AF37]/30'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>بيانات المتجر وعرض السعر</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs sm:text-sm uppercase tracking-wider font-extrabold transition-all ${
            activeTab === 'database'
              ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-md border border-[#D4AF37]'
              : 'bg-[#1A1A1A] text-[#C5BBAF] hover:text-[#D4AF37] border border-[#D4AF37]/30'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>قاعدة بيانات Neon & Vercel</span>
          {dbStatus.connected ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs sm:text-sm uppercase tracking-wider font-extrabold transition-all ${
            activeTab === 'quotes'
              ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-md border border-[#D4AF37]'
              : 'bg-[#1A1A1A] text-[#C5BBAF] hover:text-[#D4AF37] border border-[#D4AF37]/30'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>سجل عروض الأسعار المستلمة ({quotes.length})</span>
        </button>
      </div>

      {/* ==================== TAB 1: PRODUCTS MANAGER ==================== */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Action Row & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1A1A1A] p-4 rounded border border-[#D4AF37]/40">
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في المنتجات..."
                className="w-full bg-[#2D241E] text-xs text-[#FDFBF7] pr-9 pl-3 py-2.5 rounded border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <button
              id="admin-add-product-btn"
              onClick={handleOpenAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1A1A1A] font-extrabold text-xs sm:text-sm uppercase tracking-wider px-5 py-2.5 rounded shadow-lg transition-all active:scale-95 border border-[#D4AF37]"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج فرعوني جديد</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-[#1A1A1A] rounded border-2 border-[#D4AF37] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-[#2D241E] text-[#D4AF37] border-b-2 border-[#D4AF37]">
                    <th className="p-3.5">المنتج والصورة</th>
                    <th className="p-3.5">الكود والتصنيف</th>
                    <th className="p-3.5">السعر الأساسي</th>
                    <th className="p-3.5">الخامة والأبعاد</th>
                    <th className="p-3.5 text-center">الحالة</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/20 text-[#FDFBF7]">
                  {filteredProducts.map((product) => {
                    const img = product.images?.[0] || 'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=100&q=80';
                    return (
                      <tr key={product.id} className="hover:bg-[#2D241E] transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={img}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover border border-[#D4AF37] bg-white shrink-0"
                            />
                            <div>
                              <div className="font-bold text-sm text-[#FDFBF7] line-clamp-1">{product.name}</div>
                              {product.isFeatured && (
                                <span className="text-[10px] text-[#D4AF37] font-semibold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> مميز في واجهة الموقع
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-mono text-[#d4af37] font-bold text-xs">{product.itemCode}</div>
                          <div className="text-[11px] text-[#8e8574]">{product.category}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-black text-sm text-[#f3e0a2] font-pharaoh">
                            {formatPrice(product.price, currency, settings.exchangeRates)}
                          </div>
                          {product.originalPrice && (
                            <div className="text-[10px] text-[#736957] line-through">
                              {formatPrice(product.originalPrice, currency, settings.exchangeRates)}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 text-[11px]">
                          <div>{product.material || '-'}</div>
                          <div className="text-[#807664]">{product.dimensions || ''}</div>
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            product.stockStatus === 'in_stock'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : product.stockStatus === 'on_demand'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                          }`}>
                            {product.stockStatus === 'in_stock' ? 'جاهز للتوريد' : product.stockStatus === 'on_demand' ? 'حسب الطلب' : 'محدود'}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-2 rounded-lg bg-[#202438] hover:bg-[#d4af37] text-[#d6cbbb] hover:text-black transition-all"
                              title="تعديل السعر والبيانات"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف المنتج: ${product.name}؟`)) {
                                  onDeleteProduct(product.id);
                                }
                              }}
                              className="p-2 rounded-lg bg-[#202438] hover:bg-red-600 text-[#d6cbbb] hover:text-white transition-all"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 2: STORE SETTINGS ==================== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-[#12141f] p-6 rounded-2xl border border-[#d4af37]/30 space-y-6">
          
          <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
            <div>
              <h2 className="text-lg font-black font-pharaoh gold-gradient-text">
                إعدادات المتجر وبيانات عروض الأسعار
              </h2>
              <p className="text-xs text-[#9e9480]">
                هذه البيانات تظهر في رأس وتذييل عروض الأسعار الرسمية PDF ورسائل الواتساب
              </p>
            </div>
            
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-[#d4af37] to-[#b38f29] hover:from-[#e5c158] hover:to-[#d4af37] text-black font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>

          {settingsSavedMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم حفظ الإعدادات بنجاح ومزامنتها مع الموقع!</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div>
              <label className="text-[#8e8574] font-bold block mb-1">اسم المؤسسة / المصنع</label>
              <input
                type="text"
                value={settingsForm.storeName}
                onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#8e8574] font-bold block mb-1">الوصف المختصر (Tagline)</label>
              <input
                type="text"
                value={settingsForm.storeTagline}
                onChange={(e) => setSettingsForm({ ...settingsForm, storeTagline: e.target.value })}
                className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#8e8574] font-bold block mb-1">رقم الواتساب لاستقبال عروض الأسعار (مع كود الدولة مثل 2010...)</label>
              <input
                type="text"
                value={settingsForm.whatsappNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[#8e8574] font-bold block mb-1">رقم الهاتف الظاهر للعملاء</label>
              <input
                type="text"
                value={settingsForm.phoneNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })}
                className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[#8e8574] font-bold block mb-1">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={settingsForm.email}
                onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#8e8574] font-bold block mb-1">العنوان والموقع الجغرافي للمصنع</label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#8e8574] font-bold block mb-1">السجل التجاري (Commercial Record)</label>
              <input
                type="text"
                value={settingsForm.commercialRecord || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, commercialRecord: e.target.value })}
                placeholder="س.ت: 184920"
                className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#8e8574] font-bold block mb-1">البطاقة الضريبية (Tax ID)</label>
              <input
                type="text"
                value={settingsForm.taxId || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, taxId: e.target.value })}
                placeholder="ب.ض: 492-381-092"
                className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#8e8574] font-bold block mb-1">مدة صلاحية عرض السعر الافتراضية (بالأيام)</label>
              <input
                type="number"
                value={settingsForm.defaultQuoteValidityDays}
                onChange={(e) => setSettingsForm({ ...settingsForm, defaultQuoteValidityDays: parseInt(e.target.value) || 15 })}
                className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[#8e8574] font-bold block mb-1">نسبة ضريبة القيمة المضافة % (0 إذا غير مفعلة)</label>
              <input
                type="number"
                value={settingsForm.taxRate}
                onChange={(e) => setSettingsForm({ ...settingsForm, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none font-mono"
              />
            </div>

          </div>

          {/* Terms Editor */}
          <div className="space-y-2 pt-2 border-t border-[#d4af37]/20">
            <label className="text-xs font-bold text-[#d4af37] block">
              شروط وأحكام التوريد والتعاقد في عرض السعر الرسمي PDF (شرط في كل سطر):
            </label>
            <textarea
              rows={4}
              value={settingsForm.quoteTerms?.join('\n') || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, quoteTerms: e.target.value.split('\n').filter(t => t.trim()) })}
              className="w-full bg-[#1b1e2e] text-[#f7e4a8] text-xs p-3 rounded-xl border border-[#d4af37]/20 focus:border-[#d4af37] focus:outline-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38f29] text-black font-extrabold text-sm shadow-lg transition-all"
          >
            حفظ كافة التعديلات والإعدادات
          </button>

        </form>
      )}

      {/* ==================== TAB 3: NEON DATABASE & VERCEL GUIDE ==================== */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          
          {/* Status Card */}
          <div className="bg-[#12141f] p-6 rounded-2xl border border-[#d4af37]/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold font-pharaoh text-[#f3e0a2]">حالة اتصال قاعدة البيانات (Neon PostgreSQL):</h3>
                <p className="text-xs text-[#9e9480] mt-0.5">{dbStatus.message}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  dbStatus.connected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span>{dbStatus.connected ? 'Neon متصل بالكامل 🟢' : 'الوضع المحلي الآمن 🟡'}</span>
                </span>
              </div>
            </div>

            {/* Test Connection Box */}
            <div className="bg-[#191c2b] p-4 rounded-xl border border-[#d4af37]/20 space-y-3">
              <label className="text-xs font-bold text-[#d4af37] block">
                اختبار رابط اتصال Neon PostgreSQL قبل النشر:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={testConnStr}
                  onChange={(e) => setTestConnStr(e.target.value)}
                  placeholder="postgresql://user:pass@ep-cool-12345.neon.tech/neondb?sslmode=require"
                  className="flex-1 bg-[#10121c] text-[#f7e4a8] text-xs p-2.5 rounded-xl border border-[#d4af37]/30 focus:border-[#d4af37] focus:outline-none font-mono"
                />
                <button
                  onClick={handleTestNeon}
                  disabled={isTestingDb}
                  className="bg-[#2a2f47] hover:bg-[#d4af37] text-[#e8d5a3] hover:text-black font-bold text-xs px-4 py-2.5 rounded-xl border border-[#d4af37]/30 transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  {isTestingDb ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>اختبار الرابط</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-950/60 text-red-300 border border-red-500/40'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Backup & Factory Reset Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#d4af37]/15">
              <button
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2 bg-[#191c2b] hover:bg-[#25293d] text-[#e8d5a3] text-xs font-bold p-3 rounded-xl border border-[#d4af37]/25 transition-all"
              >
                <Download className="w-4 h-4 text-[#d4af37]" />
                <span>تنزيل نسخة احتياطية للمنتجات (JSON Backup)</span>
              </button>

              <button
                onClick={async () => {
                  if (confirm('هل أنت متأكد من استعادة بيانات وعروض الأسعار الافتراضية؟ سيتم إعادة تحميل الأصناف الأصلية.')) {
                    await onResetDefaults();
                    alert('تمت استعادة البيانات الافتراضية بنجاح!');
                  }
                }}
                className="flex items-center justify-center gap-2 bg-[#2a1b1b] hover:bg-red-900/40 text-red-300 text-xs font-bold p-3 rounded-xl border border-red-500/30 transition-all"
              >
                <RefreshCw className="w-4 h-4 text-red-400" />
                <span>استعادة المنتجات والأسعار الافتراضية الأصلية</span>
              </button>
            </div>

          </div>

          {/* Simple Beginner Guide for Vercel + Neon */}
          <div className="bg-[#151724] p-6 rounded-2xl border border-[#d4af37]/30 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              <h3 className="text-base sm:text-lg font-black font-pharaoh text-[#f7e4a8]">
                دليل رفع الموقع على Vercel وربط Neon في 3 دقائق بدون أي تعقيد:
              </h3>
            </div>

            <p className="text-xs text-[#b8ad96] leading-relaxed">
              لأنك واجهت صعوبة سابقاً في ربط الداتابيز، قمنا ببرمجة النظام بحيث <span className="text-[#f7e4a8] font-bold">ينشئ الجداول تلقائياً (Auto-Migrate)</span> بمجرد وضع الرابط، ويعمل حتى لو لم تضع الرابط عبر الذاكرة المحلية! إليك الخطوات البسيطة:
            </p>

            <div className="space-y-3">
              <div className="bg-[#1b1e2e] p-4 rounded-xl border border-[#d4af37]/20 flex gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-[#d4af37] text-black font-black flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-[#f7e4a8]">إنشاء قاعدة بيانات مجانية على Neon (1 دقيقة):</h4>
                  <p className="text-[#a09683] mt-0.5">
                    ادخل على موقع <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-[#d4af37] underline">neon.tech</a> أو من داخل Vercel Storage، اضغط "Create Project" وانسخ رابط الـ Connection String الذي يبدأ بـ <code className="text-[#f3e0a2]">postgresql://...</code>.
                  </p>
                </div>
              </div>

              <div className="bg-[#1b1e2e] p-4 rounded-xl border border-[#d4af37]/20 flex gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-[#d4af37] text-black font-black flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-[#f7e4a8]">وضع متغير البيئة في Vercel (Environment Variable):</h4>
                  <p className="text-[#a09683] mt-0.5">
                    في لوحة تحكم مشروعك على Vercel، اذهب إلى <strong>Settings &gt; Environment Variables</strong> وأضف متغيراً جديداً باسم <code className="text-[#f3e0a2] font-mono">DATABASE_URL</code> وضع فيه الرابط الذي نسخته من Neon.
                  </p>
                </div>
              </div>

              <div className="bg-[#1b1e2e] p-4 rounded-xl border border-[#d4af37]/20 flex gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-[#d4af37] text-black font-black flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-[#f7e4a8]">الضغط على Deploy:</h4>
                  <p className="text-[#a09683] mt-0.5">
                    سيرفع Vercel الموقع، وسيقوم السيرفر تلقائياً بإنشاء جداول المنتجات وعروض الأسعار وملئها بأصناف التحف فوراً دون الحاجة لتشغيل أي أوامر SQL يدوياً!
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================== TAB 4: QUOTES HISTORY ==================== */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="bg-[#12141f] p-4 rounded-2xl border border-[#d4af37]/20 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-pharaoh text-[#f3e0a2]">سجل عروض الأسعار والطلبات الواردة</h3>
              <p className="text-xs text-[#8f8572]">
                جميع عروض الأسعار التي تم إنشاؤها للعملاء عبر الموقع محفوظة هنا ويمكن إعادة تصديرها كـ PDF في أي وقت
              </p>
            </div>
            <span className="bg-[#d4af37]/15 text-[#d4af37] text-xs font-bold px-3 py-1 rounded-full border border-[#d4af37]/30">
              {quotes.length} عروض مسجلة
            </span>
          </div>

          {quotes.length === 0 ? (
            <div className="bg-[#12141f] p-12 text-center rounded-2xl border border-[#d4af37]/20 space-y-3">
              <FileText className="w-12 h-12 text-[#d4af37]/40 mx-auto" />
              <h4 className="text-base font-bold text-[#f7e4a8]">لا توجد عروض أسعار مسجلة بعد</h4>
              <p className="text-xs text-[#8e8574]">
                عندما يطلب العميل عرض سعر أو ينشئ فاتورة من السلة، ستظهر تفاصيلها هنا تلقائياً.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quotes.map((q) => (
                <div key={q.id} className="bg-[#151724] p-4 rounded-2xl border border-[#d4af37]/20 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#d4af37]">{q.quoteNumber}</span>
                      <div className="text-sm font-bold text-[#f7e8ce]">{q.clientName}</div>
                    </div>
                    <span className="text-lg font-black font-pharaoh text-[#f3e0a2]">
                      {formatPrice(q.total, currency, settings.exchangeRates)}
                    </span>
                  </div>

                  <div className="text-xs text-[#9e9480] space-y-1">
                    <div>📞 هاتف: <span dir="ltr" className="font-mono text-[#d6cbbb]">{q.clientPhone}</span></div>
                    {q.companyName && <div>🏢 الشركة: {q.companyName}</div>}
                    <div>📦 الأصناف: {q.items?.length || 0} صنف ({q.items?.reduce((a, b) => a + b.quantity, 0) || 0} قطعة)</div>
                    <div className="text-[10px] text-[#786e5e]">
                      تاريخ الإصدار: {new Date(q.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#d4af37]/15 flex items-center justify-end gap-2">
                    <button
                      onClick={() => onOpenPdf(q)}
                      className="flex items-center gap-1.5 bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#f7e4a8] hover:text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-[#d4af37]/40"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>فتح عرض السعر PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== PRODUCT ADD / EDIT MODAL ==================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#12141f] border border-[#d4af37]/50 rounded-3xl shadow-2xl overflow-hidden my-6">
            
            <div className="p-5 bg-[#171a29] border-b border-[#d4af37]/30 flex items-center justify-between">
              <h3 className="text-lg font-black font-pharaoh gold-gradient-text">
                {editingProduct ? 'تعديل بيانات المنتج وسعر العرض' : 'إضافة منتج فرعوني جديد للكتالوج'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#222538] hover:bg-[#d4af37] text-[#d6cbbb] hover:text-black transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              {productSaveError && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{productSaveError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8e8574] font-bold block mb-1">اسم المنتج باللغة العربية *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: تمثال أنوبيس الأسود المذهب"
                    className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#8e8574] font-bold block mb-1">الاسم بالإنجليزية (اختياري)</label>
                  <input
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. Royal Black Anubis Statue"
                    className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none font-cinzel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#8e8574] font-bold block mb-1">كود الصنف (Item Code) *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="EGY-701"
                    className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#8e8574] font-bold block mb-1">التصنيف *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'الكل').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[#8e8574] font-bold block mb-1">حالة التوريد والمخزون</label>
                  <select
                    value={formStockStatus}
                    onChange={(e) => setFormStockStatus(e.target.value as any)}
                    className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="in_stock">متوفر للتوريد الفوري</option>
                    <option value="on_demand">تصنيع وتوريد حسب الطلب</option>
                    <option value="limited">كمية محدودة ونادرة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8e8574] font-bold block mb-1">سعر القطعة الأساسي (بالجنيه المصري) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#8e8574] font-bold block mb-1">السعر الأصلي قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    value={formOriginalPrice || ''}
                    onChange={(e) => setFormOriginalPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="مثال: 1500"
                    className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8e8574] font-bold block mb-1">رابط صورة المنتج (URL) *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none font-mono text-[11px]"
                  />
                  {formImageUrl && (
                    <img src={formImageUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-[#d4af37]/30 bg-black shrink-0" />
                  )}
                </div>
              </div>

              {/* Quick Image Curated Selector */}
              <div className="bg-[#181b2a] p-2.5 rounded-xl border border-[#d4af37]/15">
                <span className="text-[11px] text-[#8e8574] block mb-1.5 font-bold">أو اختر صورة جاهزة عالية الدقة:</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1608481337062-4093bf3ed404?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=600&q=80'
                  ].map((presetUrl, idx) => (
                    <img
                      key={idx}
                      src={presetUrl}
                      alt="preset"
                      onClick={() => setFormImageUrl(presetUrl)}
                      className={`w-12 h-12 rounded-lg object-cover cursor-pointer border transition-all shrink-0 ${
                        formImageUrl === presetUrl ? 'border-[#d4af37] scale-110 shadow' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[#8e8574] font-bold block mb-1">وصف مختصر للبطاقة</label>
                <input
                  type="text"
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="وصف سريع يظهر في الكتالوج..."
                  className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#8e8574] font-bold block mb-1">الوصف التفصيلي والقصة الأثرية</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="تفاصيل الحفر، الدقة، طريقة التصنيع والمواد المستخدمة..."
                  className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#8e8574] font-bold block mb-1">الخامة</label>
                  <input
                    type="text"
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    placeholder="مثال: نحاس مطلي بماء الذهب"
                    className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#8e8574] font-bold block mb-1">الأبعاد والمقاسات</label>
                  <input
                    type="text"
                    value={formDimensions}
                    onChange={(e) => setFormDimensions(e.target.value)}
                    placeholder="مثال: ارتفاع 30 سم × عرض 15 سم"
                    className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#8e8574] font-bold block mb-1">الوزن التقريبي</label>
                  <input
                    type="text"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    placeholder="مثال: 2 كجم"
                    className="w-full bg-[#1b1e2e] text-[#f7e4a8] p-2.5 rounded-xl border border-[#d4af37]/25 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#f7e4a8]">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#d4af37] focus:ring-0"
                  />
                  <span>تمييز المنتج في الواجهة كأفضل القطع الملكية (Featured)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#d4af37]/25 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSavingProduct}
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#202336] text-[#d6cbbb] hover:text-white disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38f29] text-black font-extrabold shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingProduct && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{isSavingProduct ? 'جاري الحفظ على السيرفر...' : (editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج فوراً')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
