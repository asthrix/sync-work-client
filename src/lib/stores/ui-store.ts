import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  commandMenuOpen: boolean;
  notificationsOpen: boolean;
  mobileMenuOpen: boolean;
  
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setCommandMenuOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  commandMenuOpen: false,
  notificationsOpen: false,
  mobileMenuOpen: false,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));
