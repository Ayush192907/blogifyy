import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Ad } from '../../lib/types';

interface AdSlotProps {
  slotName: string;
  className?: string;
}

export default function AdSlot({ slotName, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    supabase
      .from('ads')
      .select('*')
      .eq('slot_name', slotName)
      .single()
      .then(({ data }) => setAd(data));
  }, [slotName]);

  if (!ad || !ad.enabled) return null;

  const w = ad.width ?? 728;
  const h = ad.height ?? 90;
  const isLeaderboard = h <= 90;
  const isSidebar = w <= 300;

  if (ad.code && ad.code.trim()) {
    return (
      <div className={`ad-slot ${className}`}>
        <p className="text-xs text-gray-400 text-center mb-1 uppercase tracking-wider">Advertisement</p>
        <div dangerouslySetInnerHTML={{ __html: ad.code }} />
      </div>
    );
  }

  return (
    <div className={`ad-slot ${className}`}>
      <p className="text-xs text-gray-400 text-center mb-1 uppercase tracking-wider">Advertisement</p>
      <div
        className={`flex items-center justify-center border-2 border-dashed rounded-lg mx-auto ${
          isSidebar
            ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800'
            : 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800'
        }`}
        style={{ width: '100%', maxWidth: w, height: h }}
      >
        <div className="text-center">
          <p className={`font-semibold text-sm ${isSidebar ? 'text-green-600' : 'text-amber-600'}`}>
            {ad.label}
          </p>
          {isLeaderboard && (
            <p className="text-xs text-gray-500 mt-1">Top of Page – Best Performing Ad Position</p>
          )}
          {isSidebar && (
            <p className="text-xs text-gray-500 mt-1">High Visibility · Good CTR</p>
          )}
        </div>
      </div>
    </div>
  );
}
