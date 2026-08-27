import React, { useState } from 'react';
import { X, ShoppingBag, MessageCircle, Sparkles, Check, Layers, ShieldCheck, Ruler, Weight, Box } from 'lucide-react';
import { Product, SiteSettings } from '../types';
import { CurrencyCode, formatPrice } from '../lib/currency';

interface ProductDetailModalProps {
  product: Product | null;
  settings: SiteSettings;
  currency: CurrencyCode;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, customNotes?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  currency,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(product.minQuantity || 1);
  const [customNotes, setCustomNotes] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=1000&q=80'];

  // Calculate wholesale discount based on current quantity
  let currentDiscountPercent = 0;
  if (product.wholesaleTiers && product.wholesaleTiers.length > 0) {
    const sortedTiers = [...product.wholesaleTiers].sort((a, b) => b.minQty - a.minQty);
    const applicableTier = sortedTiers.find(t => quantity >= t.minQty);
    if (applicableTier) {
      currentDiscountPercent = applicableTier.discountPercent;
    }
  }

  const unitPriceAfterDiscount = product.price * (1 - currentDiscountPercent / 100);
  const totalPrice = unitPriceAfterDiscount * quantity;

  const handleAdd = () => {
    onAddToCart(product, quantity, customNotes);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 900);
  };

  const [inquiryTopic, setInquiryTopic] = useState<'general' | 'wholesale' | 'custom'>('general');

  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}?product=${product.id}` : '';

  const getTopicLabel = () => {
    if (inquiryTopic === 'wholesale') return 'طلب تسعير جملة وتوريدات كميات للمصانع والشركات';
    if (inquiryTopic === 'custom') return 'طلب تصنيع بمقاس خاص أو حفر لوجو مخصص';
    return 'استفسار عام عن التحفة ومواعيد التسليم';
  };

  const whatsappDirectUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `مرحباً مؤسسة ${settings.storeName || 'الفرعون الذهبي'}،\n\n` +
    `📌 *نوع الطلب:* ${getTopicLabel()}\n` +
    `🏺 *المنتج:* ${product.name} (كود: ${product.itemCode})\n` +
    `📦 *الكمية المطلوبة:* ${quantity} قطعة\n` +
    `💰 *السعر المقدر:* ${formatPrice(totalPrice, currency, settings.exchangeRates)}${currentDiscountPercent > 0 ? ` (بعد خصم كمية ${currentDiscountPercent}%)` : ''}\n` +
    `${product.material ? `🧱 *الخامة:* ${product.material}\n` : ''}` +
    `${product.dimensions ? `📏 *الأبعاد:* ${product.dimensions}\n` : ''}` +
    `${customNotes ? `📝 *ملاحظات العميل:* ${customNotes}\n` : ''}` +
    `🔗 *رابط معاينة المنتج:* ${productUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#FDFBF7] text-[#2D241E] border-4 border-[#D4AF37] rounded-lg shadow-2xl overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-[#1A1A1A] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] transition-all border border-[#D4AF37]"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left / Top: Gallery Column */}
          <div className="p-6 bg-[#EFE9E1] flex flex-col justify-between border-b md:border-b-0 md:border-l border-[#D4AF37]/30">
            <div>
              {/* Main Image */}
              <div className="relative w-full aspect-square rounded overflow-hidden border-2 border-[#D4AF37] bg-white">
                <img
                  src={images[selectedImageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {product.isFeatured && (
                  <div className="absolute top-3 right-3 bg-[#D4AF37] text-[#1A1A1A] text-xs font-black px-3 py-1 rounded shadow-md flex items-center gap-1 border border-[#1A1A1A]/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    تحفة ملكية مميّزة
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`relative w-16 h-16 rounded overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIdx === idx ? 'border-[#D4AF37] scale-105 shadow-md' : 'border-[#D4AF37]/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality & Origin Seals */}
            <div className="mt-6 pt-4 border-t border-[#D4AF37]/30 grid grid-cols-2 gap-2 text-center text-xs font-bold text-[#2D241E]">
              <div className="p-2 rounded bg-white border border-[#D4AF37]/40 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
                <span>صناعة يدوية مصرية أصيلة</span>
              </div>
              <div className="p-2 rounded bg-white border border-[#D4AF37]/40 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
                <span>شهادة توثيق ومطابقة</span>
              </div>
            </div>

          </div>

          {/* Right: Product Details & Pricing Builder */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5 max-h-[85vh] overflow-y-auto bg-[#FDFBF7]">
            
            <div className="space-y-4">
              
              {/* Category, Code, Stock */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1A1A1A] font-extrabold px-2.5 py-1 rounded bg-[#D4AF37] border border-[#1A1A1A]/20">
                  {product.category}
                </span>
                <span className="font-mono font-bold text-[#1A1A1A] bg-[#EFE9E1] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  كود: {product.itemCode}
                </span>
              </div>

              {/* Title & En */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-pharaoh text-[#1A1A1A] leading-snug">
                  {product.name}
                </h2>
                {product.nameEn && (
                  <p className="text-xs text-[#8C7E72] font-cinzel mt-0.5 tracking-wider">{product.nameEn}</p>
                )}
              </div>

              {/* Price Banner */}
              <div className="bg-white p-4 rounded border-2 border-[#D4AF37] shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8C7E72]">سعر القطعة الأساسي:</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-pharaoh text-[#1A1A1A]">
                      {formatPrice(unitPriceAfterDiscount, currency, settings.exchangeRates)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-[#8C7E72] line-through">
                        {formatPrice(product.originalPrice, currency, settings.exchangeRates)}
                      </span>
                    )}
                  </div>
                </div>

                {currentDiscountPercent > 0 && (
                  <div className="text-left bg-[#1A1A1A] text-[#D4AF37] border border-[#D4AF37] px-3 py-1.5 rounded">
                    <span className="text-[10px] uppercase font-bold block">خصم كمية مطبق</span>
                    <span className="text-sm font-extrabold text-[#FDFBF7]">وفر {currentDiscountPercent}%</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#8B6508] uppercase tracking-wider">عن التحفة وتفاصيل الصنع:</h4>
                <p className="text-xs sm:text-sm text-[#5D4E42] leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF6EE] p-3 rounded border border-[#D4AF37]/30">
                {product.material && (
                  <div className="flex items-center gap-2 text-[#2D241E]">
                    <Box className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <div>
                      <span className="text-[#8C7E72] block text-[10px] font-semibold">الخامة:</span>
                      <span className="font-bold">{product.material}</span>
                    </div>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex items-center gap-2 text-[#2D241E]">
                    <Ruler className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <div>
                      <span className="text-[#8C7E72] block text-[10px] font-semibold">الأبعاد:</span>
                      <span className="font-bold">{product.dimensions}</span>
                    </div>
                  </div>
                )}
                {product.weight && (
                  <div className="flex items-center gap-2 text-[#2D241E]">
                    <Weight className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <div>
                      <span className="text-[#8C7E72] block text-[10px] font-semibold">الوزن التقريبي:</span>
                      <span className="font-bold">{product.weight}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#2D241E]">
                  <Layers className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <div>
                    <span className="text-[#8C7E72] block text-[10px] font-semibold">الحد الأدنى للطلب:</span>
                    <span className="font-bold">{product.minQuantity || 1} قطعة</span>
                  </div>
                </div>
              </div>

              {/* Wholesale Tiers Table */}
              {product.wholesaleTiers && product.wholesaleTiers.length > 0 && (
                <div className="space-y-2 bg-[#FAF6EE] p-3 rounded border border-[#D4AF37]/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A]">
                    <Layers className="w-4 h-4 text-[#D4AF37]" />
                    <span>جدول خصومات الكميات وطلبات المصانع:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {product.wholesaleTiers.map((tier, idx) => {
                      const isActive = quantity >= tier.minQty;
                      return (
                        <div
                          key={idx}
                          onClick={() => setQuantity(tier.minQty)}
                          className={`p-2 rounded border cursor-pointer transition-all ${
                            isActive
                              ? 'bg-[#1A1A1A] border-[#D4AF37] text-[#D4AF37] font-bold shadow'
                              : 'bg-white border-[#D4AF37]/30 text-[#5D4E42] hover:border-[#D4AF37]'
                          }`}
                        >
                          <div className="text-[10px] font-semibold">من {tier.minQty} قطعة</div>
                          <div className="text-sm font-black">خصم {tier.discountPercent}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Custom Notes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D241E]">حدد الكمية المطلوبة للتسعير:</span>
                  <div className="flex items-center gap-3 bg-white border-2 border-[#D4AF37] rounded p-1">
                    <button
                      onClick={() => setQuantity(Math.max(product.minQuantity || 1, quantity - 1))}
                      className="w-8 h-8 rounded bg-[#1A1A1A] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] font-bold text-lg flex items-center justify-center transition-all"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={product.minQuantity || 1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(product.minQuantity || 1, parseInt(e.target.value) || 1))}
                      className="w-12 text-center bg-transparent text-sm font-black text-[#1A1A1A] focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded bg-[#1A1A1A] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] font-bold text-lg flex items-center justify-center transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Topic Selector Pills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-[#5D4E42]">نوع الاستفسار المراد إرساله عبر واتساب:</span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setInquiryTopic('general')}
                      className={`p-1.5 rounded text-center border font-bold transition-all ${
                        inquiryTopic === 'general'
                          ? 'bg-[#D4AF37] text-[#1A1A1A] border-[#D4AF37]'
                          : 'bg-white text-[#5D4E42] border-[#D4AF37]/40 hover:border-[#D4AF37]'
                      }`}
                    >
                      استفسار عام
                    </button>
                    <button
                      type="button"
                      onClick={() => setInquiryTopic('wholesale')}
                      className={`p-1.5 rounded text-center border font-bold transition-all ${
                        inquiryTopic === 'wholesale'
                          ? 'bg-[#D4AF37] text-[#1A1A1A] border-[#D4AF37]'
                          : 'bg-white text-[#5D4E42] border-[#D4AF37]/40 hover:border-[#D4AF37]'
                      }`}
                    >
                      تسعير جملة
                    </button>
                    <button
                      type="button"
                      onClick={() => setInquiryTopic('custom')}
                      className={`p-1.5 rounded text-center border font-bold transition-all ${
                        inquiryTopic === 'custom'
                          ? 'bg-[#D4AF37] text-[#1A1A1A] border-[#D4AF37]'
                          : 'bg-white text-[#5D4E42] border-[#D4AF37]/40 hover:border-[#D4AF37]'
                      }`}
                    >
                      حفر وتصنيع خاص
                    </button>
                  </div>
                </div>

                {/* Optional Custom Notes Input */}
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="ملاحظات خاصة (تعديل مقاس، لون محدد، حفر اسم أو لوجو مخصص)..."
                  className="w-full bg-white text-[#1A1A1A] text-xs px-3.5 py-2.5 rounded border border-[#D4AF37] focus:border-[#1A1A1A] focus:outline-none placeholder:text-[#8C7E72]"
                />
              </div>

            </div>

            {/* Bottom Actions Row */}
            <div className="pt-4 border-t-2 border-[#D4AF37]/30 space-y-2.5">
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#5D4E42] font-semibold">الإجمالي المقدر ({quantity} قطعة):</span>
                <span className="text-2xl font-black font-pharaoh text-[#1A1A1A]">
                  {formatPrice(totalPrice, currency, settings.exchangeRates)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  id="modal-add-to-cart-btn"
                  onClick={handleAdd}
                  disabled={addedSuccess}
                  className={`w-full py-3 px-4 rounded font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 border ${
                    addedSuccess
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-[#1A1A1A] text-[#D4AF37] border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A]'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت الإضافة لعرض السعر!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>إضافة لعرض السعر ({quantity})</span>
                    </>
                  )}
                </button>

                <a
                  id="modal-whatsapp-inquire-btn"
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded font-bold text-sm bg-[#25D366] hover:bg-[#1EBE5D] text-black border border-[#25D366] flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>استفسار فوري واتساب</span>
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
