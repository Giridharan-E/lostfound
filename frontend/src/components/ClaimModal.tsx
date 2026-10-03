import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FoundItem, ItemClaim } from '../types';
import { api } from '../services/api';

interface ClaimModalProps {
  item: FoundItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (claim: ItemClaim) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ item, isOpen, onClose, onSuccess }) => {
  const [claimantName, setClaimantName] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [proofDescription, setProofDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const claim = await api.submitClaim({
        found_item_id: item.id,
        claimant_name: claimantName,
        claimant_email: claimantEmail,
        claimant_phone: claimantPhone || undefined,
        student_id: studentId || undefined,
        proof_description: proofDescription,
      });

      onSuccess(claim);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit ownership claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white rounded-full p-1 hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verification Claim</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Claim Item Ownership</h2>
          <p className="text-xs text-slate-400 mt-1">
            Claiming: <span className="text-indigo-300 font-semibold">{item.title}</span> (Held at {item.storage_location || 'Campus Desk'})
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Lin"
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Email *</label>
              <input
                type="email"
                required
                placeholder="id@campus.edu"
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Student / Staff ID</label>
              <input
                type="text"
                placeholder="STUXXXXX"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              placeholder="555-0199"
              value={claimantPhone}
              onChange={(e) => setClaimantPhone(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Verifiable Proof of Ownership *
            </label>
            <p className="text-[11px] text-slate-400 mb-1.5">
              Describe identifying marks not visible in the public listing (e.g., serial number, scratches, passcode unlock capability, receipt, or unique stickers).
            </p>
            <textarea
              required
              rows={4}
              placeholder="Provide exact identifying details to prove this is yours..."
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-950/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Claim...' : 'Submit Claim'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
