import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Server } from '../types/server';
import type { MarketplaceServer } from '../services/marketplace';

type DialogType = 'add' | 'delete' | 'logs' | null;

interface UIState {
    currentPage: 'servers' | 'inspector' | 'marketplace' | 'settings' | 'server-details';
    activeDialog: DialogType;
    dialogServer: Server | null;
    selectedServerId: string | null;
    marketplaceData: MarketplaceServer | null;
    hasSeenTour: boolean;

    // Actions
    setCurrentPage: (page: 'servers' | 'inspector' | 'marketplace' | 'settings' | 'server-details') => void;
    viewServer: (serverId: string) => void;
    openAddDialog: (data?: MarketplaceServer) => void;
    openDeleteDialog: (server: Server) => void;
    openLogsDialog: (server: Server) => void;
    closeDialog: () => void;
    completeTour: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            currentPage: 'servers',
            activeDialog: null,
            dialogServer: null,
            selectedServerId: null,
            marketplaceData: null,
            hasSeenTour: false,

            setCurrentPage: (page) => {
                set({ currentPage: page });
            },

            viewServer: (serverId: string) => {
                set({
                    currentPage: 'server-details',
                    selectedServerId: serverId,
                    activeDialog: null // Close any open dialogs
                });
            },

            openAddDialog: (data?: MarketplaceServer) => {
                set({ activeDialog: 'add', dialogServer: null, marketplaceData: data || null });
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

            completeTour: () => {
                set({ hasSeenTour: true });
            },
        }),
        {
            name: 'ui-storage',
            partialize: (state) => ({ hasSeenTour: state.hasSeenTour }),
        }
    )
);
