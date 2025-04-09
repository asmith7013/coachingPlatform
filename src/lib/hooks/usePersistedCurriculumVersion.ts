import { useState } from 'react';

type Version = 'KH' | 'ILC';
const STORAGE_KEY = 'curriculumVersion';

export function usePersistedCurriculumVersion() {
  const [version, setVersionState] = useState<Version | null>(() => {
    // Initialize from localStorage if available (only runs on mount)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'KH' || saved === 'ILC') {
        return saved;
      }
    }
    return null;
  });

  const setVersion = (newVersion: Version) => {
    setVersionState(newVersion);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newVersion);
    }
  };

  return [version, setVersion] as const;
} 