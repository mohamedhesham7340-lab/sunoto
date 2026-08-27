import React from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, Phone, MessageSquare, Database, ExternalLink } from 'lucide-react';
import { SiteSettings } from '../types';
import { CurrencyCode, CURRENCY_SYMBOLS } from '../lib/currency';

interface NavbarProps {
  settings: SiteSettings;
  cartCount: number;
  activeTab: 'catalog' | 'admin' | 'guide';
  setActiveTab: (tab: 'catalog' | 'admin' | 'guide') => void;
  openCart: () => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  dbConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  activeTab,
  setActiveTab,
  openCart,
  currency,
  setCurrency,
  dbConnected
}) => {
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن كتالوج وعروض أسعار المنتجات الفرعونية.')}`;

  return (
    <header className="sticky top-0 z-40 bg-[#1A1A1A] text-white border-b-4 border-[#D4AF37] shadow-xl">
      {/* Top Artistic Announcement Bar */}
      <div className="bg-[#2D241E] text-[#D4AF37] text-xs py-1.5 px-4 text-center border-b border-[#D4AF37]/30 flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span className="text-[#FDFBF7] font-medium">مصنع وورش الفرعون الذهبي للتحف التراثية والتوريدات الفندقية</span>
        </div>
        <div className="mx-auto md:mx-0 flex items-center gap-4 text-xs font-semibold">
          <span>✨ خصومات خاصة لطلبات الجملة والتوريدات</span>
          <span className="hidden sm:inline text-[#D4AF37]/60">|</span>
          <span className="hidden sm:inline">📦 شحن وتوصيل لكافة المحافظات والتصدير الدولي</span>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-[#D4AF37]">
            <Phone className="w-3.5 h-3.5" />
            <span dir="ltr" className="font-mono text-[#FDFBF7]">{settings.phoneNumber}</span>
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Store Title */}
          <div 
            id="brand-logo-container"
            onClick={() => setActiveTab('catalog')} 
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative w-12 h-12 rounded-full border-2 border-[#D4AF37] bg-[#2D241E] flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <span className="text-2xl font-bold font-pharaoh text-[#D4AF37]">𓋹</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-pharaoh text-[#D4AF37] tracking-wider">
                  {settings.storeName || 'الفرعون الذهبي'}
                </h1>
                <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#D4AF37] text-[#1A1A1A]">
                  ARTISTIC EDITION
                </span>
              </div>
              <p className="text-xs text-[#C5BBAF] line-clamp-1 max-w-xs sm:max-w-md">
                كتالوج وعروض أسعار التحف والمنتجات الفرعونية الأصيلة
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#2D241E] p-1.5 rounded-lg border border-[#D4AF37]/30">
            <button
              id="nav-catalog-btn"
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-md'
                  : 'text-[#EFE9E1] hover:text-[#D4AF37] hover:bg-[#3D322A]'
              }`}
            >
              🏛️ المعروضات والأسعار
            </button>

            <button
              id="nav-admin-btn"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs uppercase tracking-wider font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-md'
                  : 'text-[#EFE9E1] hover:text-[#D4AF37] hover:bg-[#3D322A]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              لوحة التحكم
              {dbConnected ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="قاعدة بيانات متصلة"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="وضع التخزين المحلي"></span>
              )}
            </button>

            <button
              id="nav-guide-btn"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded text-xs uppercase tracking-wider font-bold transition-all ${
                activeTab === 'guide'
                  ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-md'
                  : 'text-[#EFE9E1] hover:text-[#D4AF37] hover:bg-[#3D322A]'
              }`}
            >
              <Database className="w-4 h-4 text-[#D4AF37]" />
              دليل Vercel & Neon
            </button>
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Currency Selector */}
            <div className="relative">
              <select
                id="currency-selector"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-[#2D241E] text-[#D4AF37] text-xs sm:text-sm font-bold py-2 px-2.5 rounded border border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                title="تغيير عملة عرض الأسعار"
              >
                <option value="EGP">ج.م (EGP)</option>
                <option value="USD">$ (USD)</option>
                <option value="SAR">ر.س (SAR)</option>
                <option value="AED">د.إ (AED)</option>
              </select>
            </div>

            {/* Direct WhatsApp Contact */}
            <a
              id="direct-whatsapp-nav-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366] px-3.5 py-2 rounded text-xs sm:text-sm font-bold transition-all"
              title="تواصل مباشرة عبر واتساب"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>واتساب</span>
            </a>

            {/* Cart / Quote Trigger Button */}
            <button
              id="quote-cart-trigger-btn"
              onClick={openCart}
              className="relative flex items-center gap-2 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1A1A1A] font-extrabold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded shadow-lg transition-all hover:scale-105 active:scale-95 border border-[#D4AF37]"
            >
              <ShoppingBag className="w-5 h-5 text-[#1A1A1A]" />
              <span className="hidden sm:inline text-sm font-black">عرض السعر</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1A1A1A] text-[#D4AF37] text-xs font-black border border-[#D4AF37]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-[#D4AF37]/30 bg-[#2D241E]">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`text-xs font-bold py-1.5 px-3 rounded ${
              activeTab === 'catalog' ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-[#EFE9E1]'
            }`}
          >
            🏛️ المعروضات
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded ${
              activeTab === 'admin' ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-[#EFE9E1]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            لوحة التحكم
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded ${
              activeTab === 'guide' ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-[#EFE9E1]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
            دليل Vercel
          </button>
        </div>

      </div>
    </header>
  );
};
