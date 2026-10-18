import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  Sliders,
  Flame,
  Landmark,
  Utensils,
  BookOpen,
  Compass,
  Hotel,
  CloudSun,
  Bus,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';
import { AICategoryConfig, AIKnowledgeItem, AIAssistantConfig } from '../db/aiDefaults';

interface AdminAiTabProps {
  onRefresh?: () => void;
}

export const AdminAiTab: React.FC<AdminAiTabProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'categories' | 'knowledge' | 'stats'>('config');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // AI Assistant Config state
  const [config, setConfig] = useState<AIAssistantConfig | null>(null);

  // Knowledge Base state
  const [knowledgeItems, setKnowledgeItems] = useState<AIKnowledgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<Partial<AIKnowledgeItem> | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState<boolean>(false);

  // AI Stats state
  const [aiStats, setAiStats] = useState<any>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [configRes, kbRes, statsRes] = await Promise.all([
        fetch('/api/admin/ai/config'),
        fetch('/api/admin/ai/knowledge'),
        fetch('/api/admin/ai/stats'),
      ]);

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData.config);
      }
      if (kbRes.ok) {
        const kbData = await kbRes.json();
        setKnowledgeItems(kbData.items || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAiStats(statsData);
      }
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to load AI administration data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save Welcome & System Instructions
  const handleSaveConfig = async () => {
    if (!config) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/ai/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error('Failed to update config');
      const data = await res.json();
      setConfig(data.config);
      showNotification('AI Assistant settings & instructions saved successfully! No rebuild required.');
    } catch (err: any) {
      showNotification(err.message || 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Category Status
  const handleToggleCategory = (catId: string) => {
    if (!config) return;
    const updatedCategories = config.categories.map((c) =>
      c.id === catId ? { ...c, is_active: !c.is_active } : c
    );
    setConfig({ ...config, categories: updatedCategories });
  };

  // Save Knowledge Item
  const handleSaveKnowledgeItem = async (item: Partial<AIKnowledgeItem>) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/ai/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!res.ok) throw new Error('Failed to save knowledge item');
      showNotification('Verified knowledge topic saved successfully');
      setEditingItem(null);
      setIsNewItemModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      showNotification(err.message || 'Error saving item', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Knowledge Item
  const handleDeleteKnowledgeItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this verified knowledge item?')) return;
    try {
      const res = await fetch(`/api/admin/ai/knowledge/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('Knowledge item removed');
        fetchAllData();
      }
    } catch (err: any) {
      showNotification('Failed to delete item', 'error');
    }
  };

  // Reset Knowledge Base to Verified Defaults
  const handleResetKnowledge = async () => {
    if (!confirm('Reset entire AI knowledge base and prompt instructions to verified Varanasi defaults?')) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/ai/knowledge/reset', { method: 'POST' });
      if (res.ok) {
        showNotification('Knowledge base reset to verified defaults');
        fetchAllData();
      }
    } catch (err: any) {
      showNotification('Failed to reset', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredKnowledge = knowledgeItems.filter((item) => {
    const matchesCategory = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.en.toLowerCase().includes(q) ||
      item.title.hi.includes(q) ||
      item.details.en.toLowerCase().includes(q) ||
      item.details.hi.includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-stone-400 hover:text-stone-700">
            ×
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-2xl p-4 shadow-sm border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>AI Tour Guide Assistant & Knowledge Engine</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold border border-emerald-500/30">
                Backend-Controlled
              </span>
            </h3>
            <p className="text-xs text-stone-300 mt-0.5">
              Customize welcome messages, system prompt guardrails, 9 categories, and verified knowledge records without rebuilding frontend.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetKnowledge}
            disabled={saving}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold rounded-xl border border-stone-700 transition-all flex items-center gap-1.5"
            title="Reset to verified defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Publish Changes'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => setActiveSubTab('config')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'config'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Instructions & Welcome</span>
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'categories'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>9 Categories & Prompts ({config?.categories?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('knowledge')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'knowledge'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Knowledge Base ({knowledgeItems.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stats')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'stats'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Credits & Audit Log</span>
        </button>
      </div>

      {/* SUBTAB 1: System Instructions & Welcome Messages */}
      {activeSubTab === 'config' && config && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Greeting & Welcome Messages (Dynamic SSR/Client)</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                These messages display instantly when the tourist opens the chatbot dialog.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Hindi Welcome Message (हिन्दी स्वागत संदेश)
                </label>
                <textarea
                  rows={3}
                  value={config.welcome_message_hi}
                  onChange={(e) => setConfig({ ...config, welcome_message_hi: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  English Welcome Message
                </label>
                <textarea
                  rows={3}
                  value={config.welcome_message_en}
                  onChange={(e) => setConfig({ ...config, welcome_message_en: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Hindi Subtitle (हिन्दी उपशीर्षक)
                </label>
                <input
                  type="text"
                  value={config.welcome_subtitle_hi}
                  onChange={(e) => setConfig({ ...config, welcome_subtitle_hi: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  English Subtitle
                </label>
                <input
                  type="text"
                  value={config.welcome_subtitle_en}
                  onChange={(e) => setConfig({ ...config, welcome_subtitle_en: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* System Instructions / Guardrails Editor */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>AI System Instructions & Verification Guardrails</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Direct prompt instructions passed into Gemini 3.8 Flash. Changes take effect on the very next query without app restart.
                </p>
              </div>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">
                {config.system_instructions.length} chars
              </span>
            </div>

            <textarea
              rows={10}
              value={config.system_instructions}
              onChange={(e) => setConfig({ ...config, system_instructions: e.target.value })}
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs text-stone-800 focus:bg-white focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              <span>Safety Rule: Photography bans at Manikarnika and authentic boat rates are pre-configured.</span>
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Instructions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Categories & Quick Prompts */}
      {activeSubTab === 'categories' && config && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-stone-900">
                Interactive Category Cards (9 Default Slots)
              </h4>
              <p className="text-xs text-stone-500">
                Configure card titles, icons, and quick prompt chips displayed underneath the welcome message.
              </p>
            </div>
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Categories</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {config.categories.map((cat, idx) => (
              <div
                key={cat.id}
                className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                  cat.is_active ? 'bg-white border-stone-200 shadow-2xs' : 'bg-stone-50 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-xs font-bold text-amber-800">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-xs text-stone-900">{cat.name_en}</span>
                  </div>
                  <button
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all ${
                      cat.is_active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {cat.is_active ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 font-bold uppercase">Hindi Title</label>
                    <input
                      type="text"
                      value={cat.name_hi}
                      onChange={(e) => {
                        const cats = [...config.categories];
                        cats[idx].name_hi = e.target.value;
                        setConfig({ ...config, categories: cats });
                      }}
                      className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 font-bold uppercase">English Subtitle</label>
                    <input
                      type="text"
                      value={cat.subtitle_en}
                      onChange={(e) => {
                        const cats = [...config.categories];
                        cats[idx].subtitle_en = e.target.value;
                        setConfig({ ...config, categories: cats });
                      }}
                      className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 font-bold uppercase">
                      Quick Prompts ({cat.quick_prompts_en.length})
                    </label>
                    <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar pt-0.5">
                      {cat.quick_prompts_en.map((qp, qIdx) => (
                        <div key={qIdx} className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded truncate">
                          • {qp}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: Verified Knowledge Base Manager */}
      {activeSubTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-sm text-stone-900">
                Verified Knowledge Grounding Base
              </h4>
              <p className="text-xs text-stone-500">
                Official Aarti schedules, street food spots, timings, boat rates, and historical facts pulled into AI prompts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingItem({
                    category: 'places',
                    title: { en: '', hi: '' },
                    summary: { en: '', hi: '' },
                    details: { en: '', hi: '' },
                    schedule_timing: '',
                    source_url: '',
                    source_title: '',
                    nearby_suggestions: { en: [], hi: [] },
                    is_verified: true,
                    tags: [],
                  });
                  setIsNewItemModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Knowledge Topic</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search verified topics, places, foods, schedules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl font-semibold text-stone-700 focus:ring-2 focus:ring-amber-500 w-full sm:w-auto"
            >
              <option value="all">All Categories ({knowledgeItems.length})</option>
              <option value="aarti">Ghats & Ganga Aarti</option>
              <option value="temples">Temples & Darshan</option>
              <option value="food">Famous Street Food</option>
              <option value="transport">Transport & Boats</option>
              <option value="history">History & Archaeology</option>
              <option value="planning">Tour Planning</option>
              <option value="weather">Weather & Best Time</option>
              <option value="hotels">Hotels & Stay</option>
            </select>
          </div>

          {/* Knowledge Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="divide-y divide-stone-100 text-xs">
              {filteredKnowledge.map((item) => (
                <div key={item.id} className="p-4 hover:bg-stone-50/60 transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-sm">{item.title.en}</span>
                        <span className="text-stone-400 font-medium">({item.title.hi})</span>
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase bg-amber-50 text-amber-800 border border-amber-200">
                          {item.category}
                        </span>
                        {item.is_verified && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>

                      {item.schedule_timing && (
                        <div className="flex items-center gap-1.5 text-stone-600 text-[11px] font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{item.schedule_timing}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingItem({ ...item });
                          setIsNewItemModalOpen(true);
                        }}
                        className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Knowledge Topic"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteKnowledgeItem(item.id)}
                        className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Knowledge Topic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-stone-600 leading-relaxed text-[11px]">{item.summary.en}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-stone-400 pt-1">
                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-700 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Source: {item.source_title || 'Official Portal'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {item.coordinates && (
                      <span>
                        Coords: {item.coordinates.lat.toFixed(4)}, {item.coordinates.lng.toFixed(4)}
                      </span>
                    )}
                    {item.tags.length > 0 && <span>Tags: {item.tags.join(', ')}</span>}
                  </div>
                </div>
              ))}

              {filteredKnowledge.length === 0 && (
                <div className="p-8 text-center text-stone-500 text-xs">
                  No verified knowledge items matched your filter. Click "Add Knowledge Topic" to create one.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Usage Stats & Credit Controls */}
      {activeSubTab === 'stats' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Total AI Requests</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-1">{aiStats?.totalRequests || 0}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                {aiStats?.successfulRequests || 0} served successfully
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Credits Purchased</div>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">
                {aiStats?.totalCreditsPurchased || 0}
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">Prepaid tourist credits</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Direct Revenue</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹{aiStats?.totalRevenueInr || 0}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Packages activated</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Active Gemini Model</div>
              <div className="text-sm font-extrabold text-stone-900 mt-1">gemini-3.8-flash</div>
              <div className="text-[10px] text-indigo-600 mt-0.5">Server-Side Verified SDK</div>
            </div>
          </div>

          {/* Recent Audit Log */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-stone-200 font-extrabold text-xs text-stone-900">
              Recent AI Interaction Audit Log
            </div>
            <div className="divide-y divide-stone-100">
              {(aiStats?.recentUsage || []).map((rec: any) => (
                <div key={rec.id} className="p-3.5 hover:bg-stone-50 transition-colors space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-stone-900">Q: "{rec.prompt_preview}"</div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold shrink-0">
                      SUCCESS
                    </span>
                  </div>
                  <div className="text-stone-600 text-[11px] leading-relaxed">A: {rec.response_preview}...</div>
                  <div className="text-[10px] text-stone-400 pt-0.5">
                    Model: {rec.model} · Tokens: ~{rec.input_tokens + rec.output_tokens} · Time: {new Date(rec.created_at).toLocaleString()}
                  </div>
                </div>
              ))}

              {(!aiStats?.recentUsage || aiStats.recentUsage.length === 0) && (
                <div className="p-8 text-center text-stone-500">No AI queries recorded yet today.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Knowledge Item */}
      {isNewItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{editingItem.id ? 'Edit Verified Knowledge Topic' : 'New Verified Knowledge Topic'}</span>
              </h3>
              <button onClick={() => setIsNewItemModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Title (English)</label>
                <input
                  type="text"
                  value={editingItem.title?.en || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      title: { ...(editingItem.title || { en: '', hi: '' }), en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  placeholder="e.g. Dashashwamedh Maha Ganga Aarti"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Title (हिन्दी)</label>
                <input
                  type="text"
                  value={editingItem.title?.hi || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      title: { ...(editingItem.title || { en: '', hi: '' }), hi: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  placeholder="उदा: दशाश्वमेध महा गंगा आरती"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Category</label>
                <select
                  value={editingItem.category || 'places'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-800"
                >
                  <option value="aarti">Ghats & Ganga Aarti</option>
                  <option value="temples">Temples & Darshan</option>
                  <option value="food">Famous Street Food</option>
                  <option value="transport">Transport & Boats</option>
                  <option value="history">History & Heritage</option>
                  <option value="planning">Tour Planning</option>
                  <option value="weather">Weather & Best Time</option>
                  <option value="hotels">Hotels & Stay</option>
                  <option value="places">Explore Places</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Verified Schedule / Timing</label>
                <input
                  type="text"
                  value={editingItem.schedule_timing || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, schedule_timing: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  placeholder="e.g. Daily: 6:45 PM summer, 6:00 PM winter"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Detailed Facts (English)</label>
              <textarea
                rows={3}
                value={editingItem.details?.en || ''}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    details: { ...(editingItem.details || { en: '', hi: '' }), en: e.target.value },
                  })
                }
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 leading-relaxed"
                placeholder="Include authentic details, dos & donts, ticket prices, access rules..."
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Detailed Facts (हिन्दी)</label>
              <textarea
                rows={3}
                value={editingItem.details?.hi || ''}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    details: { ...(editingItem.details || { en: '', hi: '' }), hi: e.target.value },
                  })
                }
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 leading-relaxed"
                placeholder="प्रामाणिक नियम, दर्शन व्यवस्था, सावधानी व विशेषताएं..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Source Title</label>
                <input
                  type="text"
                  value={editingItem.source_title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, source_title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  placeholder="e.g. UP Tourism / Ganga Seva Nidhi"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Official Source URL</label>
                <input
                  type="text"
                  value={editingItem.source_url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, source_url: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  placeholder="https://varanasi.nic.in/..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={() => setIsNewItemModalOpen(false)}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveKnowledgeItem(editingItem)}
                disabled={saving}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Topic</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
