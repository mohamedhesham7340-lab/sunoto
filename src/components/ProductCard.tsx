import React from 'react';
import { ShoppingBag, Eye, Sparkles, MessageCircle, Layers, CheckCircle2 } from 'lucide-react';
import { Product, SiteSettings } from '../types';
import { CurrencyCode, formatPrice } from '../lib/currency';

interface ProductCardProps {
  product: Product;
  settings: SiteSettings;
  currency: CurrencyCode;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  isInCart: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  currency,
  onOpenDetail,
  onAddToCart,
  isInCart
}) => {
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=800&q=80';

  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}?product=${product.id}` : '';
  const quickWhatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `مرحباً، أود الاستفسار وطلب تسعير للمنتج:\n🏺 *${product.name}*\n🏷️ كود الصنف: ${product.itemCode}\n💰 السعر: ${formatPrice(product.price, currency, settings.exchangeRates)}\n🔗 رابط المعاينة: ${productUrl}`
  )}`;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-white rounded border border-[#D4AF37] hover:border-[#8B6508] transition-all duration-300 shadow-sm hover:shadow-lg overflow-hidden"
    >
      {/* Top Image Container */}
      <div className="relative w-full aspect-square bg-[#EFE9E1] overflow-hidden border-b border-[#D4AF37]/30">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {product.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-[#D4AF37] text-[#1A1A1A] text-[9px] uppercase tracking-widest font-black px-2.5 py-0.5 rounded shadow-sm border border-[#1A1A1A]/20">
              <Sparkles className="w-3 h-3 text-[#1A1A1A]" />
              مميّز ملكي
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#A31621] text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded shadow-sm">
              وفر {discountPercent}%
            </span>
          )}
        </div>

        {/* Item Code Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-[#1A1A1A]/90 backdrop-blur-sm text-[#D4AF37] border border-[#D4AF37] text-[10px] font-mono font-bold px-2 py-0.5 rounded">
            {product.itemCode}
          </span>
        </div>

        {/* Quick View Floating Action */}
        <button
          onClick={() => onOpenDetail(product)}
          className="absolute bottom-3 left-3 bg-[#1A1A1A] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] p-2 rounded backdrop-blur-sm border border-[#D4AF37] transition-all opacity-0 group-hover:opacity-100 shadow-md"
          title="معاينة التفاصيل والمواصفات"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Direct WhatsApp Quick Inquire */}
        <a
          href={quickWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 bg-[#25D366] hover:bg-[#1EBE5D] text-black p-2 rounded shadow-md transition-all opacity-0 group-hover:opacity-100"
          title="استفسار سريع عبر واتساب"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
        </a>
      </div>

      {/* Product Details Section */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 space-y-3 bg-[#FDFBF7]">
        
        {/* Category & Stock */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8B6508] font-bold text-[11px] uppercase tracking-wider">{product.category}</span>
          <span className="flex items-center gap-1 text-[11px]">
            {product.stockStatus === 'in_stock' ? (
              <span className="text-emerald-700 font-bold">● متوفر للتوريد الفوري</span>
            ) : product.stockStatus === 'on_demand' ? (
              <span className="text-amber-700 font-bold">● تصنيع حسب الطلب</span>
            ) : (
              <span className="text-orange-700 font-bold">● كمية نادرة</span>
            )}
          </span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onOpenDetail(product)}
          className="text-base sm:text-lg font-bold font-pharaoh text-[#1A1A1A] hover:text-[#8B6508] transition-colors line-clamp-2 cursor-pointer leading-snug"
        >
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-[#5D4E42] line-clamp-2 leading-relaxed font-medium">
          {product.shortDesc || product.description}
        </p>

        {/* Material & Specs Pill */}
        {product.material && (
          <div className="bg-[#FAF6EE] border border-[#D4AF37]/40 rounded p-2 text-[11px] text-[#2D241E] flex items-center justify-between">
            <span className="text-[#8C7E72] font-semibold">الخامة:</span>
            <span className="text-[#1A1A1A] font-bold line-clamp-1 max-w-[170px]">{product.material}</span>
          </div>
        )}

        {/* Wholesale tier preview indicator */}
        {product.wholesaleTiers && product.wholesaleTiers.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#8B6508] font-bold">
            <Layers className="w-3.5 h-3.5 shrink-0 text-[#D4AF37]" />
            <span>خصم يصل لـ {Math.max(...product.wholesaleTiers.map(t => t.discountPercent))}% للكميات</span>
          </div>
        )}

        <div className="flex-1"></div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#D4AF37]/30 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#8C7E72]">سعر القطعة:</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black font-pharaoh text-[#1A1A1A]">
                {formatPrice(product.price, currency, settings.exchangeRates)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-[#8C7E72] line-through">
                  {formatPrice(product.originalPrice, currency, settings.exchangeRates)}
                </span>
              )}
            </div>
          </div>

          <button
            id={`add-to-quote-btn-${product.id}`}
            onClick={() => onAddToCart(product, 1)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded text-xs uppercase tracking-wider font-extrabold transition-all shadow-sm active:scale-95 border ${
              isInCart
                ? 'bg-[#2D241E] text-emerald-400 border-emerald-500 hover:bg-[#1A1A1A]'
                : 'bg-[#1A1A1A] text-[#D4AF37] border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A]'
            }`}
          >
            {isInCart ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>في السلة (+1)</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>طلب تسعير</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
