import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Check } from 'lucide-react';
import ImageUploader from '../../components/admin/ImageUploader';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Setting States
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [footerAbout, setFooterAbout] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data } = await supabase.from('site_settings').select('*');

    if (data) {
      data.forEach((setting: { key: string; value: string | null }) => {
        const val = setting.value || '';
        switch (setting.key) {
          case 'site_name':
            setSiteName(val);
            break;
          case 'site_description':
            setSiteDescription(val);
            break;
          case 'logo_url':
            setLogoUrl(val);
            break;
          case 'favicon_url':
            setFaviconUrl(val);
            break;
          case 'footer_about':
            setFooterAbout(val);
            break;
          case 'social_facebook':
            setFacebook(val);
            break;
          case 'social_twitter':
            setTwitter(val);
            break;
          case 'social_instagram':
            setInstagram(val);
            break;
          case 'social_linkedin':
            setLinkedin(val);
            break;
          case 'social_youtube':
            setYoutube(val);
            break;
          default:
            break;
        }
      });
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const settingsArray = [
      { key: 'site_name', value: siteName.trim() },
      { key: 'site_description', value: siteDescription.trim() },
      { key: 'logo_url', value: logoUrl.trim() },
      { key: 'favicon_url', value: faviconUrl.trim() },
      { key: 'footer_about', value: footerAbout.trim() },
      { key: 'social_facebook', value: facebook.trim() },
      { key: 'social_twitter', value: twitter.trim() },
      { key: 'social_instagram', value: instagram.trim() },
      { key: 'social_linkedin', value: linkedin.trim() },
      { key: 'social_youtube', value: youtube.trim() },
    ];

    const { error } = await supabase
      .from('site_settings')
      .upsert(settingsArray, { onConflict: 'key' });

    if (error) {
      alert('Error saving settings: ' + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Top Save button */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <p className="text-xs text-gray-500 dark:text-gray-400">Configure global metadata and links</p>
        <div className="flex items-center gap-2">
          {success && (
            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <Check size={14} /> Settings Saved
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-2">
            General Configuration
          </h3>

          <div className="space-y-1">
            <label htmlFor="siteName" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Site Name
            </label>
            <input
              type="text"
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none"
              placeholder="e.g. Blogify"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="siteDesc" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Site Description
            </label>
            <textarea
              id="siteDesc"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none resize-none"
              placeholder="Meta description for home page..."
            />
          </div>

          <ImageUploader
            value={logoUrl}
            onChange={setLogoUrl}
            label="Logo Image"
            bucketName="blog-images"
            previewMode="contain"
            description="Recommended: 400×100px transparent PNG or SVG."
          />

          <ImageUploader
            value={faviconUrl}
            onChange={setFaviconUrl}
            label="Website Favicon"
            bucketName="blog-images"
            pathPrefix="favicons"
            previewMode="contain"
            acceptTypes={['ico']}
            description="Only ICO files accepted. Recommended: 32×32px or 192×192px."
          />

          <div className="space-y-1">
            <label htmlFor="footerAbout" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Footer Description
            </label>
            <textarea
              id="footerAbout"
              value={footerAbout}
              onChange={(e) => setFooterAbout(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none resize-none"
              placeholder="Short bio shown in footer..."
            />
          </div>
        </div>

        {/* Social Settings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-2">
            Social Media Links
          </h3>

          <div className="space-y-1">
            <label htmlFor="facebook" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Facebook URL
            </label>
            <input
              type="text"
              id="facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-xs font-mono focus:outline-none"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="twitter" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Twitter / X URL
            </label>
            <input
              type="text"
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-xs font-mono focus:outline-none"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="instagram" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Instagram URL
            </label>
            <input
              type="text"
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-xs font-mono focus:outline-none"
              placeholder="https://instagram.com/yourhandle"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="linkedin" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              LinkedIn URL
            </label>
            <input
              type="text"
              id="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-xs font-mono focus:outline-none"
              placeholder="https://linkedin.com/company/yourpage"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="youtube" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              YouTube Channel URL
            </label>
            <input
              type="text"
              id="youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-xs font-mono focus:outline-none"
              placeholder="https://youtube.com/c/yourchannel"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
