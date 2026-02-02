import { useEffect } from 'react';
import { Plus, Upload, RefreshCw, Pencil, Trash2, Terminal } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { configApi } from '../../../lib/tauri';
import { cn } from '../../../lib/utils';

export function MyServersList() {
    const { servers, loading, fetchServers, toggleServer } = useServerStore();
    const { openAddDialog, openEditDialog, openDeleteDialog, openLogsDialog } = useUIStore();
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
            });
        } catch (error) {
            toast({
                title: 'Export Failed',
                description: String(error),
                variant: 'destructive',
            });
        }
    };

    const handleToggle = async (id: string, name: string) => {
        try {
            const updated = await toggleServer(id);
            toast({
                title: updated.enabled ? 'Server Enabled' : 'Server Disabled',
                description: name,
            });
        } catch {
            toast({ title: 'Error', description: 'Failed to toggle server', variant: 'destructive' });
        }
    };

    const enabledCount = servers.filter(s => s.enabled).length;

    return (
        <div className="h-full flex flex-col">
            {/* Actions bar */}
            <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => openAddDialog()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Server
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={enabledCount === 0}>
                        <Upload className="h-4 w-4 mr-2" />
                        Export to Claude
                    </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => fetchServers()} disabled={loading}>
                    <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                </Button>
            </div>

            {/* Server list */}
            <div className="flex-1 overflow-auto p-4">
                {servers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <p className="text-lg mb-2">No servers configured</p>
                        <p className="text-sm mb-4">Add a server or browse the catalog</p>
                        <Button onClick={() => openAddDialog()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Server
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {servers.map((server) => (
                            <Card key={server.id} className="p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Status dot */}
                                    <div className={cn(
                                        'w-2 h-2 rounded-full shrink-0',
                                        server.status === 'running'
                                            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                                            : server.enabled ? 'bg-yellow-500' : 'bg-muted-foreground/30'
                                    )} />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{server.name}</h3>
                                            {server.category && (
                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium uppercase tracking-wider">
                                                    {server.category}
                                                </span>
                                            )}
                                        </div>
                                        {server.description && (
                                            <p className="text-sm text-muted-foreground truncate">{server.description}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => openLogsDialog(server)}
                                        >
                                            <Terminal className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(server)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDeleteDialog(server)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Switch checked={server.enabled} onCheckedChange={() => handleToggle(server.id, server.name)} />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
