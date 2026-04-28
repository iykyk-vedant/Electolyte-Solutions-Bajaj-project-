'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  getAdminDashboardDataAction,
  getAdminDcNumbersAction,
  getAdminPartCodeAnalyticsAction,
  getAdminDcNumberAnalyticsAction,
} from '@/app/actions/admin-actions';
import { exportTagEntriesToExcel } from '@/lib/tag-entry/export-utils';

interface EntryRow {
  userName: string;
  tagEntryCount: number;
  consumptionEntryCount: number;
}

interface PartCodeRow {
  part_code: string;
  tag_count: number;
  consumption_count: number;
}

interface DcNumberRow {
  dc_no: string;
  tag_count: number;
  consumption_count: number;
}

type AdminTab = 'users' | 'partcode' | 'dcnumber';

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Active tab
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  // Common date state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Users tab state
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [totalTag, setTotalTag] = useState(0);
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Part Code tab state
  const [partCodeRows, setPartCodeRows] = useState<PartCodeRow[]>([]);
  const [partCodeTotalTag, setPartCodeTotalTag] = useState(0);
  const [partCodeTotalConsumption, setPartCodeTotalConsumption] = useState(0);
  const [isPartCodeLoading, setIsPartCodeLoading] = useState(false);

  // DC Number tab state
  const [dcNumberRows, setDcNumberRows] = useState<DcNumberRow[]>([]);
  const [dcNumberTotalTag, setDcNumberTotalTag] = useState(0);
  const [dcNumberTotalConsumption, setDcNumberTotalConsumption] = useState(0);
  const [isDcNumberLoading, setIsDcNumberLoading] = useState(false);

  // Export
  const [dcNumbers, setDcNumbers] = useState<string[]>([]);
  const [selectedDcForExport, setSelectedDcForExport] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'ADMIN') {
        router.push('/');
      }
    }
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load data when date or tab changes
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      if (activeTab === 'users') {
        loadDashboardData();
      } else if (activeTab === 'partcode') {
        loadPartCodeData();
      } else if (activeTab === 'dcnumber') {
        loadDcNumberData();
      }
    }
  }, [user, selectedDate, activeTab]);

  // Load DC numbers for export
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadDcNumbers();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const result = await getAdminDashboardDataAction(selectedDate);
      if (result.success && result.data) {
        setEntries(result.data.entries);
        setTotalTag(result.data.totalTagEntries);
        setTotalConsumption(result.data.totalConsumptionEntries);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPartCodeData = async () => {
    setIsPartCodeLoading(true);
    try {
      const result = await getAdminPartCodeAnalyticsAction(selectedDate);
      if (result.success && result.data) {
        setPartCodeRows(result.data.rows);
        setPartCodeTotalTag(result.data.totalTag);
        setPartCodeTotalConsumption(result.data.totalConsumption);
      }
    } catch (error) {
      console.error('Error loading part code data:', error);
    } finally {
      setIsPartCodeLoading(false);
    }
  };

  const loadDcNumberData = async () => {
    setIsDcNumberLoading(true);
    try {
      const result = await getAdminDcNumberAnalyticsAction(selectedDate);
      if (result.success && result.data) {
        setDcNumberRows(result.data.rows);
        setDcNumberTotalTag(result.data.totalTag);
        setDcNumberTotalConsumption(result.data.totalConsumption);
      }
    } catch (error) {
      console.error('Error loading DC number data:', error);
    } finally {
      setIsDcNumberLoading(false);
    }
  };

  const loadDcNumbers = async () => {
    try {
      const result = await getAdminDcNumbersAction();
      if (result.success) {
        setDcNumbers(result.dcNumbers || []);
      }
    } catch (error) {
      console.error('Error loading DC numbers:', error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTagEntriesToExcel(selectedDcForExport || undefined);
    } catch (error) {
      console.error('Export failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to export Excel file');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-purple-200 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-xl">
          <p className="text-red-300 text-lg">Access denied. Admin access required.</p>
        </div>
      </div>
    );
  }

  // Tab config
  const tabs: { id: AdminTab; label: string; icon: JSX.Element }[] = [
    {
      id: 'users',
      label: 'Users',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'partcode',
      label: 'Part Code',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      id: 'dcnumber',
      label: 'DC Number',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  // Helper to get current tab's loading/data state
  const currentIsLoading = activeTab === 'users' ? isLoading : activeTab === 'partcode' ? isPartCodeLoading : isDcNumberLoading;
  const currentTotalTag = activeTab === 'users' ? totalTag : activeTab === 'partcode' ? partCodeTotalTag : dcNumberTotalTag;
  const currentTotalConsumption = activeTab === 'users' ? totalConsumption : activeTab === 'partcode' ? partCodeTotalConsumption : dcNumberTotalConsumption;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-purple-300">NexScan Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                  {(user.name || user.email || 'A')[0].toUpperCase()}
                </div>
                <span className="text-sm text-purple-200">{user.name || user.email}</span>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'text-purple-300/70 hover:text-purple-200 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export Section */}
          <div className="flex items-center gap-3">
            <select
              value={selectedDcForExport}
              onChange={(e) => setSelectedDcForExport(e.target.value)}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 text-sm text-purple-200 outline-none [color-scheme:dark] hover:bg-white/10 transition-colors"
            >
              <option value="">All DC Numbers</option>
              {dcNumbers
                .filter((dc) => dc != null && dc !== '')
                .map((dc, index) => (
                  <option key={`export-${dc}-${index}`} value={dc}>
                    {dc}
                  </option>
                ))}
            </select>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium text-sm hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>

        {/* Date Picker & Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedDate === 'overall') {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    return;
                  }
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-sm font-medium px-3 py-2 border-none outline-none [color-scheme:dark]"
              />
              <button
                onClick={() => {
                  if (selectedDate === 'overall') {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    return;
                  }
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate('overall')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedDate === 'overall'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/5 text-purple-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              Overall
            </button>
          </div>

          {/* Date Display */}
          <div className="text-right">
            <p className="text-purple-300/60 text-xs uppercase tracking-wider font-medium">Showing entries for</p>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {selectedDate === 'overall' ? 'All Time' : formatDate(selectedDate)}
            </h2>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tag Entries Card */}
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:bg-white/[0.07] transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-blue-300/70 uppercase tracking-wider">Tag Entries</p>
              </div>
              <p className="text-4xl font-bold text-white">{currentTotalTag}</p>
            </div>
          </div>

          {/* Consumption Entries Card */}
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:bg-white/[0.07] transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-colors" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-amber-300/70 uppercase tracking-wider">Consumption</p>
              </div>
              <p className="text-4xl font-bold text-white">{currentTotalConsumption}</p>
            </div>
          </div>

          {/* Total Entries Card */}
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:bg-white/[0.07] transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-colors" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-purple-300/70 uppercase tracking-wider">Total Entries</p>
              </div>
              <p className="text-4xl font-bold text-white">{currentTotalTag + currentTotalConsumption}</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">
              {activeTab === 'users' && 'User-wise Entry Summary'}
              {activeTab === 'partcode' && 'Part Code-wise Entry Summary'}
              {activeTab === 'dcnumber' && 'DC Number-wise Entry Summary'}
            </h3>
            <p className="text-sm text-purple-300/50 mt-1">
              {activeTab === 'users' && 'Breakdown of entries per user'}
              {activeTab === 'partcode' && 'Breakdown of entries per part code'}
              {activeTab === 'dcnumber' && 'Breakdown of entries per DC number'}
              {selectedDate === 'overall' ? ' (all time)' : ' for the selected date'}
            </p>
          </div>

          {currentIsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-purple-300/60 text-sm">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ======== USERS TAB ======== */}
              {activeTab === 'users' && (
                entries.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300/70 uppercase tracking-wider">#</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300/70 uppercase tracking-wider">User Name</th>
                          <th className="text-center px-6 py-4 text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Tag Entries</th>
                          <th className="text-center px-6 py-4 text-xs font-semibold text-amber-300/70 uppercase tracking-wider">Consumption Entries</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry, index) => (
                          <tr key={entry.userName} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                            <td className="px-6 py-4 text-sm text-purple-300/50 font-mono">{index + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center text-white text-xs font-bold">
                                  {entry.userName[0]?.toUpperCase() || '?'}
                                </div>
                                <span className="text-sm font-medium text-white">{entry.userName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <CountBadge count={entry.tagEntryCount} color="blue" />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <CountBadge count={entry.consumptionEntryCount} color="amber" />
                            </td>
                          </tr>
                        ))}
                        <TotalRow tagTotal={totalTag} consumptionTotal={totalConsumption} />
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* ======== PART CODE TAB ======== */}
              {activeTab === 'partcode' && (
                partCodeRows.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300/70 uppercase tracking-wider">#</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300/70 uppercase tracking-wider">Part Code</th>
                          <th className="text-center px-6 py-4 text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Tag Entries</th>
                          <th className="text-center px-6 py-4 text-xs font-semibold text-amber-300/70 uppercase tracking-wider">Consumption Entries</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partCodeRows.map((row, index) => (
                          <tr key={row.part_code} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                            <td className="px-6 py-4 text-sm text-purple-300/50 font-mono">{index + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium text-white font-mono">{row.part_code}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <CountBadge count={row.tag_count} color="blue" />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <CountBadge count={row.consumption_count} color="amber" />
                            </td>
                          </tr>
                        ))}
                        <TotalRow tagTotal={partCodeTotalTag} consumptionTotal={partCodeTotalConsumption} />
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* ======== DC NUMBER TAB ======== */}
              {activeTab === 'dcnumber' && (
                dcNumberRows.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300/70 uppercase tracking-wider">#</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300/70 uppercase tracking-wider">DC Number</th>
                          <th className="text-center px-6 py-4 text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Tag Entries</th>
                          <th className="text-center px-6 py-4 text-xs font-semibold text-amber-300/70 uppercase tracking-wider">Consumption Entries</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dcNumberRows.map((row, index) => (
                          <tr key={row.dc_no} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                            <td className="px-6 py-4 text-sm text-purple-300/50 font-mono">{index + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium text-white font-mono">{row.dc_no}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <CountBadge count={row.tag_count} color="blue" />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <CountBadge count={row.consumption_count} color="amber" />
                            </td>
                          </tr>
                        ))}
                        <TotalRow tagTotal={dcNumberTotalTag} consumptionTotal={dcNumberTotalConsumption} />
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Reusable Sub-Components ─────────────────────────────────────

function CountBadge({ count, color }: { count: number; color: 'blue' | 'amber' }) {
  const colorClasses = count > 0
    ? color === 'blue'
      ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
    : 'bg-white/5 text-purple-300/30 border border-white/5';

  return (
    <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1 rounded-lg text-sm font-semibold ${colorClasses}`}>
      {count}
    </span>
  );
}

function TotalRow({ tagTotal, consumptionTotal }: { tagTotal: number; consumptionTotal: number }) {
  return (
    <tr className="bg-white/[0.03] border-t-2 border-purple-500/30">
      <td className="px-6 py-4" />
      <td className="px-6 py-4">
        <span className="text-sm font-bold text-white uppercase tracking-wide">Total</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-500/20 text-blue-200 border border-blue-500/30">
          {tagTotal}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30">
          {consumptionTotal}
        </span>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-purple-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-purple-300/50 text-sm font-medium">No entries found for this date</p>
      <p className="text-purple-400/30 text-xs mt-1">Try selecting a different date</p>
    </div>
  );
}