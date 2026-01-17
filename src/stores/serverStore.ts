import { create } from 'zustand';
import { serverApi } from '../lib/tauri';
import type { Server, CreateServerInput, UpdateServerInput } from '../types/server';

interface ServerState {
    servers: Server[];
    loading: boolean;
    error: string | null;
    selectedServerId: string | null;

    // Actions
    fetchServers: () => Promise<void>;
    createServer: (input: CreateServerInput) => Promise<Server>;
    updateServer: (input: UpdateServerInput) => Promise<Server>;
    deleteServer: (id: string) => Promise<void>;
    toggleServer: (id: string) => Promise<Server>;
    selectServer: (id: string | null) => void;
    clearError: () => void;
}

export const useServerStore = create<ServerState>((set) => ({
    servers: [],
    loading: false,
    error: null,
    selectedServerId: null,

    fetchServers: async () => {
        set({ loading: true, error: null });
        try {
            const servers = await serverApi.getAll();
            set({ servers, loading: false });
        } catch (error) {
            set({ error: String(error), loading: false });
        }
    },

    createServer: async (input) => {
        set({ error: null });
        try {
            const server = await serverApi.create(input);
            set((state) => ({ servers: [...state.servers, server] }));
            return server;
        } catch (error) {
            set({ error: String(error) });
            throw error;
        }
    },

    updateServer: async (input) => {
        set({ error: null });
        try {
            const server = await serverApi.update(input);
            set((state) => ({
                servers: state.servers.map((s) => (s.id === server.id ? server : s)),
            }));
            return server;
        } catch (error) {
            set({ error: String(error) });
            throw error;
        }
    },

    deleteServer: async (id) => {
        set({ error: null });
        try {
            await serverApi.delete(id);
            set((state) => ({
                servers: state.servers.filter((s) => s.id !== id),
                selectedServerId: state.selectedServerId === id ? null : state.selectedServerId,
            }));
        } catch (error) {
            set({ error: String(error) });
            throw error;
        }
    },

    toggleServer: async (id) => {
        set({ error: null });
        try {
            const server = await serverApi.toggle(id);
            set((state) => ({
                servers: state.servers.map((s) => (s.id === server.id ? server : s)),
            }));
            return server;
        } catch (error) {
            set({ error: String(error) });
            throw error;
        }
    },

    selectServer: (id) => {
        set({ selectedServerId: id });
    },

    clearError: () => {
        set({ error: null });
    },
}));
