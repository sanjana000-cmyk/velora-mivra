import React from 'react';
import { X, ShieldCheck, MapPin, CheckCircle2, Lock, HeartHandshake } from 'lucide-react';
import { CAMPUS_MEETUP_SPOTS } from '../data/mockData';

interface CampusSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusSafetyModal: React.FC<CampusSafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-[#2A170D]/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FBF7F1] rounded-3xl shadow-2xl border border-[#E6D7C8] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#543220] bg-[#3D2314] text-[#FBF7F1]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-[#F0B865] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-base text-[#FBF7F1]">
                Campus Verification & Safety Protocol
              </h2>
              <p className="text-[11px] text-[#F3C4A0]">
                Building a high-trust circular community on college grounds
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#6E5A4F]">
          {/* Student Verification Concept */}
          <div className="bg-[#EFF3E7] border border-[#CBD6B8] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-xs text-[#3D2314] uppercase tracking-wide">
              <Lock className="w-4 h-4 text-[#5B6E3A]" />
              <span>How Student Verification Works</span>
            </div>
            <p className="text-xs text-[#261810] leading-relaxed">
              Every profile displaying the <strong>.edu Verified Student</strong> mark has
              authenticated their active college email address and student directory profile,
              ensuring you transact only with genuine classmates.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-[#3D2314] font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5B6E3A]" />
                Active .edu domain check
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5B6E3A]" />
                Dorm & department cross-check
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5B6E3A]" />
                Campus reputation score
              </span>
            </div>
          </div>

          {/* Designated Campus Meetup Spots */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#261810]">
              <MapPin className="w-4 h-4 text-[#B85D19]" />
              <span>Official Campus Exchange Zones</span>
            </div>
            <p className="text-xs text-[#6E5A4F]">
              Conduct physical handovers at these designated high-traffic, well-lit campus zones:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMPUS_MEETUP_SPOTS.map((spot) => (
                <div
                  key={spot}
                  className="p-2.5 rounded-xl bg-white border border-[#E6D7C8] text-xs font-semibold text-[#261810] flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#B85D19] shrink-0" />
                  <span>{spot}</span>
                </div>
              ))}
            </div>
          </div>

          {/* The Circular Honor Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#261810]">
              <HeartHandshake className="w-4 h-4 text-[#C04A2B]" />
              <span>Campus Reuse Honor Code</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl border border-[#E6D7C8] bg-white">
                <div className="font-bold text-[#261810] mb-0.5">1. Inspect Before Handover</div>
                <p className="text-[#6E5A4F]">
                  Power on calculators and electronics; check apparel zippers and seams in daylight
                  before confirming the transfer.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E6D7C8] bg-white">
                <div className="font-bold text-[#261810] mb-0.5">2. Respect Borrowing Deadlines</div>
                <p className="text-[#6E5A4F]">
                  Borrowing relies on mutual trust. Return festive attire, books, and lab tools on or
                  before the agreed date to unlock your full security deposit.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E6D7C8] bg-white">
                <div className="font-bold text-[#261810] mb-0.5">3. Clean & Care for Fest Outfits</div>
                <p className="text-[#6E5A4F]">
                  Return borrowed kurtas, gowns, and blazers dry-cleaned or neatly washed so fellow
                  classmates can reuse them immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4EAE0] border-t border-[#E6D7C8] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#3D2314] hover:bg-[#2C180D] text-[#FBF7F1] font-semibold text-xs transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
