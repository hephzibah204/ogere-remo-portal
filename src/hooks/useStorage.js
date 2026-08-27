import { useState, useEffect, useCallback } from 'react';
import { dbGet, dbSet } from '../services/storage';

export function useStorage(key, fallback = null) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await dbGet(key);
      setData(stored ?? fallback);
      setLoading(false);
    })();
  }, [key]);

  const save = useCallback(async (value) => {
    setData(value);
    await dbSet(key, value);
  }, [key]);

  return [data, save, loading];
}
