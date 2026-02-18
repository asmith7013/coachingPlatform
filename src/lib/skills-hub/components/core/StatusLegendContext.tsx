"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface StatusLegendContextValue {
  visible: boolean;
  show: () => void;
  hide: () => void;
}

const StatusLegendContext = createContext<StatusLegendContextValue>({
  visible: false,
  show: () => {},
  hide: () => {},
});

export function StatusLegendProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  return (
    <StatusLegendContext.Provider value={{ visible, show, hide }}>
      {children}
    </StatusLegendContext.Provider>
  );
}

export function useStatusLegend() {
  return useContext(StatusLegendContext);
}
