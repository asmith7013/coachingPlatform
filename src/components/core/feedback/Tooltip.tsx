"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  maxWidth?: number;
  /** When true, clicking the trigger pins the tooltip open so text can be selected/copied */
  clickable?: boolean;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 100,
  maxWidth = 300,
  clickable = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (isPinned) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (isPinned) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!clickable) return;
      e.stopPropagation();
      if (isPinned) {
        setIsPinned(false);
        setIsVisible(false);
      } else {
        setIsPinned(true);
        setIsVisible(true);
      }
    },
    [clickable, isPinned],
  );

  // Dismiss pinned tooltip on click outside or Escape
  useEffect(() => {
    if (!isPinned) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsPinned(false);
        setIsVisible(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPinned(false);
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPinned]);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = triggerRect.top - tooltipRect.height - 8;
          left =
            triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case "bottom":
          top = triggerRect.bottom + 8;
          left =
            triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case "left":
          top =
            triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case "right":
          top =
            triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.right + 8;
          break;
      }

      // Keep tooltip within viewport
      const padding = 8;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }

      setCoords({ top, left });
    }
  }, [isVisible, position, isPinned]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) {
    return <>{children}</>;
  }

  const isShown = isVisible || isPinned;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={handleClick}
        className="inline-block"
      >
        {children}
      </div>
      {isShown &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`fixed z-50 px-2 py-1.5 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-pre-wrap ${
              isPinned ? "select-text cursor-text ring-1 ring-white/30" : ""
            }`}
            style={{
              top: coords.top,
              left: coords.left,
              maxWidth,
            }}
          >
            {isPinned && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPinned(false);
                  setIsVisible(false);
                }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-full text-[10px] leading-none cursor-pointer"
              >
                ×
              </button>
            )}
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
