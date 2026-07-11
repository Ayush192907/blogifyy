import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Ad } from '../../lib/types';
import { Plus, Edit2 } from 'lucide-react';

const PREDEFINED_SLOTS = [
  { value: 'top_leaderboard', label: 'Top Leaderboard (728x90)', width: 728, height: 90 },
  { value: 'sidebar_1', label: 'Sidebar Medium Rectangle (300x250)', width: 300, height: 250 },
  { value: 'sidebar_2', label: 'Sidebar Half Page (300x600)', width: 300, height: 600 },
  { value: 'in_content_1', label: 'In Content 1 (728x90)', width: 728, height: 90 },
  { value: 'in_content_2', label: 'In Content 2 (728x90)', width: 728, height: 90 },
  { value: 'footer_ad', label: 'Footer Ad (728x90)', width: 728, height: 90 },
];

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit State
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  // Form State
  const [slotName, setSlotName] = useState('top_leaderboard');
  const [label, setLabel] = useState('');
  const [code, setCode] = useState('');
  const [width, setWidth] = useState<number>(728);
  const [height, setHeight] = useState<number>(90);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setLoading(true);
    const { data } = await supabase.from('ads').select('*').order('slot_name');
    if (data) setAds(data as Ad[]);
    setLoading(false);
  }

  const handleEditSelect = (ad: Ad) => {
    setEditingAd(ad);
    setSlotName(ad.slot_name);
    setLabel(ad.label);
    setCode(ad.code || '');
    setWidth(ad.width || 728);
    setHeight(ad.height || 90);
    setEnabled(ad.enabled);
  };

  const handleCancelEdit = () => {
    setEditingAd(null);
    setSlotName('top_leaderboard');
    setLabel('');
    setCode('');
    setWidth(728);
    setHeight(90);
    setEnabled(true);
  };

  const handleSlotSelectChange = (val: string) => {
    setSlotName(val);
    const predefined = PREDEFINED_SLOTS.find(s => s.value === val);
    if (predefined) {
      setWidth(predefined.width);
      setHeight(predefined.height);
      setLabel(predefined.label.split(' (')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotName.trim() || !label.trim()) return;
    setSaving(true);

    const payload = {
      slot_name: slotName.trim(),
      label: label.trim(),
      code: code.trim() || null,
      width,
      height,
      enabled,
    };

    if (editingAd) {
      const { error } = await supabase
        .from('ads')
        .update(payload)
        .eq('id', editingAd.id);

      if (error) {
        alert('Error updating ad slot: ' + error.message);
      } else {
        fetchAds();
        handleCancelEdit();
      }
    } else {
      const { error } = await supabase.from('ads').insert(payload);

      if (error) {
        alert('Error creating ad slot: ' + error.message);
      } else {
        fetchAds();
        handleCancelEdit();
      }
    }
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Ads List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-800 dark:text-white text-base">Ad Slots</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No ad slots configured. Use the form to configure predefined slots.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Slot Identifier</th>
                    <th className="px-6 py-4">Display Label</th>
                    <th className="px-6 py-4">Size (WxH)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                  {ads.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100 font-mono text-xs">
                        {ad.slot_name}
                      </td>
                      <td className="px-6 py-4">
                        {ad.label}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-500">
                        {ad.width && ad.height ? `${ad.width} x ${ad.height}` : 'Responsive'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            ad.enabled
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {ad.enabled ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditSelect(ad)}
                          className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 hover:text-blue-700 transition-colors"
                          title="Configure Ad"
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="lg:col-span-1">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-4 sticky top-24"
        >
          <h3 className="font-bold text-gray-800 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-2">
            {editingAd ? 'Configure Slot' : 'Create Ad Slot'}
          </h3>

          <div className="space-y-1">
            <label htmlFor="slotName" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Ad Slot Name
            </label>
            {editingAd ? (
              <input
                type="text"
                id="slotName"
                readOnly
                value={slotName}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-gray-400 rounded-lg text-xs font-mono focus:outline-none"
              />
            ) : (
              <select
                id="slotName"
                value={slotName}
                onChange={(e) => handleSlotSelectChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none"
              >
                {PREDEFINED_SLOTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="label" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Display Label
            </label>
            <input
              type="text"
              id="label"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none font-semibold"
              placeholder="e.g. Header Leaderboard"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="width" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Width (px)
              </label>
              <input
                type="number"
                id="width"
                value={width || ''}
                onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="height" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Height (px)
              </label>
              <input
                type="number"
                id="height"
                value={height || ''}
                onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="code" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              HTML / AdSense Code
            </label>
            <textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-xs font-mono focus:outline-none resize-y"
              placeholder="<!-- Insert AdSense or HTML script code here -->"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Enable Ad Slot
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-60"
            >
              <Plus size={16} /> {saving ? 'Saving...' : editingAd ? 'Update Ad' : 'Create Ad'}
            </button>
            {editingAd && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
