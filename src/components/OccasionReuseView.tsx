import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  PlusCircle,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { MarketplaceItem, OccasionType } from '../types/marketplace';
import { CurrencyCode, formatPrice } from '../utils/currency';
import { ItemCard } from './ItemCard';

interface OccasionReuseViewProps {
  items: MarketplaceItem[];
  onSelectItem: (item: MarketplaceItem) => void;
  savedItemIds: string[];
  onToggleSave: (id: string) => void;
  onOpenCreateListing: () => void;
  onOpenMivra: () => void;
  currency?: CurrencyCode;
}

export const OccasionReuseView: React.FC<OccasionReuseViewProps> = ({
  items,
  onSelectItem,
  savedItemIds,
  onToggleSave,
  onOpenCreateListing,
  onOpenMivra,
  currency = 'USD',
}) => {
  const [activeOccasion, setActiveOccasion] = useState<OccasionType>('College Fests');

  const occasionCards: {
    title: OccasionType;
    tagline: string;
    description: string;
    note: string;
  }[] = [
    {
      title: 'College Fests',
      tagline: 'Festive Wear & Props',
      description: 'Festive kurtas, dorm lighting, instruments, and statement jackets.',
      note: 'Fest Season',
    },
    {
      title: 'Traditional Day',
      tagline: 'Ethnic Kurtas & Sarees',
      description: 'Silk sarees, dupattas, embroidered kurtas, and heritage accessories.',
      note: 'High Demand',
    },
    {
      title: 'Placement & Interviews',
      tagline: 'Tailored Blazers & Ties',
      description: 'Look sharp for placement interviews, case competitions, and pitches.',
      note: 'Career Ready',
    },
    {
      title: 'Farewell & Prom',
      tagline: 'Evening Gowns & Suits',
      description: 'Evening attire for senior farewell nights and banquet dinners.',
      note: 'Single-Night Reuse',
    },
    {
      title: 'Lab Practicals',
      tagline: 'Lab Coats & Drafting Kits',
      description: 'Borrow 100% cotton lab coats, goggles, and A1 drafting boards.',
      note: 'Lab Approved',
    },
    {
      title: 'Hackathons',
      tagline: 'Arduino & Sensor Kits',
      description: 'Microcontrollers, jumper wires, and displays for weekend sprints.',
      note: 'Sprint Ready',
    },
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.occasionTags.includes(activeOccasion));
  }, [items, activeOccasion]);

  const currentMeta = occasionCards.find((c) => c.title === activeOccasion);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Occasion Header */}
      <div className="relative rounded-3xl overflow-hidden bg-[#3D2314] text-[#FBF7F1] p-7 sm:p-10 border border-[#593522] shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="text-xs font-semibold text-[#F3C4A0] tracking-wide">
              Autumn Event & Occasion Wardrobe
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
              Wear it for the night.{' '}
              <span className="italic text-[#F0B865]">
                Don't let it sit in your dorm closet for four years.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#EAD9CB] leading-relaxed max-w-2xl">
              Most students buy outfits for fests, farewells, or lab practicals that get worn once or twice. Borrow from verified classmates for a fraction of the price and keep circular fashion alive on campus.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenCreateListing}
                className="px-4 py-2.5 rounded-full bg-[#C04A2B] hover:bg-[#A33B20] text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List an Occasion Outfit</span>
              </button>
              <button
                onClick={onOpenMivra}
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-[#FBF7F1] text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F0B865]" />
                <span>Ask Mivra to Match an Outfit</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/10 border border-white/15 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#F3C4A0] text-xs font-semibold">
              <TrendingDown className="w-4 h-4" />
              <span>Circular Savings</span>
            </div>
            <div className="font-display text-3xl font-bold text-white">Up to 85% off</div>
            <p className="text-xs text-[#EAD9CB] leading-relaxed">
              Borrowing an interview blazer or traditional kurta saves an average of{' '}
              {formatPrice(95, currency)} and avoids ~18 kg of textile CO₂ emissions.
            </p>
          </div>
        </div>
      </div>

      {/* Occasion Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {occasionCards.map((card) => {
          const isSelected = activeOccasion === card.title;
          return (
            <button
              key={card.title}
              onClick={() => setActiveOccasion(card.title)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#3D2314] text-[#FBF7F1] border-[#3D2314] shadow-sm'
                  : 'bg-white text-[#261810] border-[#E6D7C8] hover:border-[#B85D19]/60 hover:bg-[#FBF7F1]'
              }`}
            >
              <div>
                <div className="text-xs font-bold leading-snug">{card.title}</div>
                <div
                  className={`text-[11px] mt-1 ${
                    isSelected ? 'text-[#F3C4A0]' : 'text-[#6E5A4F]'
                  }`}
                >
                  {card.tagline}
                </div>
              </div>
              <div
                className={`text-[10px] font-semibold mt-3 ${
                  isSelected ? 'text-[#F0B865]' : 'text-[#C04A2B]'
                }`}
              >
                {card.note}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Occasion Summary Bar */}
      {currentMeta && (
        <div className="bg-white p-5 rounded-2xl border border-[#E6D7C8] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#3D2314]">
              {currentMeta.title}
            </h2>
            <p className="text-xs text-[#6E5A4F] mt-0.5">{currentMeta.description}</p>
          </div>

          <div className="text-xs text-[#6E5A4F] bg-[#FBF7F1] px-3.5 py-2 rounded-xl border border-[#E6D7C8] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#B85D19]" />
            <span>
              Standard borrow window: <strong className="text-[#261810]">1–4 days</strong>
            </span>
          </div>
        </div>
      )}

      {/* Filtered Occasion Items Grid */}
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
        <div className="bg-white rounded-3xl border border-[#E6D7C8] p-8 text-center space-y-3 max-w-md mx-auto">
          <h3 className="font-display text-lg font-semibold text-[#3D2314]">
            Be the first to list gear for {activeOccasion}
          </h3>
          <p className="text-xs text-[#6E5A4F]">
            Have an outfit or tool you only used once? Lend it to a classmate and earn extra pocket money while keeping campus sustainable.
          </p>
          <button
            onClick={onOpenCreateListing}
            className="px-4 py-2 rounded-full bg-[#3D2314] hover:bg-[#2C180D] text-white text-xs font-semibold transition-colors"
          >
            List for {activeOccasion}
          </button>
        </div>
      )}
    </div>
  );
};
