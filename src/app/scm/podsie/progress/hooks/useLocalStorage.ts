import { useState, useEffect } from "react";

export function useLocalStorageString(key: string, defaultValue: string = "") {
  const [value, setValue] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key) || defaultValue;
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export function useLocalStorageNumber(
  key: string,
  defaultValue: number | null = null,
) {
  const [value, setValue] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(key);
      return stored ? parseInt(stored, 10) : defaultValue;
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (value !== null) {
        localStorage.setItem(key, value.toString());
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [key, value]);

  return [value, setValue] as const;
}
