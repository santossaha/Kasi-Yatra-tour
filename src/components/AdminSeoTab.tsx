import React, { useState, useEffect } from 'react';
import {
  SeoPageRecord,
  SeoGlobalSettings,
  validateJsonLd,
  buildPlaceJsonLd,
} from '../db/seoDefaults';
import { VARANASI_PLACES } from '../data/varanasiPlaces';

interface AdminSeoTabProps {
  onRefreshStats?: () => void;
}

export const AdminSeoTab: React.FC<AdminSeoTabProps> = () => {
  const [pages, setPages] = useState<SeoPageRecord[]>([]);
  const [globalSettings, setGlobalSettings] = useState<SeoGlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPage, setSelectedPage] = useState<SeoPageRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [jsonLdError, setJsonLdError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previewTab, setPreviewTab] = useState<'serp' | 'social'>('serp');
  const [saving, setSaving] = useState(false);

  // Form edit state
  const [formData, setFormData] = useState<Partial<SeoPageRecord>>({});

  useEffect(() => {
    fetchSeoData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSeoData = async () => {
    try {
      setLoading(true);
      const [pagesRes, settingsRes] = await Promise.all([
        fetch('/api/admin/seo/pages'),
        fetch('/api/admin/seo/settings'),
      ]);

      if (pagesRes.ok) {
        const pData = await pagesRes.json();
        setPages(pData.pages || []);
      }
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setGlobalSettings(sData.settings || null);
      }
    } catch (err) {
      console.error('Failed to load SEO data:', err);
      showNotification('Failed to load SEO data from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPage = (page: SeoPageRecord) => {
    setSelectedPage(page);
    setFormData({ ...page });
    setJsonLdError(null);
    setIsEditing(true);
  };

  const handleNewPage = () => {
    const siteBase = globalSettings?.site_url || 'https://kashiyatra.in';
    const newRecord: Partial<SeoPageRecord> = {
      page_name: 'New Custom Page',
      page_type: 'custom',
      route_pattern: '/custom-guide',
      place_id: null,
      meta_title: 'Custom Varanasi Experience | Kashi Yatra',
      meta_description:
        'Explore authentic traditions, sacred temples, and serene boat journeys across the ancient ghats of Varanasi.',
      meta_keywords: 'Varanasi, Kashi, Ghats, Temple, Pilgrimage',
      canonical_url: `${siteBase}/custom-guide`,
      og_title: 'Custom Varanasi Experience | Kashi Yatra',
      og_description: 'Explore authentic traditions and sacred temples across Varanasi.',
      og_image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      og_type: 'article',
      twitter_card: 'summary_large_image',
      twitter_title: 'Custom Varanasi Experience | Kashi Yatra',
      twitter_description: 'Explore authentic traditions and sacred temples across Varanasi.',
      twitter_image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      robots_index: true,
      robots_follow: true,
      change_freq: 'weekly',
      priority: 0.7,
      status: 'published',
      structured_data_json: '',
      custom_headings: {
        h1: 'Discover Kashi Secrets',
        h2: 'Heritage & Spiritual Lore',
        intro_text: 'An authentic guide to experiencing Varanasi with reverence and cultural insight.',
      },
    };
    setSelectedPage(null);
    setFormData(newRecord);
    setJsonLdError(null);
    setIsEditing(true);
  };

  const handleSavePage = async () => {
    if (!formData.route_pattern || !formData.page_name) {
      showNotification('Page name and route pattern are required', 'error');
      return;
    }

    // Validate JSON-LD if present
    if (formData.structured_data_json && formData.structured_data_json.trim()) {
      const validation = validateJsonLd(formData.structured_data_json);
      if (!validation.valid) {
        setJsonLdError(validation.error || 'Invalid JSON syntax');
        showNotification('JSON-LD schema validation failed. Please correct before saving.', 'error');
        return;
      }
    }

    try {
      setSaving(true);
      if (selectedPage?.id) {
        // Update
        const res = await fetch(`/api/admin/seo/pages/${selectedPage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Save failed');
        const data = await res.json();
        setPages((prev) => prev.map((p) => (p.id === selectedPage.id ? data.page : p)));
        showNotification(`SEO record for "${formData.page_name}" updated successfully`);
      } else {
        // Create new
        const res = await fetch('/api/admin/seo/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Create failed');
        const data = await res.json();
        setPages((prev) => [data.page, ...prev]);
        showNotification(`Created SEO record for "${formData.page_name}"`);
      }
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Error saving SEO page', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (page: SeoPageRecord) => {
    if (!window.confirm(`Are you sure you want to delete SEO record for "${page.page_name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/seo/pages/${page.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      showNotification(`Deleted SEO record for "${page.page_name}"`);
    } catch (err: any) {
      showNotification(err.message || 'Error deleting SEO page', 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        'Reset all SEO pages to system defaults? This will regenerate SEO metadata and JSON-LD schemas for all 25+ Varanasi tourist places and core routes.'
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/admin/seo/reset-defaults', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      const data = await res.json();
      setPages(data.pages || []);
      setGlobalSettings(data.settings || null);
      showNotification('All SEO pages successfully reset and regenerated!');
    } catch (err: any) {
      showNotification(err.message || 'Failed to reset SEO defaults', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSettings) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/seo/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalSettings),
      });
      if (!res.ok) throw new Error('Failed to update global settings');
      const data = await res.json();
      setGlobalSettings(data.settings);
      setIsGlobalModalOpen(false);
      showNotification('Global SEO settings updated');
    } catch (err: any) {
      showNotification(err.message || 'Error saving global settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleValidateCurrentJsonLd = () => {
    if (!formData.structured_data_json || !formData.structured_data_json.trim()) {
      setJsonLdError(null);
      showNotification('Structured data is empty (no schema applied)');
      return;
    }
    const res = validateJsonLd(formData.structured_data_json);
    if (res.valid) {
      setJsonLdError(null);
      showNotification('JSON-LD Schema is syntactically valid Schema.org JSON!');
    } else {
      setJsonLdError(res.error || 'Invalid JSON');
      showNotification('JSON-LD Schema contains syntax errors', 'error');
    }
  };

  const handleAutoGenerateSchema = () => {
    if (!formData.place_id) {
      showNotification('Select or specify a Place first to auto-generate TouristAttraction schema', 'error');
      return;
    }
    const place = VARANASI_PLACES.find((p) => p.id === formData.place_id);
    if (!place) {
      showNotification(`No place found with ID "${formData.place_id}"`, 'error');
      return;
    }
    const siteUrl = globalSettings?.site_url || 'https://kashiyatra.in';
    const schemaObj = buildPlaceJsonLd(place, siteUrl);
    setFormData((prev) => ({
      ...prev,
      structured_data_json: JSON.stringify(schemaObj, null, 2),
    }));
    setJsonLdError(null);
    showNotification('Generated TouristAttraction JSON-LD Schema!');
  };

  // Filtered pages
  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.page_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.route_pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.meta_title && p.meta_title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || p.page_type === filterType;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const titleLength = formData.meta_title?.length || 0;
  const descLength = formData.meta_description?.length || 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium animate-bounce ${
            notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* SEO Top Banner & Global Stats */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                Dynamic SEO Engine
              </span>
              <span className="bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full text-xs font-bold">
                Server-Side & Client Injected
              </span>
            </div>
            <h2 className="text-2xl font-bold">Search Engine Optimization & Metadata</h2>
            <p className="text-amber-100 text-sm mt-1 max-w-2xl">
              Manage dynamic page titles, descriptions, canonical URLs, Schema.org JSON-LD, sitemap, and robots indexing
              across all Varanasi tourist spots.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <span>🗺️</span> View sitemap.xml
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <span>🤖</span> View robots.txt
            </a>
            <button
              onClick={() => setIsGlobalModalOpen(true)}
              className="px-3.5 py-2 bg-white text-orange-900 hover:bg-amber-50 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
            >
              <span>⚙️</span> Global SEO Settings
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-3 py-2 bg-rose-900/60 hover:bg-rose-900 text-rose-100 rounded-xl text-xs font-semibold border border-rose-400/30 transition-all"
              title="Regenerates all Varanasi tourist spot SEO pages"
            >
              ↺ Reset Defaults
            </button>
          </div>
        </div>

        {/* Quick SEO Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-black/15 rounded-xl p-3">
            <div className="text-xs text-amber-200">Total Managed Pages</div>
            <div className="text-2xl font-bold mt-0.5">{pages.length}</div>
          </div>
          <div className="bg-black/15 rounded-xl p-3">
            <div className="text-xs text-amber-200">Published & Indexed</div>
            <div className="text-2xl font-bold mt-0.5 text-emerald-300">
              {pages.filter((p) => p.status === 'published' && p.robots_index).length}
            </div>
          </div>
          <div className="bg-black/15 rounded-xl p-3">
            <div className="text-xs text-amber-200">Place Pages with Schema</div>
            <div className="text-2xl font-bold mt-0.5 text-amber-300">
              {pages.filter((p) => Boolean(p.structured_data_json)).length}
            </div>
          </div>
          <div className="bg-black/15 rounded-xl p-3">
            <div className="text-xs text-amber-200">Base Domain</div>
            <div className="text-xs font-mono font-medium truncate mt-2 text-white/90">
              {globalSettings?.site_url || 'https://kashiyatra.in'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by title, route, or place name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <span className="absolute left-3 top-2.5 text-stone-400">🔍</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-stone-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Page Types</option>
            <option value="place">Tourist Places ({pages.filter((p) => p.page_type === 'place').length})</option>
            <option value="home">Home Page</option>
            <option value="guide">Guide</option>
            <option value="planner">Tour Planner</option>
            <option value="shared_location">Shared Location</option>
            <option value="custom">Custom</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-stone-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <button
          onClick={handleNewPage}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <span>＋</span> Add SEO Page
        </button>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500">
            <div className="inline-block animate-spin text-3xl mb-2">⌛</div>
            <p>Loading Varanasi SEO metadata...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <p className="text-lg font-medium text-stone-700">No SEO records found</p>
            <p className="text-sm mt-1">Try adjusting search filters or click "Reset Defaults" above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Page / Route</th>
                  <th className="py-3 px-4">Meta Title & Description</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Robots</th>
                  <th className="py-3 px-4 text-center">JSON-LD</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPages.map((page) => {
                  const titleOk = page.meta_title.length >= 40 && page.meta_title.length <= 65;
                  const descOk = page.meta_description.length >= 120 && page.meta_description.length <= 165;
                  return (
                    <tr key={page.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                          <span>{page.page_name}</span>
                        </div>
                        <div className="font-mono text-xs text-orange-700 truncate mt-0.5" title={page.route_pattern}>
                          {page.route_pattern}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 uppercase">
                          {page.page_type}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-[380px]">
                        <div className="font-medium text-stone-800 line-clamp-1 text-xs">{page.meta_title}</div>
                        <div className="text-stone-500 text-xs line-clamp-2 mt-0.5">{page.meta_description}</div>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span
                            className={`px-1.5 py-0.2 rounded font-mono ${
                              titleOk ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            Title: {page.meta_title.length} chars
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-mono ${
                              descOk ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            Desc: {page.meta_description.length} chars
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            page.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : page.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {page.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                            page.robots_index && page.robots_follow
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {page.robots_index ? 'index' : 'noindex'}, {page.robots_follow ? 'follow' : 'nofollow'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {page.structured_data_json ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                            <span>✓</span> Valid Schema
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleEditPage(page)}
                          className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <a
                          href={page.route_pattern}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          Visit ↗
                        </a>
                        {page.page_type === 'custom' && (
                          <button
                            onClick={() => handleDeletePage(page)}
                            className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit SEO Page Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedPage ? `Edit SEO: ${formData.page_name}` : 'Create New SEO Page'}
                </h3>
                <p className="text-xs text-orange-100 font-mono mt-0.5">Route: {formData.route_pattern || '/'}</p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-white/80 hover:text-white text-2xl font-light leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Live SERP & Social Preview Card */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>👁️</span> Live Search & Social Snippet Preview
                  </span>
                  <div className="flex bg-stone-200 rounded-lg p-0.5 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('serp')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        previewTab === 'serp' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                      }`}
                    >
                      Google SERP
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('social')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        previewTab === 'social' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                      }`}
                    >
                      Social Card (OG)
                    </button>
                  </div>
                </div>

                {previewTab === 'serp' ? (
                  /* Google SERP Preview */
                  <div className="bg-white p-4 rounded-lg border border-stone-300 font-sans max-w-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
                        V
                      </div>
                      <div className="text-xs text-stone-600 truncate">
                        <span>{globalSettings?.site_url || 'https://kashiyatra.in'}</span>
                        <span className="text-stone-400"> › {formData.route_pattern?.replace(/^\//, '')}</span>
                      </div>
                    </div>
                    <h4 className="text-blue-800 hover:underline text-lg font-medium leading-snug cursor-pointer line-clamp-1">
                      {formData.meta_title || 'Untitled Page - Varanasi Smart Tourist Guide'}
                    </h4>
                    <p className="text-stone-600 text-sm mt-1 line-clamp-2 leading-relaxed">
                      {formData.meta_description || 'No description provided.'}
                    </p>
                  </div>
                ) : (
                  /* Social Card Preview */
                  <div className="bg-white rounded-lg border border-stone-300 overflow-hidden max-w-lg shadow-sm">
                    {formData.og_image ? (
                      <img
                        src={formData.og_image}
                        alt="Preview"
                        className="w-full h-44 object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-stone-200 flex items-center justify-center text-stone-400 text-xs">
                        No image specified
                      </div>
                    )}
                    <div className="p-3 bg-stone-50 border-t border-stone-200">
                      <div className="text-[11px] uppercase font-semibold text-stone-500">
                        {globalSettings?.site_name || 'Kashi Yatra'}
                      </div>
                      <div className="font-bold text-stone-900 text-sm mt-0.5 line-clamp-1">
                        {formData.og_title || formData.meta_title}
                      </div>
                      <div className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {formData.og_description || formData.meta_description}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields: Page Basics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Page Name *</label>
                  <input
                    type="text"
                    value={formData.page_name || ''}
                    onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Kashi Vishwanath Temple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Route Pattern *</label>
                  <input
                    type="text"
                    value={formData.route_pattern || ''}
                    onChange={(e) => setFormData({ ...formData, route_pattern: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-orange-500"
                    placeholder="/places/kashi-vishwanath"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Page Type</label>
                  <select
                    value={formData.page_type || 'custom'}
                    onChange={(e) => setFormData({ ...formData, page_type: e.target.value as any })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="place">Tourist Place</option>
                    <option value="home">Home Page</option>
                    <option value="guide">Guide</option>
                    <option value="planner">Tour Planner</option>
                    <option value="shared_location">Shared Location</option>
                    <option value="custom">Custom Page</option>
                  </select>
                </div>
              </div>

              {/* Place Association if applicable */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Associated Tourist Place (optional)
                  </label>
                  <select
                    value={formData.place_id || ''}
                    onChange={(e) => {
                      const placeId = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        place_id: placeId || null,
                      }));
                    }}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">None / Site-wide Page</option>
                    {VARANASI_PLACES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name.en} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Publish Status</label>
                  <select
                    value={formData.status || 'published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-500 font-semibold"
                  >
                    <option value="published">Published (Indexable)</option>
                    <option value="draft">Draft (Under Review)</option>
                    <option value="disabled">Disabled (Hidden from Sitemap)</option>
                  </select>
                </div>
              </div>

              {/* Meta Title with Character Counter */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-stone-700 uppercase">Meta Title / SEO Title *</label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      titleLength >= 50 && titleLength <= 60
                        ? 'text-emerald-600'
                        : titleLength > 65
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {titleLength} / 60 chars (Recommended: 50-60)
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.meta_title || ''}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                  placeholder="Kashi Vishwanath Temple Guide | Varanasi Smart Tourist Guide"
                />
              </div>

              {/* Meta Description with Character Counter */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-stone-700 uppercase">Meta Description *</label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      descLength >= 140 && descLength <= 160
                        ? 'text-emerald-600'
                        : descLength > 165
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {descLength} / 160 chars (Recommended: 140-160)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formData.meta_description || ''}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                  placeholder="Explore the sacred Golden Temple of Lord Shiva on the banks of Ganga in Varanasi. Timings, aarti schedules, dress code, and local travel guide."
                />
              </div>

              {/* Canonical URL & Meta Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Canonical URL</label>
                  <input
                    type="url"
                    value={formData.canonical_url || ''}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-orange-500"
                    placeholder="https://kashiyatra.in/places/kashi-vishwanath"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Meta Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords || ''}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                    placeholder="Varanasi, Kashi Vishwanath, Ganga Aarti, Ghats"
                  />
                </div>
              </div>

              {/* Robots Directives */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="block text-xs font-bold text-stone-700 uppercase mb-3">
                  Search Engine Crawling & Robots Directives
                </span>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.robots_index ?? true}
                      onChange={(e) => setFormData({ ...formData, robots_index: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-stone-800">
                      Allow Indexing (<code className="text-xs">index</code>)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.robots_follow ?? true}
                      onChange={(e) => setFormData({ ...formData, robots_follow: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-stone-800">
                      Follow Links (<code className="text-xs">follow</code>)
                    </span>
                  </label>
                </div>
              </div>

              {/* Open Graph & Social Sharing */}
              <div className="space-y-4 border-t border-stone-200 pt-4">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <span>📱</span> Social Sharing Metadata (Open Graph & Twitter)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Open Graph Title</label>
                    <input
                      type="text"
                      value={formData.og_title || ''}
                      onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Leave blank to use Meta Title"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      OG / Social Image URL (1200x630px recommended)
                    </label>
                    <input
                      type="url"
                      value={formData.og_image || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, og_image: e.target.value, twitter_image: e.target.value })
                      }
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Open Graph Description</label>
                  <input
                    type="text"
                    value={formData.og_description || ''}
                    onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Leave blank to use Meta Description"
                  />
                </div>
              </div>

              {/* Structured Data (JSON-LD) Section */}
              <div className="space-y-3 border-t border-stone-200 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span>🏷️</span> Structured Data (Schema.org JSON-LD)
                    </h4>
                    <p className="text-xs text-stone-500">
                      TouristAttraction, TouristDestination, BreadcrumbList, or WebSite schema
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoGenerateSchema}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold transition-colors"
                    >
                      ⚡ Auto-Generate Schema
                    </button>
                    <button
                      type="button"
                      onClick={handleValidateCurrentJsonLd}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
                    >
                      ✓ Validate JSON
                    </button>
                  </div>
                </div>

                {jsonLdError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-mono">
                    ⚠️ {jsonLdError}
                  </div>
                )}

                <textarea
                  rows={6}
                  value={formData.structured_data_json || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, structured_data_json: e.target.value });
                    setJsonLdError(null);
                  }}
                  className="w-full border border-stone-300 rounded-lg p-3 font-mono text-xs bg-stone-900 text-emerald-300 focus:ring-2 focus:ring-orange-500"
                  placeholder='{\n  "@context": "https://schema.org",\n  "@type": "TouristAttraction",\n  "name": "..."\n}'
                />
              </div>

              {/* Custom SEO Content Blocks */}
              <div className="space-y-3 border-t border-stone-200 pt-4">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <span>📝</span> Custom SEO Content & Cultural Headings (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Primary Heading (H1 Override)
                    </label>
                    <input
                      type="text"
                      value={formData.custom_headings?.h1 || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          custom_headings: { ...formData.custom_headings, h1: e.target.value },
                        })
                      }
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="e.g. Sacred Darshan at Shri Kashi Vishwanath"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Secondary Heading (H2)
                    </label>
                    <input
                      type="text"
                      value={formData.custom_headings?.h2 || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          custom_headings: { ...formData.custom_headings, h2: e.target.value },
                        })
                      }
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Spiritual Significance & Historical Lore"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Introduction & Cultural Context Text
                  </label>
                  <textarea
                    rows={3}
                    value={formData.custom_headings?.intro_text || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        custom_headings: { ...formData.custom_headings, intro_text: e.target.value },
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Rich background content about traditions, ancient legends, spiritual rituals, and visitor tips..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePage}
                disabled={saving}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                {saving ? 'Saving...' : 'Save SEO Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global SEO Settings Modal */}
      {isGlobalModalOpen && globalSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveGlobalSettings}
            className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Global Site SEO Configuration</h3>
                <p className="text-xs text-stone-400">Site-wide defaults, canonical base domain, and meta templates</p>
              </div>
              <button
                type="button"
                onClick={() => setIsGlobalModalOpen(false)}
                className="text-white/80 hover:text-white text-2xl font-light leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Site Name</label>
                <input
                  type="text"
                  value={globalSettings.site_name}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, site_name: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Canonical Base URL (No trailing slash)
                </label>
                <input
                  type="url"
                  value={globalSettings.site_url}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, site_url: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Default Title Suffix</label>
                <input
                  type="text"
                  value={globalSettings.default_title_suffix}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, default_title_suffix: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder=" | Kashi Yatra Varanasi"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Default Fallback Meta Description
                </label>
                <textarea
                  rows={3}
                  value={globalSettings.default_meta_description}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, default_meta_description: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Default OG / Social Image URL
                  </label>
                  <input
                    type="url"
                    value={globalSettings.default_og_image}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, default_og_image: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Twitter Handle (Site or Creator)
                  </label>
                  <input
                    type="text"
                    value={globalSettings.twitter_handle || ''}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, twitter_handle: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="@KashiYatraGuide"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Google Site Verification Code
                </label>
                <input
                  type="text"
                  value={globalSettings.google_site_verification || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, google_site_verification: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="e.g. google-site-verification-..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGlobalModalOpen(false)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-md"
              >
                {saving ? 'Saving...' : 'Save Global Settings'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
