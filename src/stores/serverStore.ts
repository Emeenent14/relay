import { create } from 'zustand';
import { serverApi } from '../lib/tauri';
import type { Server, CreateServerInput, UpdateServerInput } from '../types/server';
import { listen } from '@tauri-apps/api/event';

interface LogEntry {
    id: string;
    name: string;
    stream: 'stdout' | 'stderr';
    message: string;
    timestamp: string;
}

interface ServerState {
    servers: Server[];
    logs: Record<string, LogEntry[]>;
    loading: boolean;
    error: string | null;
    selectedServerId: string | null;

    // Actions
    fetchServers: () => Promise<void>;
    syncServers: () => Promise<void>;
    createServer: (input: CreateServerInput) => Promise<Server>;
    updateServer: (input: UpdateServerInput) => Promise<Server>;
    deleteServer: (id: string) => Promise<void>;
    toggleServer: (id: string) => Promise<Server>;
    selectServer: (id: string | null) => void;
    clearError: () => void;
    addLog: (log: LogEntry) => void;
    clearLogs: (serverId: string) => void;
}

export const useServerStore = create<ServerState>((set, get) => ({
    servers: [],
    logs: {},
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

    syncServers: async () => {
        try {
            await serverApi.sync();
            await get().fetchServers();
        } catch (error) {
            console.error('Failed to sync servers:', error);
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

    addLog: (log) => {
        set((state) => {
            const serverLogs = [...(state.logs[log.id] || [])];
            serverLogs.push(log);
            // Keep only last 1000 logs
            if (serverLogs.length > 1000) {
                serverLogs.shift();
            }
            return {
                logs: {
                    ...state.logs,
                    [log.id]: serverLogs,
                },
            };
        });
    },

    clearLogs: (serverId) => {
        set((state) => ({
            logs: {
                ...state.logs,
                [serverId]: [],
            },
        }));
    },
}));

// Initialize log listener
listen<LogEntry>('server-log', (event) => {
    useServerStore.getState().addLog(event.payload);
});
