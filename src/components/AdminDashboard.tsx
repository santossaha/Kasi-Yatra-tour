import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Footprints,
  Car,
  Clock,
  Star,
  MessageSquare,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Lock,
  Layers,
  Calendar,
  X,
  Key,
  RotateCw,
  Plus,
  ShieldCheck,
  Trash2,
  Check,
  Sliders,
  History,
  AlertTriangle,
  Radio,
  Share2,
  Globe,
  MapPin,
} from 'lucide-react';
import { formatDuration } from '../services/routingService';
import { AdminSeoTab } from './AdminSeoTab';
import { AdminPlacesTab } from './AdminPlacesTab';
import { AdminAiTab } from './AdminAiTab';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('admin@kashiyatra.in');
  const [password, setPassword] = useState<string>('KashiAdmin@2026');
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'guests' | 'feedback' | 'ai' | 'maps' | 'shares' | 'seo' | 'places'>('places');
  const [locationShareStats, setLocationShareStats] = useState<any>(null);

  // Filters
  const [dateRange, setDateRange] = useState<string>('30days');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [visitorFilter, setVisitorFilter] = useState<string>('all');

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [guestReport, setGuestReport] = useState<any>(null);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [aiStats, setAiStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Maps API Key Management State
  const [mapsSettings, setMapsSettings] = useState<any>(null);
  const [mapsKeys, setMapsKeys] = useState<any[]>([]);
  const [mapsHistory, setMapsHistory] = useState<any[]>([]);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [rotationMsg, setRotationMsg] = useState<string>('');
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newRawKey, setNewRawKey] = useState<string>('');
  const [newKeyType, setNewKeyType] = useState<string>('all');
  const [newKeyPriority, setNewKeyPriority] = useState<number>(1);
  const [addKeyError, setAddKeyError] = useState<string>('');
  const [keyValidationMsgs, setKeyValidationMsgs] = useState<Record<string, { valid: boolean; message: string }>>({});

  // Selected Guest Timeline Modal
  const [selectedTimelineGuest, setSelectedTimelineGuest] = useState<string | null>(null);
  const [guestTimelineData, setGuestTimelineData] = useState<any>(null);

  // Check existing session
  useEffect(() => {
    if (isOpen) {
      checkAdminSession();
    }
  }, [isOpen]);

  const checkAdminSession = async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (res.ok) {
        setIsAuthenticated(true);
        loadAllData();
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        loadAllData();
      } else {
        setAuthError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setAuthError('Connection error to auth endpoint');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        dateRange,
        language: langFilter,
        deviceCategory: deviceFilter,
        visitorType: visitorFilter,
      }).toString();

      // Fetch dashboard
      const dashRes = await fetch(`/api/analytics/dashboard?${q}`);
      if (dashRes.ok) {
        setDashboardData(await dashRes.json());
      }

      // Fetch guest activity
      const guestRes = await fetch('/api/analytics/guest-activity?page=1&pageSize=30');
      if (guestRes.ok) {
        setGuestReport(await guestRes.json());
      }

      // Fetch feedback
      const fbRes = await fetch('/api/feedback/list');
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        setFeedbackList(fbData.feedback || []);
      }

      // Fetch AI stats
      await fetchAiStats();

      // Fetch Maps Settings & Keys
      fetchMapsData();

      // Fetch Location Sharing Stats
      fetchLocationShareStats();
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiStats = async () => {
    try {
      const aiRes = await fetch('/api/admin/ai/stats');
      if (aiRes.ok) {
        setAiStats(await aiRes.json());
      }
    } catch (e) {
      console.warn('Could not refresh AI stats:', e);
    }
  };

  const fetchLocationShareStats = async () => {
    try {
      const res = await fetch('/api/admin/location-shares');
      if (res.ok) {
        setLocationShareStats(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch location sharing stats:', e);
    }
  };

  const handleStopShareAdmin = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/location-shares/${id}/stop`, { method: 'POST' });
      if (res.ok) {
        fetchLocationShareStats();
      }
    } catch (e) {
      console.error('Failed to terminate share:', e);
    }
  };

  const fetchMapsData = async () => {
    try {
      const [settingsRes, keysRes, historyRes] = await Promise.all([
        fetch('/api/admin/maps/settings'),
        fetch('/api/admin/maps/keys'),
        fetch('/api/admin/maps/history'),
      ]);

      if (settingsRes.ok) {
        setMapsSettings(await settingsRes.json());
      }
      if (keysRes.ok) {
        const kd = await keysRes.json();
        setMapsKeys(kd.keys || []);
      }
      if (historyRes.ok) {
        const hd = await historyRes.json();
        setMapsHistory(hd.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch maps data:', err);
    }
  };

  // Reload when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [dateRange, langFilter, deviceFilter, visitorFilter, isAuthenticated]);

  const viewTimeline = async (guestUuid: string) => {
    setSelectedTimelineGuest(guestUuid);
    try {
      const res = await fetch(`/api/analytics/guest-timeline/${guestUuid}`);
      if (res.ok) {
        setGuestTimelineData(await res.json());
      }
    } catch (e) {
      console.error('Error fetching guest timeline:', e);
    }
  };

  const updateFeedbackStatus = async (id: string, status: 'reviewed' | 'resolved') => {
    try {
      await fetch(`/api/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setFeedbackList((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    } catch (e) {
      console.error('Error updating feedback status:', e);
    }
  };

  const exportCsv = () => {
    window.location.href = '/api/analytics/export-csv';
  };

  // Maps Key Actions
  const handleRotateNow = async () => {
    setIsRotating(true);
    setRotationMsg('');
    try {
      const res = await fetch('/api/admin/maps/rotate-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Admin triggered manual rotation' }),
      });
      if (res.ok) {
        setRotationMsg('Successfully switched to next eligible key!');
        fetchMapsData();
        setTimeout(() => setRotationMsg(''), 4000);
      }
    } catch (e) {
      console.error('Failed to rotate maps key:', e);
    } finally {
      setIsRotating(false);
    }
  };

  const handleUpdateMapsSettings = async (updates: any) => {
    try {
      const res = await fetch('/api/admin/maps/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchMapsData();
      }
    } catch (e) {
      console.error('Failed to update maps settings:', e);
    }
  };

  const handleAddKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddKeyError('');
    if (!newKeyName.trim() || !newRawKey.trim()) {
      setAddKeyError('Please provide both a key name and raw API key.');
      return;
    }

    try {
      const res = await fetch('/api/admin/maps/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_name: newKeyName.trim(),
          raw_key: newRawKey.trim(),
          key_type: newKeyType,
          rotation_priority: Number(newKeyPriority) || 1,
        }),
      });

      if (res.ok) {
        setIsAddKeyModalOpen(false);
        setNewKeyName('');
        setNewRawKey('');
        fetchMapsData();
      } else {
        const err = await res.json();
        setAddKeyError(err.error || 'Failed to add key');
      }
    } catch (e) {
      setAddKeyError('Network error adding key');
    }
  };

  const handleToggleKeyEnabled = async (key: any) => {
    try {
      await fetch(`/api/admin/maps/keys/${key.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !key.is_enabled }),
      });
      fetchMapsData();
    } catch (e) {
      console.error('Failed to toggle key:', e);
    }
  };

  const handleValidateKey = async (keyId: string) => {
    try {
      const res = await fetch(`/api/admin/maps/keys/${keyId}/validate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setKeyValidationMsgs((prev) => ({
          ...prev,
          [keyId]: { valid: data.valid, message: data.message },
        }));
        fetchMapsData();
        setTimeout(() => {
          setKeyValidationMsgs((prev) => {
            const next = { ...prev };
            delete next[keyId];
            return next;
          });
        }, 5000);
      }
    } catch (e) {
      console.error('Failed to validate key:', e);
    }
  };

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    if (window.confirm(`Are you sure you want to remove "${keyName}" from active rotation?`)) {
      try {
        await fetch(`/api/admin/maps/keys/${keyId}`, { method: 'DELETE' });
        fetchMapsData();
      } catch (e) {
        console.error('Failed to delete key:', e);
      }
    }
  };

  if (!isOpen) return null;

  // Login View
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-xs">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
          <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Kashi Yatra Admin Portal</h3>
                <p className="text-[11px] text-stone-300">Authorized personnel only</p>
              </div>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleLogin} className="p-4 space-y-3 text-xs">
            {authError && (
              <div className="p-2 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900">
              <strong>Pre-configured Demo Credentials:</strong>
              <div>admin@kashiyatra.in / KashiAdmin@2026</div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-md transition-all"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const activeKey = mapsKeys.find((k) => k.id === mapsSettings?.active_key_id);

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-14 bg-stone-900 text-white px-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-bold text-sm text-white">
            KY
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">Varanasi Tourism Intelligence Hub</h2>
            <p className="text-[10px] text-stone-400">Visitor Analytics · Guest Sessions · Maps API Rotation</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-stone-800 p-1 rounded-xl text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'overview' ? 'bg-amber-600 text-white font-bold' : 'text-stone-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'guests' ? 'bg-amber-600 text-white font-bold' : 'text-stone-300 hover:text-white'
            }`}
          >
            Guest Activity
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'feedback' ? 'bg-amber-600 text-white font-bold' : 'text-stone-300 hover:text-white'
            }`}
          >
            Feedback ({feedbackList.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'ai' ? 'bg-amber-600 text-white font-bold' : 'text-stone-300 hover:text-white'
            }`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'maps' ? 'bg-amber-600 text-white font-bold' : 'text-amber-300 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Maps API Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('shares')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'shares' ? 'bg-amber-600 text-white font-bold' : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Location Shares</span>
            {locationShareStats?.activeSessions > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'seo' ? 'bg-amber-600 text-white font-bold' : 'text-blue-300 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SEO Management</span>
          </button>
          <button
            onClick={() => setActiveTab('places')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'places' ? 'bg-amber-600 text-white font-bold' : 'text-orange-300 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Tourist Places (तीर्थ स्थल)</span>
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-stone-700"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={loadAllData}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg"
            title="Close Admin"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Filter Ribbon (shown for overview/guests/feedback) */}
      {activeTab !== 'maps' && (
        <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="font-bold text-stone-600 flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <Filter className="w-3 h-3 text-amber-600" /> Filters:
            </span>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium focus:ring-1 focus:ring-amber-500"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="this_month">This Month</option>
            </select>

            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Languages</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="en">English</option>
            </select>

            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Devices</option>
              <option value="mobile">Mobile Phones</option>
              <option value="tablet">Tablets</option>
              <option value="desktop">Desktop</option>
            </select>

            <select
              value={visitorFilter}
              onChange={(e) => setVisitorFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Visitors</option>
              <option value="new">New Visitors</option>
              <option value="returning">Returning Visitors</option>
            </select>
          </div>

          <div className="text-[11px] text-stone-500">
            Showing metrics in <strong>UTC / IST</strong>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 overflow-y-auto p-4 max-w-7xl mx-auto w-full">
        {/* ================================== */}
        {/* TAB 1: OVERVIEW METRICS & CHARTS  */}
        {/* ================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-medium mb-1">Total Visits</div>
                <div className="text-xl font-extrabold text-stone-900">{summary.totalVisits ?? 0}</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">Sessions started</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-medium mb-1">Unique Visitors</div>
                <div className="text-xl font-extrabold text-amber-900">{summary.uniqueVisitors ?? 0}</div>
                <div className="text-[10px] text-stone-500 mt-1">
                  {summary.newVisitors ?? 0} new · {summary.returningVisitors ?? 0} returning
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-medium mb-1">Avg Session Time</div>
                <div className="text-xl font-extrabold text-stone-900">
                  {formatDuration(summary.avgSessionDurationSeconds ?? 0)}
                </div>
                <div className="text-[10px] text-stone-500 mt-1">Active navigation duration</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-medium mb-1">Tourist Places Viewed</div>
                <div className="text-xl font-extrabold text-stone-900">{summary.placeViewsCount ?? 0}</div>
                <div className="text-[10px] text-stone-500 mt-1">Sheet details & markers</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-medium mb-1">Tours Completed</div>
                <div className="text-xl font-extrabold text-emerald-700">{summary.toursCompleted ?? 0}</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                  {summary.tourCompletionRate ?? 0}% completion rate
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-medium mb-1">Feedback Rating</div>
                <div className="text-xl font-extrabold text-amber-600 flex items-center gap-1">
                  <span>{summary.avgRating ?? '5.0'}</span>
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div className="text-[10px] text-stone-500 mt-1">{summary.feedbackCount ?? 0} reviews received</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-medium mb-1">AI Assistant Usage</div>
                <div className="text-xl font-extrabold text-indigo-700">{summary.aiRequestsCount ?? 0}</div>
                <div className="text-[10px] text-stone-500 mt-1">Guidance queries answered</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-medium mb-1">Walking vs Driving</div>
                <div className="text-sm font-extrabold text-stone-800 flex items-center gap-2 mt-1">
                  <span className="text-orange-600">{dashboardData?.travelModes?.walking ?? 0} Walk</span>
                  <span>/</span>
                  <span className="text-blue-600">{dashboardData?.travelModes?.driving ?? 0} Drive</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-1">Walking preferred in lanes</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-medium mb-1">Top Language</div>
                <div className="text-sm font-extrabold text-stone-900 mt-1">
                  {dashboardData?.languages?.hindi ?? 0} Hindi · {dashboardData?.languages?.english ?? 0} English
                </div>
                <div className="text-[10px] text-stone-500 mt-1">Bilingual distribution</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <h3 className="font-bold text-stone-900 text-xs mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-600" /> Daily Visitor Growth & Footfall
                </h3>
                <div className="h-48 flex items-end gap-2 pt-6 pb-2 border-b border-stone-200">
                  {(dashboardData?.visitorGrowth || []).slice(-14).map((d: any) => {
                    const maxV = Math.max(...(dashboardData?.visitorGrowth || []).map((x: any) => x.visits), 10);
                    const heightPct = Math.max(10, Math.round((d.visits / maxV) * 100));

                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full bg-amber-500 group-hover:bg-amber-600 rounded-t transition-all"
                        ></div>
                        <span className="text-[9px] text-stone-400 rotate-45 mt-1 font-mono">
                          {d.date.slice(5)}
                        </span>
                        <div className="absolute -top-7 whitespace-nowrap bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {d.visits} visits ({d.date})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <h3 className="font-bold text-stone-900 text-xs mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" /> Most Visited Tourist Locations
                </h3>
                <div className="space-y-2">
                  {(dashboardData?.popularPlaces || []).slice(0, 6).map((item: any) => {
                    const maxCount = dashboardData?.popularPlaces?.[0]?.count || 1;
                    const pct = Math.round((item.count / maxCount) * 100);

                    return (
                      <div key={item.id} className="text-xs">
                        <div className="flex items-center justify-between text-[11px] font-medium text-stone-700 mb-0.5">
                          <span className="capitalize">{item.id.replace(/-/g, ' ')}</span>
                          <span className="font-bold text-stone-900">{item.count} views</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="h-full bg-amber-600 rounded-full"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================== */}
        {/* TAB 2: GUEST ACTIVITY REPORT       */}
        {/* ================================== */}
        {activeTab === 'guests' && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-stone-900">Anonymous Guest Activity & Timeline Report</h3>
                <p className="text-[11px] text-stone-500">
                  Recorded interactions without mandatory registration. Click any guest to inspect full chronological timeline.
                </p>
              </div>
              <span className="text-xs text-stone-500">{guestReport?.total || 0} Total Guests</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Guest Identifier</th>
                    <th className="py-2.5 px-3 font-semibold">Device</th>
                    <th className="py-2.5 px-3 font-semibold">Language</th>
                    <th className="py-2.5 px-3 font-semibold">Duration</th>
                    <th className="py-2.5 px-3 font-semibold">Places Viewed</th>
                    <th className="py-2.5 px-3 font-semibold">Tour Status</th>
                    <th className="py-2.5 px-3 font-semibold">Feedback</th>
                    <th className="py-2.5 px-3 font-semibold">Last Active</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {(guestReport?.items || []).map((guest: any) => (
                    <tr key={guest.guest_uuid} className="hover:bg-amber-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-stone-900 truncate max-w-[140px]">
                        {guest.guest_uuid}
                      </td>
                      <td className="py-2.5 px-3 capitalize">{guest.device_category}</td>
                      <td className="py-2.5 px-3 font-medium uppercase text-amber-800">
                        {guest.preferred_language}
                      </td>
                      <td className="py-2.5 px-3">{guest.duration_minutes} min</td>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        {guest.places_viewed_count} places
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            guest.tour_status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : guest.tour_status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {guest.tour_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-amber-600">{guest.feedback_status}</td>
                      <td className="py-2.5 px-3 text-[11px] text-stone-500">
                        {new Date(guest.last_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => viewTimeline(guest.guest_uuid)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-amber-600 hover:text-white rounded-md text-stone-700 text-xs font-semibold transition-all"
                        >
                          View Timeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================== */}
        {/* TAB 3: FEEDBACK MANAGEMENT         */}
        {/* ================================== */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-stone-900">Tourist Experience & Navigation Feedback</h3>
                <p className="text-[11px] text-stone-500">
                  Reviews collected from visitors upon completing their Varanasi tour.
                </p>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {feedbackList.map((fb) => (
                <div key={fb.id} className="p-4 space-y-2 hover:bg-stone-50/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= fb.overall_rating ? 'fill-amber-500' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-xs text-stone-900">{fb.overall_rating}/5</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-[11px] text-stone-500 font-mono">{fb.guest_uuid.slice(0, 16)}...</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-[10px] uppercase font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        {fb.preferred_language}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          fb.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fb.status === 'reviewed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {fb.status.toUpperCase()}
                      </span>

                      {fb.status !== 'resolved' && (
                        <button
                          onClick={() => updateFeedbackStatus(fb.id, 'resolved')}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold rounded"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-800 font-medium">{fb.comments}</p>

                  {fb.problems_encountered && (
                    <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                      <strong>Navigation Issues Encountered: </strong>
                      {fb.problems_encountered}
                    </div>
                  )}

                  <div className="text-[10px] text-stone-400">
                    Submitted on {new Date(fb.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================== */}
        {/* TAB 4: AI ASSISTANT MANAGEMENT     */}
        {/* ================================== */}
        {activeTab === 'ai' && (
          <AdminAiTab onRefresh={fetchAiStats} />
        )}

        {/* ================================== */}
        {/* TAB 5: MAPS API KEY ROTATION       */}
        {/* ================================== */}
        {activeTab === 'maps' && (
          <div className="space-y-4">
            {/* Active Key Status Banner */}
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl p-4 shadow-md border border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      Currently Active Maps Credential
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {activeKey?.key_name || 'No Active Key Configured'}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-300 mt-1 font-mono">
                    <span className="bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                      {activeKey?.key_masked || 'None'}
                    </span>
                    <span>·</span>
                    <span className="text-amber-200">
                      {activeKey?.total_requests_observed || 0} observed requests
                    </span>
                  </div>
                </div>
              </div>

              {/* Countdown and Manual Rotate button */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right text-xs mr-1 hidden sm:block">
                  <div className="text-stone-400 text-[10px]">Next Scheduled Rotation</div>
                  <div className="font-semibold text-emerald-300">
                    {mapsSettings?.next_rotation_due_at
                      ? new Date(mapsSettings.next_rotation_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Scheduled'}
                  </div>
                </div>

                <button
                  disabled={isRotating}
                  onClick={handleRotateNow}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                  title="Switch immediately to the next eligible key in circular rotation"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                  <span>{isRotating ? 'Rotating...' : 'Rotate Key Now'}</span>
                </button>

                <button
                  onClick={() => setIsAddKeyModalOpen(true)}
                  className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Key</span>
                </button>
              </div>
            </div>

            {rotationMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{rotationMsg}</span>
              </div>
            )}

            {/* Rotation Strategy & Scheduler Configuration */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-4">
              <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-xs text-stone-900">Automatic Rotation Engine Controls</h4>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-stone-700">Auto-Rotation Status:</span>
                  <button
                    onClick={() =>
                      handleUpdateMapsSettings({ rotation_enabled: !mapsSettings?.rotation_enabled })
                    }
                    className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all ${
                      mapsSettings?.rotation_enabled
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-200 text-stone-600 border border-stone-300'
                    }`}
                  >
                    {mapsSettings?.rotation_enabled ? 'ENABLED' : 'PAUSED'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Strategy Selector */}
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Rotation Strategy</label>
                  <select
                    value={mapsSettings?.rotation_strategy || 'time_based'}
                    onChange={(e) => handleUpdateMapsSettings({ rotation_strategy: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-medium text-stone-900 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="time_based">Time-Based Rotation (Recommended)</option>
                    <option value="usage_based">Usage-Based (Threshold Reached)</option>
                    <option value="health_fallback">Health-Based Fallback Only</option>
                  </select>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Switches to next eligible key after interval or on failure.
                  </p>
                </div>

                {/* Interval Selector */}
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Rotation Interval</label>
                  <select
                    value={mapsSettings?.rotation_interval_seconds || 7200}
                    onChange={(e) =>
                      handleUpdateMapsSettings({ rotation_interval_seconds: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-medium text-stone-900 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="900">15 Minutes</option>
                    <option value="1800">30 Minutes</option>
                    <option value="3600">1 Hour</option>
                    <option value="7200">2 Hours (Default Configured)</option>
                    <option value="14400">4 Hours</option>
                    <option value="21600">6 Hours</option>
                  </select>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Central coordination ensures all sessions switch simultaneously.
                  </p>
                </div>

                {/* Usage Threshold per Key */}
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Max Usage Threshold / Key</label>
                  <input
                    type="number"
                    defaultValue={mapsSettings?.usage_threshold_per_key || 2500}
                    onBlur={(e) =>
                      handleUpdateMapsSettings({ usage_threshold_per_key: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-medium text-stone-900 focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Max observed client/route requests before switching.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Management Pool Table */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-stone-900">Configured Google Maps Credentials Pool</h4>
                  <p className="text-[11px] text-stone-500">
                    Encrypted server-side storage. Raw keys are never displayed in full or exposed to browser.
                  </p>
                </div>
                <span className="text-xs font-semibold text-stone-600">
                  {mapsKeys.filter((k) => k.is_enabled && k.is_eligible).length} / {mapsKeys.length} Eligible
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Priority</th>
                      <th className="py-2.5 px-3 font-semibold">Credential Name</th>
                      <th className="py-2.5 px-3 font-semibold">Masked Fingerprint</th>
                      <th className="py-2.5 px-3 font-semibold">Health & Status</th>
                      <th className="py-2.5 px-3 font-semibold">Requests</th>
                      <th className="py-2.5 px-3 font-semibold">Last Activated</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {mapsKeys.map((key) => {
                      const isActive = key.id === mapsSettings?.active_key_id;
                      const valMsg = keyValidationMsgs[key.id];

                      return (
                        <tr
                          key={key.id}
                          className={`hover:bg-stone-50/70 transition-colors ${
                            isActive ? 'bg-amber-50/40 font-medium' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-stone-900">#{key.rotation_priority}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-stone-900 flex items-center gap-1.5">
                              <span>{key.key_name}</span>
                              {isActive && (
                                <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400 capitalize">{key.key_type} key</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-stone-800">
                            {key.key_masked}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded w-max ${
                                  !key.is_enabled
                                    ? 'bg-stone-100 text-stone-600'
                                    : key.last_validation_result === 'valid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : key.last_validation_result === 'invalid'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {!key.is_enabled
                                  ? 'DISABLED'
                                  : key.last_validation_result === 'valid'
                                  ? 'HEALTHY'
                                  : key.last_validation_result === 'invalid'
                                  ? 'VALIDATION FAILED'
                                  : 'NEEDS ATTENTION'}
                              </span>
                              {valMsg && (
                                <span className="text-[10px] text-stone-600">{valMsg.message}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-stone-900">
                            {key.total_requests_observed} req
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-stone-500">
                            {key.last_activated_at
                              ? new Date(key.last_activated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Never'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleValidateKey(key.id)}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold rounded transition-colors"
                                title="Verify key structure"
                              >
                                Test Health
                              </button>

                              <button
                                onClick={() => handleToggleKeyEnabled(key)}
                                className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                                  key.is_enabled
                                    ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                }`}
                              >
                                {key.is_enabled ? 'Disable' : 'Enable'}
                              </button>

                              <button
                                onClick={() => handleDeleteKey(key.id, key.key_name)}
                                className="p-1 text-stone-400 hover:text-red-600 rounded"
                                title="Remove key"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rotation Audit History Log */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-xs text-stone-900">Key Rotation & Activation Audit Log</h4>
                </div>
                <span className="text-[11px] text-stone-500">Centralized immutable event trail</span>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {mapsHistory.length === 0 ? (
                  <div className="p-4 text-center text-stone-400">No rotation events recorded yet.</div>
                ) : (
                  mapsHistory.map((item) => (
                    <div key={item.id} className="p-3 flex items-start justify-between gap-3 hover:bg-stone-50">
                      <div>
                        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                          <span className="capitalize">{item.event_type.replace(/_/g, ' ')}:</span>
                          <span className="text-amber-800">{item.previous_key_name || 'Start'}</span>
                          <span>→</span>
                          <span className="text-emerald-700 font-bold">{item.new_key_name || 'None'}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{item.trigger_reason}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                          {item.status.toUpperCase()}
                        </span>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {new Date(item.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Google Cloud Compliance & Security Notice */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-stone-900">
                  Google Cloud Platform Security & Terms Compliance
                </div>
                <p className="text-[11px] text-stone-700 leading-relaxed">
                  Keys are stored using server-side encryption. Browser keys must be restricted in Google Cloud Console
                  by authorized website referrers (e.g. your application URL). Rotating keys distributes load across
                  configured credentials without circumvention of Google Cloud project quotas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 6. Live Location Sharing Tab */}
        {activeTab === 'shares' && (
          <div className="p-4 max-w-6xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">Secure Live Location Sharing Intelligence</h3>
                <p className="text-xs text-stone-500">
                  Monitor active companion tracking sessions, ephemeral link lifecycle, and privacy compliance.
                </p>
              </div>
              <button
                onClick={fetchLocationShareStats}
                className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Stats</span>
              </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Total Links Created</div>
                <div className="text-2xl font-extrabold text-stone-900 mt-1">
                  {locationShareStats?.totalShares || 0}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">All time unique tokens</div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-emerald-300 bg-emerald-50/30 shadow-xs">
                <div className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span>Active Right Now</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-950 mt-1">
                  {locationShareStats?.activeSessions || 0}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Live sessions transmitting</div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Live vs Snapshot</div>
                <div className="text-xl font-extrabold text-stone-900 mt-1">
                  {locationShareStats?.liveCount || 0} / {locationShareStats?.snapshotCount || 0}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Continuous GPS vs Point-in-time</div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs">
                <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">GPS Updates Logged</div>
                <div className="text-2xl font-extrabold text-stone-900 mt-1">
                  {locationShareStats?.totalUpdates || 0}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Avg duration: {locationShareStats?.avgDurationMins || 30} mins</div>
              </div>
            </div>

            {/* Privacy Architecture Notice */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-600 space-y-1">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Privacy-First Architecture</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Tokens are 128-bit unpredictable pseudorandom strings. To preserve pilgrim privacy, the server stores only
                the latest coordinate snapshot in memory/storage (no permanent historical movement surveillance trails are retained).
                Links automatically transition to expired status when their duration lapses.
              </p>
            </div>

            {/* Recent Sessions Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                <h4 className="font-bold text-sm text-stone-900">Recent Location Sharing Sessions</h4>
                <span className="text-xs text-stone-500 font-mono">
                  {locationShareStats?.recentShares?.length || 0} recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Tourist / Note</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Started</th>
                      <th className="p-3">Expires</th>
                      <th className="p-3">GPS Updates</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(!locationShareStats?.recentShares || locationShareStats.recentShares.length === 0) ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-stone-400">
                          No location sharing sessions created yet. Test sharing from the map or navigation screen!
                        </td>
                      </tr>
                    ) : (
                      locationShareStats.recentShares.map((s: any) => (
                        <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                          <td className="p-3 font-semibold text-stone-900">
                            {s.sender_name}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.share_type === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {s.share_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.status === 'ended'
                                ? 'bg-stone-200 text-stone-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {s.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-stone-600 font-mono">
                            {s.duration_minutes} min
                          </td>
                          <td className="p-3 text-stone-500 font-mono text-[11px]">
                            {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3 text-stone-500 font-mono text-[11px]">
                            {new Date(s.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3 font-mono text-stone-700">
                            {s.update_count}
                          </td>
                          <td className="p-3 text-right">
                            {s.status === 'active' ? (
                              <button
                                onClick={() => handleStopShareAdmin(s.id)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold shadow-xs"
                                title="Force terminate session"
                              >
                                Terminate
                              </button>
                            ) : (
                              <span className="text-[11px] text-stone-400">Archived</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SEO Management Tab */}
        {activeTab === 'seo' && <AdminSeoTab />}

        {/* Tourist Places & Locations Management Tab */}
        {activeTab === 'places' && <AdminPlacesTab />}
      </main>

      {/* Add Maps Key Modal */}
      {isAddKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm">Add Google Maps API Key</h4>
              </div>
              <button onClick={() => setIsAddKeyModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddKeySubmit} className="p-4 space-y-3 text-xs">
              {addKeyError && (
                <div className="p-2 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addKeyError}</span>
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Friendly Key Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google Maps Key D (Failover)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Raw Google Maps API Key</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={newRawKey}
                  onChange={(e) => setNewRawKey(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  required
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Key will be masked as <code>AIza••••••••1234</code> after saving.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Key Type</label>
                  <select
                    value={newKeyType}
                    onChange={(e) => setNewKeyType(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
                  >
                    <option value="all">Universal (All APIs)</option>
                    <option value="browser_javascript">Browser JS API</option>
                    <option value="backend_routes">Backend Routes API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Rotation Priority</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newKeyPriority}
                    onChange={(e) => setNewKeyPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-[10px] text-stone-600">
                Key will be tested automatically upon creation. Only valid credentials participate in rotation.
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddKeyModalOpen(false)}
                  className="px-3 py-2 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save & Validate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest Activity Timeline Modal */}
      {selectedTimelineGuest && guestTimelineData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Guest Activity Timeline</h4>
                <p className="text-[11px] text-stone-400 font-mono truncate max-w-xs">{selectedTimelineGuest}</p>
              </div>
              <button
                onClick={() => setSelectedTimelineGuest(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mb-2">
                Recorded Real Chronological Events
              </div>

              {(guestTimelineData.events || []).map((ev: any, idx: number) => (
                <div key={ev.id} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="font-bold text-stone-900 capitalize">
                      {ev.event_type.replace(/_/g, ' ')}
                    </div>
                    {ev.tourist_place_id && (
                      <div className="text-amber-800 font-medium text-[11px]">
                        Target Place: {ev.tourist_place_id.replace(/-/g, ' ')}
                      </div>
                    )}
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {new Date(ev.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedTimelineGuest(null)}
                className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
