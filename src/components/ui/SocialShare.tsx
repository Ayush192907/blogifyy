import { Share2, Twitter, Facebook, Link2 } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  title: string;
  url?: string;
}

export default function SocialShare({ title, url }: SocialShareProps) {
  const shareUrl = url || window.location.href;
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-sm text-gray-500 font-medium">
        <Share2 size={14} /> Share:
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
        title="Share on Twitter"
      >
        <Twitter size={16} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
        title="Share on Facebook"
      >
        <Facebook size={16} />
      </a>
      <button
        onClick={copyLink}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors"
        title="Copy link"
      >
        <Link2 size={16} />
      </button>
      {copied && <span className="text-xs text-green-600 font-medium">Copied!</span>}
    </div>
  );
}
