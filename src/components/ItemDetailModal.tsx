import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Leaf,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle2,
  Repeat,
  MessageSquare,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';
import { MarketplaceItem } from '../types/marketplace';
import { CAMPUS_MEETUP_SPOTS } from '../data/mockData';
import { CurrencyCode, formatPrice, formatAlternatePrice } from '../utils/currency';

interface ItemDetailModalProps {
  item: MarketplaceItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenMivraWithContext?: (query: string) => void;
  currency?: CurrencyCode;
  onOpenBorrowAdvisor?: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  isSaved,
  onToggleSave,
  onOpenMivraWithContext,
  currency = 'USD',
  onOpenBorrowAdvisor,
}) => {
  const [borrowDays, setBorrowDays] = useState<number>(3);
  const [selectedSpot, setSelectedSpot] = useState<string>(
    item?.meetupSpots[0] || CAMPUS_MEETUP_SPOTS[0]
  );
  const [requestNote, setRequestNote] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setBorrowDays(3);
      setSelectedSpot(item.meetupSpots[0] || CAMPUS_MEETUP_SPOTS[0]);
      setRequestNote('');
      setIsSubmitted(false);
    }
  }, [item?.id]);

  if (!item) return null;

  const dailyRate = item.borrowRatePerDay || 2;
  const deposit = item.borrowDeposit || 10;
  const totalRentalFee = dailyRate * borrowDays;
  const totalDueAtHandover = item.dealType === 'borrow' ? totalRentalFee + deposit : item.price;

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-[#2A170D]/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#FBF7F1] rounded-3xl shadow-2xl border border-[#E6D7C8] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6D7C8] bg-white">
          <div className="flex items-center gap-2 text-xs text-[#6E5A4F]">
            <span className="font-semibold text-[#B85D19]">{item.category}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8B7569]" />
              {item.campusLocation}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-[#6E5A4F] hover:text-[#3D2314] hover:bg-[#F9EFE6] transition-colors"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copiedLink && (
              <span className="text-[11px] font-semibold text-[#B85D19]">Copied</span>
            )}
            <button
              onClick={() => onToggleSave(item.id)}
              className={`p-2 rounded-full transition-colors ${
                isSaved
                  ? 'bg-[#FBF0EC] text-[#C04A2B]'
                  : 'text-[#8B7569] hover:text-[#C04A2B] hover:bg-[#F4EAE0]'
              }`}
              title={isSaved ? 'Bookmarked' : 'Bookmark item'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C04A2B]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#8B7569] hover:text-[#261810] hover:bg-[#F4EAE0] transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-[#F4EAE0] border border-[#E6D7C8]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#261810]/80 text-white backdrop-blur-md">
                    {item.condition}
                  </span>
                  {item.dealType === 'borrow' && (
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#C04A2B] text-white">
                      Borrow · {formatPrice(item.borrowRatePerDay || 0, currency)}/day
                    </span>
                  )}
                  {item.dealType === 'free' && (
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#5B6E3A] text-white">
                      Free Giveaway
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h2 className="font-display text-2xl font-semibold text-[#3D2314]">
                  {item.title}
                </h2>

                <div className="text-xs text-[#6E5A4F] mt-1.5">
                  {item.occasionTags.join(' · ')} · {item.tags.slice(0, 4).join(' · ')}
                </div>

                <div className="mt-4 text-sm text-[#261810] leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-[#E6D7C8]">
                  {item.description}
                </div>
              </div>

              {/* Environmental Circular Impact */}
              <div className="p-5 rounded-2xl bg-[#EFF3E7] border border-[#CBD6B8]">
                <div className="flex items-center gap-2 mb-3 text-[#3D2314] font-bold text-xs">
                  <Leaf className="w-4 h-4 text-[#5B6E3A]" />
                  <span>Estimated Circular Impact of Reusing This Item</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-[#DCE4CC]">
                    <div className="font-display text-lg font-bold text-[#5B6E3A]">
                      {item.impact.co2Kg} kg
                    </div>
                    <div className="text-[11px] text-[#6E5A4F]">CO₂ Avoided</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#DCE4CC]">
                    <div className="font-display text-lg font-bold text-[#C04A2B]">
                      {item.impact.wasteKg} kg
                    </div>
                    <div className="text-[11px] text-[#6E5A4F]">Waste Diverted</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#DCE4CC]">
                    <div className="font-display text-lg font-bold text-[#3D2314]">
                      {formatPrice(item.impact.moneySaved, currency)}
                    </div>
                    <div className="text-[10px] text-[#8B7569]">
                      ≈ {formatAlternatePrice(item.impact.moneySaved, currency)}
                    </div>
                    <div className="text-[11px] text-[#6E5A4F]">Est. Savings</div>
                  </div>
                </div>
              </div>

              {/* Mivra Advisor Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {onOpenBorrowAdvisor && (
                  <button
                    type="button"
                    onClick={onOpenBorrowAdvisor}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4EAE0] hover:bg-[#EBDDCE] border border-[#E6D7C8] text-[#261810] text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#C04A2B]" />
                      <span>Borrow vs. Buy Advisor</span>
                    </div>
                    <span className="text-[#C04A2B]">Evaluate →</span>
                  </button>
                )}

                {onOpenMivraWithContext && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMivraWithContext(
                        `Is "${item.title}" a good choice for my needs, and how does borrowing work?`
                      )
                    }
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7EEF1] hover:bg-[#EFE0E5] border border-[#E4CCD4] text-[#6D2E46] text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#6D2E46]" />
                      <span>Ask Mivra</span>
                    </div>
                    <span>Chat →</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 space-y-5">
              {/* Seller Profile Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#E6D7C8] space-y-2.5">
                <div className="flex items-center gap-3">
                  <img
                    src={item.seller.avatar}
                    alt={item.seller.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#E6D7C8]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-[#261810] text-sm">{item.seller.name}</h4>
                      {item.seller.verifiedEdu && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#5B6E3A]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E5A4F]">
                      {item.seller.year} · {item.seller.department}
                    </p>
                    <p className="text-[11px] text-[#8B7569]">
                      {item.seller.hostel} · {item.seller.rating}★ ({item.seller.totalExchanges} exchanges)
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-[#6E5A4F] pt-1 border-t border-[#EFE3D6]">
                  {item.seller.badges.join(' · ')}
                  {item.seller.responseRate ? ` · Replies ${item.seller.responseRate}` : ''}
                </div>
              </div>

              {/* Transaction Box */}
              <div className="p-5 rounded-2xl border border-[#E6D7C8] bg-white space-y-4">
                {isSubmitted ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#EFF3E7] text-[#5B6E3A] flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="font-display font-semibold text-[#3D2314] text-lg">
                      Request Sent to {item.seller.name}
                    </h3>
                    <p className="text-xs text-[#6E5A4F] max-w-sm mx-auto leading-relaxed">
                      We notified {item.seller.name}. Proposed campus meetup spot:{' '}
                      <strong className="text-[#261810]">{selectedSpot}</strong>.
                    </p>
                    <div className="bg-[#FBF7F1] border border-[#E6D7C8] p-3 rounded-xl text-left text-xs text-[#6E5A4F] space-y-1">
                      <div className="font-bold flex items-center gap-1 text-[#C04A2B]">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Campus Handover Note
                      </div>
                      <p>
                        Inspect the item during handover and return borrowed gear on schedule to maintain your trust rating.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-xs text-[#3D2314] font-semibold underline pt-2"
                    >
                      Edit request details
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EFE3D6]">
                      <div>
                        <span className="text-[11px] text-[#6E5A4F] block font-semibold">
                          {item.dealType === 'borrow'
                            ? 'Campus Borrow Rate'
                            : item.dealType === 'free'
                            ? 'Campus Giveaway'
                            : 'Direct Peer Price'}
                        </span>
                        <div className="font-display text-2xl font-bold text-[#3D2314]">
                          {item.dealType === 'borrow' ? (
                            <div>
                              <span>
                                {formatPrice(item.borrowRatePerDay || 0, currency)}
                                <span className="text-sm font-normal text-[#8B7569]">/day</span>
                              </span>
                              <span className="block text-[11px] font-sans font-medium text-[#8B7569]">
                                ≈ {formatAlternatePrice(item.borrowRatePerDay || 0, currency)}/day
                              </span>
                            </div>
                          ) : item.dealType === 'free' ? (
                            <span className="text-[#5B6E3A]">Free</span>
                          ) : (
                            <div>
                              <span>{formatPrice(item.price, currency)}</span>
                              <span className="block text-[11px] font-sans font-medium text-[#8B7569]">
                                ≈ {formatAlternatePrice(item.price, currency)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.dealType === 'borrow' && (
                        <div className="text-right">
                          <span className="text-[11px] text-[#6E5A4F] block">Refundable Deposit</span>
                          <span className="text-sm font-bold text-[#261810] block">
                            {formatPrice(deposit, currency)}
                          </span>
                          <span className="text-[10px] text-[#8B7569] block">
                            ≈ {formatAlternatePrice(deposit, currency)}
                          </span>
                        </div>
                      )}
                    </div>

                    {item.dealType === 'borrow' && (
                      <div className="space-y-2 bg-[#FBF7F1] p-3.5 rounded-xl border border-[#E6D7C8]">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#261810]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#C04A2B]" />
                            Borrow Duration:
                          </span>
                          <span className="font-bold text-[#3D2314]">
                            {borrowDays} {borrowDays === 1 ? 'Day' : 'Days'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max={item.maxBorrowDays || 14}
                          value={borrowDays}
                          onChange={(e) => setBorrowDays(Number(e.target.value))}
                          className="w-full accent-[#C04A2B] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-[#8B7569]">
                          <span>1 day</span>
                          <span>{item.maxBorrowDays || 14} days max</span>
                        </div>

                        <div className="pt-2 border-t border-[#E6D7C8] text-xs space-y-1">
                          <div className="flex justify-between text-[#6E5A4F]">
                            <span>Rental ({borrowDays}d):</span>
                            <span>
                              {formatPrice(totalRentalFee, currency)} (≈{' '}
                              {formatAlternatePrice(totalRentalFee, currency)})
                            </span>
                          </div>
                          <div className="flex justify-between text-[#6E5A4F]">
                            <span>Refundable deposit:</span>
                            <span>
                              {formatPrice(deposit, currency)} (≈{' '}
                              {formatAlternatePrice(deposit, currency)})
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-[#261810] pt-1 border-t border-[#E6D7C8]">
                            <span>Total at handover:</span>
                            <span className="text-[#3D2314] text-right">
                              {formatPrice(totalDueAtHandover, currency)}
                              <span className="block text-[10px] font-normal text-[#8B7569]">
                                ≈ {formatAlternatePrice(totalDueAtHandover, currency)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#261810] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#B85D19]" />
                        Campus Meetup Spot
                      </label>
                      <select
                        value={selectedSpot}
                        onChange={(e) => setSelectedSpot(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                      >
                        {item.meetupSpots.map((spot) => (
                          <option key={spot} value={spot}>
                            {spot}
                          </option>
                        ))}
                        {CAMPUS_MEETUP_SPOTS.filter((s) => !item.meetupSpots.includes(s)).map(
                          (spot) => (
                            <option key={spot} value={spot}>
                              {spot}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#261810] flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-[#8B7569]" />
                        Message to {item.seller.name}
                      </label>
                      <textarea
                        rows={2}
                        value={requestNote}
                        onChange={(e) => setRequestNote(e.target.value)}
                        placeholder={`Hi ${item.seller.name}! Looking to use this for ${
                          item.occasionTags[0] || 'class'
                        }...`}
                        className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B85D19]/30"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#3D2314] hover:bg-[#2C180D] text-[#FBF7F1] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Repeat className="w-4 h-4 text-[#F3C4A0]" />
                      <span>
                        {item.dealType === 'borrow'
                          ? `Request to Borrow (${formatPrice(totalRentalFee, currency)})`
                          : item.dealType === 'free'
                          ? 'Claim for Campus Reuse'
                          : `Request Purchase (${formatPrice(item.price, currency)})`}
                      </span>
                    </button>
                  </form>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#F4EAE0] border border-[#E6D7C8] text-[#6E5A4F] text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#B85D19] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Peer-to-peer campus exchange. Inspect items in person at a public campus hub before transferring funds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
