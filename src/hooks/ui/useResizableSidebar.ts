import { useState, useCallback, useRef, useEffect } from "react";

interface UseResizableSidebarProps {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
}

export function useResizableSidebar({
  defaultWidth = 256, // 16rem in pixels
  minWidth = 200, // ~12.5rem
  maxWidth = 400, // 25rem
  storageKey = "sidebar-width",
}: UseResizableSidebarProps = {}) {
  // Get initial width from localStorage or use default
  const getInitialWidth = () => {
    if (typeof window === "undefined") return defaultWidth;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = parseInt(stored, 10);
      return Math.min(Math.max(parsed, minWidth), maxWidth);
    }
    return defaultWidth;
  };

  const [sidebarWidth, setSidebarWidth] = useState(getInitialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(sidebarWidth);

  // Save width to localStorage
  const saveWidth = useCallback(
    (width: number) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, width.toString());
      }
    },
    [storageKey],
  );

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = sidebarWidth;

      // Add body styles to prevent text selection during resize
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [sidebarWidth],
  );

  // Handle mouse move during resize
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.min(
        Math.max(startWidthRef.current + deltaX, minWidth),
        maxWidth,
      );

      setSidebarWidth(newWidth);
    },
    [isResizing, minWidth, maxWidth],
  );

  // Handle mouse up (end resize)
  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // Save the new width
    saveWidth(sidebarWidth);
  }, [isResizing, sidebarWidth, saveWidth]);

  // Add global mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Reset to default width
  const resetWidth = useCallback(() => {
    setSidebarWidth(defaultWidth);
    saveWidth(defaultWidth);
  }, [defaultWidth, saveWidth]);

  return {
    sidebarWidth,
    isResizing,
    handleMouseDown,
    resetWidth,
    // Helper values for styling
    sidebarStyle: { width: `${sidebarWidth}px` },
    isAtMinWidth: sidebarWidth <= minWidth,
    isAtMaxWidth: sidebarWidth >= maxWidth,
  };
}
