import React, { useState } from 'react';
import {
  Sparkles,
  Repeat,
  Tag,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Scale,
  Loader2,
} from 'lucide-react';
import { CampusStats, OccasionType } from '../types/marketplace';
import { CurrencyCode, formatPrice } from '../utils/currency';

interface HeroBannerProps {
  stats: CampusStats;
  selectedDealType: string;
  setSelectedDealType: (type: string) => void;
  selectedOccasion: string;
  setSelectedOccasion: (occ: string) => void;
  onOpenMivra: () => void;
  onOpenCreateListing: () => void;
  onNaturalSearch: (query: string) => void;
  onOpenBorrowAdvisor: () => void;
  currency?: CurrencyCode;
  isNaturalSearching?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  stats,
  selectedDealType,
  setSelectedDealType,
  selectedOccasion,
  setSelectedOccasion,
  onOpenMivra,
  onOpenCreateListing,
  onNaturalSearch,
  onOpenBorrowAdvisor,
  currency = 'USD',
  isNaturalSearching = false,
}) => {
  const [naturalInput, setNaturalInput] = useState('');

  const occasionOptions: { label: string; value: OccasionType }[] = [
    { label: 'College Fests', value: 'College Fests' },
    { label: 'Traditional Day', value: 'Traditional Day' },
    { label: 'Interviews', value: 'Placement & Interviews' },
    { label: 'Farewell & Prom', value: 'Farewell & Prom' },
    { label: 'Lab Practicals', value: 'Lab Practicals' },
    { label: 'Hackathons', value: 'Hackathons' },
  ];

  const dealTypeOptions = [
    { label: 'All Listings', value: 'all' },
    { label: 'Borrow & Lend', value: 'borrow' },
    { label: 'Buy & Sell', value: 'sell' },
    { label: 'Free Giveaways', value: 'free' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F9ECE0] via-[#FBF5EE] to-[#FBF7F1] text-[#261810] pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-[#E6D7C8]">
      {/* Warm autumn foliage ambiance */}
      <div className="absolute -top-24 right-1/5 w-[420px] h-[420px] bg-[#F2D5B3]/45 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/6 w-[380px] h-[380px] bg-[#ECC7B4]/45 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-7">
        {/* Quiet top editorial eyebrow */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#6E5A4F]">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C04A2B]" />
            <span>Autumn Semester Circular Exchange</span>
            <span aria-hidden="true">·</span>
            <span>Powered by Mivra AI</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-[#B85D19]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>.edu Verified Student Community</span>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.15] text-[#3D2314]">
              Borrow for one fest, exam, or interview —{' '}
              <span className="italic text-[#C04A2B]">reuse across campus.</span>
            </h1>

            <p className="text-sm sm:text-[15px] text-[#6E5A4F] max-w-2xl leading-relaxed">
              Velora connects verified college peers to share textbooks, autumn & festive outfits, scientific calculators, and dorm essentials in both ₹ INR and $ USD. Ask Mivra in plain language and save up to 80%.
            </p>

            {/* Mivra Natural Language Search Box */}
            <div className="pt-1 max-w-2xl space-y-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (naturalInput.trim()) {
                    onNaturalSearch(naturalInput.trim());
                  }
                }}
                className="flex items-center bg-white border border-[#DECBB8] rounded-2xl p-1.5 shadow-sm focus-within:border-[#6D2E46] focus-within:ring-2 focus-within:ring-[#6D2E46]/15 transition-all"
              >
                <div className="pl-3 pr-2 text-[#6D2E46] flex items-center">
                  <Sparkles className="w-4 h-4 text-[#C04A2B]" />
                </div>
                <input
                  type="text"
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  placeholder='Ask Mivra: "Traditional outfit for fest under ₹500" or "Calc for Friday exam"...'
                  className="w-full bg-transparent text-xs sm:text-sm text-[#261810] placeholder:text-[#9A8578] focus:outline-none py-2"
                />
                <button
                  type="submit"
                  disabled={isNaturalSearching}
                  className="px-4 py-2 rounded-xl bg-[#3D2314] hover:bg-[#2C180D] disabled:opacity-60 text-[#FBF7F1] font-semibold text-xs shrink-0 transition-colors flex items-center gap-1.5"
                >
                  {isNaturalSearching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Matching...</span>
                    </>
                  ) : (
                    <>
                      <span>Match</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick prompt triggers */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6E5A4F]">
                <span className="text-[#8B7569] font-medium">Try:</span>
                {[
                  'Traditional outfit for fest under ₹500',
                  'Borrow Casio fx-991 for midterms',
                  'Lab coat for Biotech practical',
                ].map((promptText, idx) => (
                  <React.Fragment key={promptText}>
                    <button
                      type="button"
                      disabled={isNaturalSearching}
                      onClick={() => {
                        setNaturalInput(promptText);
                        onNaturalSearch(promptText);
                      }}
                      className="hover:text-[#3D2314] disabled:opacity-50 underline decoration-[#DECBB8] underline-offset-4 transition-colors"
                    >
                      "{promptText}"
                    </button>
                    {idx < 2 && <span className="text-[#DECBB8]">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={onOpenMivra}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#6D2E46] hover:bg-[#562337] text-[#FBF7F1] font-semibold text-xs shadow-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F0B865]" />
                <span>Chat with Mivra AI</span>
              </button>

              <button
                onClick={onOpenBorrowAdvisor}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#F4EAE0] border border-[#DECBB8] text-[#261810] font-semibold text-xs transition-colors"
              >
                <Scale className="w-3.5 h-3.5 text-[#C04A2B]" />
                <span>Borrow vs. Buy Advisor</span>
              </button>

              <button
                onClick={onOpenCreateListing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-transparent hover:bg-[#F4EAE0] text-[#3D2314] font-semibold text-xs transition-colors"
              >
                <Repeat className="w-3.5 h-3.5 text-[#B85D19]" />
                <span>List an Item</span>
              </button>
            </div>
          </div>

          {/* Editorial Campus Impact Summary Panel */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 border border-[#E6D7C8] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-baseline justify-between border-b border-[#EFE3D6] pb-3.5">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#3D2314]">
                    Campus Collective Impact
                  </h2>
                  <p className="text-xs text-[#6E5A4F] mt-0.5">
                    Estimated student reuse savings this semester
                  </p>
                </div>
                <span className="text-[11px] font-medium text-[#B85D19]">Estimated</span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <div className="text-2xl font-display font-bold text-[#3D2314]">
                    {stats.itemsReusedTotal.toLocaleString()}+
                  </div>
                  <div className="text-xs font-medium text-[#6E5A4F] mt-0.5">
                    Items kept in circulation
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-display font-bold text-[#5B6E3A]">
                    {stats.co2SavedKg.toLocaleString()} kg
                  </div>
                  <div className="text-xs font-medium text-[#6E5A4F] mt-0.5">
                    CO₂ emissions avoided
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-display font-bold text-[#C04A2B]">
                    {stats.wasteAvoidedKg.toLocaleString()} kg
                  </div>
                  <div className="text-xs font-medium text-[#6E5A4F] mt-0.5">
                    Landfill waste diverted
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-display font-bold text-[#261810]">
                    {formatPrice(stats.studentMoneySaved, currency)}
                  </div>
                  <div className="text-xs font-medium text-[#6E5A4F] mt-0.5">
                    Saved by students
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Interactive Filter Bar */}
        <div className="pt-5 border-t border-[#E6D7C8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Deal Mode Segmented Control */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-[#6E5A4F] mr-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#B85D19]" />
              Mode:
            </span>
            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EFE3D6]/80 rounded-xl">
              {dealTypeOptions.map((dt) => (
                <button
                  key={dt.value}
                  onClick={() => setSelectedDealType(dt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedDealType === dt.value
                      ? 'bg-white text-[#3D2314] shadow-2xs'
                      : 'text-[#6E5A4F] hover:text-[#261810]'
                  }`}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-[#6E5A4F] mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#C04A2B]" />
              Occasion:
            </span>
            <button
              onClick={() => setSelectedOccasion('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedOccasion === 'all'
                  ? 'bg-[#3D2314] text-[#FBF7F1]'
                  : 'text-[#6E5A4F] hover:bg-[#EFE3D6]/70'
              }`}
            >
              All
            </button>
            {occasionOptions.map((occ) => (
              <button
                key={occ.value}
                onClick={() => setSelectedOccasion(occ.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedOccasion === occ.value
                    ? 'bg-[#C04A2B] text-white'
                    : 'text-[#6E5A4F] hover:bg-[#EFE3D6]/70'
                }`}
              >
                {occ.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
