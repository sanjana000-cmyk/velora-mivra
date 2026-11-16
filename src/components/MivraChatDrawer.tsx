import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Compass,
  MessageSquare,
} from 'lucide-react';
import { MarketplaceItem } from '../types/marketplace';
import { CurrencyCode, formatPrice } from '../utils/currency';

interface MivraChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItems: MarketplaceItem[];
  onSelectItem: (item: MarketplaceItem) => void;
  initialPrompt?: string;
  currency?: CurrencyCode;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'mivra';
  text: string;
  suggestedItems?: MarketplaceItem[];
  timestamp: string;
}

export const MivraChatDrawer: React.FC<MivraChatDrawerProps> = ({
  isOpen,
  onClose,
  activeItems,
  onSelectItem,
  initialPrompt,
  currency = 'USD',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'chat' | 'smart-match'>('chat');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'mivra',
      text: "Hi! I'm Mivra, your Velora campus reuse assistant. Tell me what you need — whether it's a scientific calculator for midterms, an ethnic kurta for Cultural Fest under ₹500, or dorm essentials — and I'll match you with verified classmates.",
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [matchNeedQuery, setMatchNeedQuery] = useState('');
  const [matchOccasion, setMatchOccasion] = useState('All');
  const [matchBudget, setMatchBudget] = useState<number>(30);
  const [matchCategory, setMatchCategory] = useState('All');
  const [isSmartMatching, setIsSmartMatching] = useState(false);
  const [smartMatchResults, setSmartMatchResults] = useState<{
    summary: string;
    matches: {
      item: MarketplaceItem;
      score: number;
      reason: string;
      mode: string;
    }[];
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const quickChips = [
    'Traditional outfit for fest under ₹500',
    'Borrow vs buy scientific calculator?',
    'Fest kurta for cultural night',
    'Lab coat for Biotech practicals',
    `Dorm fridge under ${formatPrice(40, currency)}`,
    'Sustainability tips for college reuse',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/mivra/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          activeItems,
        }),
      });

      if (!res.ok) throw new Error('Failed to reach Mivra server');

      const data = await res.json();
      const matchedItems = Array.isArray(data.suggestedItemIds)
        ? activeItems.filter((i) => data.suggestedItemIds.includes(i.id))
        : [];

      const mivraMsg: ChatMessage = {
        id: `miv-${Date.now()}`,
        sender: 'mivra',
        text: data.reply || "I couldn't find a direct match, but try posting on the Wanted Board!",
        suggestedItems: matchedItems,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, mivraMsg]);
    } catch (err: any) {
      console.error(err);
      const lower = text.toLowerCase();
      const matched = activeItems.filter(
        (i) =>
          lower.includes(i.category.toLowerCase().split(' ')[0]) ||
          lower.includes(i.title.toLowerCase().split(' ')[0]) ||
          (lower.includes('fest') && i.occasionTags.includes('College Fests')) ||
          (lower.includes('calc') && i.title.toLowerCase().includes('calculator'))
      );

      const fallbackMsg: ChatMessage = {
        id: `miv-${Date.now()}`,
        sender: 'mivra',
        text: `Here are the closest matches on campus for "${text}". Borrowing within your college community saves money and avoids single-use waste.`,
        suggestedItems: matched.slice(0, 2),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSmartMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchNeedQuery.trim()) return;

    setIsSmartMatching(true);
    setSmartMatchResults(null);

    try {
      const res = await fetch('/api/mivra/smart-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needQuery: matchNeedQuery,
          occasion: matchOccasion,
          budget: matchBudget,
          category: matchCategory,
          availableItems: activeItems,
        }),
      });

      if (!res.ok) throw new Error('Smart match failed');

      const data = await res.json();
      const enrichedMatches = (data.matches || [])
        .map((m: any) => {
          const itemObj = activeItems.find((i) => i.id === m.itemId);
          if (!itemObj) return null;
          return {
            item: itemObj,
            score: m.matchScore || 90,
            reason: m.recommendationReason,
            mode: m.recommendedMode,
          };
        })
        .filter(Boolean);

      setSmartMatchResults({
        summary: data.summary,
        matches: enrichedMatches,
      });
    } catch (err) {
      console.error(err);
      const fallbackMatches = activeItems.slice(0, 3).map((item, idx) => ({
        item,
        score: 95 - idx * 8,
        reason: `Matches your search for "${matchNeedQuery}" within budget.`,
        mode:
          item.dealType === 'borrow'
            ? 'Borrowing recommended for short-term use'
            : 'Affordable peer purchase',
      }));

      setSmartMatchResults({
        summary: `Found top campus matches for "${matchNeedQuery}".`,
        matches: fallbackMatches,
      });
    } finally {
      setIsSmartMatching(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md md:max-w-lg bg-[#FBF7F1] shadow-2xl border-l border-[#E6D7C8] flex flex-col animate-slide-left">
      {/* Header */}
      <div className="p-4 bg-[#6D2E46] text-[#FBF7F1] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-[#F0B865]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-base">Mivra</h3>
              <span className="text-[11px] text-[#F3D9E1]">· AI Campus Assistant</span>
            </div>
            <p className="text-[11px] text-[#F3D9E1]/80">
              Natural search & smart reuse recommendations
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

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-2 bg-[#F4EAE0] p-1 border-b border-[#E6D7C8] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'chat'
              ? 'bg-white text-[#6D2E46] shadow-2xs'
              : 'text-[#6E5A4F] hover:text-[#261810]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat with Mivra</span>
        </button>
        <button
          onClick={() => setActiveTab('smart-match')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'smart-match'
              ? 'bg-white text-[#3D2314] shadow-2xs'
              : 'text-[#6E5A4F] hover:text-[#261810]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Smart Match</span>
        </button>
      </div>

      {/* Mode 1: Chat View */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'mivra' && (
                  <div className="w-7 h-7 rounded-lg bg-[#6D2E46] text-[#F0B865] flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="max-w-[85%] space-y-2">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#3D2314] text-[#FBF7F1] rounded-tr-none'
                        : 'bg-white text-[#261810] border border-[#E6D7C8] rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-semibold text-[#6E5A4F]">
                        Matched Campus Listings
                      </div>
                      {msg.suggestedItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            onSelectItem(item);
                            onClose();
                          }}
                          className="bg-white p-2.5 rounded-xl border border-[#E6D7C8] hover:border-[#B85D19] cursor-pointer transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-11 h-11 rounded-lg object-cover shrink-0 border border-[#E6D7C8]"
                            />
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-[#261810] truncate group-hover:text-[#3D2314]">
                                {item.title}
                              </h5>
                              <div className="text-[10px] text-[#6E5A4F] flex items-center gap-1.5 mt-0.5">
                                <span className="text-[#C04A2B] font-semibold">
                                  {item.dealType === 'borrow'
                                    ? `${formatPrice(item.borrowRatePerDay || 0, currency)}/day`
                                    : formatPrice(item.price, currency)}
                                </span>
                                <span>·</span>
                                <span>{item.condition}</span>
                                <span>·</span>
                                <span className="truncate">{item.campusLocation}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-[#3D2314] group-hover:underline shrink-0">
                            View →
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[10px] text-[#8B7569] ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-[#6D2E46] bg-[#F7EEF1] p-3 rounded-2xl w-fit">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mivra is checking campus listings...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-white border-t border-[#E6D7C8] overflow-x-auto flex gap-1.5">
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap bg-[#FBF7F1] hover:bg-[#F4EAE0] border border-[#E6D7C8] text-[#6E5A4F] hover:text-[#3D2314] font-medium transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-[#E6D7C8]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Mivra (e.g. blazer for interview tomorrow)..."
                className="flex-1 text-xs sm:text-sm p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D2E46]/25"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-2.5 rounded-xl bg-[#6D2E46] hover:bg-[#562337] disabled:opacity-50 text-white transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Mode 2: Smart Match */
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="bg-white p-4 rounded-2xl border border-[#E6D7C8] space-y-1.5">
            <h4 className="font-display font-semibold text-base text-[#3D2314] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#B85D19]" />
              <span>Mivra Smart Match</span>
            </h4>
            <p className="text-xs text-[#6E5A4F] leading-relaxed">
              Share what you need, your occasion, and budget. Mivra scans the campus catalog and recommends whether borrowing or buying fits best.
            </p>
          </div>

          <form
            onSubmit={handleRunSmartMatch}
            className="bg-white p-4 rounded-2xl border border-[#E6D7C8] space-y-4"
          >
            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1">
                What do you need? *
              </label>
              <input
                type="text"
                required
                value={matchNeedQuery}
                onChange={(e) => setMatchNeedQuery(e.target.value)}
                placeholder="e.g. Formal blazer for presentation, or Casio calculator"
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">Occasion</label>
                <select
                  value={matchOccasion}
                  onChange={(e) => setMatchOccasion(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#DECBB8] bg-[#FBF7F1]"
                >
                  <option value="All">Any Occasion</option>
                  <option value="College Fests">College Fests</option>
                  <option value="Traditional Day">Traditional Day</option>
                  <option value="Placement & Interviews">Placement & Interviews</option>
                  <option value="Farewell & Prom">Farewell & Prom</option>
                  <option value="Lab Practicals">Lab Practicals</option>
                  <option value="Hackathons">Hackathons</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">Category</label>
                <select
                  value={matchCategory}
                  onChange={(e) => setMatchCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#DECBB8] bg-[#FBF7F1]"
                >
                  <option value="All">All Categories</option>
                  <option value="Clothing & Outfits">Clothing & Outfits</option>
                  <option value="Electronics & Gadgets">Electronics</option>
                  <option value="Books & Academics">Books</option>
                  <option value="Lab & Studio Equipment">Lab Equipment</option>
                  <option value="Dorm & Living">Dorm Essentials</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#261810] mb-1">
                <span>Max Budget:</span>
                <span className="text-[#C04A2B]">{formatPrice(matchBudget, currency)}</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={matchBudget}
                onChange={(e) => setMatchBudget(Number(e.target.value))}
                className="w-full accent-[#C04A2B] cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isSmartMatching || !matchNeedQuery.trim()}
              className="w-full py-2.5 rounded-xl bg-[#3D2314] hover:bg-[#2C180D] disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              {isSmartMatching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning Campus Items...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F0B865]" />
                  <span>Find Smart Matches</span>
                </>
              )}
            </button>
          </form>

          {smartMatchResults && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-[#F9EFE6] border border-[#E6D7C8] p-3.5 rounded-xl text-xs text-[#3D2314] font-medium">
                {smartMatchResults.summary}
              </div>

              {smartMatchResults.matches.map((res) => (
                <div
                  key={res.item.id}
                  onClick={() => {
                    onSelectItem(res.item);
                    onClose();
                  }}
                  className="bg-white p-3.5 rounded-2xl border border-[#E6D7C8] hover:border-[#B85D19] cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#5B6E3A]">{res.score}% Match</span>
                    <span className="font-bold text-[#3D2314]">
                      {res.item.dealType === 'borrow'
                        ? `${formatPrice(res.item.borrowRatePerDay || 0, currency)}/day`
                        : formatPrice(res.item.price, currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={res.item.imageUrl}
                      alt={res.item.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#E6D7C8]"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-[#261810] group-hover:text-[#3D2314]">
                        {res.item.title}
                      </h5>
                      <p className="text-[11px] text-[#6E5A4F] line-clamp-2 mt-0.5">
                        {res.reason}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EFE3D6] flex items-center justify-between text-[11px]">
                    <span className="text-[#C04A2B] font-medium">{res.mode}</span>
                    <span className="text-[#3D2314] font-semibold group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
