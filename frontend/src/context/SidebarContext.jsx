import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((s) => !s);
  const close = () => setOpen(false);
  const value = { open, toggle, close };

  // Listen for global toggle events (dispatched by HeaderBar)
  useEffect(() => {
    const handler = () => toggle();
    window.addEventListener('toggleSidebar', handler);
    return () => window.removeEventListener('toggleSidebar', handler);
  }, []);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export default SidebarContext;
