import React from 'react';
import { X, Bookmark, Trash2, Leaf } from 'lucide-react';
import { MarketplaceItem } from '../types/marketplace';
import { CurrencyCode, formatPrice, formatAlternatePrice } from '../utils/currency';

interface SavedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: MarketplaceItem[];
  onRemoveSave: (id: string) => void;
  onSelectItem: (item: MarketplaceItem) => void;
  currency?: CurrencyCode;
}

export const SavedItemsModal: React.FC<SavedItemsModalProps> = ({
  isOpen,
  onClose,
  savedItems,
  onRemoveSave,
  onSelectItem,
  currency = 'USD',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-[#2A170D]/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FBF7F1] rounded-3xl shadow-2xl border border-[#E6D7C8] overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#543220] bg-[#3D2314] text-[#FBF7F1]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-[#F3C4A0] flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-[#FBF7F1] text-base">
                Saved Campus Gear ({savedItems.length})
              </h2>
              <p className="text-[11px] text-[#F3C4A0]">Items you bookmarked for later</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/75 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {savedItems.length > 0 ? (
            savedItems.map((item) => {
              const baseAmount =
                item.dealType === 'borrow' ? item.borrowRatePerDay || 0 : item.price;
              const altPrice =
                item.dealType !== 'free' ? formatAlternatePrice(baseAmount, currency) : '';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className="bg-white p-3 rounded-2xl border border-[#E6D7C8] hover:border-[#B85D19] hover:shadow-md cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#E6D7C8]"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#261810] truncate group-hover:text-[#3D2314]">
                        {item.title}
                      </h4>
                      <div className="text-[11px] text-[#6E5A4F] flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="font-bold text-[#3D2314]">
                          {item.dealType === 'borrow'
                            ? `${formatPrice(item.borrowRatePerDay || 0, currency)}/day`
                            : item.dealType === 'free'
                              ? 'Free'
                              : formatPrice(item.price, currency)}
                        </span>
                        {altPrice && (
                          <span className="text-[10px] text-[#8B7569]">
                            (≈ {altPrice}
                            {item.dealType === 'borrow' ? '/d' : ''})
                          </span>
                        )}
                        <span>·</span>
                        <span>{item.condition}</span>
                      </div>
                      <span className="text-[10px] text-[#5B6E3A] font-medium flex items-center gap-1 mt-0.5">
                        <Leaf className="w-3 h-3" />
                        Est. {item.impact.co2Kg}kg CO₂ avoided
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSave(item.id);
                      }}
                      className="p-2 rounded-lg text-[#8B7569] hover:text-[#C04A2B] hover:bg-[#FBF0EC] transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-[#B85D19] group-hover:underline">
                      View →
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#F4EAE0] text-[#8B7569] flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#261810]">No saved items yet</h3>
              <p className="text-xs text-[#6E5A4F] max-w-xs mx-auto">
                Click the heart icon on any product in the marketplace or occasion hub to keep track
                of it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
