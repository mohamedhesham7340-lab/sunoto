import React from 'react';
import { Search, Sparkles, Award, Truck, Layers, FileSpreadsheet } from 'lucide-react';
import { CATEGORIES } from '../data/initialProducts';

interface HeroBannerProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  totalProducts: number;
  openCart: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  totalProducts,
  openCart
}) => {
  return (
    <div className="relative overflow-hidden bg-[#FDFBF7] text-[#2D241E] border-b-2 border-[#D4AF37] py-8 sm:py-12 parchment-pattern">
      {/* Decorative Warm Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2D241E]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Content Box */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1A1A] text-[#D4AF37] border border-[#D4AF37] text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>كتالوج التوريدات والتحف المصرية الأصيلة للمصانع والشركات والأفراد</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-pharaoh text-[#1A1A1A] tracking-wide leading-tight">
            عروض أسعار مقتنيات الحضارة المصرية
          </h1>

          <p className="text-sm sm:text-base text-[#5D4E42] leading-relaxed max-w-2xl mx-auto font-medium">
            تصفح أحدث قائمة أسعار ومواصفات التحف، المجوهرات، البرديات، والزيوت العطرية الملكية. أضف المنتجات لسلة التسعير واحصل على عرض سعر رسمي موثق بصيغة <span className="text-[#8B6508] font-bold">PDF</span> أو أرسله فوراً عبر <span className="text-[#128C7E] font-bold">واتساب</span> بضغطة زر.
          </p>

          {/* Quick Badges in Artistic Box Style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 pb-2">
            <div className="flex items-center justify-center gap-2 bg-white border border-[#D4AF37] p-2.5 rounded shadow-sm text-xs font-bold text-[#2D241E]">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>جودة مطابقة للأصل 100%</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white border border-[#D4AF37] p-2.5 rounded shadow-sm text-xs font-bold text-[#2D241E]">
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              <span>توريد وشحن محلي وتصدير</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white border border-[#D4AF37] p-2.5 rounded shadow-sm text-xs font-bold text-[#2D241E]">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              <span>خصومات كميات للمصانع</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white border border-[#D4AF37] p-2.5 rounded shadow-sm text-xs font-bold text-[#2D241E]">
              <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
              <span>عروض أسعار رسمية PDF</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
              <input
                id="search-products-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم، كود الصنف، أو الخامة (مثال: قناع ذهبي، بازلت، بردي، لوتس)..."
                className="w-full bg-white text-[#1A1A1A] pr-11 pl-4 py-3.5 rounded border-2 border-[#D4AF37] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#D4AF37]/30 placeholder:text-[#8C7E72] text-sm shadow-md focus:outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs bg-[#1A1A1A] text-[#D4AF37] hover:bg-[#2D241E] px-2.5 py-1 rounded"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                id={`cat-filter-${category}`}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded text-xs sm:text-sm uppercase tracking-wider font-bold transition-all cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-[#1A1A1A] text-[#D4AF37] border-2 border-[#D4AF37] shadow-md scale-105'
                    : 'bg-white text-[#2D241E] border border-[#D4AF37]/60 hover:border-[#D4AF37] hover:bg-[#FAF6EE]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
