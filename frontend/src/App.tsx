import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { LostItemsPage } from './pages/LostItemsPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { MatchesPage } from './pages/MatchesPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

import { ReportLostModal } from './components/ReportLostModal';
import { ReportFoundModal } from './components/ReportFoundModal';
import { ClaimModal } from './components/ClaimModal';
import { MatchSuggestionsModal } from './components/MatchSuggestionsModal';
import { ItemDetailModal } from './components/ItemDetailModal';

import { api } from './services/api';
import { LostItem, FoundItem, CampusStats, LostItemStatus, FoundItemStatus } from './types';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'matches' | 'claims' | 'stats'>('lost');
  
  // Data
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [stats, setStats] = useState<CampusStats | null>(null);
  const [loadingLost, setLoadingLost] = useState(false);
  const [loadingFound, setLoadingFound] = useState(false);

  // Modals
  const [isReportLostOpen, setIsReportLostOpen] = useState(false);
  const [isReportFoundOpen, setIsReportFoundOpen] = useState(false);
  
  const [claimTarget, setClaimTarget] = useState<FoundItem | null>(null);
  const [isClaimOpen, setIsClaimOpen] = useState(false);

  const [matchTarget, setMatchTarget] = useState<{ item: LostItem | FoundItem; type: 'lost' | 'found' } | null>(null);
  const [isMatchOpen, setIsMatchOpen] = useState(false);

  const [detailTarget, setDetailTarget] = useState<{ item: LostItem | FoundItem; type: 'lost' | 'found' } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Data fetchers
  const loadLostItems = async () => {
    setLoadingLost(true);
    try {
      const data = await api.getLostItems();
      setLostItems(data);
    } catch (err) {
      console.error('Error fetching lost items:', err);
    } finally {
      setLoadingLost(false);
    }
  };

  const loadFoundItems = async () => {
    setLoadingFound(true);
    try {
      const data = await api.getFoundItems();
      setFoundItems(data);
    } catch (err) {
      console.error('Error fetching found items:', err);
    } finally {
      setLoadingFound(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    loadLostItems();
    loadFoundItems();
    loadStats();
  }, []);

  // Handlers
  const handleItemStatusChange = async (id: number, newStatus: string) => {
    try {
      if (detailTarget?.type === 'lost') {
        const updated = await api.updateLostItemStatus(id, newStatus as LostItemStatus);
        setLostItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
        setDetailTarget({ item: updated, type: 'lost' });
        showToast(`Lost item updated to status: "${newStatus}"`);
      } else {
        const updated = await api.updateFoundItemStatus(id, newStatus as FoundItemStatus);
        setFoundItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
        setDetailTarget({ item: updated, type: 'found' });
        showToast(`Found item updated to status: "${newStatus}"`);
      }
      loadStats();
    } catch (err: any) {
      alert(`Status transition error: ${err.message}`);
    }
  };

  const handleItemDelete = async (id: number) => {
    try {
      if (detailTarget?.type === 'lost') {
        await api.deleteLostItem(id);
        setLostItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        await api.deleteFoundItem(id);
        setFoundItems((prev) => prev.filter((item) => item.id !== id));
      }
      showToast('Item listing deleted successfully');
      loadStats();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleConfirmMatch = async (lostId: number, foundId: number, score: number) => {
    try {
      await api.createMatch({
        lost_item_id: lostId,
        found_item_id: foundId,
        match_score: score,
        match_reason: 'Manually verified and confirmed by campus portal user',
      });
      setIsMatchOpen(false);
      showToast('Match confirmed! Items moved to "possible match" / "claimed" status');
      loadLostItems();
      loadFoundItems();
      loadStats();
    } catch (err: any) {
      alert(`Error confirming match: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportLost={() => setIsReportLostOpen(true)}
        onOpenReportFound={() => setIsReportFoundOpen(true)}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Metric Cards Overview (Always visible on lost and found tabs) */}
        {(activeTab === 'lost' || activeTab === 'found') && (
          <StatsOverview stats={stats} />
        )}

        {/* Tab 1: Lost Items */}
        {activeTab === 'lost' && (
          <LostItemsPage
            items={lostItems}
            loading={loadingLost}
            onRefresh={() => { loadLostItems(); loadStats(); }}
            onOpenReport={() => setIsReportLostOpen(true)}
            onSelect={(item) => {
              setDetailTarget({ item, type: 'lost' });
              setIsDetailOpen(true);
            }}
            onOpenMatches={(item) => {
              setMatchTarget({ item, type: 'lost' });
              setIsMatchOpen(true);
            }}
          />
        )}

        {/* Tab 2: Found Items */}
        {activeTab === 'found' && (
          <FoundItemsPage
            items={foundItems}
            loading={loadingFound}
            onRefresh={() => { loadFoundItems(); loadStats(); }}
            onOpenReport={() => setIsReportFoundOpen(true)}
            onSelect={(item) => {
              setDetailTarget({ item, type: 'found' });
              setIsDetailOpen(true);
            }}
            onOpenMatches={(item) => {
              setMatchTarget({ item, type: 'found' });
              setIsMatchOpen(true);
            }}
            onClaim={(item) => {
              setClaimTarget(item);
              setIsClaimOpen(true);
            }}
          />
        )}

        {/* Tab 3: Match Radar */}
        {activeTab === 'matches' && <MatchesPage />}

        {/* Tab 4: Claims Verification Queue */}
        {activeTab === 'claims' && <ClaimsPage />}

        {/* Tab 5: Analytics */}
        {activeTab === 'stats' && <AnalyticsPage stats={stats} />}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">CampusTrace</span>
            <span>• Full-Stack Campus Lost & Found Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>FastAPI + PostgreSQL</span>
            <span>•</span>
            <span>React + TypeScript + Tailwind</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-xl shadow-indigo-950/50 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal: Report Lost Item */}
      <ReportLostModal
        isOpen={isReportLostOpen}
        onClose={() => setIsReportLostOpen(false)}
        onSuccess={(newItem) => {
          setLostItems((prev) => [newItem, ...prev]);
          showToast(`Reported lost: "${newItem.title}". Auto-matching triggered!`);
          loadStats();
        }}
      />

      {/* Modal: Report Found Item */}
      <ReportFoundModal
        isOpen={isReportFoundOpen}
        onClose={() => setIsReportFoundOpen(false)}
        onSuccess={(newItem) => {
          setFoundItems((prev) => [newItem, ...prev]);
          showToast(`Reported found: "${newItem.title}". Stored in campus inventory!`);
          loadStats();
        }}
      />

      {/* Modal: Claim Item */}
      <ClaimModal
        isOpen={isClaimOpen}
        item={claimTarget}
        onClose={() => setIsClaimOpen(false)}
        onSuccess={() => {
          showToast('Ownership claim submitted! Item placed in claimed status.');
          loadFoundItems();
          loadLostItems();
          loadStats();
        }}
      />

      {/* Modal: Match Radar Suggestions */}
      <MatchSuggestionsModal
        isOpen={isMatchOpen}
        item={matchTarget?.item || null}
        type={matchTarget?.type || 'lost'}
        onClose={() => setIsMatchOpen(false)}
        onConfirmMatch={handleConfirmMatch}
        onOpenClaim={(foundItem) => {
          setIsMatchOpen(false);
          setClaimTarget(foundItem);
          setIsClaimOpen(true);
        }}
      />

      {/* Modal: Item Details & Lifecycle Transition */}
      <ItemDetailModal
        isOpen={isDetailOpen}
        item={detailTarget?.item || null}
        type={detailTarget?.type || 'lost'}
        onClose={() => setIsDetailOpen(false)}
        onStatusChange={handleItemStatusChange}
        onDelete={handleItemDelete}
        onOpenMatches={(item) => {
          setIsDetailOpen(false);
          setMatchTarget({ item, type: detailTarget!.type });
          setIsMatchOpen(true);
        }}
        onOpenClaim={(foundItem) => {
          setIsDetailOpen(false);
          setClaimTarget(foundItem);
          setIsClaimOpen(true);
        }}
      />

    </div>
  );
}

export default App;
