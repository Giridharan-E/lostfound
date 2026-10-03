import React, { useState } from 'react';
import { X, Upload, AlertCircle, ShieldCheck, MapPin, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { FoundItem } from '../types';

interface ReportFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem: FoundItem) => void;
}

const CATEGORIES = [
  'Electronics',
  'IDs & Cards',
  'Keys',
  'Wallets & Bags',
  'Books & Supplies',
  'Apparel & Accessories',
  'Other',
];

const STORAGE_DESKS = [
  'Campus Lost & Found Central Office (Student Union 105)',
  'Main Library Information Desk',
  'Engineering Dean\'s Office Front Desk',
  'Campus Safety & Police Headquarters',
  'Recreation & Wellness Center Welcome Desk',
  'Dining Hall Staff Station',
  'Currently with Finder (Direct Handover upon Claim)',
];

export const ReportFoundModal: React.FC<ReportFoundModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [campusLocation, setCampusLocation] = useState('');
  const [storageLocation, setStorageLocation] = useState(STORAGE_DESKS[0]);
  const [customStorage, setCustomStorage] = useState('');
  const [description, setDescription] = useState('');
  const [finderName, setFinderName] = useState('');
  const [finderEmail, setFinderEmail] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().slice(0, 16));

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let uploadedImageUrl: string | null = null;
      if (selectedFile) {
        const uploadRes = await api.uploadImage(selectedFile);
        uploadedImageUrl = uploadRes.url;
      }

      const finalStorage = storageLocation === 'Other' && customStorage
        ? customStorage
        : storageLocation;

      const created = await api.createFoundItem({
        title,
        category,
        campus_location: campusLocation,
        storage_location: finalStorage,
        description,
        finder_name: finderName,
        finder_email: finderEmail,
        finder_phone: finderPhone || null,
        date_found: new Date(dateFound).toISOString(),
        image_url: uploadedImageUrl,
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit found item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white rounded-full p-1 hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Turn In / Register Found Property</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Report a Found Item</h2>
          <p className="text-sm text-slate-400 mt-1">
            Log an item you discovered on campus so the owner can be identified and notified.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Item Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Black AirPods Pro Case"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Where was it found */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Where on Campus was it Found? *</label>
            <input
              type="text"
              required
              placeholder="e.g. Science Complex Hallway 102, under bench row 3"
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Storage / Custody Location */}
          <div className="rounded-2xl bg-slate-800/40 border border-slate-700/80 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 className="h-4 w-4 text-emerald-400" />
              <label className="text-xs font-semibold text-emerald-300">
                Safe Custody Location (Where can owner inspect/retrieve it?) *
              </label>
            </div>
            <select
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
            >
              {STORAGE_DESKS.map((desk) => (
                <option key={desk} value={desk}>{desk}</option>
              ))}
              <option value="Other">Other Specific Office / Room</option>
            </select>

            {storageLocation === 'Other' && (
              <input
                type="text"
                placeholder="Specify building and office number..."
                value={customStorage}
                onChange={(e) => setCustomStorage(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Visual Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Visual state, color, physical condition, distinctive labels or casing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date Found & Photo Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date & Time Found *</label>
              <input
                type="datetime-local"
                required
                value={dateFound}
                onChange={(e) => setDateFound(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Item Photo</label>
              <label className="flex items-center justify-center gap-2 w-full h-[42px] rounded-xl border border-dashed border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-xs font-medium text-slate-300 cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-slate-400" />
                <span className="truncate">{selectedFile ? selectedFile.name : 'Upload photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {previewUrl && (
            <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-slate-700">
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Finder Details */}
          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-3">Finder / Submitter Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Your Name *"
                  value={finderName}
                  onChange={(e) => setFinderName(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  placeholder="Campus Email *"
                  value={finderEmail}
                  onChange={(e) => setFinderEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={finderPhone}
                  onChange={(e) => setFinderPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering Found Item...</span>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Submit Found Item</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
