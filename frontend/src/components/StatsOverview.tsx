import React from 'react';
import { Search, PackageCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { CampusStats } from '../types';

interface StatsOverviewProps {
  stats: CampusStats | null;
  onFilterStatus?: (status: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, onFilterStatus }) => {
  if (!stats) return null;

  const { summary } = stats;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* 1. Actively Searching */}
      <div 
        onClick={() => onFilterStatus?.('searching')}
        className="glass-card rounded-2xl p-4 transition-all hover:border-amber-500/40 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-300">Searching</span>
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Search className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{summary.actively_searching}</span>
          <span className="text-xs text-amber-400/80 font-medium">Lost active</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Pending recovery across campus</p>
      </div>

      {/* 2. Available at Desks */}
      <div 
        onClick={() => onFilterStatus?.('available')}
        className="glass-card rounded-2xl p-4 transition-all hover:border-emerald-500/40 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-300">Found & Stored</span>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <PackageCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{summary.available_at_desks}</span>
          <span className="text-xs text-emerald-400/80 font-medium">Available</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Held securely at campus desks</p>
      </div>

      {/* 3. In Process (Matches & Claims) */}
      <div 
        onClick={() => onFilterStatus?.('possible match')}
        className="glass-card rounded-2xl p-4 transition-all hover:border-purple-500/40 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 group-hover:text-purple-300">Matches & Claims</span>
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">
            {summary.pending_claims + (summary.total_matches || 0)}
          </span>
          <span className="text-xs text-purple-400/80 font-medium">In Process</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Verification and claim reviews</p>
      </div>

      {/* 4. Recovered & Reunited */}
      <div 
        onClick={() => onFilterStatus?.('returned')}
        className="glass-card rounded-2xl p-4 transition-all hover:border-teal-500/40 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 group-hover:text-teal-300">Reunited</span>
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{summary.successfully_returned}</span>
          <span className="text-xs text-teal-400 font-semibold">{summary.recovery_rate_percent}% recovery</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Items returned to rightful owners</p>
      </div>
    </div>
  );
};
