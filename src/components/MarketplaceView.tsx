import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Search,
  X,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { MarketplaceItem, ItemCategory, OccasionType, Condition } from '../types/marketplace';
import { CurrencyCode, formatPrice } from '../utils/currency';
import { ItemCard } from './ItemCard';

interface MarketplaceViewProps {
  items: MarketplaceItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDealType: string;
  setSelectedDealType: (type: string) => void;
  selectedOccasion: string;
  setSelectedOccasion: (occ: string) => void;
  savedItemIds: string[];
  onToggleSave: (id: string) => void;
  onSelectItem: (item: MarketplaceItem) => void;
  onOpenCreateListing: () => void;
  onOpenMivra: () => void;
  onOpenWantedBoard: () => void;
  currency?: CurrencyCode;
  naturalSearchInterpretation?: string | null;
  naturalMatchedItemIds?: string[] | null;
  onClearNaturalSearch?: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  items,
  searchTerm,
  setSearchTerm,
  selectedDealType,
  setSelectedDealType,
  selectedOccasion,
  setSelectedOccasion,
  savedItemIds,
  onToggleSave,
  onSelectItem,
  onOpenMivra,
  onOpenWantedBoard,
  currency = 'USD',
  naturalSearchInterpretation,
  naturalMatchedItemIds,
  onClearNaturalSearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'impact'>('newest');
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);

  const categories: { label: string; value: ItemCategory | 'all' }[] = [
    { label: 'All Items', value: 'all' },
    { label: 'Books & Academics', value: 'Books & Academics' },
    { label: 'Electronics & Tech', value: 'Electronics & Gadgets' },
    { label: 'Clothing & Outfits', value: 'Clothing & Outfits' },
    { label: 'Lab & Studio Gear', value: 'Lab & Studio Equipment' },
    { label: 'Dorm & Living', value: 'Dorm & Living' },
    { label: 'Bikes & Mobility', value: 'Bicycles & Mobility' },
  ];

  const occasions: { label: string; value: OccasionType | 'all' }[] = [
    { label: 'All Occasions', value: 'all' },
    { label: 'College Fests', value: 'College Fests' },
    { label: 'Traditional Day', value: 'Traditional Day' },
    { label: 'Placement & Interviews', value: 'Placement & Interviews' },
    { label: 'Farewell & Prom', value: 'Farewell & Prom' },
    { label: 'Lab Practicals', value: 'Lab Practicals' },
    { label: 'Hackathons', value: 'Hackathons' },
  ];

  const conditions: { label: string; value: Condition | 'all' }[] = [
    { label: 'Any Condition', value: 'all' },
    { label: 'Like New', value: 'Like New' },
    { label: 'Good', value: 'Good' },
    { label: 'Fair', value: 'Fair' },
  ];

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (naturalMatchedItemIds && naturalMatchedItemIds.length > 0) {
          if (!naturalMatchedItemIds.includes(item.id)) {
            return false;
          }
        }

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
          const matchSeller = item.seller.name.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCategory && !matchTags && !matchSeller) {
            return false;
          }
        }

        if (selectedDealType !== 'all') {
          if (selectedDealType === 'borrow') {
            if (item.dealType !== 'borrow' && item.dealType !== 'lend') return false;
          } else if (selectedDealType === 'sell') {
            if (item.dealType !== 'sell') return false;
          } else if (selectedDealType === 'free') {
            if (item.dealType !== 'free') return false;
          }
        }

        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        if (
          selectedOccasion !== 'all' &&
          !item.occasionTags.includes(selectedOccasion as OccasionType)
        ) {
          return false;
        }

        if (selectedCondition !== 'all' && item.condition !== selectedCondition) {
          return false;
        }

        const relevantPrice = item.dealType === 'borrow' ? item.borrowRatePerDay || 0 : item.price;
        if (relevantPrice > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price-asc') {
          const priceA = a.dealType === 'borrow' ? a.borrowRatePerDay || 0 : a.price;
          const priceB = b.dealType === 'borrow' ? b.borrowRatePerDay || 0 : b.price;
          return priceA - priceB;
        }
        if (sortBy === 'price-desc') {
          const priceA = a.dealType === 'borrow' ? a.borrowRatePerDay || 0 : a.price;
          const priceB = b.dealType === 'borrow' ? b.borrowRatePerDay || 0 : b.price;
          return priceB - priceA;
        }
        if (sortBy === 'impact') {
          return b.impact.co2Kg - a.impact.co2Kg;
        }
        return 0;
      });
  }, [
    items,
    naturalMatchedItemIds,
    searchTerm,
    selectedDealType,
    selectedCategory,
    selectedOccasion,
    selectedCondition,
    maxPrice,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedDealType !== 'all' ? 1 : 0) +
    (selectedOccasion !== 'all' ? 1 : 0) +
    (selectedCondition !== 'all' ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (naturalMatchedItemIds && naturalMatchedItemIds.length > 0 ? 1 : 0) +
    (maxPrice < 100 ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedDealType('all');
    setSelectedOccasion('all');
    setSelectedCondition('all');
    setSearchTerm('');
    setMaxPrice(100);
    onClearNaturalSearch?.();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Category Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? 'bg-[#3D2314] text-[#FBF7F1] shadow-xs'
                : 'bg-white border border-[#E6D7C8] text-[#6E5A4F] hover:text-[#261810] hover:border-[#B85D19]/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-[#E6D7C8] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-[#261810]">
            Showing <span className="text-[#C04A2B] font-bold">{filteredItems.length}</span> listings
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-[#C04A2B] hover:text-[#A33B20] font-semibold bg-[#FBF0EC] px-2.5 py-1 rounded-lg border border-[#EAC6BA]"
            >
              <X className="w-3 h-3" />
              Reset ({activeFiltersCount})
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8B7569]" />
            <span className="text-[#6E5A4F] hidden md:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E6D7C8] bg-[#FBF7F1] text-[#261810] focus:outline-none focus:ring-2 focus:ring-[#B85D19]/30"
            >
              <option value="newest">Latest Listed</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="impact">Highest CO₂ Saved</option>
            </select>
          </div>

          <button
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showFiltersDrawer || activeFiltersCount > 0
                ? 'bg-[#F9EFE6] border-[#B85D19]/40 text-[#3D2314]'
                : 'bg-white border-[#E6D7C8] text-[#6E5A4F] hover:bg-[#FBF7F1]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#3D2314] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFiltersDrawer && (
        <div className="bg-[#F4EAE0] border border-[#E6D7C8] rounded-2xl p-5 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1.5">
                Target Occasion
              </label>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-white"
              >
                {occasions.map((occ) => (
                  <option key={occ.value} value={occ.value}>
                    {occ.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1.5">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-white"
              >
                {conditions.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1.5">Mode</label>
              <select
                value={selectedDealType}
                onChange={(e) => setSelectedDealType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-white"
              >
                <option value="all">All Modes</option>
                <option value="borrow">Borrow & Lend Only</option>
                <option value="sell">Direct Purchase Only</option>
                <option value="free">Free Giveaways Only</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#261810] mb-1.5">
                <span>Max Price / Rate:</span>
                <span className="text-[#C04A2B]">{formatPrice(maxPrice, currency)}</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#C04A2B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8B7569]">
                <span>{formatPrice(5, currency)}</span>
                <span>{formatPrice(100, currency)}+</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Natural Language Search Interpretation Banner */}
      {naturalSearchInterpretation && (
        <div className="bg-[#F7EEF1] border border-[#E4CCD4] p-4 rounded-2xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#6D2E46] text-white shrink-0">
              <Sparkles className="w-4 h-4 text-[#F0B865]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D2E46] block">
                Mivra Natural Search
              </span>
              <p className="text-xs text-[#261810] font-semibold">{naturalSearchInterpretation}</p>
            </div>
          </div>

          {onClearNaturalSearch && (
            <button
              onClick={onClearNaturalSearch}
              className="text-xs font-semibold text-[#6D2E46] hover:text-[#4D1E30] bg-white px-3 py-1.5 rounded-xl border border-[#E4CCD4] shrink-0"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Product Grid or Empty State */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              isSaved={savedItemIds.includes(item.id)}
              onToggleSave={onToggleSave}
              currency={currency}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6D7C8] p-10 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F9EFE6] text-[#B85D19] flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-display text-xl font-semibold text-[#3D2314]">
            No campus listings match these filters
          </h3>
          <p className="text-xs text-[#6E5A4F] leading-relaxed">
            Post a quick request on the Wanted Board or ask Mivra AI to help locate a classmate who can lend what you need.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenWantedBoard}
              className="px-4 py-2 rounded-full bg-[#3D2314] hover:bg-[#2C180D] text-white font-semibold text-xs transition-colors"
            >
              Post on Wanted Board
            </button>
            <button
              onClick={onOpenMivra}
              className="px-4 py-2 rounded-full bg-[#F7EEF1] hover:bg-[#EEDCE2] text-[#6D2E46] font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask Mivra
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-full bg-[#F4EAE0] hover:bg-[#EBDDCE] text-[#261810] font-semibold text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
