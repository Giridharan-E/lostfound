import React, { useState } from 'react';
import { Search, Filter, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { LostItem, LostItemStatus } from '../types';
import { ItemCard } from '../components/ItemCard';
import { StatusBadge } from '../components/StatusBadge';

interface LostItemsPageProps {
  items: LostItem[];
  loading: boolean;
  onRefresh: () => void;
  onOpenReport: () => void;
  onSelect: (item: LostItem) => void;
  onOpenMatches: (item: LostItem) => void;
}

const CATEGORIES = [
  'All',
  'Electronics',
  'IDs & Cards',
  'Keys',
  'Wallets & Bags',
  'Books & Supplies',
  'Apparel & Accessories',
  'Other',
];

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Searching', value: 'searching' },
  { label: 'Possible Match', value: 'possible match' },
  { label: 'Claimed', value: 'claimed' },
  { label: 'Returned', value: 'returned' },
  { label: 'Lost', value: 'lost' },
];

export const LostItemsPage: React.FC<LostItemsPageProps> = ({
  items,
  loading,
  onRefresh,
  onOpenReport,
  onSelect,
  onOpenMatches,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.campus_location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || item.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      {/* Top Banner / Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lost Items Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse currently lost campus items or report an item to trigger instant AI matching.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-950/30 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Report Lost Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keywords, campus building, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-800 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Dropdown */}
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Items */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse p-4" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <Search className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No lost items match your filters</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, category filters, or check the Found Items tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              type="lost"
              onSelect={() => onSelect(item)}
              onOpenMatches={() => onOpenMatches(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
