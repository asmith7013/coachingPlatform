'use client';

import { useState, useEffect } from 'react';

type CurriculumVersion = 'KH' | 'ILC' | 'ILC_HS';

export function usePersistedCurriculumVersion(defaultVersion: CurriculumVersion = 'KH') {
  const [version, setVersion] = useState<CurriculumVersion>(defaultVersion);
  
  useEffect(() => {
    const storedVersion = localStorage.getItem('curriculumVersion');
    if (storedVersion && (storedVersion === 'KH' || storedVersion === 'ILC' || storedVersion === 'ILC_HS')) {
      setVersion(storedVersion as CurriculumVersion);
    }
  }, []);
  
  const setCurriculumVersion = (newVersion: CurriculumVersion) => {
    setVersion(newVersion);
    localStorage.setItem('curriculumVersion', newVersion);
  };
  
  return [version, setCurriculumVersion] as const;
} 