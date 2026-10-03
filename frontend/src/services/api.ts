import { 
  LostItem, 
  FoundItem, 
  LostItemStatus, 
  FoundItemStatus, 
  ItemMatchRecord, 
  ItemClaim, 
  CampusStats, 
  MatchSuggestion 
} from '../types';

const API_BASE = '/api';

export const api = {
  // --- Lost Items ---
  async getLostItems(params?: { status?: string; category?: string; q?: string }): Promise<LostItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params?.q) searchParams.append('q', params.q);

    const res = await fetch(`${API_BASE}/lost-items?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch lost items');
    return res.json();
  },

  async createLostItem(data: Partial<LostItem>): Promise<LostItem> {
    const res = await fetch(`${API_BASE}/lost-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to report lost item' }));
      throw new Error(err.detail || 'Failed to report lost item');
    }
    return res.json();
  },

  async updateLostItemStatus(id: number, status: LostItemStatus): Promise<LostItem> {
    const res = await fetch(`${API_BASE}/lost-items/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update lost item status' }));
      throw new Error(err.detail || 'Failed to update lost item status');
    }
    return res.json();
  },

  async deleteLostItem(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/lost-items/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete lost item');
  },

  async getLostItemMatches(id: number): Promise<MatchSuggestion[]> {
    const res = await fetch(`${API_BASE}/lost-items/${id}/matches`);
    if (!res.ok) throw new Error('Failed to fetch match suggestions');
    return res.json();
  },

  // --- Found Items ---
  async getFoundItems(params?: { status?: string; category?: string; q?: string }): Promise<FoundItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params?.q) searchParams.append('q', params.q);

    const res = await fetch(`${API_BASE}/found-items?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch found items');
    return res.json();
  },

  async createFoundItem(data: Partial<FoundItem>): Promise<FoundItem> {
    const res = await fetch(`${API_BASE}/found-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to report found item' }));
      throw new Error(err.detail || 'Failed to report found item');
    }
    return res.json();
  },

  async updateFoundItemStatus(id: number, status: FoundItemStatus): Promise<FoundItem> {
    const res = await fetch(`${API_BASE}/found-items/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update found item status' }));
      throw new Error(err.detail || 'Failed to update found item status');
    }
    return res.json();
  },

  async deleteFoundItem(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/found-items/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete found item');
  },

  async getFoundItemMatches(id: number): Promise<any[]> {
    const res = await fetch(`${API_BASE}/found-items/${id}/matches`);
    if (!res.ok) throw new Error('Failed to fetch matches for found item');
    return res.json();
  },

  // --- Uploads ---
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Image upload failed' }));
      throw new Error(err.detail || 'Image upload failed');
    }
    return res.json();
  },

  // --- Matches & Claims ---
  async getMatches(): Promise<ItemMatchRecord[]> {
    const res = await fetch(`${API_BASE}/matches`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  async updateMatchStatus(matchId: number, status: 'suggested' | 'confirmed' | 'rejected'): Promise<ItemMatchRecord> {
    const res = await fetch(`${API_BASE}/matches/${matchId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update match status');
    return res.json();
  },

  async createMatch(data: { lost_item_id: number; found_item_id: number; match_score: number; match_reason?: string }): Promise<ItemMatchRecord> {
    const res = await fetch(`${API_BASE}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create match proposal');
    return res.json();
  },

  async submitClaim(data: {
    found_item_id: number;
    lost_item_id?: number;
    claimant_name: string;
    claimant_email: string;
    claimant_phone?: string;
    student_id?: string;
    proof_description: string;
  }): Promise<ItemClaim> {
    const res = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit claim' }));
      throw new Error(err.detail || 'Failed to submit claim');
    }
    return res.json();
  },

  async getClaims(): Promise<ItemClaim[]> {
    const res = await fetch(`${API_BASE}/claims`);
    if (!res.ok) throw new Error('Failed to fetch claims');
    return res.json();
  },

  async reviewClaim(claimId: number, approved: boolean, notes?: string): Promise<ItemClaim> {
    const searchParams = new URLSearchParams();
    searchParams.append('approved', String(approved));
    if (notes) searchParams.append('review_notes', notes);

    const res = await fetch(`${API_BASE}/claims/${claimId}/review?${searchParams.toString()}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to review claim');
    return res.json();
  },

  // --- Stats ---
  async getStats(): Promise<CampusStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch campus stats');
    return res.json();
  },
};
