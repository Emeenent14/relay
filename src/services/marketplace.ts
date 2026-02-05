/**
 * Marketplace Service
 * 
 * Fetches MCP servers from Docker Hub (241+ servers) and MCP Registry
 * using Tauri backend to bypass CORS restrictions.
 */

import { invoke } from '@tauri-apps/api/core';
import { ALL_SERVER_TEMPLATES } from '../lib/serverCatalog';

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
     * Fallbacks to local catalog if backend fails
     */
    async fetchServers(query: string = '', page: number = 1): Promise<{ servers: MarketplaceServer[], isFallback: boolean, error?: string }> {
        // Only fetch on first page
        if (page > 1) {
            return { servers: [], isFallback: false };
        }

        try {
            const servers = await invoke<MarketplaceServer[]>('fetch_marketplace_servers', { query });

            if (servers.length === 0) {
                throw new Error('No servers returned from backend');
            }
            return { servers, isFallback: false };
        } catch (error: any) {
            let errorMsg = String(error);
            // Detect browser environment
            const isBrowser = !(window as any).__TAURI_INTERNALS__ && !(window as any).__TAURI__;

            if (isBrowser || (errorMsg.includes("Cannot read properties of undefined") && errorMsg.includes("invoke"))) {
                console.warn('Tauri API not available (Browser detection)');
                errorMsg = "Browser detected. Please use the Relay Desktop App for full access.";
            } else {
                console.warn('Failed to fetch marketplace servers, falling back to catalog:', error);
            }

            // Map local catalog templates to MarketplaceServer format
            const fallbackServers: MarketplaceServer[] = ALL_SERVER_TEMPLATES
                .filter(t => !query ||
                    t.name.toLowerCase().includes(query.toLowerCase()) ||
                    t.description.toLowerCase().includes(query.toLowerCase())
                )
                .map(t => ({
                    id: t.id,
                    name: t.name,
                    description: t.description,
                    command: t.command,
                    args: t.args,
                    envVariables: t.env ? Object.keys(t.env) : [],
                    author: t.source === 'official' ? 'Official' : 'Community',
                    sourceUrl: t.documentationUrl || '',
                    category: t.category,
                    iconUrl: t.iconUrl,
                    source: 'catalog',
                    verified: t.verified || false,
                    packageName: t.packageName || '',
                    requiresConfig: t.requiresConfig || false,
                    pullCount: undefined,
                    starCount: undefined
                }));

            return {
                servers: fallbackServers,
                isFallback: true,
                error: String(error)
            };
        }
    },
};
