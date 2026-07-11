import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Category, Post } from '../../lib/types';
import { slugify, estimateReadingTime, formatDate } from '../../lib/utils';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { Save, ArrowLeft, Settings as SettingsIcon, Eye, X, AlertTriangle } from 'lucide-react';
import ImageUploader from '../../components/admin/ImageUploader';

export default function CreateEditPostPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  // Focus keyword for SEO auditing
  const [focusKeyword, setFocusKeyword] = useState('');

  // Unsaved changes warning trigger
  const [isDirty, setIsDirty] = useState(false);

  // For slug auto-generation control
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  // Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Unsaved changes browser warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  }

  async function fetchPost() {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      const post = data as Post;
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt || '');
      setContent(post.content || '');
      setFeaturedImage(post.featured_image || '');
      setCategoryId(post.category_id || '');
      setAuthor(post.author || 'Admin');
      setStatus(post.status);
      setFeatured(post.featured || false);
      setPopular(post.popular || false);
      setMetaTitle(post.meta_title || '');
      setMetaDescription(post.meta_description || '');
      setMetaKeywords(post.meta_keywords || '');
      setPublishedAt(post.published_at);
      setAutoSlug(false);
      setIsDirty(false); // Clean initially after fetching
    } else {
      alert('Error fetching post: ' + (error?.message || 'unknown error'));
      navigate('/admin/posts');
    }
    setLoading(false);
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setIsDirty(true);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(e.target.value));
    setAutoSlug(false);
    setIsDirty(true);
  };

  const handleValueChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setIsDirty(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Post Title is required';
    if (!slug.trim()) errors.slug = 'Slug is required';
    if (!content.trim()) errors.content = 'Post Body Content is required';
    if (!categoryId) errors.categoryId = 'Please select a Category';
    if (!author.trim()) errors.author = 'Author name is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please fill in all required fields marked with validation errors.');
      return;
    }

    setSaving(true);

    const readingTime = estimateReadingTime(content);
    let pubAt = publishedAt;
    if (status === 'published' && !pubAt) {
      pubAt = new Date().toISOString();
    } else if (status === 'draft') {
      pubAt = null;
    }

    const payload: Partial<Post> = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: content.trim() || null,
      featured_image: featuredImage.trim() || null,
      category_id: categoryId || null,
      author: author.trim() || 'Admin',
      status,
      featured,
      popular,
      reading_time: readingTime,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      meta_keywords: metaKeywords.trim() || null,
      published_at: pubAt,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (isEdit && id) {
      result = await supabase
        .from('posts')
        .update(payload)
        .eq('id', id);
    } else {
      result = await supabase
        .from('posts')
        .insert({
          ...payload,
          views: 0,
        });
    }

    if (result.error) {
      alert('Error saving post: ' + result.error.message);
    } else {
      setIsDirty(false); // Reset dirtiness before navigating
      navigate('/admin/posts');
    }
    setSaving(false);
  };

  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5174';
  const selectedCategoryName = categories.find(c => c.id === categoryId)?.name || 'Uncategorized';

  // SEO Audit Panel Calculations
  const hasFocus = focusKeyword.trim().length > 0;
  const kw = focusKeyword.toLowerCase().trim();

  const kwInTitle = hasFocus && title.toLowerCase().includes(kw);
  const kwInSlug = hasFocus && slug.toLowerCase().includes(kw.replace(/\s+/g, '-'));
  const kwInDesc = hasFocus && metaDescription.toLowerCase().includes(kw);
  const kwInContent = hasFocus && content.toLowerCase().includes(kw);

  const titleLength = metaTitle.length || title.length;
  const descLength = metaDescription.length || excerpt.length;

  const isTitleLengthOk = titleLength >= 50 && titleLength <= 60;
  const isDescLengthOk = descLength >= 140 && descLength <= 160;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/admin/posts"
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Posts
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Eye size={16} /> Preview
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>

        {/* Warnings & Alerts */}
        {isDirty && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 dark:bg-amber-900/10 dark:border-amber-800/30 dark:text-amber-400">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span>You have unsaved changes. Please save your post to prevent data loss.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-800 dark:text-white text-base">Content Editor</h2>

              {/* Title field */}
              <div className="space-y-1">
                <label htmlFor="title" className="text-xs font-bold text-gray-600 dark:text-gray-400 flex justify-between">
                  <span>Post Title <span className="text-red-500">*</span></span>
                  <span className={title.length > 60 ? 'text-red-500' : 'text-gray-400'}>{title.length} chars</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  className={`w-full px-3 py-2 bg-gray-50 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold ${
                    validationErrors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter title here..."
                />
                {validationErrors.title && (
                  <p className="text-red-500 text-[10px] font-bold mt-0.5">⚠️ {validationErrors.title}</p>
                )}
              </div>

              {/* Slug field */}
              <div className="space-y-1">
                <label htmlFor="slug" className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    id="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    className={`flex-1 px-3 py-2 bg-gray-50 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono ${
                      validationErrors.slug ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    placeholder="url-friendly-slug"
                  />
                  {!autoSlug && (
                    <button
                      type="button"
                      onClick={() => { setSlug(slugify(title)); setAutoSlug(true); }}
                      className="px-2.5 py-2 text-xs border border-gray-200 hover:bg-gray-100 rounded-lg dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Reset Auto
                    </button>
                  )}
                </div>
                {validationErrors.slug && (
                  <p className="text-red-500 text-[10px] font-bold mt-0.5">⚠️ {validationErrors.slug}</p>
                )}
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                  Preview: {siteUrl}/blogs/{slug || '...'}
                </p>
              </div>

              {/* Excerpt field */}
              <div className="space-y-1">
                <label htmlFor="excerpt" className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Excerpt / Brief Summary
                </label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => handleValueChange(setExcerpt, e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="A brief summary of the post..."
                />
              </div>

              {/* Body Content editor */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Body Content <span className="text-red-500">*</span>
                </label>
                <RichTextEditor value={content} onChange={(val) => handleValueChange(setContent, val)} />
                {validationErrors.content && (
                  <p className="text-red-500 text-[10px] font-bold mt-0.5">⚠️ {validationErrors.content}</p>
                )}
              </div>
            </div>

            {/* SEO Panel */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-700 pb-2">
                <SettingsIcon size={16} /> SEO & Snippet Configuration
              </h3>

              {/* Focus Keyword audit tool */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="space-y-1 md:col-span-1">
                  <label htmlFor="focusKeyword" className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    Focus Keyword
                  </label>
                  <input
                    type="text"
                    id="focusKeyword"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                    placeholder="Enter main target keyword..."
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Focus Keyword Audit</p>
                  {!hasFocus ? (
                    <p className="text-xs text-gray-400 italic">Enter a keyword to check occurrences.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${kwInTitle ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span>In Title: {kwInTitle ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${kwInSlug ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span>In Slug: {kwInSlug ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${kwInDesc ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span>In Meta Desc: {kwInDesc ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${kwInContent ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span>In Body: {kwInContent ? '✅' : '❌'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Inputs */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="metaTitle" className="text-xs font-bold text-gray-600 dark:text-gray-400 flex justify-between">
                    <span>Meta Title</span>
                    <span className={`text-[10px] font-semibold ${isTitleLengthOk ? 'text-green-600' : 'text-amber-500'}`}>
                      {titleLength} chars (Ideal: 50-60)
                    </span>
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => handleValueChange(setMetaTitle, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="For search engine results. Defaults to Title."
                  />
                  {titleLength > 60 && (
                    <p className="text-amber-500 text-[10px] font-bold">⚠️ Meta Title exceeds 60 characters and may get truncated.</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="metaDescription" className="text-xs font-bold text-gray-600 dark:text-gray-400 flex justify-between">
                    <span>Meta Description</span>
                    <span className={`text-[10px] font-semibold ${isDescLengthOk ? 'text-green-600' : 'text-amber-500'}`}>
                      {descLength} chars (Ideal: 140-160)
                    </span>
                  </label>
                  <textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => handleValueChange(setMetaDescription, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                    placeholder="Search snippet summary. Defaults to excerpt."
                  />
                  {descLength === 0 && (
                    <p className="text-amber-500 text-[10px] font-bold">⚠️ Warning: Meta Description is missing.</p>
                  )}
                  {descLength > 160 && (
                    <p className="text-amber-500 text-[10px] font-bold">⚠️ Meta Description exceeds 160 characters and may get truncated.</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="metaKeywords" className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    id="metaKeywords"
                    value={metaKeywords}
                    onChange={(e) => handleValueChange(setMetaKeywords, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="comma, separated, keywords"
                  />
                </div>
              </div>

              {/* Google Snippet Live Preview */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Google Search Snippet Preview</p>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-750 p-4 rounded-xl space-y-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                    {siteUrl}/blogs/{slug || 'your-slug-here'}
                  </div>
                  <div className="text-blue-700 dark:text-blue-400 hover:underline text-base font-medium leading-snug line-clamp-1 truncate">
                    {metaTitle || title || 'Post Title goes here'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {metaDescription || excerpt || 'Search snippet summary will be displayed here when meta description is entered.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar settings Column */}
          <div className="space-y-6">
            {/* Post Settings */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-2">
                Post Settings
              </h3>

              {/* Status select */}
              <div className="space-y-1">
                <label htmlFor="status" className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => handleValueChange(setStatus, e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Category select */}
              <div className="space-y-1">
                <label htmlFor="category" className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => handleValueChange(setCategoryId, e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-50 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none ${
                    validationErrors.categoryId ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {validationErrors.categoryId && (
                  <p className="text-red-500 text-[10px] font-bold mt-0.5">⚠️ {validationErrors.categoryId}</p>
                )}
              </div>

              {/* Author field */}
              <div className="space-y-1">
                <label htmlFor="author" className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => handleValueChange(setAuthor, e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-50 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none ${
                    validationErrors.author ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                />
                {validationErrors.author && (
                  <p className="text-red-500 text-[10px] font-bold mt-0.5">⚠️ {validationErrors.author}</p>
                )}
              </div>

              {/* Featured / Popular Toggles */}
              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => handleValueChange(setFeatured, e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Mark as Featured Post
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => handleValueChange(setPopular, e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Mark as Popular Post
                </label>
              </div>
            </div>

            {/* Media Settings */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-2">
                Featured Image
              </h3>

              <ImageUploader
                value={featuredImage}
                onChange={(val) => handleValueChange(setFeaturedImage, val)}
                label="Featured Image URL"
                bucketName="blog-images"
                previewMode="contain"
                description="Upload post featured thumbnail (ideal: 1200x630px JPG, PNG, WEBP)."
              />
            </div>
          </div>
        </div>
      </form>

      {/* Full Screen Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-gray-50 dark:bg-gray-900 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-850 flex justify-between items-center bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded">
                  Preview
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold truncate max-w-md">
                  {title || 'Untitled Post'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                {/* Meta details */}
                <div className="space-y-3">
                  <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full">
                    {selectedCategoryName}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                    {title || 'Post Title goes here'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400 font-semibold">
                    <span>By {author || 'Admin'}</span>
                    <span>•</span>
                    <span>{formatDate(new Date().toISOString())}</span>
                    <span>•</span>
                    <span>{estimateReadingTime(content)} min read</span>
                  </div>
                </div>

                {/* Featured Image preview */}
                {featuredImage && (
                  <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden shadow-sm">
                    <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Excerpt */}
                {excerpt && (
                  <div className="border-l-4 border-blue-500 pl-4 py-1 text-sm text-gray-500 dark:text-gray-400 italic">
                    {excerpt}
                  </div>
                )}

                {/* Body Content markup */}
                <div
                  className="prose dark:prose-invert max-w-none prose-sm sm:prose-base dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">Post body is empty.</p>' }}
                />
              </article>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
