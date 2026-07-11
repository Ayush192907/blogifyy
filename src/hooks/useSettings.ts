import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(s => { if (s.value) map[s.key] = s.value; });
        setSettings(map);
      }
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
