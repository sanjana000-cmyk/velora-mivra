import React, { useState } from 'react';
import {
  Leaf,
  Repeat,
  TrendingUp,
  DollarSign,
  IndianRupee,
  Award,
  ShieldCheck,
  Info,
  Share2,
  Sparkles,
} from 'lucide-react';
import { CampusStats } from '../types/marketplace';
import { CurrencyCode, formatPrice } from '../utils/currency';

interface ImpactTrackerViewProps {
  stats: CampusStats;
  onOpenCreateListing: () => void;
  onOpenMivra: () => void;
  currency?: CurrencyCode;
}

export const ImpactTrackerView: React.FC<ImpactTrackerViewProps> = ({
  stats,
  onOpenCreateListing,
  onOpenMivra,
  currency = 'USD',
}) => {
  const [showMethodology, setShowMethodology] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const categoryImpactBreakdown = [
    { name: 'Occasion Outfits & Fest Wear', percentage: 34, co2: '3,220 kg', items: '626 items' },
    { name: 'Electronics & Calculators', percentage: 26, co2: '2,464 kg', items: '478 items' },
    { name: 'Textbooks & Course Notes', percentage: 22, co2: '2,085 kg', items: '405 items' },
    { name: 'Dorm Furniture & Appliances', percentage: 12, co2: '1,137 kg', items: '221 items' },
    { name: 'Lab Coats & Drafting Equipment', percentage: 6, co2: '568 kg', items: '112 items' },
  ];

  const dormLeaderboard = [
    { rank: 1, name: 'Oak Hall Residence', items: 428, co2Saved: '2,140 kg', note: 'Top Circular Dorm' },
    { rank: 2, name: 'Maple Court Residences', items: 382, co2Saved: '1,960 kg', note: 'High Reuse Ratio' },
    { rank: 3, name: 'Pine Quad Dorms', items: 310, co2Saved: '1,620 kg', note: 'Fest Outfits Shared' },
    { rank: 4, name: 'Willow Hall Complex', items: 285, co2Saved: '1,450 kg', note: 'Lab Gear Champion' },
  ];

  const handleShareImpact = () => {
    navigator.clipboard?.writeText(
      `Our college campus has saved an estimated ${stats.co2SavedKg.toLocaleString()}kg of CO2 and ${formatPrice(stats.studentMoneySaved, currency)} using Velora campus reuse!`
    );
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-[#3D2314] text-[#FBF7F1] rounded-3xl p-7 sm:p-10 border border-[#593522] shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold text-[#F3C4A0]">
            Campus Sustainability & Circularity Tracker
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Small student handovers.{' '}
            <span className="italic text-[#F0B865]">Measurable environmental impact.</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#EAD9CB] leading-relaxed max-w-2xl">
            Every textbook passed down, fest outfit borrowed, and dorm appliance kept out of campus dumpsters reduces virgin manufacturing emissions and keeps money in student pockets.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-[#F3C4A0]" />
              <span>{showMethodology ? 'Hide Calculation Guide' : 'How We Estimate Impact'}</span>
            </button>

            <button
              onClick={handleShareImpact}
              className="px-4 py-2 rounded-full bg-[#C04A2B] hover:bg-[#A33B20] text-white font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? 'Copied to clipboard' : 'Share Campus Milestone'}</span>
            </button>

            <button
              onClick={onOpenMivra}
              className="px-4 py-2 rounded-full bg-[#6D2E46] hover:bg-[#562337] text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F0B865]" />
              <span>Ask Sustainability Advisor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Methodology Callout */}
      {showMethodology && (
        <div className="bg-[#EFF3E7] border border-[#CBD6B8] rounded-2xl p-6 text-[#261810] space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2 text-[#3D2314]">
              <ShieldCheck className="w-4 h-4 text-[#5B6E3A]" />
              Impact Estimation Methodology (All Figures Estimated)
            </h3>
          </div>

          <p className="text-xs text-[#6E5A4F] leading-relaxed">
            All metrics shown on this tracker are <strong>estimates</strong> calculated by comparing the lifecycle footprint of producing and shipping a brand-new item versus extending the life of an existing campus item.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="bg-white p-4 rounded-xl border border-[#E6D7C8]">
              <div className="font-bold text-[#5B6E3A]">CO₂ Avoided (Estimate)</div>
              <p className="text-[11px] text-[#6E5A4F] mt-1">
                Averages ~8.5 kg for textbooks, ~18 kg for festive/formal clothing, and ~12 kg for small electronics.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E6D7C8]">
              <div className="font-bold text-[#C04A2B]">Landfill Diverted (Estimate)</div>
              <p className="text-[11px] text-[#6E5A4F] mt-1">
                Solid weight of items plus shipping packaging prevented from entering municipal waste streams.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E6D7C8]">
              <div className="font-bold text-[#3D2314]">Student Savings (Estimate)</div>
              <p className="text-[11px] text-[#6E5A4F] mt-1">
                Difference between retail/bookstore MSRP and the student's peer sale or borrowing rate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-[#E6D7C8] p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#F9EFE6] text-[#3D2314]">
              <Repeat className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-[#B85D19]">Live Total</span>
          </div>
          <div className="font-display text-3xl font-bold text-[#3D2314]">
            {stats.itemsReusedTotal.toLocaleString()}+
          </div>
          <div className="text-xs font-bold text-[#261810]">Items Kept in Circulation</div>
          <p className="text-[11px] text-[#6E5A4F]">
            Across {stats.activeLendersCount} lenders & {stats.activeBorrowsCount} active borrows.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6D7C8] p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#EFF3E7] text-[#5B6E3A]">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-[#6E5A4F]">Estimated</span>
          </div>
          <div className="font-display text-3xl font-bold text-[#5B6E3A]">
            {stats.co2SavedKg.toLocaleString()} kg
          </div>
          <div className="text-xs font-bold text-[#261810]">CO₂ Emissions Avoided</div>
          <p className="text-[11px] text-[#6E5A4F]">
            Comparable to ~430 mature trees absorbing carbon for a decade.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6D7C8] p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#FBF0EC] text-[#C04A2B]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-[#6E5A4F]">Estimated</span>
          </div>
          <div className="font-display text-3xl font-bold text-[#C04A2B]">
            {stats.wasteAvoidedKg.toLocaleString()} kg
          </div>
          <div className="text-xs font-bold text-[#261810]">Landfill Waste Diverted</div>
          <p className="text-[11px] text-[#6E5A4F]">
            Avoided solid product & packaging disposal on move-out days.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6D7C8] p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-[#F4EAE0] text-[#3D2314]">
              {currency === 'INR' ? (
                <IndianRupee className="w-4 h-4" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
            </div>
            <span className="text-[11px] font-semibold text-[#6E5A4F]">Estimated</span>
          </div>
          <div className="font-display text-3xl font-bold text-[#261810]">
            {formatPrice(stats.studentMoneySaved, currency)}
          </div>
          <div className="text-xs font-bold text-[#261810]">Student Money Saved</div>
          <p className="text-[11px] text-[#6E5A4F]">
            Retained directly in student budgets instead of new retail.
          </p>
        </div>
      </div>

      {/* Breakdown & Dorm Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E6D7C8] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-[#3D2314] text-lg">
              Estimated Reuse Breakdown by Category
            </h3>
            <span className="text-xs text-[#8B7569]">Semester to Date</span>
          </div>

          <div className="space-y-4">
            {categoryImpactBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#261810]">
                  <span>{cat.name}</span>
                  <span className="text-[#B85D19]">
                    {cat.co2} avoided · {cat.items}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F4EAE0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C04A2B] rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#EFE3D6] flex items-center justify-between">
            <div className="text-xs text-[#6E5A4F]">
              Want to add your contribution to the campus impact score?
            </div>
            <button
              onClick={onOpenCreateListing}
              className="text-xs font-bold text-[#3D2314] hover:underline"
            >
              List an item →
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E6D7C8] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-[#3D2314] text-lg">
              Dorm Circularity Rankings
            </h3>
            <Award className="w-5 h-5 text-[#C04A2B]" />
          </div>

          <p className="text-xs text-[#6E5A4F]">
            Residences leading campus sharing across fest wear, textbooks, and study gear.
          </p>

          <div className="space-y-3 pt-1">
            {dormLeaderboard.map((dorm) => (
              <div
                key={dorm.name}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#EFE3D6] hover:border-[#B85D19]/40 bg-[#FBF7F1] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white font-bold text-xs text-[#3D2314] flex items-center justify-center border border-[#E6D7C8]">
                    {dorm.rank}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-[#261810]">{dorm.name}</div>
                    <div className="text-[11px] text-[#B85D19] font-medium">{dorm.note}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#261810]">{dorm.items} items</div>
                  <div className="text-[10px] text-[#8B7569]">{dorm.co2Saved} est.</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
