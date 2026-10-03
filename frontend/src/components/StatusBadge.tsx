import React from 'react';
import { LostItemStatus, FoundItemStatus } from '../types';

interface StatusBadgeProps {
  status: LostItemStatus | FoundItemStatus | string;
  type?: 'lost' | 'found';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'lost', size = 'md' }) => {
  const s = status.toLowerCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  // Specific styling depending on status
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotStyle = 'bg-slate-400';

  if (s === 'searching') {
    badgeStyle = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    dotStyle = 'bg-amber-400 animate-pulse';
  } else if (s === 'available') {
    badgeStyle = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    dotStyle = 'bg-emerald-400 animate-pulse';
  } else if (s === 'possible match') {
    badgeStyle = 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20';
    dotStyle = 'bg-purple-400 animate-ping';
  } else if (s === 'claimed') {
    badgeStyle = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    dotStyle = 'bg-blue-400';
  } else if (s === 'returned') {
    badgeStyle = 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    dotStyle = 'bg-teal-400';
  } else if (s === 'lost') {
    badgeStyle = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    dotStyle = 'bg-rose-400';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider backdrop-blur-sm ${badgeStyle} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyle}`} />
      <span>{status}</span>
    </span>
  );
};
