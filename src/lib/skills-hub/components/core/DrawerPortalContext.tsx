"use client";

import { createContext, useContext, useState } from "react";

const DrawerPortalContext = createContext<HTMLDivElement | null>(null);

export function DrawerPortalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);

  return (
    <DrawerPortalContext.Provider value={target}>
      {children}
      <div ref={setTarget} />
    </DrawerPortalContext.Provider>
  );
}

export function useDrawerPortal() {
  return useContext(DrawerPortalContext);
}
