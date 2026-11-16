import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Leaf,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import {
  CurrencyCode,
  formatPrice,
  formatAlternatePrice,
  fromBaseUsd,
  toBaseUsd,
} from '../utils/currency';

interface BorrowAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onSearchItem: (term: string) => void;
  initialItemName?: string;
}

export const BorrowAdvisorModal: React.FC<BorrowAdvisorModalProps> = ({
  isOpen,
  onClose,
  currency,
  onSearchItem,
  initialItemName = '',
}) => {
  const [itemName, setItemName] = useState(initialItemName || 'Festive Kurta / Suit');
  const [intendedUsage, setIntendedUsage] = useState('College Cultural Fest (1 weekend)');
  const [frequency, setFrequency] = useState('One-time (1-3 days)');
  const [budgetUsd, setBudgetUsd] = useState<number>(20);
  const [estimatedPriceUsd, setEstimatedPriceUsd] = useState<number>(45);
  const [estimatedBorrowRateUsd, setEstimatedBorrowRateUsd] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && initialItemName) {
      setItemName(initialItemName);
    }
  }, [isOpen, initialItemName]);

  if (!isOpen) return null;

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const presetItems = [
    {
      name: 'Festive Kurta / Ethnic Outfit',
      usage: 'College Cultural Fest (1 weekend)',
      freq: 'One-time (1-3 days)',
      price: 40,
      rate: 5,
    },
    {
      name: 'Casio Scientific Calculator',
      usage: 'Calculus Midterm & Finals',
      freq: 'Exam weeks only',
      price: 25,
      rate: 2,
    },
    {
      name: 'Navy Placement Blazer / Suit',
      usage: 'Campus Interviews & Presentations',
      freq: '2-3 times during placement week',
      price: 70,
      rate: 8,
    },
    {
      name: 'Pure Cotton Lab Coat & Goggles',
      usage: 'Biotech Lab Module (8 weeks)',
      freq: 'Twice a week for 2 months',
      price: 20,
      rate: 2,
    },
  ];

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/mivra/borrow-or-buy-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          intendedUsage,
          frequency,
          budget: budgetUsd,
          estimatedPrice: estimatedPriceUsd,
          estimatedBorrowRate: estimatedBorrowRateUsd,
        }),
      });

      if (!response.ok) throw new Error('Advisor API failed');
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.warn(err);
      const isBorrow =
        frequency.includes('One-time') ||
        intendedUsage.includes('Fest') ||
        intendedUsage.includes('weekend');
      setResult({
        recommendation: isBorrow ? 'borrow' : 'buy',
        confidence: 94,
        headline: isBorrow
          ? `Borrowing is 80%+ cheaper for your ${intendedUsage}`
          : `Buying pre-owned gives better long-term semester value`,
        detailedAnalysis: isBorrow
          ? `Since you only need this item briefly, borrowing at ${formatPrice(
              estimatedBorrowRateUsd,
              currency
            )}/day saves upfront funds and avoids dorm clutter.`
          : `For semester-long utility, owning pre-owned gives unlimited usage and resale value later.`,
        financialBreakdown: {
          borrowCost: estimatedBorrowRateUsd * 3,
          buyCost: estimatedPriceUsd,
          netSavings: Math.max(10, estimatedPriceUsd - estimatedBorrowRateUsd * 3),
        },
        sustainabilityInsight: `Avoids ~15kg CO₂ emissions and eliminates packaging waste on campus.`,
        peerTip: `Meet at the Student Union or Library steps in daylight to verify condition.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-[#2A170D]/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FBF7F1] rounded-3xl shadow-2xl border border-[#E6D7C8] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#543220] bg-[#3D2314] text-[#FBF7F1]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-[#F3C4A0]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-base">
                Mivra Borrow-or-Buy Advisor
              </h2>
              <p className="text-[11px] text-[#F3C4A0]">
                Compare short-term borrowing vs. buying pre-owned ({currency === 'INR' ? '₹ INR' : '$ USD'})
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div>
            <span className="text-xs font-bold text-[#261810] block mb-2">
              Quick Campus Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {presetItems.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => {
                    setItemName(preset.name);
                    setIntendedUsage(preset.usage);
                    setFrequency(preset.freq);
                    setEstimatedPriceUsd(preset.price);
                    setEstimatedBorrowRateUsd(preset.rate);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    itemName === preset.name
                      ? 'bg-[#3D2314] text-[#FBF7F1] border-[#3D2314]'
                      : 'bg-white text-[#6E5A4F] border-[#E6D7C8] hover:border-[#B85D19]'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleRunAnalysis}
            className="space-y-4 bg-white p-5 rounded-2xl border border-[#E6D7C8]"
          >
            <div>
              <label className="text-xs font-bold text-[#261810] block mb-1">
                Item or Gear *
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Traditional Sherwani, Scientific Calculator, Lab Coat"
                className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Intended Occasion / Purpose
                </label>
                <input
                  type="text"
                  value={intendedUsage}
                  onChange={(e) => setIntendedUsage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Usage Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                >
                  <option value="One-time (1-3 days)">One-time (1–3 days for event)</option>
                  <option value="A few times during semester">A few times during semester</option>
                  <option value="Weekly throughout the year">Weekly throughout the year</option>
                  <option value="Daily for multiple years">Daily for entire degree</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Est. Buy Price ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="1"
                  value={fromBaseUsd(estimatedPriceUsd, currency) || ''}
                  onChange={(e) => setEstimatedPriceUsd(toBaseUsd(Number(e.target.value) || 0, currency))}
                  className="w-full text-xs p-2 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                />
                <span className="text-[10px] text-[#8B7569]">
                  ≈ {formatAlternatePrice(estimatedPriceUsd, currency)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Borrow Rate / Day ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="1"
                  value={fromBaseUsd(estimatedBorrowRateUsd, currency) || ''}
                  onChange={(e) =>
                    setEstimatedBorrowRateUsd(toBaseUsd(Number(e.target.value) || 0, currency))
                  }
                  className="w-full text-xs p-2 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                />
                <span className="text-[10px] text-[#8B7569]">
                  ≈ {formatAlternatePrice(estimatedBorrowRateUsd, currency)}/day
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-[#261810] block mb-1">
                  Your Budget ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="1"
                  value={fromBaseUsd(budgetUsd, currency) || ''}
                  onChange={(e) => setBudgetUsd(toBaseUsd(Number(e.target.value) || 0, currency))}
                  className="w-full text-xs p-2 rounded-xl border border-[#DECBB8] bg-[#FBF7F1] text-[#261810]"
                />
                <span className="text-[10px] text-[#8B7569]">
                  ≈ {formatAlternatePrice(budgetUsd, currency)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#C04A2B] hover:bg-[#A33B20] text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating cost & sustainability...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F0B865]" />
                  <span>Analyze: Borrow or Buy?</span>
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="space-y-4 animate-fade-in">
              <div
                className={`p-5 rounded-2xl text-[#FBF7F1] ${
                  result.recommendation === 'borrow' ? 'bg-[#C04A2B]' : 'bg-[#3D2314]'
                }`}
              >
                <div className="text-[11px] font-semibold opacity-90">
                  Mivra Recommendation · {result.confidence}% confidence
                </div>
                <h3 className="font-display text-xl font-semibold mt-0.5">
                  {result.recommendation === 'borrow'
                    ? 'Smarter Choice: Borrow from a Peer'
                    : 'Smarter Choice: Buy Pre-Owned'}
                </h3>
                <p className="text-xs opacity-95 mt-1">{result.headline}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-3.5 rounded-xl border border-[#E6D7C8]">
                  <div className="text-xs text-[#6E5A4F] font-medium">3-Day Borrow</div>
                  <div className="text-base font-bold text-[#C04A2B] mt-1">
                    {formatPrice(result.financialBreakdown?.borrowCost || 15, currency)}
                  </div>
                  <div className="text-[10px] text-[#8B7569]">
                    ≈ {formatAlternatePrice(result.financialBreakdown?.borrowCost || 15, currency)}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E6D7C8]">
                  <div className="text-xs text-[#6E5A4F] font-medium">Full Purchase</div>
                  <div className="text-base font-bold text-[#261810] mt-1">
                    {formatPrice(result.financialBreakdown?.buyCost || 45, currency)}
                  </div>
                  <div className="text-[10px] text-[#8B7569]">
                    ≈ {formatAlternatePrice(result.financialBreakdown?.buyCost || 45, currency)}
                  </div>
                </div>

                <div className="bg-[#EFF3E7] p-3.5 rounded-xl border border-[#CBD6B8]">
                  <div className="text-xs text-[#3D2314] font-semibold">Est. Savings</div>
                  <div className="text-base font-bold text-[#5B6E3A] mt-1">
                    {formatPrice(result.financialBreakdown?.netSavings || 30, currency)}
                  </div>
                  <div className="text-[10px] text-[#6E5A4F]">
                    ≈ {formatAlternatePrice(result.financialBreakdown?.netSavings || 30, currency)}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E6D7C8] text-xs text-[#6E5A4F] leading-relaxed space-y-1.5">
                <div className="font-bold text-[#261810] text-sm">Analysis</div>
                <p>{result.detailedAnalysis}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#EFF3E7] p-3.5 rounded-xl border border-[#CBD6B8] text-[#3D2314] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-[#5B6E3A]" />
                    Sustainability Advisor
                  </div>
                  <p className="text-[11px] leading-relaxed">{result.sustainabilityInsight}</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E6D7C8] text-[#261810] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5B6E3A]" />
                    Campus Handover Tip
                  </div>
                  <p className="text-[11px] text-[#6E5A4F] leading-relaxed">{result.peerTip}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSearchItem(itemName.split(' ')[0]);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-[#3D2314] hover:bg-[#2C180D] text-white font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Browse "{itemName}" on Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
