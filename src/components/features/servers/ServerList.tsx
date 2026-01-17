import { useEffect } from 'react';
import { Plus, Upload, RefreshCw, Server } from 'lucide-react';
import { Button } from '../../ui/button';
import { ServerCard } from './ServerCard';
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { configApi } from '../../../lib/tauri';

export function ServerList() {
    const { servers, loading, error, fetchServers } = useServerStore();
    const { openAddDialog } = useUIStore();
    const { toast } = useToast();

    useEffect(() => {
        fetchServers();
    }, [fetchServers]);

    const handleExport = async () => {
        try {
            const path = await configApi.exportToClaude();
            toast({
                title: 'Config Exported',
                description: `Saved to ${path}`,
                variant: 'success',
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

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={enabledCount === 0}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Export to Claude
                    </Button>

                    <Button size="sm" onClick={openAddDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Server
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
                        <Button onClick={openAddDialog}>
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
        </div>
    );
}
