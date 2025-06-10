import { useState, useCallback } from 'react';

export function useSectionToggle<T extends Record<string, boolean>>(
  initialState: T
) {
  const [sections, setSections] = useState(initialState);
  
  const toggle = useCallback((section: keyof T) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);
  
  const expandAll = useCallback(() => {
    setSections(prev => Object.keys(prev).reduce((acc, key) => ({
      ...acc, [key]: true
    }), {} as T));
  }, []);
  
  const collapseAll = useCallback(() => {
    setSections(prev => Object.keys(prev).reduce((acc, key) => ({
      ...acc, [key]: false
    }), {} as T));
  }, []);
  
  return { sections, toggle, expandAll, collapseAll };
} 