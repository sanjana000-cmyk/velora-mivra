import React from 'react';
import {
  Heart,
  ShieldCheck,
  MapPin,
  Leaf,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { MarketplaceItem } from '../types/marketplace';
import { CurrencyCode, formatPrice, formatAlternatePrice } from '../utils/currency';

interface ItemCardProps {
  item: MarketplaceItem;
  onSelect: (item: MarketplaceItem) => void;
  isSaved: boolean;
  onToggleSave: (itemId: string) => void;
  onQuickBorrowOrBuy?: (item: MarketplaceItem) => void;
  currency?: CurrencyCode;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onSelect,
  isSaved,
  onToggleSave,
  currency = 'USD',
}) => {
  const getDealBadge = () => {
    switch (item.dealType) {
      case 'borrow':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#C04A2B] text-white shadow-xs">
            <Clock className="w-3 h-3" />
            Borrow · {formatPrice(item.borrowRatePerDay || 0, currency)}/day
          </span>
        );
      case 'sell':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#3D2314] text-[#FBF7F1] shadow-xs">
            Buy · {formatPrice(item.price, currency)}
          </span>
        );
      case 'free':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#5B6E3A] text-white shadow-xs">
            Free Giveaway
          </span>
        );
      case 'exchange':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#6D2E46] text-white shadow-xs">
            Peer Exchange
          </span>
        );
      default:
        return null;
    }
  };

  const baseAmount = item.dealType === 'borrow' ? item.borrowRatePerDay || 0 : item.price;
  const altPrice = item.dealType !== 'free' ? formatAlternatePrice(baseAmount, currency) : '';

  return (
    <article
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-[#E6D7C8] hover:border-[#B85D19]/60 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-[#F4EAE0] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Subtle gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#261810]/55 via-transparent to-black/15 pointer-events-none" />

        {/* Single Clean Deal Tag */}
        <div className="absolute top-3 left-3 z-10">{getDealBadge()}</div>

        {/* Bookmark Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(item.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isSaved
              ? 'bg-white text-[#C04A2B] shadow-xs'
              : 'bg-black/25 text-white hover:bg-black/45'
          }`}
          title={isSaved ? 'Remove bookmark' : 'Save item'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C04A2B]' : ''}`} />
        </button>

        {/* Quiet bottom photo caption */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white/95 text-[11px] font-medium z-10">
          <span className="inline-flex items-center gap-1 drop-shadow-xs">
            <Leaf className="w-3 h-3 text-[#D6E5B8]" />
            Avoids {item.impact.co2Kg}kg CO₂
          </span>
          <span className="text-white/90 drop-shadow-xs">{item.condition}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Clean Unboxed Metadata Line */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#6E5A4F] mb-1 truncate">
            <span className="font-semibold text-[#B85D19]">{item.category}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3 text-[#8B7569] shrink-0" />
              {item.campusLocation}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-[#261810] text-sm sm:text-[15px] line-clamp-1 group-hover:text-[#3D2314] transition-colors">
            {item.title}
          </h3>

          {/* Description Excerpt */}
          <p className="text-xs text-[#6E5A4F] line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Quiet Inline Occasion / Keyword Line */}
        {(item.occasionTags?.[0] || item.tags.length > 0) && (
          <div className="text-[11px] text-[#8B7569] truncate">
            {item.occasionTags?.[0] && item.occasionTags[0] !== 'Everyday'
              ? `${item.occasionTags[0]} · `
              : ''}
            {item.tags.slice(0, 2).join(' · ')}
          </div>
        )}

        {/* Seller Info & Action Bar */}
        <div className="pt-3 border-t border-[#EFE3D6] flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={item.seller.avatar}
              alt={item.seller.name}
              className="w-7 h-7 rounded-full object-cover border border-[#E6D7C8] shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-[#261810] truncate">
                  {item.seller.name}
                </span>
                {item.seller.verifiedEdu && (
                  <span title="Verified Campus Student" className="inline-flex">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5B6E3A] shrink-0" />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#8B7569] block truncate">
                {item.seller.hostel} · {item.seller.rating}★
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            {item.dealType === 'borrow' ? (
              <div>
                <span className="text-xs font-extrabold text-[#C04A2B]">
                  {formatPrice(item.borrowRatePerDay || 0, currency)}
                </span>
                <span className="text-[10px] text-[#8B7569]">/day</span>
                {altPrice && (
                  <span className="text-[10px] text-[#8B7569] block">≈ {altPrice}/d</span>
                )}
              </div>
            ) : item.dealType === 'free' ? (
              <span className="text-xs font-extrabold text-[#5B6E3A]">Free</span>
            ) : (
              <div>
                <span className="text-xs font-extrabold text-[#3D2314]">
                  {formatPrice(item.price, currency)}
                </span>
                {altPrice && (
                  <span className="text-[10px] text-[#8B7569] block">≈ {altPrice}</span>
                )}
              </div>
            )}
            <div className="text-[10px] text-[#B85D19] font-semibold flex items-center justify-end gap-0.5 group-hover:underline">
              <span>View</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
