/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Repeat,
  Leaf,
  ShieldCheck,
  Heart,
  MapPin,
  HelpCircle,
  PlusCircle,
  MessageSquare
} from 'lucide-react';
import {
  MarketplaceItem,
  WantedPost,
  WantedOffer,
  CampusStats,
  OccasionType
} from './types/marketplace';
import { INITIAL_ITEMS, INITIAL_WANTED, INITIAL_STATS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MarketplaceView } from './components/MarketplaceView';
import { OccasionReuseView } from './components/OccasionReuseView';
import { WantedBoardView } from './components/WantedBoardView';
import { ImpactTrackerView } from './components/ImpactTrackerView';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { PostWantedModal } from './components/PostWantedModal';
import { MivraChatDrawer } from './components/MivraChatDrawer';
import { CampusSafetyModal } from './components/CampusSafetyModal';
import { SavedItemsModal } from './components/SavedItemsModal';
import { BorrowAdvisorModal } from './components/BorrowAdvisorModal';
import { CurrencyCode, formatPrice } from './utils/currency';

export default function App() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'occasions' | 'wanted' | 'impact'>('marketplace');

  // Core Data State
  const [items, setItems] = useState<MarketplaceItem[]>(INITIAL_ITEMS);
  const [wantedPosts, setWantedPosts] = useState<WantedPost[]>(INITIAL_WANTED);
  const [stats, setStats] = useState<CampusStats>(INITIAL_STATS);
  const [savedItemIds, setSavedItemIds] = useState<string[]>(['item-1', 'item-3']);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Modals & Panels
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isPostWantedOpen, setIsPostWantedOpen] = useState(false);
  const [isMivraOpen, setIsMivraOpen] = useState(false);
  const [mivraPrompt, setMivraPrompt] = useState<string>('');
  const [isSafetyGuideOpen, setIsSafetyGuideOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isBorrowAdvisorOpen, setIsBorrowAdvisorOpen] = useState(false);

  // Search & Global Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDealType, setSelectedDealType] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [naturalSearchInterpretation, setNaturalSearchInterpretation] = useState<string | null>(null);
  const [naturalMatchedItemIds, setNaturalMatchedItemIds] = useState<string[] | null>(null);
  const [isNaturalSearching, setIsNaturalSearching] = useState(false);
  const inFlightQueryRef = useRef<string | null>(null);

  // Handle Natural Language Search via Mivra
  const handleNaturalSearch = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery || inFlightQueryRef.current === cleanQuery) return;

    inFlightQueryRef.current = cleanQuery;
    setIsNaturalSearching(true);
    setActiveTab('marketplace');
    setSearchTerm('');
    setSelectedDealType('all');
    setSelectedOccasion('all');
    setNaturalMatchedItemIds(null);
    setNaturalSearchInterpretation(`Mivra is interpreting: "${cleanQuery}"...`);

    try {
      const res = await fetch('/api/mivra/natural-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery, availableItems: items }),
      });

      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      setNaturalSearchInterpretation(
        `${data.interpretation || `Matches for "${cleanQuery}"`} ${data.borrowOrBuyTip ? `· ${data.borrowOrBuyTip}` : ''}`
      );

      if (Array.isArray(data.suggestedItemIds) && data.suggestedItemIds.length > 0) {
        setNaturalMatchedItemIds(data.suggestedItemIds);
      } else if (data.suggestedOccasion) {
        setSelectedOccasion(data.suggestedOccasion);
      }
    } catch {
      setNaturalSearchInterpretation(`Showing campus listings matching: "${cleanQuery}"`);
      setSearchTerm(cleanQuery.split(' ')[0]);
    } finally {
      inFlightQueryRef.current = null;
      setIsNaturalSearching(false);
    }
  };

  const handleClearNaturalSearch = () => {
    setNaturalSearchInterpretation(null);
    setNaturalMatchedItemIds(null);
    setSearchTerm('');
    setSelectedOccasion('all');
    setSelectedDealType('all');
  };

  // Handle Bookmarks
  const handleToggleSave = (itemId: string) => {
    setSavedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Handle New Item Created
  const handleItemCreated = (newItem: MarketplaceItem) => {
    setItems((prev) => [newItem, ...prev]);
    // Boost collective impact stats
    setStats((prev) => ({
      ...prev,
      itemsReusedTotal: prev.itemsReusedTotal + 1,
      co2SavedKg: Math.round(prev.co2SavedKg + newItem.impact.co2Kg),
      wasteAvoidedKg: Math.round(prev.wasteAvoidedKg + newItem.impact.wasteKg),
      studentMoneySaved: Math.round(prev.studentMoneySaved + newItem.impact.moneySaved),
      activeLendersCount: prev.activeLendersCount + 1,
    }));
    setActiveTab('marketplace');
  };

  // Handle New Wanted Post
  const handlePostWantedCreated = (newPost: WantedPost) => {
    setWantedPosts((prev) => [newPost, ...prev]);
    setActiveTab('wanted');
  };

  // Handle Offer Added to Wanted Post
  const handleAddOffer = (postId: string, offer: WantedOffer) => {
    setWantedPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            offers: [offer, ...(p.offers || [])],
            responsesCount: (p.responsesCount || 0) + 1,
          };
        }
        return p;
      })
    );
  };

  // Open Mivra with contextual query
  const handleOpenMivraWithContext = (query: string) => {
    setMivraPrompt(query);
    setIsMivraOpen(true);
  };

  const savedItems = items.filter((i) => savedItemIds.includes(i.id));

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#261810] flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateListing={() => setIsCreateListingOpen(true)}
        onOpenMivra={() => {
          setMivraPrompt('');
          setIsMivraOpen(true);
        }}
        onOpenSafetyGuide={() => setIsSafetyGuideOpen(true)}
        savedCount={savedItemIds.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currency={currency}
        setCurrency={setCurrency}
        onOpenBorrowAdvisor={() => setIsBorrowAdvisorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero banner shown on marketplace or occasions tab */}
        {(activeTab === 'marketplace' || activeTab === 'occasions') && (
          <HeroBanner
            stats={stats}
            selectedDealType={selectedDealType}
            setSelectedDealType={setSelectedDealType}
            selectedOccasion={selectedOccasion}
            setSelectedOccasion={setSelectedOccasion}
            onOpenMivra={() => {
              setMivraPrompt('');
              setIsMivraOpen(true);
            }}
            onOpenCreateListing={() => setIsCreateListingOpen(true)}
            onNaturalSearch={handleNaturalSearch}
            onOpenBorrowAdvisor={() => setIsBorrowAdvisorOpen(true)}
            currency={currency}
            isNaturalSearching={isNaturalSearching}
          />
        )}

        {/* View Routing */}
        {activeTab === 'marketplace' && (
          <MarketplaceView
            items={items}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDealType={selectedDealType}
            setSelectedDealType={setSelectedDealType}
            selectedOccasion={selectedOccasion}
            setSelectedOccasion={setSelectedOccasion}
            savedItemIds={savedItemIds}
            onToggleSave={handleToggleSave}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenCreateListing={() => setIsCreateListingOpen(true)}
            onOpenMivra={() => {
              setMivraPrompt('');
              setIsMivraOpen(true);
            }}
            onOpenWantedBoard={() => setActiveTab('wanted')}
            currency={currency}
            naturalSearchInterpretation={naturalSearchInterpretation}
            naturalMatchedItemIds={naturalMatchedItemIds}
            onClearNaturalSearch={handleClearNaturalSearch}
          />
        )}

        {activeTab === 'occasions' && (
          <OccasionReuseView
            items={items}
            onSelectItem={(item) => setSelectedItem(item)}
            savedItemIds={savedItemIds}
            onToggleSave={handleToggleSave}
            onOpenCreateListing={() => setIsCreateListingOpen(true)}
            onOpenMivra={() => {
              setMivraPrompt('Find an outfit to borrow for upcoming college events');
              setIsMivraOpen(true);
            }}
            currency={currency}
          />
        )}

        {activeTab === 'wanted' && (
          <WantedBoardView
            posts={wantedPosts}
            onOpenPostWanted={() => setIsPostWantedOpen(true)}
            onAddOffer={handleAddOffer}
            onOpenMivraWithContext={handleOpenMivraWithContext}
            currency={currency}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactTrackerView
            stats={stats}
            onOpenCreateListing={() => setIsCreateListingOpen(true)}
            onOpenMivra={() => {
              setMivraPrompt('How does reuse calculate carbon savings compared to buying new?');
              setIsMivraOpen(true);
            }}
            currency={currency}
          />
        )}
      </main>

      {/* Persistent Floating Mivra AI Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            setMivraPrompt('');
            setIsMivraOpen(true);
          }}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#6D2E46] hover:bg-[#562337] text-[#FBF7F1] font-semibold text-xs sm:text-sm shadow-xl shadow-[#2A170D]/25 border border-white/15 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#F0B865]" />
          </div>
          <span className="font-bold tracking-wide">Ask Mivra</span>
          <span className="text-[11px] text-[#F3D9E1] font-medium hidden sm:inline">
            · AI Helper
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-[#2A170D] text-[#EAD9CB]/85 text-xs border-t border-[#543220] py-10 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3D2314] text-[#F0B865] flex items-center justify-center font-bold border border-white/10">
                <Repeat className="w-4 h-4" />
              </div>
              <span className="font-display font-semibold text-lg text-[#FBF7F1]">Velora</span>
            </div>
            <p className="text-[11px] text-[#EAD9CB]/75 leading-relaxed">
              AI-powered campus reuse marketplace with Mivra. Encouraging student affordability,
              circularity, and verified peer sharing.
            </p>
            <div className="flex items-center gap-1.5 text-[#F3C4A0] text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified College Community Network</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[#FBF7F1] font-bold text-xs uppercase tracking-wider">Features</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  Buy & Sell Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('occasions')}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  Occasion-Based Outfits & Gear
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('wanted')}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  Wanted Board (ISO Requests)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('impact')}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  Reuse Impact Tracker
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-[#FBF7F1] font-bold text-xs uppercase tracking-wider">Mivra AI</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => {
                    setMivraPrompt('');
                    setIsMivraOpen(true);
                  }}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  Mivra Smart Match
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsCreateListingOpen(true)}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  AI Listing Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setMivraPrompt(`Suggest fest outfits under ${formatPrice(15, currency)}`);
                    setIsMivraOpen(true);
                  }}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  Fest Outfit Recommender
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setMivraPrompt('How does campus borrowing protect deposits?');
                    setIsMivraOpen(true);
                  }}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  Borrowing Safety Guide
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-[#FBF7F1] font-bold text-xs uppercase tracking-wider">
              Campus Trust
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => setIsSafetyGuideOpen(true)}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  Designated Safe Meetup Spots
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsSafetyGuideOpen(true)}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  .edu Verification Standard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsSafetyGuideOpen(true)}
                  className="hover:text-[#FBF7F1] transition-colors"
                >
                  Circular Campus Honor Code
                </button>
              </li>
              <li>
                <span className="text-[#EAD9CB]/55">Campus Prototype Network</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[#543220] flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#EAD9CB]/65">
          <div>© 2026 Velora Campus Reuse with Mivra. Built for verified college students.</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#D6E5B8] font-medium">
              <Leaf className="w-3.5 h-3.5" />
              Circular Economy · Zero Single-Use Waste
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isSaved={selectedItem ? savedItemIds.includes(selectedItem.id) : false}
        onToggleSave={handleToggleSave}
        onOpenMivraWithContext={handleOpenMivraWithContext}
        currency={currency}
        onOpenBorrowAdvisor={() => setIsBorrowAdvisorOpen(true)}
      />

      <BorrowAdvisorModal
        isOpen={isBorrowAdvisorOpen}
        onClose={() => setIsBorrowAdvisorOpen(false)}
        currency={currency}
        onSearchItem={(term) => {
          setSearchTerm(term);
          setActiveTab('marketplace');
        }}
        initialItemName={selectedItem?.title || ''}
      />

      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onItemCreated={handleItemCreated}
        currency={currency}
      />

      <PostWantedModal
        isOpen={isPostWantedOpen}
        onClose={() => setIsPostWantedOpen(false)}
        onPostCreated={handlePostWantedCreated}
        currency={currency}
      />

      <MivraChatDrawer
        isOpen={isMivraOpen}
        onClose={() => setIsMivraOpen(false)}
        activeItems={items}
        onSelectItem={(item) => setSelectedItem(item)}
        initialPrompt={mivraPrompt}
        currency={currency}
      />

      <CampusSafetyModal
        isOpen={isSafetyGuideOpen}
        onClose={() => setIsSafetyGuideOpen(false)}
      />

      <SavedItemsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedItems={savedItems}
        onRemoveSave={handleToggleSave}
        onSelectItem={(item) => setSelectedItem(item)}
        currency={currency}
      />
    </div>
  );
}
