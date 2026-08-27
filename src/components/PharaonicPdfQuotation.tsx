import React from 'react';
import { X, Printer, Download, Share2, Sparkles, Phone, Mail, MapPin, CheckCircle2, Shield } from 'lucide-react';
import { QuoteRequest, SiteSettings } from '../types';
import { CurrencyCode, formatPrice } from '../lib/currency';

interface PharaonicPdfQuotationProps {
  quote: QuoteRequest | null;
  settings: SiteSettings;
  currency: CurrencyCode;
  onClose: () => void;
}

export const PharaonicPdfQuotation: React.FC<PharaonicPdfQuotationProps> = ({
  quote,
  settings,
  currency,
  onClose
}) => {
  if (!quote) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('تم نسخ رابط عرض السعر بنجاح!');
  };

  // Convert number to Arabic words (simple Egyptian representation)
  const formatArabicNumberWords = (num: number, cur: string) => {
    const rounded = Math.round(num);
    const curName = cur === 'EGP' ? 'جنيه مصري' : cur === 'SAR' ? 'ريال سعودي' : cur === 'USD' ? 'دولار أمريكي' : 'درهم إماراتي';
    return `فقط وقدره ${rounded.toLocaleString('ar-EG')} ${curName} لا غير`;
  };

  const quoteDateStr = new Date(quote.createdAt || Date.now()).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      
      {/* Container Box */}
      <div className="relative w-full max-w-4xl bg-white text-[#1A1A1A] rounded shadow-2xl overflow-hidden my-6 border-4 border-[#D4AF37]">
        
        {/* Floating Top Toolbar (Hidden on Print) */}
        <div className="no-print sticky top-0 z-20 bg-[#1A1A1A] text-[#FDFBF7] p-3 sm:p-4 border-b-2 border-[#D4AF37] flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-bold text-sm sm:text-base font-pharaoh text-[#D4AF37]">
              معاينة عرض السعر الرسمي (جاهز للحفظ كـ PDF)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1A1A1A] font-extrabold text-xs sm:text-sm uppercase tracking-wider px-4 py-2 rounded shadow-md cursor-pointer transition-all active:scale-95 border border-[#D4AF37]"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 bg-[#2D241E] hover:bg-[#3D322A] text-[#D4AF37] text-xs px-3 py-2 rounded border border-[#D4AF37]"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-[#2D241E] hover:bg-red-900/80 text-[#D4AF37] hover:text-white rounded transition-all border border-[#D4AF37]"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Pharaonic Quotation Sheet */}
        <div className="quotation-paper p-6 sm:p-10 bg-[#FDFBF7] space-y-6 text-[#2D241E]" dir="rtl">
          
          {/* Royal Frame Header */}
          <div className="border-b-2 border-[#D4AF37] pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Right: Company Logo & Info */}
            <div className="text-right space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded bg-[#1A1A1A] border-2 border-[#D4AF37] flex items-center justify-center text-3xl font-pharaoh text-[#D4AF37] shadow-md">
                  𓋹
                </div>
                <div>
                  <h1 className="text-2xl font-black font-pharaoh text-[#1A1A1A] tracking-wide">
                    {settings.storeName || 'الفرعون الذهبي'}
                  </h1>
                  <p className="text-xs text-[#8B6508] font-bold">
                    {settings.storeTagline || 'للتوريدات والمقتنيات الفرعونية والتراثية'}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-[#5D4E42] space-y-0.5 pt-2 font-medium">
                <div>📍 {settings.address}</div>
                <div>📞 هاتف: <span dir="ltr">{settings.phoneNumber}</span> | واتساب: <span dir="ltr">{settings.whatsappNumber}</span></div>
                <div>✉️ البريد: {settings.email}</div>
                {(settings.commercialRecord || settings.taxId) && (
                  <div className="text-[10px] text-[#8C7E72]">
                    {settings.commercialRecord} {settings.taxId && `| ${settings.taxId}`}
                  </div>
                )}
              </div>
            </div>

            {/* Left: Quotation Reference & Stamp Header */}
            <div className="text-left bg-white border-2 border-[#D4AF37] p-4 rounded text-xs space-y-1.5 min-w-[240px] shadow-sm">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/40 pb-1">
                <span className="font-extrabold text-[#1A1A1A] text-sm font-pharaoh">عرض سعر رسمي</span>
                <span className="bg-[#1A1A1A] text-[#D4AF37] border border-[#D4AF37] text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  QUOTATION
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7E72] font-semibold">رقم العرض:</span>
                <span className="font-mono font-bold text-[#1A1A1A]">{quote.quoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7E72] font-semibold">تاريخ الإصدار:</span>
                <span className="font-medium text-[#1A1A1A]">{quoteDateStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7E72] font-semibold">صلاحية العرض:</span>
                <span className="font-bold text-emerald-800">
                  {quote.validUntil || `${settings.defaultQuoteValidityDays || 15} يوماً من تاريخه`}
                </span>
              </div>
            </div>

          </div>

          {/* Client & Destination Information Box */}
          <div className="bg-[#FAF6EE] border border-[#D4AF37] rounded p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#8B6508] font-bold block text-[11px] mb-1">الموجه إليه (العميل / المصنع / المؤسسة):</span>
              <div className="text-sm font-extrabold text-[#1A1A1A]">{quote.clientName || 'عميل كريم'}</div>
              {quote.companyName && (
                <div className="text-xs font-semibold text-[#5D4E42]">المصنع / الشركة: {quote.companyName}</div>
              )}
            </div>

            <div className="sm:text-left space-y-0.5 font-medium">
              <span className="text-[#8B6508] font-bold block text-[11px] mb-1">بيانات التواصل والتسليم:</span>
              <div>رقم الهاتف: <span className="font-mono font-bold text-[#1A1A1A]" dir="ltr">{quote.clientPhone}</span></div>
              {quote.deliveryCity && <div>مدينة التسليم والتوريد: <span className="font-bold">{quote.deliveryCity}</span></div>}
              {quote.clientEmail && <div>البريد: {quote.clientEmail}</div>}
            </div>
          </div>

          {/* Quotation Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-[#1A1A1A] text-[#D4AF37] border-y-2 border-[#D4AF37]">
                  <th className="p-2.5 text-center w-10">م</th>
                  <th className="p-2.5">بيان الصنف والمواصفات</th>
                  <th className="p-2.5 text-center">كود الصنف</th>
                  <th className="p-2.5 text-center">الخامة والأبعاد</th>
                  <th className="p-2.5 text-center">الكمية</th>
                  <th className="p-2.5 text-center">سعر الوحدة</th>
                  <th className="p-2.5 text-center">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/30 bg-white">
                {quote.items.map((item, idx) => {
                  const unitPrice = item.product.price;
                  const itemTotal = unitPrice * item.quantity;
                  return (
                    <tr key={idx} className="hover:bg-[#FAF6EE]">
                      <td className="p-2.5 text-center font-bold text-[#8B6508]">{idx + 1}</td>
                      <td className="p-2.5">
                        <div className="font-bold text-[#1A1A1A] text-sm">{item.product.name}</div>
                        {item.product.shortDesc && (
                          <div className="text-[11px] text-[#5D4E42] line-clamp-1">{item.product.shortDesc}</div>
                        )}
                        {item.customNotes && (
                          <div className="text-[10px] text-amber-800 italic mt-0.5">ملاحظات: {item.customNotes}</div>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-mono text-[#1A1A1A] font-bold text-[11px]">
                        {item.product.itemCode}
                      </td>
                      <td className="p-2.5 text-center text-[#5D4E42] text-[11px]">
                        <div>{item.product.material || '-'}</div>
                        <div className="text-[10px] text-[#8C7E72]">{item.product.dimensions || ''}</div>
                      </td>
                      <td className="p-2.5 text-center font-black text-sm text-[#1A1A1A]">
                        {item.quantity}
                      </td>
                      <td className="p-2.5 text-center font-bold text-[#1A1A1A]">
                        {formatPrice(unitPrice, currency, settings.exchangeRates)}
                      </td>
                      <td className="p-2.5 text-center font-black text-sm text-[#8B6508]">
                        {formatPrice(itemTotal, currency, settings.exchangeRates)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Words Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2">
            
            {/* Left: Written Words & Notes */}
            <div className="sm:col-span-7 bg-[#FAF6EE] border border-[#D4AF37]/50 rounded p-3.5 space-y-2 text-xs">
              <div>
                <span className="text-[#8B6508] font-bold block text-[11px]">المبلغ الإجمالي بالحروف:</span>
                <span className="font-bold text-[#1A1A1A] text-xs sm:text-sm">
                  {formatArabicNumberWords(quote.total, quote.currency || 'EGP')}
                </span>
              </div>

              {quote.notes && (
                <div className="pt-2 border-t border-[#D4AF37]/30 text-[11px] text-[#5D4E42]">
                  <span className="font-bold text-[#8B6508]">ملاحظات الطلب: </span>
                  {quote.notes}
                </div>
              )}
            </div>

            {/* Right: Calculations Box */}
            <div className="sm:col-span-5 bg-white border-2 border-[#D4AF37] rounded p-3.5 space-y-1.5 text-xs shadow-sm">
              <div className="flex justify-between text-[#5D4E42]">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-[#1A1A1A]">{formatPrice(quote.subtotal, currency, settings.exchangeRates)}</span>
              </div>
              {quote.discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>خصم الكميات والتوريد:</span>
                  <span>- {formatPrice(quote.discount, currency, settings.exchangeRates)}</span>
                </div>
              )}
              {quote.tax > 0 && (
                <div className="flex justify-between text-[#5D4E42]">
                  <span>ضريبة القيمة المضافة ({settings.taxRate}%):</span>
                  <span>+ {formatPrice(quote.tax, currency, settings.exchangeRates)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t-2 border-[#D4AF37] text-[#1A1A1A]">
                <span className="text-sm font-black font-pharaoh">صافي الإجمالي النهائي:</span>
                <span className="text-xl font-black font-pharaoh text-[#8B6508]">
                  {formatPrice(quote.total, currency, settings.exchangeRates)}
                </span>
              </div>
            </div>

          </div>

          {/* Terms & Conditions Section */}
          <div className="border-t border-[#D4AF37]/40 pt-4 space-y-1.5 text-[11px] text-[#5D4E42]">
            <div className="font-bold text-[#8B6508] flex items-center gap-1 text-xs">
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>الشروط والأحكام العامة للتوريد والتعاقد:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pr-1 text-[#5D4E42] font-medium">
              {settings.quoteTerms && settings.quoteTerms.length > 0 ? (
                settings.quoteTerms.map((term, i) => <li key={i}>{term}</li>)
              ) : (
                <>
                  <li>الأسعار الموضحة في عرض السعر سارية لمدة 15 يوماً من تاريخ الإصدار.</li>
                  <li>شروط السداد: 50% دفعة مقدمة عند تأكيد الطلب، و50% قبل موعد التسليم والشحن.</li>
                  <li>جميع المنتجات مرفق معها شهادة أصالة وجودة وضمان ضد عيوب الصناعة.</li>
                </>
              )}
            </ul>
          </div>

          {/* Official Signatures & Pharaonic Royal Stamp */}
          <div className="pt-6 border-t-2 border-[#D4AF37] grid grid-cols-2 sm:grid-cols-3 items-center justify-between text-center text-xs">
            
            {/* Client Acceptance Signature */}
            <div className="space-y-6 text-[#5D4E42]">
              <span className="font-bold">توقيع واعتماد العميل:</span>
              <div className="w-32 border-b border-dashed border-[#8B6508] mx-auto"></div>
            </div>

            {/* Official Pharaonic Gold Stamp Seal */}
            <div className="hidden sm:flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-double border-[#D4AF37] bg-white flex flex-col items-center justify-center p-2 text-center rotate-[-8deg] shadow-sm">
                <span className="text-xl text-[#8B6508] font-bold">𓋹</span>
                <span className="text-[9px] font-black text-[#1A1A1A] font-pharaoh">الفرعون الذهبي</span>
                <span className="text-[8px] text-[#D4AF37] font-extrabold uppercase">معتمد وموثق</span>
              </div>
            </div>

            {/* Sales & Export Dept Signature */}
            <div className="space-y-6 text-[#5D4E42]">
              <span className="font-bold">إدارة المبيعات والتصدير:</span>
              <div className="font-pharaoh text-xs text-[#1A1A1A] font-black">مصنع ومؤسسة الفرعون الذهبي</div>
            </div>

          </div>

          {/* Footer Sub-Note */}
          <div className="text-center text-[10px] text-[#8C7E72] pt-4 border-t border-[#D4AF37]/30">
            هذا المستند تم إنشاؤه إلكترونياً ويعد عرض أسعار رسمي معتمد من مؤسسة الفرعون الذهبي للتحف والتوريدات التراثية.
          </div>

        </div>

      </div>

    </div>
  );
};
