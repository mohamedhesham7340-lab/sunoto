import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Send, FileText, Sparkles, Building, Phone, User, MapPin, Layers, CheckCircle2 } from 'lucide-react';
import { CartItem, SiteSettings, QuoteRequest } from '../types';
import { CurrencyCode, formatPrice } from '../lib/currency';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: SiteSettings;
  currency: CurrencyCode;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onGeneratePdf: (quote: QuoteRequest) => void;
  onSaveQuote: (quote: Omit<QuoteRequest, 'id' | 'quoteNumber' | 'createdAt'>) => Promise<QuoteRequest>;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  settings,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onGeneratePdf,
  onSaveQuote
}) => {
  if (!isOpen) return null;

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate pricing
  let subtotal = 0;
  let totalDiscount = 0;

  cart.forEach(item => {
    const originalUnitPrice = item.product.price;
    const baseTotal = originalUnitPrice * item.quantity;
    subtotal += baseTotal;

    // Check wholesale tier discounts
    if (item.product.wholesaleTiers && item.product.wholesaleTiers.length > 0) {
      const sortedTiers = [...item.product.wholesaleTiers].sort((a, b) => b.minQty - a.minQty);
      const applicableTier = sortedTiers.find(t => item.quantity >= t.minQty);
      if (applicableTier) {
        const itemDiscount = (baseTotal * applicableTier.discountPercent) / 100;
        totalDiscount += itemDiscount;
      }
    }
  });

  const tax = settings.taxRate > 0 ? ((subtotal - totalDiscount) * settings.taxRate) / 100 : 0;
  const netTotal = subtotal - totalDiscount + tax;

  const buildQuoteObject = (): Omit<QuoteRequest, 'id' | 'quoteNumber' | 'createdAt'> => {
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + (settings.defaultQuoteValidityDays || 15));
    
    return {
      clientName: clientName || 'عميل كريم',
      clientPhone: clientPhone || '-',
      companyName,
      deliveryCity,
      items: cart,
      subtotal,
      discount: totalDiscount,
      tax,
      total: netTotal,
      currency,
      notes,
      validUntil: validityDate.toLocaleDateString('ar-EG'),
      status: 'sent_whatsapp'
    };
  };

  // 1. Send via WhatsApp
  const handleSendWhatsApp = async () => {
    if (!clientPhone && !clientName) {
      alert('يرجى كتابة الاسم ورقم الهاتف لإرسال عرض السعر بدقة.');
      return;
    }

    setIsSubmitting(true);
    try {
      const quoteObj = buildQuoteObject();
      const savedQuote = await onSaveQuote(quoteObj);

      // Build formatted WhatsApp message
      let message = `🏛️ *عرض أسعار رسمي - مؤسسة الفرعون الذهبي للتحف*\n`;
      message += `📜 *رقم المرجع:* ${savedQuote.quoteNumber}\n`;
      message += `👤 *العميل / المصنع:* ${clientName || 'عميل مميز'}\n`;
      if (companyName) message += `🏢 *الشركة:* ${companyName}\n`;
      if (clientPhone) message += `📞 *الهاتف:* ${clientPhone}\n`;
      if (deliveryCity) message += `📍 *المدينة:* ${deliveryCity}\n`;
      message += `-------------------------\n`;
      message += `📦 *تفاصيل المنتجات المطلوبة:*\n\n`;

      cart.forEach((item, index) => {
        message += `${index + 1}. *${item.product.name}*\n`;
        message += `   - كود: ${item.product.itemCode}\n`;
        message += `   - الكمية: ${item.quantity} قطعة\n`;
        message += `   - سعر القطعة: ${item.product.price} ج.م\n`;
        message += `   - إجمالي الصنف: ${item.product.price * item.quantity} ج.م\n`;
        if (item.customNotes) message += `   - ملاحظة خاصة: ${item.customNotes}\n`;
        message += `\n`;
      });

      message += `-------------------------\n`;
      message += `💵 *المجموع الفرعي:* ${subtotal} ج.م\n`;
      if (totalDiscount > 0) message += `🎁 *خصم الكميات والتوريد:* -${totalDiscount} ج.م\n`;
      message += `👑 *صافي الإجمالي النهائي:* ${netTotal} ج.م\n`;
      if (notes) message += `📝 *ملاحظات إضافية:* ${notes}\n`;
      message += `\n✨ شكراً لاختياركم منتجات الفرعون الذهبي التراثية.`;

      const targetNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Error sending quote:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Open PDF preview
  const handleOpenPdf = async () => {
    setIsSubmitting(true);
    try {
      const quoteObj = buildQuoteObject();
      const savedQuote = await onSaveQuote(quoteObj);
      onGeneratePdf(savedQuote);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-xl bg-[#2D241E] text-[#FDFBF7] border-r sm:border-l-4 border-[#D4AF37] shadow-2xl flex flex-col h-full overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#1A1A1A] border-b-2 border-[#D4AF37] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#2D241E] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-pharaoh text-[#D4AF37]">
                سلة عرض السعر والتسعير الفوري
              </h2>
              <p className="text-xs text-[#C5BBAF]">
                {cart.length > 0 ? `${cart.length} أصناف مضافة للتسعير` : 'السلة فارغة'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-red-300 hover:text-red-200 p-1.5 rounded hover:bg-red-500/20 transition-all"
                title="تفريغ السلة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded bg-[#2D241E] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] transition-all border border-[#D4AF37]"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-dashed border-[#D4AF37] flex items-center justify-center text-3xl font-pharaoh text-[#D4AF37]">
                𓋹
              </div>
              <h3 className="text-base font-bold text-[#D4AF37] font-pharaoh">سلة عرض الأسعار فارغة</h3>
              <p className="text-xs text-[#C5BBAF] max-w-xs leading-relaxed font-medium">
                تصفح الكتالوج واضغط على "طلب تسعير" لإضافة القطع الفرعونية إلى عرض السعر وتصديره PDF أو إرساله عبر واتساب.
              </p>
            </div>
          ) : (
            <>
              {/* Added Items List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">الأصناف المحددة:</div>
                
                {cart.map((item) => {
                  const unitPrice = item.product.price;
                  const itemTotal = unitPrice * item.quantity;
                  const img = item.product.images?.[0] || 'https://images.unsplash.com/photo-1599732448498-34863c8096b8?auto=format&fit=crop&w=200&q=80';

                  return (
                    <div
                      key={item.productId}
                      className="bg-[#3D322A] p-3 rounded border border-[#D4AF37]/40 flex gap-3 items-center shadow-sm"
                    >
                      <img
                        src={img}
                        alt={item.product.name}
                        className="w-16 h-16 rounded object-cover border border-[#D4AF37] bg-white shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-bold font-pharaoh text-[#FDFBF7] line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.productId)}
                            className="text-[#C5BBAF] hover:text-red-300 p-1"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-[#C5BBAF] flex items-center justify-between">
                          <span>كود: {item.product.itemCode}</span>
                          <span className="text-[#D4AF37] font-bold">
                            {formatPrice(unitPrice, currency, settings.exchangeRates)} / قطعة
                          </span>
                        </div>

                        {/* Quantity Controls & Subtotal */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#D4AF37]/20">
                          <div className="flex items-center gap-2 bg-[#1A1A1A] rounded p-0.5 border border-[#D4AF37]/40">
                            <button
                              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-[#2D241E] hover:bg-[#D4AF37] hover:text-[#1A1A1A] text-xs font-bold flex items-center justify-center transition-all"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-black text-[#D4AF37]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-[#2D241E] hover:bg-[#D4AF37] hover:text-[#1A1A1A] text-xs font-bold flex items-center justify-center transition-all"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs sm:text-sm font-black font-pharaoh text-[#D4AF37]">
                            {formatPrice(itemTotal, currency, settings.exchangeRates)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wholesale Savings Callout */}
              {totalDiscount > 0 && (
                <div className="bg-[#1A1A1A] border-2 border-[#D4AF37] rounded p-3 flex items-center gap-2.5 text-xs text-[#D4AF37]">
                  <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <div>
                    <span className="font-bold block text-white">تهانينا! تم تطبيق خصم التوريد والكميات:</span>
                    <span>تم توفير {formatPrice(totalDiscount, currency, settings.exchangeRates)} من إجمالي العرض.</span>
                  </div>
                </div>
              )}

              {/* Client Details Form for Official Quotation */}
              <div className="bg-[#3D322A] border border-[#D4AF37]/40 p-4 rounded space-y-3 shadow-inner">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
                  <User className="w-4 h-4" />
                  <span>بيانات العميل الموجه إليه عرض السعر:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[#C5BBAF] block mb-1">اسم العميل / المستلم *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="مثال: م. أحمد عبد العزيز"
                      className="w-full bg-[#1A1A1A] text-[#FDFBF7] text-xs p-2.5 rounded border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#C5BBAF] block mb-1">رقم الهاتف / الواتساب *</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="مثال: 01012345678"
                      className="w-full bg-[#1A1A1A] text-[#FDFBF7] text-xs p-2.5 rounded border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[#C5BBAF] block mb-1">اسم الشركة / المصنع (اختياري)</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="مثال: مصنع الأهرام للتوريدات"
                      className="w-full bg-[#1A1A1A] text-[#FDFBF7] text-xs p-2.5 rounded border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#C5BBAF] block mb-1">مدينة / مكان التسليم</label>
                    <input
                      type="text"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      placeholder="مثال: القاهرة / الإسكندرية / تصدير"
                      className="w-full bg-[#1A1A1A] text-[#FDFBF7] text-xs p-2.5 rounded border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#C5BBAF] block mb-1">ملاحظات وشروط خاصة بالعرض</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي مواصفات خاصة، شروط دفع، أو طلب تغليف هدايا ملكي..."
                    className="w-full bg-[#1A1A1A] text-[#FDFBF7] text-xs p-2.5 rounded border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none resize-none"
                  />
                </div>
              </div>

            </>
          )}

        </div>

        {/* Drawer Footer with Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#1A1A1A] border-t-2 border-[#D4AF37] space-y-3">
            
            {/* Price Calculations Summary */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#C5BBAF]">
                <span>المجموع الفرعي ({cart.reduce((a, b) => a + b.quantity, 0)} قطعة):</span>
                <span>{formatPrice(subtotal, currency, settings.exchangeRates)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>خصم الكميات:</span>
                  <span>- {formatPrice(totalDiscount, currency, settings.exchangeRates)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-1.5 border-t border-[#D4AF37]/30 text-sm font-black">
                <span className="text-white font-pharaoh">الإجمالي النهائي:</span>
                <span className="text-2xl font-black font-pharaoh text-[#D4AF37]">
                  {formatPrice(netTotal, currency, settings.exchangeRates)}
                </span>
              </div>
            </div>

            {/* Dual Super Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              
              {/* WhatsApp Instant Submit */}
              <button
                id="drawer-send-whatsapp-btn"
                onClick={handleSendWhatsApp}
                disabled={isSubmitting}
                className="py-3 px-3 rounded bg-[#25D366] hover:bg-[#1EBE5D] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 border border-[#25D366]"
              >
                <Send className="w-4 h-4" />
                <span>إرسال العرض واتساب</span>
              </button>

              {/* Official Pharaonic PDF Export */}
              <button
                id="drawer-export-pdf-btn"
                onClick={handleOpenPdf}
                disabled={isSubmitting}
                className="py-3 px-3 rounded bg-[#D4AF37] hover:bg-[#E5C158] text-[#1A1A1A] font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 border border-[#D4AF37]"
              >
                <FileText className="w-4 h-4" />
                <span>عرض وطباعة PDF</span>
              </button>

            </div>

            <p className="text-[10px] text-center text-[#C5BBAF]">
              يتم حفظ طلب عرض السعر تلقائياً ويمكن الرجوع إليه في أي وقت من لوحة التحكم.
            </p>

          </div>
        )}

      </div>
    </div>
  );
};
