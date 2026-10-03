import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle, XCircle, ArrowRight, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { ItemMatchRecord } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

interface MatchesPageProps {
  onSelectLost?: (id: number) => void;
  onSelectFound?: (id: number) => void;
}

export const MatchesPage: React.FC<MatchesPageProps> = () => {
  const [matches, setMatches] = useState<ItemMatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMatches();
      setMatches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load match radar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleStatusUpdate = async (id: number, status: 'confirmed' | 'rejected') => {
    try {
      await api.updateMatchStatus(id, status);
      await fetchMatches();
    } catch (err: any) {
      alert(`Error updating match status: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Automated AI Correlation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Match Radar & Pairings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-factor similarity matching pairing reported lost items with found inventory.
          </p>
        </div>

        <button
          onClick={fetchMatches}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Radar</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-2 opacity-60" />
          <h3 className="text-base font-bold text-white">No active matches paired yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When lost items and found items share key attributes, categories, and campus locations, pairings appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => {
            const lost = m.lost_item;
            const found = m.found_item;

            return (
              <div 
                key={m.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/30 transition-all"
              >
                {/* Match Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      {m.match_score}% Confidence
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                      m.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : m.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  {m.status === 'suggested' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusUpdate(m.id, 'confirmed')}
                        className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Confirm Match</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(m.id, 'rejected')}
                        className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Side-by-side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Lost Item Side */}
                  <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Lost Item Report
                      </span>
                      {lost && <StatusBadge status={lost.status} type="lost" size="sm" />}
                    </div>
                    {lost ? (
                      <div>
                        <h4 className="text-sm font-bold text-white">{lost.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{lost.description}</p>
                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-indigo-400" />
                          <span>{lost.campus_location}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Owner: {lost.reporter_name} ({lost.reporter_email})
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Lost item record #{m.lost_item_id}</span>
                    )}
                  </div>

                  {/* Found Item Side */}
                  <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Found Item Registry
                      </span>
                      {found && <StatusBadge status={found.status} type="found" size="sm" />}
                    </div>
                    {found ? (
                      <div>
                        <h4 className="text-sm font-bold text-white">{found.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{found.description}</p>
                        <div className="mt-2 text-xs text-emerald-300/90 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>Custody: {found.storage_location || found.campus_location}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Finder: {found.finder_name} ({found.finder_email})
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Found item record #{m.found_item_id}</span>
                    )}
                  </div>

                </div>

                {/* Match explanation footer */}
                {m.match_reason && (
                  <div className="mt-3 rounded-lg bg-purple-950/20 border border-purple-800/30 p-2.5 text-xs text-purple-200">
                    <span className="font-semibold text-purple-300">Match Evidence: </span>
                    {m.match_reason}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
