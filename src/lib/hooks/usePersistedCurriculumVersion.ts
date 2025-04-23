import { useEffect, useState } from 'react';

type Version = 'KH' | 'ILC';
const STORAGE_KEY = 'curriculumVersion';

export function usePersistedCurriculumVersion() {
  const [version, setVersionState] = useState<Version | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'KH' || saved === 'ILC') {
        setVersionState(saved);
      }
    } catch (error) {
      console.warn('🚨 Failed to load curriculumVersion from localStorage:', error);
    }
  }, []);

  const setVersion = (newVersion: Version) => {
    try {
      setVersionState(newVersion);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newVersion);
      }
    } catch (error) {
      console.warn('🚨 Failed to save curriculumVersion to localStorage:', error);
    }
  };

  if (!hasMounted) return [null, setVersion] as const;

  return [version, setVersion] as const;
} 