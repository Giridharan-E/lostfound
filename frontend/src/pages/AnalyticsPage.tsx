import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  PackageCheck, 
  Clock, 
  AlertTriangle,
  ShieldCheck,
  Building
} from 'lucide-react';
import { CampusStats } from '../types';

interface AnalyticsPageProps {
  stats: CampusStats | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="py-12 text-center">
        <BarChart3 className="h-8 w-8 text-slate-500 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-400">Loading campus recovery analytics...</p>
      </div>
    );
  }

  const { summary, lost_breakdown, found_breakdown } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 border border-slate-700 mb-2">
          <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
          <span>Campus Recovery Metrics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Recovery Performance & Campus Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Detailed breakdown of item lifecycle velocity, recovery percentages, and inventory custody status.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Registered</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{summary.total_lost + summary.total_found}</span>
            <span className="text-xs text-slate-500">campus items</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{summary.total_lost} lost, {summary.total_found} found</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Recovery Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-400">{summary.recovery_rate_percent}%</span>
            <TrendingUp className="h-4 w-4 text-teal-400" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{summary.successfully_returned} items reunited</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">In Verification</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-400">{summary.pending_claims}</span>
            <span className="text-xs text-blue-400/80">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Claims submitted & pending</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Match Pairings</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-400">{summary.total_matches}</span>
            <span className="text-xs text-purple-400/80">Correlated</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cross-system AI detections</p>
        </div>
      </div>

      {/* Lifecycle Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lost Item Flow Breakdown */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-amber-400" />
              <span>Lost Items Lifecycle Stages</span>
            </h3>
            <span className="text-xs text-slate-400">Flow distribution</span>
          </div>

          <div className="space-y-3">
            {[
              { status: 'searching', count: lost_breakdown['searching'] || 0, color: 'bg-amber-500' },
              { status: 'possible match', count: lost_breakdown['possible match'] || 0, color: 'bg-purple-500' },
              { status: 'claimed', count: lost_breakdown['claimed'] || 0, color: 'bg-blue-500' },
              { status: 'returned', count: lost_breakdown['returned'] || 0, color: 'bg-teal-500' },
              { status: 'lost', count: lost_breakdown['lost'] || 0, color: 'bg-rose-500' },
            ].map((stage) => {
              const pct = summary.total_lost > 0 ? Math.round((stage.count / summary.total_lost) * 100) : 0;
              return (
                <div key={stage.status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300 capitalize">{stage.status}</span>
                    <span className="text-slate-400 font-mono">{stage.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${stage.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Found Item Flow Breakdown */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-emerald-400" />
              <span>Found Items Lifecycle Stages</span>
            </h3>
            <span className="text-xs text-slate-400">Custody distribution</span>
          </div>

          <div className="space-y-3">
            {[
              { status: 'available', count: found_breakdown['available'] || 0, color: 'bg-emerald-500' },
              { status: 'possible match', count: found_breakdown['possible match'] || 0, color: 'bg-purple-500' },
              { status: 'claimed', count: found_breakdown['claimed'] || 0, color: 'bg-blue-500' },
              { status: 'returned', count: found_breakdown['returned'] || 0, color: 'bg-teal-500' },
            ].map((stage) => {
              const pct = summary.total_found > 0 ? Math.round((stage.count / summary.total_found) * 100) : 0;
              return (
                <div key={stage.status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300 capitalize">{stage.status}</span>
                    <span className="text-slate-400 font-mono">{stage.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${stage.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
