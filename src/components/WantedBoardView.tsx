import React, { useState } from 'react';
import {
  Repeat,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Send,
} from 'lucide-react';
import { WantedPost, WantedOffer } from '../types/marketplace';
import { CurrencyCode, formatPrice, formatAlternatePrice } from '../utils/currency';

interface WantedBoardViewProps {
  posts: WantedPost[];
  onOpenPostWanted: () => void;
  onAddOffer: (postId: string, offer: WantedOffer) => void;
  onOpenMivraWithContext: (query: string) => void;
  currency?: CurrencyCode;
}

export const WantedBoardView: React.FC<WantedBoardViewProps> = ({
  posts,
  onOpenPostWanted,
  onAddOffer,
  onOpenMivraWithContext,
  currency = 'USD',
}) => {
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent' | 'this-week' | 'flexible'>('all');
  const [activeReplyingPostId, setActiveReplyingPostId] = useState<string | null>(null);

  const [offerItemTitle, setOfferItemTitle] = useState('');
  const [offerPriceOrRate, setOfferPriceOrRate] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittedPostId, setSubmittedPostId] = useState<string | null>(null);

  const filteredPosts = posts.filter((p) => {
    if (urgencyFilter !== 'all' && p.urgency !== urgencyFilter) return false;
    return true;
  });

  const handleSendOffer = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!offerItemTitle.trim() || !offerMessage.trim()) return;

    const newOffer: WantedOffer = {
      id: `off-${Date.now()}`,
      studentName: 'Alex Rivera',
      studentAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      studentDept: 'CS Junior · Oak Hall 2B',
      itemTitle: offerItemTitle,
      priceOrRate: offerPriceOrRate || 'Free',
      message: offerMessage,
      time: 'Just now',
    };

    onAddOffer(postId, newOffer);
    setSubmittedPostId(postId);
    setActiveReplyingPostId(null);
    setOfferItemTitle('');
    setOfferPriceOrRate('');
    setOfferMessage('');

    setTimeout(() => {
      setSubmittedPostId(null);
    }, 4000);
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return <span className="text-[11px] font-bold text-[#C04A2B]">Urgent · Needed soon</span>;
      case 'this-week':
        return <span className="text-[11px] font-semibold text-[#B85D19]">Needed this week</span>;
      default:
        return <span className="text-[11px] font-medium text-[#6E5A4F]">Flexible timeline</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#F9EFE6] border border-[#E6D7C8] rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-semibold text-[#B85D19]">
            Campus Wanted Board (In Search Of)
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#3D2314]">
            Can't find what you need? Ask your campus community.
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5A4F] leading-relaxed">
            Describe an exam calculator, fest outfit, or textbook in plain language. Mivra structures your request so peers with spare gear in their dorms can reply directly.
          </p>
        </div>

        <button
          onClick={onOpenPostWanted}
          className="px-5 py-2.5 rounded-full bg-[#3D2314] hover:bg-[#2C180D] text-[#FBF7F1] font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#F3C4A0]" />
          <span>Post Wanted Request</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E6D7C8]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#6E5A4F] mr-1">Timeline:</span>
          {[
            { id: 'all', label: `All Requests (${posts.length})` },
            { id: 'urgent', label: 'Urgent' },
            { id: 'this-week', label: 'This Week' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setUrgencyFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                urgencyFilter === tab.id
                  ? 'bg-[#3D2314] text-[#FBF7F1]'
                  : 'text-[#6E5A4F] hover:bg-[#F4EAE0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#8B7569]">
          {filteredPosts.length} active student inquiries
        </div>
      </div>

      {submittedPostId && (
        <div className="bg-[#EFF3E7] border border-[#CBD6B8] p-4 rounded-2xl text-[#3D2314] flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#5B6E3A]" />
            <span>Offer sent to student. They'll confirm the campus meetup spot shortly.</span>
          </div>
        </div>
      )}

      {/* Wanted Post Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => {
          const altBudget = formatAlternatePrice(post.maxBudget, currency);
          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-[#E6D7C8] hover:border-[#B85D19]/50 transition-all p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Student Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.student.avatar}
                      alt={post.student.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E6D7C8]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#261810] text-sm">
                          {post.student.name}
                        </span>
                        {post.student.verifiedEdu && (
                          <span title="Verified Campus Student" className="inline-flex">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#5B6E3A]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6E5A4F]">
                        {post.student.year} · {post.student.department} · {post.student.hostel}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {getUrgencyLabel(post.urgency)}
                    <span className="text-[10px] text-[#8B7569] block mt-0.5">
                      Need by {post.needByDate}
                    </span>
                  </div>
                </div>

                {/* Request Copy */}
                <div>
                  <h3 className="font-bold text-[#261810] text-base leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#6E5A4F] mt-1.5 leading-relaxed">
                    {post.description}
                  </p>
                </div>

                {/* Unboxed Metadata Line */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E5A4F] pt-1">
                  <span className="font-semibold text-[#B85D19]">{post.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Max budget{' '}
                    <strong className="text-[#261810]">
                      {formatPrice(post.maxBudget, currency)}
                    </strong>
                    {altBudget ? ` (${altBudget})` : ''}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {post.dealTypePreference === 'borrow'
                      ? 'Prefer to borrow'
                      : post.dealTypePreference === 'sell'
                      ? 'Prefer to buy'
                      : 'Borrow or buy'}
                  </span>
                  {post.occasion && post.occasion !== 'Everyday' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#C04A2B] font-medium">{post.occasion}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Peer Offers */}
              {post.offers && post.offers.length > 0 && (
                <div className="bg-[#FBF7F1] rounded-xl p-3.5 border border-[#EFE3D6] space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#3D2314]">
                    <MessageSquare className="w-3.5 h-3.5 text-[#B85D19]" />
                    <span>Peer Offers ({post.offers.length})</span>
                  </div>
                  <div className="space-y-2">
                    {post.offers.map((off) => (
                      <div
                        key={off.id}
                        className="bg-white p-3 rounded-xl border border-[#E6D7C8] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={off.studentAvatar}
                              alt={off.studentName}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-bold text-[#261810] text-[11px]">
                              {off.studentName}
                            </span>
                            <span className="text-[10px] text-[#8B7569]">({off.studentDept})</span>
                          </div>
                          <span className="font-bold text-[#3D2314] text-xs">{off.priceOrRate}</span>
                        </div>
                        <p className="text-[11px] text-[#6E5A4F] pl-6">"{off.message}"</p>
                        <div className="text-[10px] text-[#8B7569] pl-6">{off.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inline Offer Form */}
              {activeReplyingPostId === post.id && (
                <form
                  onSubmit={(e) => handleSendOffer(post.id, e)}
                  className="bg-[#F4EAE0] p-4 rounded-xl border border-[#E6D7C8] space-y-2.5 animate-fade-in"
                >
                  <div className="text-xs font-bold text-[#3D2314] flex items-center justify-between">
                    <span>Offer your item to {post.student.name}</span>
                    <button
                      type="button"
                      onClick={() => setActiveReplyingPostId(null)}
                      className="text-[#8B7569] hover:text-[#261810]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={offerItemTitle}
                      onChange={(e) => setOfferItemTitle(e.target.value)}
                      placeholder="Your item (e.g. Casio fx-991)"
                      className="text-xs p-2 rounded-lg border border-[#DECBB8] bg-white"
                    />
                    <input
                      type="text"
                      value={offerPriceOrRate}
                      onChange={(e) => setOfferPriceOrRate(e.target.value)}
                      placeholder={
                        currency === 'INR' ? 'Rate/Price (e.g. ₹160/day)' : 'Rate/Price (e.g. $2/day)'
                      }
                      className="text-xs p-2 rounded-lg border border-[#DECBB8] bg-white"
                    />
                  </div>

                  <textarea
                    rows={2}
                    required
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Where & when can you meet on campus?"
                    className="w-full text-xs p-2 rounded-lg border border-[#DECBB8] bg-white"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-[#3D2314] hover:bg-[#2C180D] text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Offer</span>
                  </button>
                </form>
              )}

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#EFE3D6] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onOpenMivraWithContext(
                      `Check if we have any marketplace listings matching this wanted request: "${post.title}"`
                    )
                  }
                  className="text-xs text-[#6D2E46] hover:text-[#4D1E30] font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Mivra to Match</span>
                </button>

                {activeReplyingPostId !== post.id && (
                  <button
                    type="button"
                    onClick={() => setActiveReplyingPostId(post.id)}
                    className="px-3.5 py-1.5 rounded-full bg-[#3D2314] hover:bg-[#2C180D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>I Have This</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
