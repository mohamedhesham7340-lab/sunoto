import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Phone, ShieldCheck, Clock } from 'lucide-react';
import { SiteSettings, Product } from '../types';

interface WhatsAppFloatingWidgetProps {
  settings: SiteSettings;
  currentProduct?: Product | null;
}

export const WhatsAppFloatingWidget: React.FC<WhatsAppFloatingWidgetProps> = ({
  settings,
  currentProduct
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('general');

  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');

  const templates = [
    {
      id: 'general',
      label: 'استفسار عام وطلب كتالوج',
      text: `مرحباً، أود الاستفسار عن المنتجات الفرعونية وطلب كتالوج الأسعار الحالي لورش ومصنع ${settings.storeName || 'الفرعون الذهبي'}.`
    },
    {
      id: 'wholesale',
      label: 'طلبات الجملة والتوريد للمصانع والشركات',
      text: `السلام عليكم، أود طلب تسعير لكميات جملة وتوريدات لمؤسسة / شركة، والتعرف على نسب الخصم المتاحة.`
    },
    {
      id: 'custom_order',
      label: 'تصنيع خاص أو حفر بالطلب',
      text: `مرحباً، هل يتوفر لديكم تصنيع تحف فرعونية مخصصة بمقاسات أو حفر اسم ولوجو بالطلب؟`
    },
    ...(currentProduct ? [{
      id: 'current_item',
      label: `استفسار عن: ${currentProduct.name}`,
      text: `مرحباً، أود الاستفسار عن منتج: ${currentProduct.name} (كود: ${currentProduct.itemCode})\nالسعر: ${currentProduct.price} ج.م\nرابط المعاينة: ${typeof window !== 'undefined' ? `${window.location.origin}?product=${currentProduct.id}` : ''}`
    }] : [])
  ];

  const handleSendMessage = () => {
    let textToSend = customMessage.trim();
    if (!textToSend) {
      const activeTmpl = templates.find(t => t.id === selectedTemplate) || templates[0];
      textToSend = activeTmpl.text;
    }

    // Attach product link if viewing a product and not already in text
    if (currentProduct && typeof window !== 'undefined' && !textToSend.includes('product=')) {
      textToSend += `\n\n📌 رابط المنتج: ${window.location.origin}?product=${currentProduct.id}`;
    }

    const fullUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomMessage('');
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 font-cairo" dir="rtl">
      
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-[#1A1A1A] text-[#FDFBF7] rounded border-2 border-[#D4AF37] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-[#2D241E] p-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-black flex items-center justify-center shadow-md">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#2D241E] rounded-full animate-pulse"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#D4AF37] font-pharaoh">خدمة عملاء الفرعون الذهبي</h3>
                <div className="flex items-center gap-1 text-[10px] text-[#C5BBAF]">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>متواجدون للرد الفوري على مدار الساعة</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded bg-[#1A1A1A] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] transition-all border border-[#D4AF37]/40"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#1A1A1A] max-h-[70vh] overflow-y-auto">
            
            {/* Greeting */}
            <div className="bg-[#2D241E] p-3 rounded border border-[#D4AF37]/30 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>أهلاً بك في صرح التراث الفرعوني الأصيل!</span>
              </div>
              <p className="text-[#C5BBAF] text-[11px] leading-relaxed">
                يسعدنا الإجابة عن أي استفسار، تقديم عروض الأسعار المخفضة، وحجز شحنات التوريد الفوري.
              </p>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#D4AF37] block">اختر نوع الاستفسار السريع:</label>
              <div className="space-y-1.5">
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl.id);
                      setCustomMessage(tmpl.text);
                    }}
                    className={`w-full text-right p-2 rounded text-[11px] border transition-all ${
                      selectedTemplate === tmpl.id
                        ? 'bg-[#D4AF37] text-[#1A1A1A] font-bold border-[#D4AF37] shadow-sm'
                        : 'bg-[#2D241E] text-[#EFE9E1] hover:text-[#D4AF37] border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    • {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#D4AF37] block">نص الرسالة المخصصة:</label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="اكتب رسالتك أو استفسارك هنا..."
                className="w-full bg-[#2D241E] text-xs text-[#FDFBF7] p-2.5 rounded border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none resize-none placeholder:text-[#8C7E72]"
              />
            </div>

            {/* Current Product Attached Hint */}
            {currentProduct && (
              <div className="p-2 rounded bg-[#2D241E] border border-[#D4AF37]/30 flex items-center justify-between text-[10px] text-[#C5BBAF]">
                <span className="line-clamp-1">مرفق: {currentProduct.name}</span>
                <span className="text-[#D4AF37] font-bold font-mono">#{currentProduct.itemCode}</span>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              className="w-full py-2.5 px-4 rounded bg-[#25D366] hover:bg-[#1EBE5D] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-[#25D366]"
            >
              <Send className="w-4 h-4" />
              <span>بدء المحادثة على واتساب الآن</span>
            </button>

          </div>

          {/* Footer Security Badge */}
          <div className="p-2 bg-[#2D241E] border-t border-[#D4AF37]/30 text-center text-[10px] text-[#C5BBAF] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
            <span>رقم معتمد وموثق: <span dir="ltr" className="font-mono text-[#D4AF37]">{settings.whatsappNumber}</span></span>
          </div>

        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-black px-4 py-3 rounded-full shadow-2xl hover:shadow-[#25D366]/40 transition-all transform hover:scale-105 border-2 border-white/40 active:scale-95"
        title="تواصل مباشر عبر واتساب"
        aria-label="WhatsApp Contact"
      >
        <MessageCircle className="w-6 h-6 fill-current text-black" />
        <span className="hidden sm:inline-block text-xs font-black uppercase tracking-wider text-black">
          استفسار واتساب فوري
        </span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white"></span>
      </button>

    </div>
  );
};
