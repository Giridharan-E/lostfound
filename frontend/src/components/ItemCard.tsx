import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Laptop, 
  CreditCard, 
  Key, 
  Briefcase, 
  BookOpen, 
  Shirt, 
  Box,
  Building,
  CheckCircle,
  HelpCircle,
  Eye
} from 'lucide-react';
import { LostItem, FoundItem, LostItemStatus, FoundItemStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface ItemCardProps {
  item: LostItem | FoundItem;
  type: 'lost' | 'found';
  onSelect: (item: LostItem | FoundItem) => void;
  onOpenMatches: (item: LostItem | FoundItem) => void;
  onClaim?: (item: FoundItem) => void;
  onStatusChange?: (id: number, newStatus: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  type,
  onSelect,
  onOpenMatches,
  onClaim,
  onStatusChange,
}) => {
  const isLost = type === 'lost';
  const lostItem = isLost ? (item as LostItem) : null;
  const foundItem = !isLost ? (item as FoundItem) : null;

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Electronics':
        return <Laptop className="h-4 w-4" />;
      case 'IDs & Cards':
        return <CreditCard className="h-4 w-4" />;
      case 'Keys':
        return <Key className="h-4 w-4" />;
      case 'Wallets & Bags':
        return <Briefcase className="h-4 w-4" />;
      case 'Books & Supplies':
        return <BookOpen className="h-4 w-4" />;
      case 'Apparel & Accessories':
        return <Shirt className="h-4 w-4" />;
      default:
        return <Box className="h-4 w-4" />;
    }
  };

  const formattedDate = new Date(isLost ? lostItem!.date_lost : foundItem!.date_found).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 group">
      <div>
        {/* Header row: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 border border-slate-700/60">
            {getCategoryIcon(item.category)}
            <span>{item.category}</span>
          </span>
          <StatusBadge status={item.status} type={type} size="sm" />
        </div>

        {/* Optional Image Preview */}
        {item.image_url ? (
          <div className="relative mb-3.5 h-36 w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
            <img 
              src={item.image_url} 
              alt={item.title} 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
        ) : null}

        {/* Title & Description */}
        <h3 
          onClick={() => onSelect(item)}
          className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 cursor-pointer"
        >
          {item.title}
        </h3>
        
        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Meta details: Location & Date */}
        <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{item.campus_location}</span>
          </div>

          {!isLost && foundItem?.storage_location ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400/90">
              <Building className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Held at: {foundItem.storage_location}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{isLost ? 'Lost on' : 'Found on'} {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(item)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Details</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenMatches(item)}
            className="flex items-center gap-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 px-2.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 active:scale-95 transition-all"
            title="Scan campus database for matching items"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Matches</span>
          </button>

          {!isLost && (item.status === 'available' || item.status === 'possible match') && onClaim ? (
            <button
              onClick={() => onClaim(foundItem!)}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all active:scale-95"
            >
              <span>Claim</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
