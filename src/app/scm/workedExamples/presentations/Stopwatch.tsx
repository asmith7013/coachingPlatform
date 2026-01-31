"use client";

import { useEffect, useRef, useState, useCallback } from "react";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface StopwatchProps {
  /** Current slide index — resets the slide timer on change */
  currentSlide: number;
  /** Whether the stopwatch is active (modal open) */
  isActive: boolean;
}

export function Stopwatch({ currentSlide, isActive }: StopwatchProps) {
  const [totalMs, setTotalMs] = useState(0);
  const [slideMs, setSlideMs] = useState(0);
  const slideStartRef = useRef(Date.now());
  const totalStartRef = useRef(Date.now());

  // Reset slide timer when slide changes
  useEffect(() => {
    slideStartRef.current = Date.now();
    setSlideMs(0);
  }, [currentSlide]);

  // Tick every second
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setTotalMs(now - totalStartRef.current);
      setSlideMs(now - slideStartRef.current);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const resetAll = useCallback(() => {
    const now = Date.now();
    totalStartRef.current = now;
    slideStartRef.current = now;
    setTotalMs(0);
    setSlideMs(0);
  }, []);

  // Reset when becoming active
  useEffect(() => {
    if (isActive) {
      resetAll();
    }
  }, [isActive, resetAll]);

  return (
    <div className="flex items-center gap-3 bg-gray-700 px-3 h-10 rounded-full">
      <svg
        className="w-4 h-4 text-gray-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </svg>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Slide</span>
        <span className="text-sm font-medium text-white font-mono">
          {formatTime(slideMs)}
        </span>
      </div>
      <div className="w-px h-4 bg-gray-500" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Total</span>
        <span className="text-sm font-medium text-white font-mono">
          {formatTime(totalMs)}
        </span>
      </div>
    </div>
  );
}
