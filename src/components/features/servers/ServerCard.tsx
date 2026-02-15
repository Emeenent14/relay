import { Card, CardContent } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Button } from '../../ui/button';
import { Pencil, Trash2, Terminal, ExternalLink } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CATEGORY_COLORS, type ServerCategory } from '../../../lib/constants';
import { formatRelativeTime } from '../../../lib/utils';
import { parseServerArgs, parseServerEnv, parseServerSecrets, type Server as ServerType } from '../../../types/server';
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { diagnosticsApi } from '../../../lib/tauri';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../../ui/tooltip';

interface ServerCardProps {
    server: ServerType;
}

export function ServerCard({ server }: ServerCardProps) {
    const { toggleServer } = useServerStore();
    const { viewServer, openDeleteDialog, openLogsDialog } = useUIStore();
    const { toast } = useToast();

    const handleToggle = async () => {
        if (!server.enabled) {
            const testResult = await diagnosticsApi.testConnection({
                server_id: server.id,
                command: server.command,
                args: parseServerArgs(server),
                env: parseServerEnv(server),
                secrets: parseServerSecrets(server),
            });

            if (!testResult.success) {
                toast({
                    title: 'Preflight Check Failed',
                    description: testResult.hints[0] || testResult.message,
                    variant: 'destructive',
                });
                return;
            }
        }

        try {
            const updated = await toggleServer(server.id);
            toast({
                title: updated.enabled ? 'Server Enabled' : 'Server Disabled',
                description: `${server.name} has been ${updated.enabled ? 'enabled' : 'disabled'}`,
                variant: updated.enabled ? 'success' : 'default',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to toggle server',
                variant: 'destructive',
            });
        }
    };

    const category = (server.category || 'other') as ServerCategory;

    return (
        <TooltipProvider delayDuration={300}>
            <Card className={cn(
                'group transition-all duration-200 hover:shadow-md',
                server.enabled
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'hover:border-border/80'
            )}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        {/* Left side - Info */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Icon */}
                            <div className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                                server.enabled
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-muted text-muted-foreground'
                            )}>
                                <Terminal className="h-5 w-5" />
                            </div>

                            {/* Text content */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold truncate">{server.name}</h3>
                                    <span className={cn(
                                        'px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
                                        CATEGORY_COLORS[category]
                                    )}>
                                        {category}
                                    </span>
                                </div>

                                {server.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                        {server.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="font-mono truncate max-w-[200px]">
                                        {server.command}
                                    </span>
                                    {server.context_usage && server.context_usage.total_tokens > 0 && (
                                        <span className="text-blue-600 dark:text-blue-300">
                                            {server.context_usage.total_tokens} tok
                                        </span>
                                    )}
                                    <span className="shrink-0">
                                        {formatRelativeTime(server.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {server.documentation_url && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => window.open(server.documentation_url!, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View documentation</TooltipContent>
                                </Tooltip>
                            )}

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => openLogsDialog(server)}
                                    >
                                        <Terminal className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>View logs</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => viewServer(server.id)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit server</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                        onClick={() => openDeleteDialog(server)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete server</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Switch
                                            checked={server.enabled}
                                            onCheckedChange={handleToggle}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>{server.enabled ? 'Disable server' : 'Enable server'}</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
