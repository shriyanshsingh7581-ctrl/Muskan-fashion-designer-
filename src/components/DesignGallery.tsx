import React, { useState, useMemo } from 'react';
import { BlouseDesign, CategoryId, Language } from '../types';
import { CATEGORIES } from '../data/initialData';
import { translations } from '../data/translations';
import { DesignCard } from './DesignCard';
import { Search, Sparkles } from 'lucide-react';

interface DesignGalleryProps {
  designs: BlouseDesign[];
  language: Language;
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  onViewDetails: (design: BlouseDesign) => void;
  onOrderThis: (design: BlouseDesign) => void;
}

export const DesignGallery: React.FC<DesignGalleryProps> = ({
  designs,
  language,
  selectedCategory,
  onSelectCategory,
  onViewDetails,
  onOrderThis,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[language];

  // Filter designs by category and search term
  const filteredDesigns = useMemo(() => {
    return designs.filter((design) => {
      // Category check
      const matchesCategory =
        selectedCategory === 'all' ||
        design.categoryId === selectedCategory ||
        (selectedCategory === 'festive-navratri' && design.isNavratriSpecial);

      if (!matchesCategory) return false;

      // Search check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const nameHi = design.nameHi.toLowerCase();
      const nameEn = design.nameEn.toLowerCase();
      const code = design.code.toLowerCase();
      const descHi = (design.descriptionHi || '').toLowerCase();
      const descEn = (design.descriptionEn || '').toLowerCase();
      const neck = (design.neckTypeHi + ' ' + design.neckTypeEn).toLowerCase();
      const sleeve = (design.sleeveTypeHi + ' ' + design.sleeveTypeEn).toLowerCase();

      return (
        nameHi.includes(q) ||
        nameEn.includes(q) ||
        code.includes(q) ||
        descHi.includes(q) ||
        descEn.includes(q) ||
        neck.includes(q) ||
        sleeve.includes(q)
      );
    });
  }, [designs, selectedCategory, searchQuery]);

  return (
    <section id="gallery-section" className="py-12 sm:py-16 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#80182A] tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.gallery.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#4A0A19] text-balance">
            {t.gallery.subtitle}
          </h2>
        </div>

        {/* Search Bar & Stats */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A70]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.gallery.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#D9CEB5] focus:border-[#80182A] focus:ring-2 focus:ring-[#80182A]/10 rounded-full text-sm text-[#2C1810] placeholder-[#8C7A70] shadow-xs outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8C7A70] hover:text-[#4A0A19]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs (Functional segmented controls allowed by design guide) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start lg:justify-center">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const categoryName = language === 'hi' ? cat.nameHi : cat.nameEn;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#6B1124] text-white shadow-xs font-semibold border border-[#80182A]'
                    : 'bg-[#F5EFE3] text-[#5A4A42] hover:bg-[#EADBBE] hover:text-[#2C1810] border border-transparent'
                }`}
              >
                {categoryName}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredDesigns.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                language={language}
                onViewDetails={onViewDetails}
                onOrderThis={onOrderThis}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E8DFC8] max-w-md mx-auto">
            <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-[#4A0A19]">
              {t.gallery.noResults}
            </h3>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-[#80182A] bg-[#FAF3E8] hover:bg-[#F2E8D5] rounded-full border border-[#DFC99D] transition-colors"
            >
              सभी डिज़ाइन देखें
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
