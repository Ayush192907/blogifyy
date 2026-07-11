import { useRef, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3, Type,
  List, ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Trash, Undo, Redo, Eye, Edit3, Loader2
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const ref = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Undo/Redo history tracking
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Keep history in sync if value is edited from parent outside the editor (e.g. post loading)
  useEffect(() => {
    if (value !== history[historyIndex]) {
      setHistory([value]);
      setHistoryIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const updateValue = (newVal: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newVal]);
    setHistoryIndex(newHistory.length);
    onChange(newVal);
  };

  const insert = (before: string, after = '', defaultText = '') => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || defaultText;
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
    updateValue(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleLinkInsert = () => {
    const url = prompt('Enter the link URL (e.g., https://example.com):');
    if (!url) return;
    const text = prompt('Enter link display text:', 'Link');
    insert(
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">`,
      '</a>',
      text || 'Link'
    );
  };

  const handleImageInsert = () => {
    const choice = confirm('Press OK to upload an image from your computer, or Cancel to enter an image URL.');
    if (choice) {
      if (imageInputRef.current) {
        imageInputRef.current.click();
      }
    } else {
      const url = prompt('Enter image URL:');
      if (url) {
        insert(`<img src="${url}" alt="image" class="rounded-xl shadow-sm max-w-full my-4 mx-auto object-cover" />\n`, '');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validation
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    if (!allowedExts.includes(fileExt || '')) {
      alert('Only JPG, JPEG, PNG, WEBP, GIF, and SVG images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `editor_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        insert(`<img src="${data.publicUrl}" alt="${file.name}" class="rounded-xl shadow-sm max-w-full my-4 mx-auto object-cover" />\n`, '');
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleClearFormatting = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const cleaned = selected.replace(/<\/?[^>]+(>|$)/g, '');
    const newVal = value.slice(0, start) + cleaned + value.slice(end);
    updateValue(newVal);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevVal = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextVal = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(nextVal);
    }
  };

  const toolbarGroups = [
    {
      label: 'Format',
      items: [
        { icon: Heading1, title: 'Heading 1', action: () => insert('<h1>', '</h1>', 'Heading 1') },
        { icon: Heading2, title: 'Heading 2', action: () => insert('<h2>', '</h2>', 'Heading 2') },
        { icon: Heading3, title: 'Heading 3', action: () => insert('<h3>', '</h3>', 'Heading 3') },
        { icon: Type, title: 'Paragraph', action: () => insert('<p>', '</p>', 'Paragraph') },
      ]
    },
    {
      label: 'Inline',
      items: [
        { icon: Bold, title: 'Bold', action: () => insert('<strong>', '</strong>', 'Bold text') },
        { icon: Italic, title: 'Italic', action: () => insert('<em>', '</em>', 'Italic text') },
        { icon: Underline, title: 'Underline', action: () => insert('<u>', '</u>', 'Underlined text') },
      ]
    },
    {
      label: 'Blocks',
      items: [
        { icon: List, title: 'Bullet List', action: () => insert('<ul>\n  <li>', '</li>\n</ul>', 'List Item') },
        { icon: ListOrdered, title: 'Numbered List', action: () => insert('<ol>\n  <li>', '</li>\n</ol>', 'List Item') },
        { icon: Quote, title: 'Blockquote', action: () => insert('<blockquote>', '</blockquote>', 'Quote text') },
        { icon: Code, title: 'Code Block', action: () => insert('<pre><code>', '</code></pre>', 'Code goes here') },
      ]
    },
    {
      label: 'Alignment',
      items: [
        { icon: AlignLeft, title: 'Align Left', action: () => insert('<div class="text-left">', '</div>') },
        { icon: AlignCenter, title: 'Align Center', action: () => insert('<div class="text-center">', '</div>') },
        { icon: AlignRight, title: 'Align Right', action: () => insert('<div class="text-right">', '</div>') },
      ]
    },
    {
      label: 'Media',
      items: [
        { icon: LinkIcon, title: 'Insert Link', action: handleLinkInsert },
        { icon: ImageIcon, title: 'Insert Image', action: handleImageInsert },
      ]
    },
    {
      label: 'History & Clean',
      items: [
        { icon: Undo, title: 'Undo', action: handleUndo, disabled: historyIndex === 0 },
        { icon: Redo, title: 'Redo', action: handleRedo, disabled: historyIndex === history.length - 1 },
        { icon: Trash, title: 'Clear Formatting', action: handleClearFormatting },
      ]
    }
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-800">
      {/* Hidden File Input for images */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 select-none">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 flex-1 min-w-0">
          {toolbarGroups.map((group) => (
            <div key={group.label} className="flex items-center gap-0.5 border-r border-gray-200 dark:border-gray-600 last:border-0 pr-2 last:pr-0">
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    type="button"
                    title={item.title}
                    onClick={item.action}
                    disabled={item.disabled}
                    className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
          ))}
          {uploadingImage && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> Uploading image...
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border-t sm:border-t-0 border-gray-200 dark:border-gray-600 pt-2 sm:pt-0 justify-end flex-shrink-0">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              mode === 'edit'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Edit3 size={12} /> HTML Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              mode === 'preview'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Eye size={12} /> Rich Preview
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {mode === 'edit' ? (
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'Start writing in HTML or use toolbar options above...'}
          className="w-full p-4 text-sm font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 min-h-[400px] max-h-[600px] resize-y focus:outline-none"
          spellCheck={false}
        />
      ) : (
        <div
          className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto prose dark:prose-invert max-w-none prose-sm sm:prose-base bg-white dark:bg-gray-800 dark:text-gray-300 whitespace-normal"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400 dark:text-gray-500 italic">No content to preview yet.</p>' }}
        />
      )}
    </div>
  );
}
