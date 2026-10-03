import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Building, 
  Mail, 
  Phone, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle
} from 'lucide-react';
import { LostItem, FoundItem, LostItemStatus, FoundItemStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface ItemDetailModalProps {
  item: LostItem | FoundItem | null;
  type: 'lost' | 'found';
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: number, newStatus: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onOpenMatches: (item: LostItem | FoundItem) => void;
  onOpenClaim?: (foundItem: FoundItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  type,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
  onOpenMatches,
  onOpenClaim,
}) => {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !item) return null;

  const isLost = type === 'lost';
  const lostItem = isLost ? (item as LostItem) : null;
  const foundItem = !isLost ? (item as FoundItem) : null;

  // Allowed transitions
  const lostFlow: LostItemStatus[] = ['searching', 'possible match', 'claimed', 'returned', 'lost'];
  const foundFlow: FoundItemStatus[] = ['available', 'possible match', 'claimed', 'returned'];

  const handleStatusClick = async (nextStatus: string) => {
    setUpdating(true);
    try {
      await onStatusChange(item.id, nextStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Are you sure you want to remove this item registry?')) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white rounded-full p-1 hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <StatusBadge status={item.status} type={type} size="lg" />
          <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
            {item.category}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">{item.title}</h2>

        {/* Item Image if available */}
        {item.image_url && (
          <div className="mt-4 h-56 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Status Lifecycle Flow Visualizer */}
        <div className="mt-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isLost ? 'Lost Item Lifecycle Flow' : 'Found Item Lifecycle Flow'}
            </span>
            <span className="text-[11px] text-slate-500">Click a state to update</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(isLost ? lostFlow : foundFlow).map((s) => {
              const isCurrent = item.status.toLowerCase() === s.toLowerCase();
              return (
                <button
                  key={s}
                  disabled={updating}
                  onClick={() => handleStatusClick(s)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</h4>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-800/30 rounded-xl p-3 border border-slate-800">
            {item.description}
          </p>
        </div>

        {/* Secret Details (if lost item) */}
        {isLost && lostItem?.secret_details && (
          <div className="mt-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 p-3.5">
            <span className="text-xs font-semibold text-indigo-300 block mb-1">
              Private Verification Feature (Staff Only)
            </span>
            <p className="text-xs text-indigo-200/90">{lostItem.secret_details}</p>
          </div>
        )}

        {/* Metadata Details Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-slate-800/30 border border-slate-800 p-3 space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Location: <strong>{item.campus_location}</strong></span>
            </div>
            
            {!isLost && foundItem?.storage_location && (
              <div className="flex items-center gap-2 text-emerald-300">
                <Building className="h-4 w-4 shrink-0" />
                <span>Custody: <strong>{foundItem.storage_location}</strong></span>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                Reported: {new Date(isLost ? lostItem!.date_lost : foundItem!.date_found).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/30 border border-slate-800 p-3 space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Contact: {isLost ? lostItem!.reporter_name : foundItem!.finder_name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{isLost ? lostItem!.reporter_email : foundItem!.finder_email}</span>
            </div>
            {(isLost ? lostItem?.reporter_phone : foundItem?.finder_phone) && (
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{isLost ? lostItem?.reporter_phone : foundItem?.finder_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDeleteClick}
            disabled={deleting}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Listing</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                onOpenMatches(item);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 px-4 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-600/30 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Scan Matches</span>
            </button>

            {!isLost && onOpenClaim && (item.status === 'available' || item.status === 'possible match') && (
              <button
                onClick={() => {
                  onClose();
                  onOpenClaim(foundItem!);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
              >
                <span>Submit Claim</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
