import { create } from 'zustand';
import type { Server } from '../types/server';

type DialogType = 'add' | 'edit' | 'delete' | null;

interface UIState {
    currentPage: 'servers' | 'settings';
    activeDialog: DialogType;
    dialogServer: Server | null;

    // Actions
    setCurrentPage: (page: 'servers' | 'settings') => void;
    openAddDialog: () => void;
    openEditDialog: (server: Server) => void;
    openDeleteDialog: (server: Server) => void;
    closeDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    currentPage: 'servers',
    activeDialog: null,
    dialogServer: null,

    setCurrentPage: (page) => {
        set({ currentPage: page });
    },

    openAddDialog: () => {
        set({ activeDialog: 'add', dialogServer: null });
    },

    openEditDialog: (server) => {
        set({ activeDialog: 'edit', dialogServer: server });
    },

    openDeleteDialog: (server) => {
        set({ activeDialog: 'delete', dialogServer: server });
    },

    closeDialog: () => {
        set({ activeDialog: null, dialogServer: null });
    },
}));
