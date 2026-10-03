import React, { useEffect, useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Building, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { LostItem, FoundItem, MatchSuggestion } from '../types';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';

interface MatchSuggestionsModalProps {
  item: LostItem | FoundItem | null;
  type: 'lost' | 'found';
  isOpen: boolean;
  onClose: () => void;
  onConfirmMatch: (lostId: number, foundId: number, score: number) => void;
  onOpenClaim?: (foundItem: FoundItem) => void;
}

export const MatchSuggestionsModal: React.FC<MatchSuggestionsModalProps> = ({
  item,
  type,
  isOpen,
  onClose,
  onConfirmMatch,
  onOpenClaim,
}) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      loadMatches();
    }
  }, [isOpen, item]);

  const loadMatches = async () => {
    if (!item) return;
    setLoading(true);
    setError(null);
    try {
      if (type === 'lost') {
        const res = await api.getLostItemMatches(item.id);
        setMatches(res);
      } else {
        const res = await api.getFoundItemMatches(item.id);
        setMatches(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate matches');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white rounded-full p-1 hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Campus Match Radar</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Potential Matches for "{item.title}"
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing category, location proximity, keywords, and timeline across registered campus items.
          </p>
        </div>

        {/* Target Item Summary Strip */}
        <div className="mb-6 rounded-2xl bg-slate-950/60 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Selected {type === 'lost' ? 'Lost' : 'Found'} Item
            </span>
            <h4 className="text-sm font-semibold text-white">{item.title}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span>{item.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-indigo-400" />
                {item.campus_location}
              </span>
            </div>
          </div>
          <StatusBadge status={item.status} type={type} size="sm" />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center">
            <Sparkles className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">Scanning campus inventory...</p>
            <p className="text-xs text-slate-500 mt-1">Evaluating similarity scores and locations</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && matches.length === 0 && (
          <div className="py-10 text-center rounded-2xl bg-slate-800/20 border border-dashed border-slate-800 p-8">
            <HelpCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No high-confidence matches found yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Our background matcher continuously scans incoming campus reports. You'll be flagged as "possible match" when a corresponding item is submitted.
            </p>
          </div>
        )}

        {/* Matches List */}
        {!loading && matches.length > 0 && (
          <div className="space-y-4">
            {matches.map((m, idx) => {
              const matchedTarget = type === 'lost' ? m.found_item : m.lost_item;
              const score = m.match_score;

              return (
                <div 
                  key={idx}
                  className="rounded-2xl bg-slate-800/40 border border-slate-700/80 p-5 transition-all hover:border-purple-500/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Item info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                          {score}% Match Confidence
                        </span>
                        <StatusBadge status={matchedTarget.status} size="sm" />
                      </div>

                      <h4 className="text-base font-bold text-white">{matchedTarget.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {matchedTarget.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                          {matchedTarget.campus_location}
                        </span>
                        {matchedTarget.storage_location && (
                          <span className="flex items-center gap-1 text-emerald-300">
                            <Building className="h-3.5 w-3.5" />
                            Custody: {matchedTarget.storage_location}
                          </span>
                        )}
                      </div>

                      {/* Match Reasons Pill List */}
                      {m.reasons && m.reasons.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {m.reasons.map((reason: string, rIdx: number) => (
                            <span 
                              key={rIdx}
                              className="text-[11px] rounded-md bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 text-purple-200"
                            >
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const lostId = type === 'lost' ? item.id : matchedTarget.id;
                          const foundId = type === 'lost' ? matchedTarget.id : item.id;
                          onConfirmMatch(lostId, foundId, score);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-950/40 transition-all active:scale-95"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Confirm Match</span>
                      </button>

                      {type === 'lost' && onOpenClaim && (
                        <button
                          onClick={() => onOpenClaim(matchedTarget)}
                          className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                        >
                          <span>Claim Item</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
