import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle, Sparkles, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { LostItem } from '../types';

interface ReportLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem: LostItem) => void;
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

const CAMPUS_LOCATIONS = [
  'Main Library - 1st Floor Cafe',
  'Main Library - 2nd/3rd Floor Quiet Study',
  'Student Center - Ground Floor Commons',
  'Engineering Hall - Labs & Classrooms',
  'Science Complex & Lecture Halls',
  'Campus Recreation & Wellness Gym',
  'Student Union Dining Hall',
  'North/South Campus Parking Garage',
  'Campus Shuttle Bus (Route A/B)',
  'Other Campus Location',
];

export const ReportLostModal: React.FC<ReportLostModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [campusLocation, setCampusLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [description, setDescription] = useState('');
  const [secretDetails, setSecretDetails] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [dateLost, setDateLost] = useState(new Date().toISOString().slice(0, 16));
  
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

      const finalLocation = campusLocation === 'Other Campus Location' && customLocation 
        ? customLocation 
        : campusLocation;

      const created = await api.createLostItem({
        title,
        category,
        campus_location: finalLocation,
        description,
        secret_details: secretDetails,
        reporter_name: reporterName,
        reporter_email: reporterEmail,
        reporter_phone: reporterPhone || null,
        student_id: studentId || null,
        date_lost: new Date(dateLost).toISOString(),
        image_url: uploadedImageUrl,
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
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
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Campus Lost Item Report</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Report a Lost Item</h2>
          <p className="text-sm text-slate-400 mt-1">
            Provide details to activate automated matching against all campus found registries.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Item Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Item Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Space Gray MacBook Air"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campus Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Location Lost *</label>
            <select
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            {campusLocation === 'Other Campus Location' && (
              <input
                type="text"
                placeholder="Specific room, building floor, or landmark..."
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Public Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Color, brand, identifying stickers, case style, when you last had it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Secret Details (Verification Anchor) */}
          <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/20 p-4">
            <label className="block text-xs font-semibold text-indigo-300 mb-1">
              Private Verification Details (Staff Verification Only)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Hidden from public search. Used by campus security desks to verify ownership upon handover (e.g. lockscreen wallpaper, serial number snippet, engraving).
            </p>
            <input
              type="text"
              placeholder="e.g. Photo wallpaper of dog, initials scratched on back..."
              value={secretDetails}
              onChange={(e) => setSecretDetails(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-indigo-500/30 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date Lost & Photo Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date & Time Lost *</label>
              <input
                type="datetime-local"
                required
                value={dateLost}
                onChange={(e) => setDateLost(e.target.value)}
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Item Photo (Optional)</label>
              <label className="flex items-center justify-center gap-2 w-full h-[42px] rounded-xl border border-dashed border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-xs font-medium text-slate-300 cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-slate-400" />
                <span className="truncate">{selectedFile ? selectedFile.name : 'Upload image file'}</span>
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

          {/* Contact Details */}
          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-3">Owner Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  placeholder="Campus Email (@campus.edu) *"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Student ID / Staff ID (Optional)"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-950/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering & Scanning...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Publish Lost Item</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
