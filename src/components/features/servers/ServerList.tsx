import { useEffect, useState } from 'react';
import { Plus, Upload, RefreshCw, Server, Library, ChevronDown } from 'lucide-react';
import { Button } from '../../ui/button';
import { ServerCard } from './ServerCard';
import { ServerCatalogDialog } from './ServerCatalogDialog';
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { configApi } from '../../../lib/tauri';
import { getSupportedClients } from '../../../lib/clientCatalog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '../../ui/dropdown-menu';

export function ServerList() {
    const { servers, loading, error, fetchServers } = useServerStore();
    const { openAddDialog } = useUIStore();
    const { toast } = useToast();
    const [catalogOpen, setCatalogOpen] = useState(false);
    const supportedClients = getSupportedClients();

    useEffect(() => {
        fetchServers();
    }, [fetchServers]);

    const handleExportAll = async () => {
        let successCount = 0;
        let failCount = 0;

        for (const client of supportedClients) {
            try {
                await configApi.exportToClient(client.id);
                successCount++;
            } catch {
                failCount++;
            }
        }

        toast({
            title: 'Exported to All Clients',
            description: `${successCount} succeeded, ${failCount} failed`,
        });
    };

    const handleExport = async (clientId: string, clientName: string) => {
        try {
            const path = await configApi.exportToClient(clientId);
            toast({
                title: `Exported to ${clientName}`,
                description: `Saved to ${path}`,
            });
        } catch (error) {
            toast({
                title: 'Export Failed',
                description: String(error),
                variant: 'destructive',
            });
        }
    };

    const enabledCount = servers.filter(s => s.enabled).length;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold">MCP Servers</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {servers.length} servers • {enabledCount} enabled
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchServers()}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={enabledCount === 0}>
                                <Upload className="h-4 w-4 mr-2" />
                                Export
                                <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExportAll} className="font-medium">
                                Export to All Clients
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Export to specific client
                            </DropdownMenuLabel>
                            {supportedClients.map((client) => (
                                <DropdownMenuItem
                                    key={client.id}
                                    onClick={() => handleExport(client.id, client.name)}
                                >
                                    {client.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCatalogOpen(true)}
                    >
                        <Library className="h-4 w-4 mr-2" />
                        Browse Catalog
                    </Button>

                    <Button size="sm" onClick={() => openAddDialog()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {loading && servers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <RefreshCw className="h-8 w-8 animate-spin mb-4" />
                        <p>Loading servers...</p>
                    </div>
                ) : servers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Server className="h-12 w-12 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No servers configured</h3>
                        <p className="text-sm mb-4">Add your first MCP server to get started</p>
                        <Button onClick={() => openAddDialog()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Server
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {servers.map((server) => (
                            <ServerCard key={server.id} server={server} />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                        Error: {error}
                    </div>
                )}
            </div>

            {/* Catalog Dialog */}
            <ServerCatalogDialog open={catalogOpen} onOpenChange={setCatalogOpen} />
        </div>
    );
}
