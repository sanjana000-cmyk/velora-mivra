import React, { useState } from 'react';
import { X, Repeat, Sparkles, Loader2 } from 'lucide-react';
import { WantedPost, ItemCategory, DealType, OccasionType } from '../types/marketplace';
import {
  CurrencyCode,
  formatPrice,
  formatAlternatePrice,
  fromBaseUsd,
  toBaseUsd,
} from '../utils/currency';

interface PostWantedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: WantedPost) => void;
  currency?: CurrencyCode;
}

export const PostWantedModal: React.FC<PostWantedModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  currency = 'USD',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics & Gadgets');
  const [urgency, setUrgency] = useState<'urgent' | 'this-week' | 'flexible'>('urgent');
  const [needByDate, setNeedByDate] = useState('Tomorrow 9:00 AM');
  const [maxBudget, setMaxBudget] = useState<number>(15);
  const [dealTypePreference, setDealTypePreference] = useState<DealType | 'any'>('borrow');
  const [occasion, setOccasion] = useState<OccasionType>('Everyday');

  const [conversationalInput, setConversationalInput] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftedNotice, setDraftedNotice] = useState(false);

  if (!isOpen) return null;

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const handleConvertWithMivra = async () => {
    if (!conversationalInput.trim()) return;
    setIsDrafting(true);
    setDraftedNotice(false);

    try {
      const res = await fetch('/api/mivra/draft-wanted-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationalText: conversationalInput }),
      });

      if (!res.ok) throw new Error('Drafting failed');
      const data = await res.json();

      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.category) setCategory(data.category);
      if (data.urgency) setUrgency(data.urgency);
      if (data.needByDate) setNeedByDate(data.needByDate);
      if (data.maxBudget !== undefined) setMaxBudget(data.maxBudget);
      if (data.dealTypePreference) setDealTypePreference(data.dealTypePreference);
      if (data.occasion) setOccasion(data.occasion);

      setDraftedNotice(true);
    } catch (e) {
      console.warn(e);
      setTitle(conversationalInput.slice(0, 45));
      setDescription(conversationalInput);
      setDraftedNotice(true);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPost: WantedPost = {
      id: `wanted-${Date.now()}`,
      title,
      description,
      category,
      urgency,
      needByDate,
      maxBudget: Number(maxBudget),
      dealTypePreference,
      occasion,
      student: {
        id: 'usr-current',
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
        badges: ['Verified Student'],
      },
      responsesCount: 0,
      createdAt: new Date().toISOString(),
      status: 'active',
      offers: [],
    };

    onPostCreated(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-[#2A170D]/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FBF7F1] rounded-3xl shadow-2xl border border-[#E6D7C8] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#543220] bg-[#3D2314] text-[#FBF7F1]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-[#F3C4A0] flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-[#FBF7F1] text-base">
                Post on Campus Wanted Board
              </h2>
              <p className="text-[11px] text-[#F3C4A0]">
                Ask college peers to lend or sell what you need ({currency === 'INR' ? '₹ INR' : '$ USD'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/75 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Mivra Conversational Wanted Drafter */}
          <div className="bg-[#F7EEF1] border border-[#E4CCD4] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6D2E46] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6D2E46]" />
                Conversational Wanted Drafter
              </span>
              <span className="text-[11px] font-semibold text-[#6E5A4F]">Mivra AI</span>
            </div>
            <p className="text-[11px] text-[#6E5A4F]">
              Describe what you need in natural words and Mivra will structure the request:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={conversationalInput}
                onChange={(e) => setConversationalInput(e.target.value)}
                placeholder={`e.g. "Need ethnic kurta for Saturday fest, budget ${formatPrice(
                  10,
                  currency
                )}, willing to borrow"`}
                className="flex-1 text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-white text-[#261810] placeholder-[#8B7569] focus:outline-none focus:ring-2 focus:ring-[#6D2E46]"
              />
              <button
                type="button"
                disabled={isDrafting || !conversationalInput.trim()}
                onClick={handleConvertWithMivra}
                className="px-3.5 py-2 rounded-xl bg-[#6D2E46] hover:bg-[#562337] disabled:opacity-50 text-[#FBF7F1] font-semibold text-xs shrink-0 transition-colors flex items-center gap-1.5"
              >
                {isDrafting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <span>Convert</span>
                )}
              </button>
            </div>
            {draftedNotice && (
              <span className="text-[11px] text-[#3D2314] font-semibold block">
                Mivra filled out the structured fields below — review and edit if needed.
              </span>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-5 rounded-2xl border border-[#E6D7C8]"
          >
            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1">
                What are you looking for? *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio fx-991EX for Friday Calculus Midterm"
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                >
                  <option value="Electronics & Gadgets">Electronics</option>
                  <option value="Clothing & Outfits">Clothing & Outfits</option>
                  <option value="Books & Academics">Books & Notes</option>
                  <option value="Lab & Studio Equipment">Lab & Studio</option>
                  <option value="Dorm & Living">Dorm Essentials</option>
                  <option value="Bicycles & Mobility">Bikes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                >
                  <option value="urgent">Urgent (Next 24–48 hrs)</option>
                  <option value="this-week">This Week</option>
                  <option value="flexible">Flexible Timeline</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Need By Date / Event
                </label>
                <input
                  type="text"
                  required
                  value={needByDate}
                  onChange={(e) => setNeedByDate(e.target.value)}
                  placeholder="e.g. Friday 8:30 AM"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Max Budget ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  value={fromBaseUsd(maxBudget, currency) || ''}
                  onChange={(e) =>
                    setMaxBudget(toBaseUsd(Number(e.target.value) || 0, currency))
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                />
                {maxBudget > 0 && (
                  <span className="text-[10px] text-[#8B7569] block mt-0.5">
                    ≈ {formatAlternatePrice(maxBudget, currency)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Deal Preference
                </label>
                <select
                  value={dealTypePreference}
                  onChange={(e) => setDealTypePreference(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                >
                  <option value="borrow">Prefer to Borrow / Rent</option>
                  <option value="sell">Prefer to Buy Outright</option>
                  <option value="any">Open to Borrow or Buy</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Occasion / Reason
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value as OccasionType)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                >
                  <option value="Everyday">General / Everyday</option>
                  <option value="College Fests">College Fests</option>
                  <option value="Traditional Day">Traditional Day</option>
                  <option value="Placement & Interviews">Placement & Interviews</option>
                  <option value="Farewell & Prom">Farewell & Prom</option>
                  <option value="Lab Practicals">Lab Practicals</option>
                  <option value="Hackathons">Hackathons</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1">
                Details & Context *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain why you need it, course number or event details, and when you can return it..."
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
              />
            </div>

            <div className="pt-2 border-t border-[#E6D7C8] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#6E5A4F] hover:text-[#261810]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#C04A2B] hover:bg-[#A33B20] text-[#FBF7F1] font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Repeat className="w-4 h-4" />
                <span>Broadcast to Campus</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
