/**
 * Marketplace Service
 * 
 * Fetches MCP servers from Docker Hub (241+ servers) and MCP Registry
 * using Tauri backend to bypass CORS restrictions.
 */

import { invoke } from '@tauri-apps/api/core';

export interface MarketplaceServer {
    id: string;
    name: string;
    description: string;
    command: string;
    args: string[];
    envVariables: string[];
    author: string;
    sourceUrl: string;
    category: string;
    iconUrl?: string;
    source: 'docker' | 'registry' | 'catalog';
    verified: boolean;
    packageName: string;
    requiresConfig: boolean;
    pullCount?: number;
    starCount?: number;
}

export const marketplaceService = {
    /**
     * Fetch servers from Docker Hub + Registry via Tauri backend
     * Returns empty array if nothing found - NO MOCK DATA
     */
    async fetchServers(query: string = '', page: number = 1): Promise<MarketplaceServer[]> {
        // Only fetch on first page
        if (page > 1) {
            return [];
        }

        try {
            console.log('Fetching marketplace servers via Tauri:', query);
            const servers = await invoke<MarketplaceServer[]>('fetch_marketplace_servers', { query });
            console.log(`Fetched ${servers.length} marketplace servers`);
            return servers;
        } catch (error) {
            console.error('Failed to fetch marketplace servers:', error);
            return [];
        }
    },
};
