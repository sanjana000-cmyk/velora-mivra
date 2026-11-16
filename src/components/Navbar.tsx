import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Repeat,
  BarChart3,
  PlusCircle,
  ShieldCheck,
  Search,
  Bookmark,
  Menu,
  X,
  MapPin,
  CalendarCheck,
  Scale,
} from 'lucide-react';
import { CurrencyCode } from '../utils/currency';

interface NavbarProps {
  activeTab: 'marketplace' | 'occasions' | 'wanted' | 'impact';
  setActiveTab: (tab: 'marketplace' | 'occasions' | 'wanted' | 'impact') => void;
  onOpenCreateListing: () => void;
  onOpenMivra: () => void;
  onOpenSafetyGuide: () => void;
  savedCount: number;
  onOpenSavedModal: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  onOpenBorrowAdvisor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateListing,
  onOpenMivra,
  onOpenSafetyGuide,
  savedCount,
  onOpenSavedModal,
  searchTerm,
  setSearchTerm,
  currency,
  setCurrency,
  onOpenBorrowAdvisor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  interface NavLinkItem {
    id: 'marketplace' | 'occasions' | 'wanted' | 'impact';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  const navLinks: NavLinkItem[] = [
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'occasions', label: 'Occasions', icon: CalendarCheck },
    { id: 'wanted', label: 'Wanted Board', icon: Repeat },
    { id: 'impact', label: 'Impact', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBF7F1]/95 backdrop-blur-md border-b border-[#E6D7C8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-[#3D2314] flex items-center justify-center text-[#FBF7F1] shadow-xs group-hover:bg-[#52301C] transition-colors">
                <Repeat className="w-4 h-4 text-[#F0B865] transition-transform group-hover:rotate-45" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-bold text-xl tracking-tight text-[#3D2314]">
                    Velora
                  </span>
                  <span className="text-[11px] font-medium text-[#6E5A4F] hidden sm:inline">
                    · Autumn Campus
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Quick Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B7569]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (activeTab !== 'marketplace') setActiveTab('marketplace');
                }}
                placeholder="Search calculators, kurtas, books..."
                className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-[#E6D7C8] rounded-full text-[#261810] focus:outline-none focus:ring-2 focus:ring-[#B85D19]/30 focus:border-[#B85D19] transition-all placeholder:text-[#9A8578]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#8B7569] hover:text-[#261810]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'text-[#3D2314]'
                      : 'text-[#6E5A4F] hover:text-[#3D2314]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C04A2B]' : 'text-[#8B7569]'}`} />
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#C04A2B] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Segmented Dual Currency Switcher (₹ INR | $ USD) */}
            <div
              className="inline-flex items-center p-0.5 rounded-lg bg-[#F4EAE0] border border-[#E6D7C8]"
              role="group"
              aria-label="Currency selector"
            >
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                  currency === 'INR'
                    ? 'bg-[#3D2314] text-[#FBF7F1] shadow-2xs'
                    : 'text-[#6E5A4F] hover:text-[#261810]'
                }`}
                title="Show Indian Rupee (₹ INR) prices"
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-[#3D2314] text-[#FBF7F1] shadow-2xs'
                    : 'text-[#6E5A4F] hover:text-[#261810]'
                }`}
                title="Show US Dollar ($ USD) prices"
              >
                $ USD
              </button>
            </div>

            {/* AI Borrow-or-Buy Advisor Button */}
            <button
              onClick={onOpenBorrowAdvisor}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4EAE0] hover:bg-[#EBDDCE] border border-[#E6D7C8] text-[#261810] text-xs font-semibold transition-colors"
              title="AI Borrow-or-Buy Advisor"
            >
              <Scale className="w-3.5 h-3.5 text-[#C04A2B]" />
              <span>Advisor</span>
            </button>

            {/* Mivra AI Assistant Trigger Button */}
            <button
              onClick={onOpenMivra}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#6D2E46] hover:bg-[#562337] text-[#FBF7F1] text-xs font-semibold shadow-xs transition-all"
              title="Ask Mivra AI for recommendations"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F0B865]" />
              <span className="hidden sm:inline">Ask Mivra</span>
              <span className="sm:hidden font-bold">Mivra</span>
            </button>

            {/* List an Item Button */}
            <button
              onClick={onOpenCreateListing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#3D2314] hover:bg-[#2C180D] text-[#FBF7F1] text-xs font-semibold shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#F3C4A0]" />
              <span className="hidden sm:inline">List Item</span>
              <span className="sm:hidden">List</span>
            </button>

            {/* Saved Bookmarks */}
            <button
              onClick={onOpenSavedModal}
              className="relative p-2 rounded-full text-[#6E5A4F] hover:text-[#3D2314] hover:bg-[#F4EAE0] transition-colors"
              title="Saved Items"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#C04A2B] text-white text-[10px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Campus Safety Guide */}
            <button
              onClick={onOpenSafetyGuide}
              className="hidden sm:flex items-center gap-1 p-2 rounded-full text-[#B85D19] hover:bg-[#F4EAE0] transition-colors"
              title="Campus Verification & Safety Protocol"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden text-[#6E5A4F] hover:text-[#3D2314] rounded-lg hover:bg-[#F4EAE0]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E6D7C8] py-3 px-2 space-y-1.5 bg-[#FBF7F1]">
            <div className="mb-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7569]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (activeTab !== 'marketplace') setActiveTab('marketplace');
                  }}
                  placeholder="Search products, kurtas, books..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E6D7C8] rounded-xl"
                />
              </div>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-[#F9EFE6] text-[#3D2314]' : 'text-[#6E5A4F] hover:bg-[#F4EAE0]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#C04A2B]" />
                  <span>{link.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => {
                onOpenBorrowAdvisor();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#6E5A4F] hover:bg-[#F4EAE0]"
            >
              <Scale className="w-4 h-4 text-[#C04A2B]" />
              <span>AI Borrow-or-Buy Advisor</span>
            </button>

            <div className="pt-2 border-t border-[#E6D7C8] flex items-center justify-between text-xs text-[#6E5A4F] px-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B85D19]" />
                College Campus Network
              </span>
              <button
                onClick={() => {
                  onOpenSafetyGuide();
                  setMobileMenuOpen(false);
                }}
                className="text-[#3D2314] font-semibold underline"
              >
                Safe Meetup Spots
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
