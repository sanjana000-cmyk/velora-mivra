import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Repeat,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  MarketplaceItem,
  ItemCategory,
  DealType,
  Condition,
  OccasionType,
} from '../types/marketplace';
import { CAMPUS_MEETUP_SPOTS } from '../data/mockData';
import {
  CurrencyCode,
  formatPrice,
  formatAlternatePrice,
  fromBaseUsd,
  toBaseUsd,
} from '../utils/currency';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (newItem: MarketplaceItem) => void;
  currency?: CurrencyCode;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onItemCreated,
  currency = 'USD',
}) => {
  // AI Generator state
  const [rawNotes, setRawNotes] = useState('');
  const [isGeneratingWithAi, setIsGeneratingWithAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGeneratedPreview, setAiGeneratedPreview] = useState<any | null>(null);

  // Form Fields (prices stored internally in base USD for consistent dual-currency conversion)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Books & Academics');
  const [dealType, setDealType] = useState<DealType>('borrow');
  const [price, setPrice] = useState<number>(20);
  const [borrowRatePerDay, setBorrowRatePerDay] = useState<number>(3);
  const [borrowDeposit, setBorrowDeposit] = useState<number>(15);
  const [maxBorrowDays, setMaxBorrowDays] = useState<number>(7);
  const [condition, setCondition] = useState<Condition>('Like New');
  const [occasion, setOccasion] = useState<OccasionType>('Everyday');
  const [campusLocation] = useState('Central Library Quad');
  const [selectedSpots, setSelectedSpots] = useState<string[]>([
    CAMPUS_MEETUP_SPOTS[0],
    CAMPUS_MEETUP_SPOTS[1],
  ]);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  );
  const [tagsInput, setTagsInput] = useState('Textbook, Calculus, Math');

  if (!isOpen) return null;

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  // Pre-set sample images for quick testing
  const sampleImages: { label: string; url: string }[] = [
    {
      label: 'Textbook',
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Calculator',
      url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Blazer / Suit',
      url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Festive Kurta',
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Lab Coat',
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Bicycle',
      url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Call Mivra AI Generator backend
  const handleGenerateWithMivra = async () => {
    if (!rawNotes.trim()) {
      setAiError('Please enter a few quick bullet points or notes about your item.');
      return;
    }

    setIsGeneratingWithAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/mivra/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNotes,
          category,
          condition,
          dealType,
        }),
      });

      if (!response.ok) {
        throw new Error('AI generation failed');
      }

      const data = await response.json();
      setAiGeneratedPreview(data);

      // Auto-populate form
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.suggestedPrice !== undefined) setPrice(data.suggestedPrice);
      if (data.borrowRatePerDay !== undefined) setBorrowRatePerDay(data.borrowRatePerDay);
      if (Array.isArray(data.tags)) setTagsInput(data.tags.join(', '));
      if (data.occasion) setOccasion(data.occasion);
    } catch (err: any) {
      console.error(err);
      setAiError('Mivra was unable to connect. Using smart local template instead.');
      setTitle(rawNotes.slice(0, 50));
      setDescription(
        `${rawNotes}\n\nClean, well-maintained, and tested by a student peer. Available for campus handover.`
      );
      setTagsInput('CampusReuse, StudentSpecial, PreLoved');
    } finally {
      setIsGeneratingWithAi(false);
    }
  };

  const handleSpotToggle = (spot: string) => {
    if (selectedSpots.includes(spot)) {
      if (selectedSpots.length > 1) {
        setSelectedSpots(selectedSpots.filter((s) => s !== spot));
      }
    } else {
      setSelectedSpots([...selectedSpots, spot]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const calculatedCo2 =
      dealType === 'borrow' ? 12.5 : category === 'Clothing & Outfits' ? 18.0 : 8.0;

    const newItem: MarketplaceItem = {
      id: `item-${Date.now()}`,
      title,
      description,
      category,
      dealType,
      price: dealType === 'free' ? 0 : Number(price),
      borrowRatePerDay: dealType === 'borrow' ? Number(borrowRatePerDay) : undefined,
      borrowDeposit: dealType === 'borrow' ? Number(borrowDeposit) : undefined,
      maxBorrowDays: dealType === 'borrow' ? Number(maxBorrowDays) : undefined,
      condition,
      occasionTags: [occasion],
      campusLocation,
      meetupSpots: selectedSpots,
      seller: {
        id: 'user-current',
        name: 'Jordan Lee (You)',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        department: 'Environmental Science',
        year: '2nd Year',
        verifiedEdu: true,
        eduEmailDomain: 'j.lee@campus.edu',
        hostel: 'Maple Court 3A',
        rating: 5.0,
        totalExchanges: 4,
        badges: ['Verified Student', 'Eco Contributor'],
        responseRate: '< 15 mins',
      },
      imageUrl,
      tags,
      impact: {
        co2Kg: aiGeneratedPreview?.estimatedImpact?.co2Kg || calculatedCo2,
        wasteKg: aiGeneratedPreview?.estimatedImpact?.wasteKg || 1.2,
        moneySaved:
          aiGeneratedPreview?.estimatedImpact?.moneySaved ||
          (dealType === 'free' ? 30 : price * 1.5),
      },
      createdAt: new Date().toISOString(),
      isAvailable: true,
      likes: 0,
      views: 1,
    };

    onItemCreated(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-[#2A170D]/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#FBF7F1] rounded-3xl shadow-2xl border border-[#E6D7C8] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#543220] bg-[#3D2314] text-[#FBF7F1]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-[#F3C4A0] flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-[#FBF7F1] text-base">
                List an Item for Campus Reuse
              </h2>
              <p className="text-[11px] text-[#F3C4A0]">
                Sell, lend, or give away items to college peers ({currency === 'INR' ? '₹ INR' : '$ USD'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/75 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Mivra AI Assistant Banner Box */}
          <div className="bg-[#F7EEF1] border border-[#E4CCD4] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#6D2E46] font-bold text-xs">
                <Sparkles className="w-4 h-4 text-[#6D2E46]" />
                <span>Mivra AI Listing Generator</span>
              </div>
              <span className="text-[11px] font-semibold text-[#6E5A4F]">
                Smart Draft Assistant
              </span>
            </div>

            <p className="text-xs text-[#6E5A4F] leading-relaxed">
              Type quick rough notes below and Mivra will craft an attractive title, fair student
              pricing, and estimate your reuse impact automatically.
            </p>

            <div className="space-y-2.5">
              <textarea
                rows={2}
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="e.g. Stewart Calculus 8th edition, used for Math 101, some notes in ch3, good condition, clean spine..."
                className="w-full text-xs p-3 rounded-xl border border-[#DECBB8] bg-white text-[#261810] placeholder-[#8B7569] focus:outline-none focus:ring-2 focus:ring-[#6D2E46]"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={isGeneratingWithAi || !rawNotes.trim()}
                  onClick={handleGenerateWithMivra}
                  className="px-4 py-2 rounded-xl bg-[#6D2E46] hover:bg-[#562337] disabled:opacity-50 text-[#FBF7F1] font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {isGeneratingWithAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mivra is crafting your listing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#F0B865]" />
                      <span>Generate with Mivra AI</span>
                    </>
                  )}
                </button>

                {aiGeneratedPreview && (
                  <span className="text-[11px] text-[#3D2314] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5B6E3A]" />
                    Listing draft populated below
                  </span>
                )}
              </div>

              {aiError && (
                <div className="text-[11px] text-[#C04A2B] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-5 rounded-2xl border border-[#E6D7C8]">
            {/* Deal Type Selector */}
            <div>
              <label className="text-xs font-bold text-[#261810] block mb-2">
                What would you like to do with this item?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'borrow', label: 'Lend / Borrow', desc: 'Rent by day or week' },
                  { id: 'sell', label: 'Sell Outright', desc: 'One-time student sale' },
                  { id: 'free', label: 'Free Giveaway', desc: 'Pass to juniors' },
                  { id: 'exchange', label: 'Peer Trade', desc: 'Swap with a peer' },
                ].map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setDealType(type.id as DealType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      dealType === type.id
                        ? 'bg-[#F9EFE6] border-[#B85D19] text-[#3D2314]'
                        : 'bg-[#FBF7F1] border-[#E6D7C8] text-[#261810] hover:border-[#DECBB8]'
                    }`}
                  >
                    <div className="font-bold text-xs">{type.label}</div>
                    <div className="text-[10px] text-[#6E5A4F] mt-0.5">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Title */}
            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio FX-991EX Scientific Calculator"
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
              />
            </div>

            {/* Category & Condition & Occasion */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                >
                  <option value="Books & Academics">Books & Academics</option>
                  <option value="Electronics & Gadgets">Electronics & Tech</option>
                  <option value="Clothing & Outfits">Clothing & Outfits</option>
                  <option value="Lab & Studio Equipment">Lab & Studio Gear</option>
                  <option value="Dorm & Living">Dorm & Living</option>
                  <option value="Bicycles & Mobility">Bikes & Mobility</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Condition)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                >
                  <option value="Like New">Like New (Mint)</option>
                  <option value="Good">Good (Lightly used)</option>
                  <option value="Fair">Fair (Noticeable wear, functional)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Target Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value as OccasionType)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                >
                  <option value="Everyday">Everyday / General</option>
                  <option value="College Fests">College Fests</option>
                  <option value="Traditional Day">Traditional Day</option>
                  <option value="Placement & Interviews">Placement & Interviews</option>
                  <option value="Farewell & Prom">Farewell & Prom</option>
                  <option value="Lab Practicals">Lab Practicals</option>
                  <option value="Hackathons">Hackathons</option>
                </select>
              </div>
            </div>

            {/* Pricing / Borrow Terms */}
            {dealType === 'borrow' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F4EAE0] p-4 rounded-2xl border border-[#E6D7C8]">
                <div>
                  <label className="text-xs font-bold text-[#261810] block mb-1">
                    Daily Borrow Rate ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={fromBaseUsd(borrowRatePerDay, currency) || ''}
                    onChange={(e) =>
                      setBorrowRatePerDay(toBaseUsd(Number(e.target.value) || 0, currency))
                    }
                    className="w-full text-xs p-2 rounded-xl border border-[#DECBB8] bg-white text-[#261810]"
                  />
                  <span className="text-[10px] text-[#6E5A4F] mt-0.5 block">
                    e.g. {formatPrice(3, currency)}/day
                    {borrowRatePerDay > 0
                      ? ` · ≈ ${formatAlternatePrice(borrowRatePerDay, currency)}`
                      : ''}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#261810] block mb-1">
                    Refundable Deposit ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fromBaseUsd(borrowDeposit, currency) || ''}
                    onChange={(e) =>
                      setBorrowDeposit(toBaseUsd(Number(e.target.value) || 0, currency))
                    }
                    className="w-full text-xs p-2 rounded-xl border border-[#DECBB8] bg-white text-[#261810]"
                  />
                  <span className="text-[10px] text-[#6E5A4F] mt-0.5 block">
                    {borrowDeposit > 0
                      ? `≈ ${formatAlternatePrice(borrowDeposit, currency)} · `
                      : ''}
                    Returned safely
                  </span>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#261810] block mb-1">
                    Max Borrow Window (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={maxBorrowDays}
                    onChange={(e) => setMaxBorrowDays(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-[#DECBB8] bg-white text-[#261810]"
                  />
                  <span className="text-[10px] text-[#6E5A4F] mt-0.5 block">Max days allowed</span>
                </div>
              </div>
            ) : dealType === 'sell' ? (
              <div className="bg-[#EFF3E7] p-4 rounded-2xl border border-[#CBD6B8]">
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Sale Price ({currencySymbol})
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={fromBaseUsd(price, currency) || ''}
                    onChange={(e) => setPrice(toBaseUsd(Number(e.target.value) || 0, currency))}
                    className="w-full max-w-xs text-xs p-2 rounded-xl border border-[#DECBB8] bg-white text-[#261810]"
                  />
                  {price > 0 && (
                    <span className="text-xs font-semibold text-[#5B6E3A]">
                      ≈ {formatAlternatePrice(price, currency)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#6E5A4F] block mt-1">
                  Keep pricing fair and student-friendly.
                </span>
              </div>
            ) : null}

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention condition details, included accessories, or reasons for listing..."
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
              />
            </div>

            {/* Quick Photo Selector */}
            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1.5">
                Item Photo (Select preset or paste URL)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {sampleImages.map((s) => (
                  <button
                    type="button"
                    key={s.label}
                    onClick={() => setImageUrl(s.url)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      imageUrl === s.url
                        ? 'bg-[#3D2314] text-[#FBF7F1] border-[#3D2314] font-semibold'
                        : 'bg-[#FBF7F1] border-[#E6D7C8] text-[#6E5A4F] hover:border-[#B85D19]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
              />
            </div>

            {/* Campus Meetup Spots Selection */}
            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1.5">
                Preferred Safe Meetup Spots on Campus
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAMPUS_MEETUP_SPOTS.map((spot) => {
                  const isChecked = selectedSpots.includes(spot);
                  return (
                    <button
                      type="button"
                      key={spot}
                      onClick={() => handleSpotToggle(spot)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                        isChecked
                          ? 'bg-[#F9EFE6] border-[#B85D19] text-[#3D2314] font-semibold'
                          : 'bg-[#FBF7F1] border-[#E6D7C8] text-[#6E5A4F]'
                      }`}
                    >
                      <span className="truncate pr-2">{spot}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-[#B85D19] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1">
                Search Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Calculator, STEM, Math101, Casio"
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-[#E6D7C8] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#6E5A4F] hover:text-[#261810]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#3D2314] hover:bg-[#2C180D] text-[#FBF7F1] font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5"
              >
                <Repeat className="w-4 h-4 text-[#F3C4A0]" />
                <span>Publish Listing to Campus</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
