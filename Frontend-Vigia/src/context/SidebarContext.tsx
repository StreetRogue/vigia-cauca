import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'vigia-sidebar-collapsed';
/** Por debajo de este ancho la barra deja de ocupar espacio y pasa a superponerse. */
const COMPACT_BREAKPOINT = 900;

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
  close: () => {},
});

function readInitial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    // localStorage puede estar bloqueado (modo privado); se usa el ancho.
  }
  // Sin preferencia guardada: en pantallas angostas arranca recogida.
  return window.innerWidth < COMPACT_BREAKPOINT;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Sin persistencia: la preferencia dura lo que la sesión.
    }
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((value) => !value), []);
  const close = useCallback(() => setCollapsed(true), []);

  const value = useMemo(() => ({ collapsed, toggle, close }), [collapsed, toggle, close]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  return useContext(SidebarContext);
}
