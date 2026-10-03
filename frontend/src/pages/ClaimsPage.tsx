import React, { useEffect, useState } from 'react';
import { FileCheck2, CheckCircle2, XCircle, RefreshCw, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { ItemClaim } from '../types';
import { api } from '../services/api';

export const ClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<ItemClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getClaims();
      setClaims(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleReview = async (claimId: number, approved: boolean) => {
    const notes = prompt(
      approved 
        ? 'Approval notes (e.g. Student ID verified, handover confirmed):' 
        : 'Reason for rejection (e.g. Description did not match serial number):'
    );
    if (notes === null) return; // user cancelled

    setActionLoading(claimId);
    try {
      await api.reviewClaim(claimId, approved, notes || undefined);
      await fetchClaims();
    } catch (err: any) {
      alert(`Error reviewing claim: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/20 mb-2">
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Verification & Claims Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ownership Claims & Custody Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review proof of ownership submitted by campus students and approve releases to change status to "returned".
          </p>
        </div>

        <button
          onClick={fetchClaims}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Claims</span>
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
            <div key={i} className="h-36 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <FileCheck2 className="h-8 w-8 text-slate-500 mx-auto mb-2 opacity-60" />
          <h3 className="text-base font-bold text-white">No ownership claims submitted yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When users click "Claim" on an available found item, their verification details appear in this review queue.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div 
              key={claim.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-xs font-bold text-slate-400">Claim #{claim.id}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      claim.status === 'approved'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : claim.status === 'rejected'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {claim.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      Target Found Item ID: #{claim.found_item_id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    Claimant: {claim.claimant_name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Email: {claim.claimant_email}</span>
                    {claim.student_id && <span>• Student ID: {claim.student_id}</span>}
                    {claim.claimant_phone && <span>• Phone: {claim.claimant_phone}</span>}
                  </div>

                  {/* Proof of ownership text */}
                  <div className="mt-3 rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Submitted Verifiable Proof
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {claim.proof_description}
                    </p>
                  </div>

                  {/* Review Notes if any */}
                  {claim.review_notes && (
                    <div className="mt-2 text-xs text-slate-400 italic">
                      Staff Note: {claim.review_notes}
                    </div>
                  )}
                </div>

                {/* Review Action Buttons */}
                {claim.status === 'pending' && (
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <button
                      disabled={actionLoading === claim.id}
                      onClick={() => handleReview(claim.id, true)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-950/40 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve & Release</span>
                    </button>

                    <button
                      disabled={actionLoading === claim.id}
                      onClick={() => handleReview(claim.id, false)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/70 hover:text-rose-300 px-3.5 py-2 text-xs font-medium text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject Claim</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
