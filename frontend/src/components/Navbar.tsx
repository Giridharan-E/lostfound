import React from 'react';
import { 
  Compass, 
  Search, 
  PackagePlus, 
  Sparkles, 
  FileCheck2, 
  BarChart3, 
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import { CampusStats } from '../types';

interface NavbarProps {
  activeTab: 'lost' | 'found' | 'matches' | 'claims' | 'stats';
  setActiveTab: (tab: 'lost' | 'found' | 'matches' | 'claims' | 'stats') => void;
  onOpenReportLost: () => void;
  onOpenReportFound: () => void;
  stats?: CampusStats | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportLost,
  onOpenReportFound,
  stats
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('lost')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-md shadow-indigo-500/20">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">CampusTrace</span>
                <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                  L&F HUB
                </span>
              </div>
              <p className="text-xs text-slate-400">Campus Lost & Found Platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800/80">
            <button
              onClick={() => setActiveTab('lost')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'lost'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Lost Items</span>
              {stats?.summary?.actively_searching ? (
                <span className="ml-1 rounded-full bg-indigo-950 px-1.5 py-0.2 text-[10px] font-bold text-indigo-200">
                  {stats.summary.actively_searching}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('found')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PackagePlus className="h-3.5 w-3.5" />
              <span>Found Items</span>
              {stats?.summary?.available_at_desks ? (
                <span className="ml-1 rounded-full bg-emerald-950 px-1.5 py-0.2 text-[10px] font-bold text-emerald-200">
                  {stats.summary.available_at_desks}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'matches'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Match Radar</span>
              {stats?.summary?.total_matches ? (
                <span className="ml-1 rounded-full bg-purple-950 px-1.5 py-0.2 text-[10px] font-bold text-purple-200">
                  {stats.summary.total_matches}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('claims')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'claims'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Claims</span>
              {stats?.summary?.pending_claims ? (
                <span className="ml-1 rounded-full bg-blue-950 px-1.5 py-0.2 text-[10px] font-bold text-blue-200">
                  {stats.summary.pending_claims}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'stats'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenReportLost}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-all hover:bg-amber-500/20 active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Report Lost</span>
            </button>

            <button
              onClick={onOpenReportFound}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/30 transition-all hover:bg-emerald-500 active:scale-95"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Report Found</span>
            </button>
          </div>

        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('lost')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-md ${activeTab === 'lost' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            Lost
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-md ${activeTab === 'found' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
          >
            Found
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-md ${activeTab === 'matches' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
          >
            Match Radar
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-md ${activeTab === 'claims' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Claims
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-md ${activeTab === 'stats' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          >
            Stats
          </button>
        </div>

      </div>
    </header>
  );
};
