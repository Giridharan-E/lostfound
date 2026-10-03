export type LostItemStatus = 'searching' | 'possible match' | 'claimed' | 'returned' | 'lost';

export type FoundItemStatus = 'available' | 'possible match' | 'claimed' | 'returned';

export type ItemCategory = 
  | 'Electronics'
  | 'IDs & Cards'
  | 'Keys'
  | 'Wallets & Bags'
  | 'Books & Supplies'
  | 'Apparel & Accessories'
  | 'Other';

export interface LostItem {
  id: number;
  title: string;
  category: string;
  description: string;
  campus_location: string;
  date_lost: string;
  image_url?: string | null;
  status: LostItemStatus;
  reporter_name: string;
  reporter_email: string;
  reporter_phone?: string | null;
  student_id?: string | null;
  secret_details?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoundItem {
  id: number;
  title: string;
  category: string;
  description: string;
  campus_location: string;
  storage_location?: string | null;
  date_found: string;
  image_url?: string | null;
  status: FoundItemStatus;
  finder_name: string;
  finder_email: string;
  finder_phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchSuggestion {
  lost_item_id: number;
  found_item_id: number;
  match_score: number;
  reasons: string[];
  found_item: FoundItem;
}

export interface FoundMatchSuggestion {
  lost_item_id: number;
  found_item_id: number;
  match_score: number;
  reasons: string[];
  lost_item: LostItem;
}

export interface ItemMatchRecord {
  id: number;
  lost_item_id: number;
  found_item_id: number;
  match_score: number;
  match_reason?: string | null;
  status: 'suggested' | 'confirmed' | 'rejected';
  created_at: string;
  updated_at: string;
  lost_item?: LostItem;
  found_item?: FoundItem;
}

export interface ItemClaim {
  id: number;
  found_item_id: number;
  lost_item_id?: number | null;
  claimant_name: string;
  claimant_email: string;
  claimant_phone?: string | null;
  student_id?: string | null;
  proof_description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string | null;
  review_notes?: string | null;
}

export interface CampusStats {
  summary: {
    total_lost: number;
    total_found: number;
    actively_searching: number;
    available_at_desks: number;
    pending_claims: number;
    successfully_returned: number;
    permanently_lost: number;
    recovery_rate_percent: number;
    total_claims: number;
    total_matches: number;
  };
  lost_breakdown: Record<string, number>;
  found_breakdown: Record<string, number>;
}
