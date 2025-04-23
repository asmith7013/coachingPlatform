import { useState, useEffect } from 'react';

const STORAGE_KEY = 'curriculumVersion';

type Version = "ILC" | "KH" | null;

export function usePersistedCurriculumVersion(defaultVersion: Version = null) {
  const [version, setVersion] = useState<Version>(defaultVersion);

  useEffect(() => {
    // Load saved version from localStorage on initial mount
    const savedVersion = localStorage.getItem(STORAGE_KEY) as Version;
    if (savedVersion) {
      setVersion(savedVersion);
    }
  }, []);

  const updateVersion = (newVersion: Version) => {
    setVersion(newVersion);
    
    // Save to localStorage
    if (newVersion) {
      localStorage.setItem(STORAGE_KEY, newVersion);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return [version, updateVersion] as const;
} 