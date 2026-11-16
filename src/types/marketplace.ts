export type DealType = 'sell' | 'borrow' | 'lend' | 'free' | 'exchange';

export type ItemCategory =
  | 'Books & Academics'
  | 'Electronics & Gadgets'
  | 'Clothing & Outfits'
  | 'Lab & Studio Equipment'
  | 'Dorm & Living'
  | 'Bicycles & Mobility'
  | 'Accessories & Misc';

export type OccasionType =
  | 'College Fests'
  | 'Traditional Day'
  | 'Farewell & Prom'
  | 'Placement & Interviews'
  | 'Lab Practicals'
  | 'Hackathons'
  | 'Everyday';

export type Condition = 'Like New' | 'Good' | 'Fair';

export interface SellerProfile {
  id: string;
  name: string;
  avatar: string;
  department: string;
  year: string;
  verifiedEdu: boolean;
  eduEmailDomain: string;
  hostel: string;
  rating: number;
  totalExchanges: number;
  badges: string[];
  responseRate?: string;
}

export interface ItemImpact {
  co2Kg: number;
  wasteKg: number;
  moneySaved: number;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  dealType: DealType;
  price: number;
  borrowRatePerDay?: number;
  borrowDeposit?: number;
  maxBorrowDays?: number;
  condition: Condition;
  occasionTags: OccasionType[];
  campusLocation: string;
  meetupSpots: string[];
  seller: SellerProfile;
  imageUrl: string;
  additionalImages?: string[];
  tags: string[];
  impact: ItemImpact;
  createdAt: string;
  isAvailable: boolean;
  likes: number;
  views?: number;
}

export interface WantedPost {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  maxBudget: number;
  dealTypePreference: DealType | 'any';
  urgency: 'urgent' | 'this-week' | 'flexible';
  needByDate: string;
  occasion?: OccasionType;
  student: SellerProfile;
  responsesCount: number;
  createdAt: string;
  status: 'active' | 'fulfilled';
  offers: WantedOffer[];
}

export interface WantedOffer {
  id: string;
  studentName: string;
  studentAvatar: string;
  studentDept: string;
  itemTitle: string;
  priceOrRate: string;
  message: string;
  time: string;
}

export interface CampusStats {
  itemsReusedTotal: number;
  co2SavedKg: number;
  wasteAvoidedKg: number;
  studentMoneySaved: number;
  activeLendersCount: number;
  activeBorrowsCount: number;
}
