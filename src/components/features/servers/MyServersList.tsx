import { useEffect } from 'react';
import { Plus, Upload, RefreshCw, Pencil, Trash2, Terminal, ChevronDown } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { configApi } from '../../../lib/tauri';
import { cn } from '../../../lib/utils';
import { getSupportedClients } from '../../../lib/clientCatalog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../../ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '../../ui/dropdown-menu';

export function MyServersList() {
    const { servers, loading, fetchServers, toggleServer } = useServerStore();
    const { openAddDialog, openEditDialog, openDeleteDialog, openLogsDialog } = useUIStore();
    const { toast } = useToast();
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
        <TooltipProvider delayDuration={300}>
            <div className="h-full flex flex-col">
                {/* Actions bar */}
                <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => openAddDialog()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Server
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" disabled={enabledCount === 0}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Export
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
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
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => fetchServers()} disabled={loading}>
                                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh servers</TooltipContent>
                    </Tooltip>
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
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => openLogsDialog(server)}
                                                    >
                                                        <Terminal className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View logs</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(server)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit server</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDeleteDialog(server)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Delete server</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <Switch checked={server.enabled} onCheckedChange={() => handleToggle(server.id, server.name)} />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>{server.enabled ? 'Disable server' : 'Enable server'}</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
