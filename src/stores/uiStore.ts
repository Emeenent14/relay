import { create } from 'zustand';
import type { Server } from '../types/server';
import type { MarketplaceServer } from '../services/marketplace';

type DialogType = 'add' | 'edit' | 'delete' | 'logs' | null;

interface UIState {
    currentPage: 'servers' | 'inspector' | 'marketplace' | 'settings';
    activeDialog: DialogType;
    dialogServer: Server | null;
    marketplaceData: MarketplaceServer | null;

    // Actions
    setCurrentPage: (page: 'servers' | 'inspector' | 'marketplace' | 'settings') => void;
    openAddDialog: (data?: MarketplaceServer) => void;
    openEditDialog: (server: Server) => void;
    openDeleteDialog: (server: Server) => void;
    openLogsDialog: (server: Server) => void;
    closeDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    currentPage: 'servers',
    activeDialog: null,
    dialogServer: null,
    marketplaceData: null,

    setCurrentPage: (page) => {
        set({ currentPage: page });
    },

    openAddDialog: (data?: MarketplaceServer) => {
        set({ activeDialog: 'add', dialogServer: null, marketplaceData: data || null });
    },

    openEditDialog: (server: Server) => {
        set({ activeDialog: 'edit', dialogServer: server, marketplaceData: null });
    },

    openDeleteDialog: (server: Server) => {
        set({ activeDialog: 'delete', dialogServer: server, marketplaceData: null });
    },

    openLogsDialog: (server: Server) => {
        set({ activeDialog: 'logs', dialogServer: server, marketplaceData: null });
    },

    closeDialog: () => {
        set({ activeDialog: null, dialogServer: null, marketplaceData: null });
    },
}));
