import React, { useState, useEffect } from 'react';
import { TouristPlace, PlaceCategory } from '../types/tourist';
import {
  MapPin,
  Plus,
  RotateCw,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Eye,
  Sliders,
  Image,
  Clock,
  Sparkles,
  Globe,
  ShieldCheck,
  Database,
  FileText,
  X,
  HelpCircle,
  Info,
} from 'lucide-react';

interface AdminPlacesTabProps {
  onRefreshPlaces?: () => void;
}

export const AdminPlacesTab: React.FC<AdminPlacesTabProps> = ({ onRefreshPlaces }) => {
  const [places, setPlaces] = useState<TouristPlace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<TouristPlace | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<TouristPlace>>({});

  useEffect(() => {
    fetchPlaces();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/places');
      if (!res.ok) throw new Error('Failed to fetch places');
      const data = await res.json();
      setPlaces(data.places || []);
    } catch (err: any) {
      console.error(err);
      showNotification('Could not load tourist places from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (place: TouristPlace) => {
    setSelectedPlace(place);
    setFormData({
      ...place,
      coordinates: { ...place.coordinates },
      name: { ...place.name },
      subtitle: { ...place.subtitle },
      shortIntro: { ...place.shortIntro },
      historicalBackground: { ...place.historicalBackground },
      visitingHours: { ...place.visitingHours },
      entryFee: { ...place.entryFee },
    });
    setIsEditing(true);
  };

  const handleNewPlace = () => {
    setSelectedPlace(null);
    setFormData({
      id: '',
      number: places.length + 1,
      name: { en: '', hi: '' },
      subtitle: { en: '', hi: '' },
      category: 'temple',
      coordinates: { lat: 25.3109, lng: 83.0104 },
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      shortIntro: { en: '', hi: '' },
      historicalBackground: { en: '', hi: '' },
      visitingHours: { en: 'Open daily 05:00 AM - 09:00 PM', hi: 'प्रतिदिन प्रातः 05:00 से रात्रि 09:00 बजे तक' },
      entryFee: { en: 'Free Entry', hi: 'निःशुल्क' },
      status: 'active',
      rating: 4.8,
      suggestedDurationMinutes: 45,
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.en || !formData.name?.hi) {
      showNotification('Both English and Hindi names are required', 'error');
      return;
    }
    if (!formData.coordinates?.lat || !formData.coordinates?.lng) {
      showNotification('Valid GPS Coordinates (Latitude and Longitude) are required', 'error');
      return;
    }

    try {
      setSaving(true);
      if (selectedPlace) {
        // Update existing
        const res = await fetch(`/api/admin/places/${selectedPlace.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Update failed');
        const data = await res.json();
        setPlaces((prev) => prev.map((p) => (p.id === selectedPlace.id ? data.place : p)));
        showNotification(`Location "${formData.name.en}" updated successfully!`);
      } else {
        // Create new
        const res = await fetch('/api/admin/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Creation failed');
        const data = await res.json();
        setPlaces((prev) => [...prev, data.place]);
        showNotification(`New place "${formData.name.en}" added to database!`);
      }

      setIsEditing(false);
      if (onRefreshPlaces) onRefreshPlaces();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Error saving tourist place', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (place: TouristPlace) => {
    const newStatus = place.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/places/${place.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Status change failed');
      const data = await res.json();
      setPlaces((prev) => prev.map((p) => (p.id === place.id ? data.place : p)));
      showNotification(`"${place.name.en}" is now ${newStatus}`);
      if (onRefreshPlaces) onRefreshPlaces();
    } catch (err: any) {
      showNotification('Failed to update place status', 'error');
    }
  };

  const handleDelete = async (place: TouristPlace) => {
    if (!window.confirm(`Are you sure you want to delete "${place.name.en}" from database?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/places/${place.id}?hard=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setPlaces((prev) => prev.filter((p) => p.id !== place.id));
      showNotification(`"${place.name.en}" deleted from database`);
      if (onRefreshPlaces) onRefreshPlaces();
    } catch (err: any) {
      showNotification('Failed to delete place', 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        'Reset all tourist places to initial curated Varanasi locations? Any custom places added will be reverted.'
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/admin/places/reset-defaults', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      const data = await res.json();
      setPlaces(data.places || []);
      showNotification('Reset all tourist places to defaults successfully!');
      if (onRefreshPlaces) onRefreshPlaces();
    } catch (err: any) {
      showNotification('Failed to reset places', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset coordinates in Varanasi
  const applyCoordinatePreset = (presetName: string, lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: { lat, lng },
    }));
    showNotification(`Applied coordinates for ${presetName} (${lat}, ${lng})`);
  };

  // Filtered places
  const filteredPlaces = places.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (p.name?.en && p.name.en.toLowerCase().includes(q)) ||
      (p.name?.hi && p.name.hi.includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q));

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' || (p.status || 'active') === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = places.filter((p) => (p.status || 'active') === 'active').length;
  const inactiveCount = places.filter((p) => p.status === 'inactive').length;
  const templesCount = places.filter((p) => p.category === 'temple').length;
  const ghatsCount = places.filter((p) => p.category === 'ghat').length;

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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                Database Managed
              </span>
              <span className="bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full text-xs font-bold">
                Live Backend Control
              </span>
            </div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-amber-300" />
              <span>Tourist Visiting Points & Locations (तीर्थ स्थल प्रबंधन)</span>
            </h2>
            <p className="text-amber-100 text-sm mt-1 max-w-2xl">
              दशाश्वमेध घाट, मणिकर्णिका घाट, श्री काशी विश्वनाथ मंदिर और अन्य सभी तीर्थ स्थलों को बैकएंड डेटाबेस से सीधे एडिट व मैनेज करें। परिवर्तन तुरंत ऐप और मैप पर लाइव दिखेंगे।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleNewPlace}
              className="px-4 py-2.5 bg-white text-orange-900 hover:bg-amber-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-orange-600" />
              <span>Add New Location</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-3 py-2.5 bg-rose-900/60 hover:bg-rose-900 text-rose-100 rounded-xl text-xs font-semibold border border-rose-400/30 transition-all flex items-center gap-1.5"
              title="Reset to default curated Varanasi spots"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-black/15 rounded-xl p-3">
            <div className="text-xs text-amber-200">Total Backend Places</div>
            <div className="text-2xl font-bold mt-0.5">{places.length}</div>
          </div>
          <div className="bg-black/15 rounded-xl p-3">
            <div className="text-xs text-emerald-200">Active On Live Map</div>
            <div className="text-2xl font-bold mt-0.5 text-emerald-300">{activeCount}</div>
          </div>
          <div className="bg-black/15 rounded-xl p-3">
            <div className="text-xs text-rose-200">Inactive / Hidden</div>
            <div className="text-2xl font-bold mt-0.5 text-rose-200">{inactiveCount}</div>
          </div>
          <div className="bg-black/15 rounded-xl p-3">
            <div className="text-xs text-amber-200">Temples & Ghats</div>
            <div className="text-2xl font-bold mt-0.5 text-amber-200">{templesCount + ghatsCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name (English / हिन्दी) or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-stone-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Categories ({places.length})</option>
            <option value="temple">Temples ({templesCount})</option>
            <option value="ghat">Ghats ({ghatsCount})</option>
            <option value="historical">Historical</option>
            <option value="culture">Cultural</option>
            <option value="museum">Museums</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-stone-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active (Visible)</option>
            <option value="inactive">Inactive (Hidden)</option>
            <option value="under_renovation">Under Renovation</option>
          </select>
        </div>

        <button
          onClick={fetchPlaces}
          className="p-2 border border-stone-300 hover:bg-stone-100 rounded-xl text-stone-600 transition-colors"
          title="Refresh from Database"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
        </button>
      </div>

      {/* Places List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500">
            <div className="inline-block animate-spin text-3xl mb-2">⌛</div>
            <p>Loading tourist locations from database...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <p className="text-lg font-medium text-stone-700">No locations found</p>
            <p className="text-sm mt-1">Try clearing filters or click "Reset Defaults" above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Place / Identity</th>
                  <th className="py-3 px-4">GPS Coordinates (Lat, Lng)</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Timings & Fees</th>
                  <th className="py-3 px-4 text-center">Map Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPlaces.map((place) => {
                  const isActive = (place.status || 'active') === 'active';
                  return (
                    <tr key={place.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-4 max-w-[280px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={place.image}
                            alt={place.name.en}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div className="truncate">
                            <div className="font-bold text-stone-900 truncate">{place.name.en}</div>
                            <div className="text-xs text-orange-800 font-medium truncate">{place.name.hi}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-stone-400 font-mono">ID: {place.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-mono text-xs text-stone-800 font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          <span>
                            {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
                          </span>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            place.category === 'temple'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : place.category === 'ghat'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {place.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-stone-600 max-w-[200px]">
                        <div className="truncate font-medium">{place.visitingHours?.en || 'Open daily'}</div>
                        <div className="text-[11px] text-stone-400 truncate mt-0.5">
                          {place.entryFee?.en || 'Free Entry'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(place)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : place.status === 'under_renovation'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                          title="Click to toggle active / inactive"
                        >
                          {isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-stone-500" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(place)}
                          className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(place)}
                          className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1"
                          title="Delete from database"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Location Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-200" />
                  <span>
                    {selectedPlace
                      ? `Edit Tourist Place: ${formData.name?.en || selectedPlace.id}`
                      : 'Add New Tourist Visiting Point'}
                  </span>
                </h3>
                <p className="text-xs text-orange-100 mt-0.5">
                  Update GPS coordinates, descriptions, photos, and operational timings in database
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-white/80 hover:text-white text-2xl font-light leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Names & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name?.en || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: { ...formData.name, en: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 font-medium"
                    placeholder="e.g. Shri Kashi Vishwanath Temple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Hindi Name (हिन्दी नाम) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name?.hi || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: { ...formData.name, hi: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 font-medium"
                    placeholder="उदा. श्री काशी विश्वनाथ मंदिर"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Category (श्रेणी) *
                  </label>
                  <select
                    value={formData.category || 'temple'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as PlaceCategory,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                  >
                    <option value="temple">Temple (मंदिर)</option>
                    <option value="ghat">Ghat (गंगा घाट)</option>
                    <option value="historical">Historical (ऐतिहासिक)</option>
                    <option value="culture">Cultural / Ashrams (सांस्कृतिक)</option>
                    <option value="museum">Museum (संग्रहालय)</option>
                  </select>
                </div>
              </div>

              {/* Subtitles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    English Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle?.en || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subtitle: { ...formData.subtitle, en: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="The Golden Temple of Lord Shiva & Sacred Jyotirlinga"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Hindi Subtitle (हिन्दी उपशीर्षक)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle?.hi || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subtitle: { ...formData.subtitle, hi: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="भगवान शिव का स्वर्णिम ज्योतिर्लिंग मंदिर"
                  />
                </div>
              </div>

              {/* GPS Coordinates Section (CRITICAL FOR USER REQUIREMENT) */}
              <div className="p-4 bg-amber-50/70 border border-amber-300/80 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-950">
                        GPS Coordinates (अक्षांश व देशांतर)
                      </h4>
                      <p className="text-xs text-amber-800">
                        मैप पर इस जगह का सटीक स्थान तय करता है। इसे बदलने पर नेविगेशन रूट तुरंत अपडेट होगा।
                      </p>
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-amber-800 font-semibold">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyCoordinatePreset('Godowlia', 25.3094, 83.0062)}
                      className="px-2 py-0.5 bg-white border border-amber-300 rounded-md hover:bg-amber-100 font-medium"
                    >
                      Godowlia
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCoordinatePreset('Dashashwamedh', 25.3072, 83.0104)}
                      className="px-2 py-0.5 bg-white border border-amber-300 rounded-md hover:bg-amber-100 font-medium"
                    >
                      Dashashwamedh
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCoordinatePreset('Assi Ghat', 25.2884, 83.0065)}
                      className="px-2 py-0.5 bg-white border border-amber-300 rounded-md hover:bg-amber-100 font-medium"
                    >
                      Assi
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCoordinatePreset('Sarnath', 25.3762, 83.0227)}
                      className="px-2 py-0.5 bg-white border border-amber-300 rounded-md hover:bg-amber-100 font-medium"
                    >
                      Sarnath
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Latitude (अक्षांश - e.g. 25.3109) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.coordinates?.lat ?? 25.3109}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coordinates: {
                            lat: parseFloat(e.target.value) || 0,
                            lng: formData.coordinates?.lng || 83.0104,
                          },
                        })
                      }
                      className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm font-mono font-bold bg-white focus:ring-2 focus:ring-orange-500"
                      placeholder="25.3109"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Longitude (देशांतर - e.g. 83.0107) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.coordinates?.lng ?? 83.0107}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coordinates: {
                            lat: formData.coordinates?.lat || 25.3109,
                            lng: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm font-mono font-bold bg-white focus:ring-2 focus:ring-orange-500"
                      placeholder="83.0107"
                    />
                  </div>
                </div>
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Image URL (तस्वीर का लिंक) *
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 font-mono"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-12 h-10 rounded-lg object-cover border border-stone-300 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Map Status (स्थिति)
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-white font-semibold focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Active (Visible on Map)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                    <option value="under_renovation">Under Renovation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Sequence / Order Number
                  </label>
                  <input
                    type="number"
                    value={formData.number || 1}
                    onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Suggested Visit Time (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.suggestedDurationMinutes || 45}
                    onChange={(e) =>
                      setFormData({ ...formData, suggestedDurationMinutes: parseInt(e.target.value) || 45 })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Timings & Entry Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Visiting Hours (English)
                  </label>
                  <input
                    type="text"
                    value={formData.visitingHours?.en || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visitingHours: { ...formData.visitingHours, en: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Open 05:00 AM - 09:00 PM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Visiting Hours (हिन्दी दर्शन समय)
                  </label>
                  <input
                    type="text"
                    value={formData.visitingHours?.hi || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visitingHours: { ...formData.visitingHours, hi: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="प्रातः 05:00 से रात्रि 09:00 बजे तक खुला"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Entry Fee (English)
                  </label>
                  <input
                    type="text"
                    value={formData.entryFee?.en || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        entryFee: { ...formData.entryFee, en: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Free Entry (VIP Sugam Darshan charges apply)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Entry Fee (हिन्दी प्रवेश शुल्क)
                  </label>
                  <input
                    type="text"
                    value={formData.entryFee?.hi || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        entryFee: { ...formData.entryFee, hi: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="निःशुल्क सामान्य दर्शन (सुगम दर्शन टिकट उपलब्ध)"
                  />
                </div>
              </div>

              {/* Short Intro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Short Intro (English)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.shortIntro?.en || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortIntro: { ...formData.shortIntro, en: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Overview of this pilgrimage spot..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Short Intro (हिन्दी संक्षिप्त परिचय)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.shortIntro?.hi || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortIntro: { ...formData.shortIntro, hi: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="इस तीर्थ स्थल का संक्षिप्त परिचय..."
                  />
                </div>
              </div>

              {/* Historical Background */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Historical Background (English)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.historicalBackground?.en || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicalBackground: { ...formData.historicalBackground, en: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Historical chronicles, builders, period..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Historical Background (हिन्दी ऐतिहासिक पृष्ठभूमि)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.historicalBackground?.hi || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicalBackground: { ...formData.historicalBackground, hi: e.target.value } as any,
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="ऐतिहासिक पृष्ठभूमि, निर्माणकर्ता, कालखंड..."
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
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                {saving ? 'Saving to Database...' : 'Save Tourist Place'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
