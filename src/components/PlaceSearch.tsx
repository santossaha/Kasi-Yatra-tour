import React from 'react';
import { Search, X } from 'lucide-react';
import { Language, PlaceCategory } from '../types/tourist';

interface PlaceSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: PlaceCategory | 'all';
  onCategoryChange: (cat: PlaceCategory | 'all') => void;
  lang: Language;
  totalCount: number;
}

export const PlaceSearch: React.FC<PlaceSearchProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  lang,
  totalCount,
}) => {
  const categories: { id: PlaceCategory | 'all'; labelEn: string; labelHi: string }[] = [
    { id: 'all', labelEn: 'All Places', labelHi: 'सभी स्थान' },
    { id: 'ghat', labelEn: 'Ghats', labelHi: 'घाट' },
    { id: 'temple', labelEn: 'Temples', labelHi: 'मंदिर' },
    { id: 'historical', labelEn: 'Heritage', labelHi: 'ऐतिहासिक' },
    { id: 'museum', labelEn: 'Museums', labelHi: 'संग्रहालय' },
  ];

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-stone-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            lang === 'hi'
              ? 'स्थान, घाट, मंदिर खोजें (उदा. काशी विश्वनाथ, सारनाथ)...'
              : 'Search temples, ghats, monuments (e.g. Vishwanath, Sarnath)...'
          }
          className="w-full pl-10 pr-9 py-2.5 text-sm bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 placeholder:text-stone-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 p-1 text-stone-400 hover:text-stone-600 rounded-full"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Segmented Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white/90 text-stone-700 hover:bg-stone-100 border border-stone-200/80 shadow-xs'
              }`}
            >
              {lang === 'hi' ? cat.labelHi : cat.labelEn}
            </button>
          );
        })}
      </div>
    </div>
  );
};
