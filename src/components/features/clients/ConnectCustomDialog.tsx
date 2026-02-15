import { useRef, useState } from 'react';
import { Copy, Check, FolderOpen, Save } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { useServerStore } from '../../../stores/serverStore';
import { parseServerArgs, parseServerEnv } from '../../../types/server';
import { toast } from '../../ui/use-toast';
import { configApi } from '../../../lib/tauri';
import { resolveConfigPath } from '../../../lib/clientCatalog';

interface ConnectCustomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const COMMON_PATH_SUGGESTIONS = (() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) {
        return [
            '%APPDATA%/Claude/claude_desktop_config.json',
            '%USERPROFILE%/.cursor/mcp.json',
        ];
    }
    if (ua.includes('mac')) {
        return [
            '~/Library/Application Support/Claude/claude_desktop_config.json',
            '~/.cursor/mcp.json',
        ];
    }
    return [
        '~/.config/Claude/claude_desktop_config.json',
        '~/.cursor/mcp.json',
    ];
})();

export function ConnectCustomDialog({ open, onOpenChange }: ConnectCustomDialogProps) {
    const { servers } = useServerStore();
    const [copied, setCopied] = useState(false);
    const [manualPath, setManualPath] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateConfig = () => {
        const config = {
            mcpServers: servers
                .filter((s) => s.enabled)
                .reduce<Record<string, { command: string; args: string[]; env?: Record<string, string> }>>(
                    (acc, server) => {
                        const env = parseServerEnv(server);
                        acc[server.name] = {
                            command: server.command,
                            args: parseServerArgs(server),
                            ...(Object.keys(env).length > 0 ? { env } : {}),
                        };
                        return acc;
                    },
                    {}
                ),
        };
        return JSON.stringify(config, null, 2);
    };

    const configString = generateConfig();

    const handleCopy = () => {
        navigator.clipboard.writeText(configString);
        setCopied(true);
        toast({
            title: 'Config Copied',
            description: 'MCP configuration copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePickFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] as (File & { path?: string }) | undefined;
        if (!file) return;
        if (file.path) {
            setManualPath(file.path);
            return;
        }
        setManualPath(file.name);
    };

    const handleExportToPath = async () => {
        if (!manualPath.trim()) {
            toast({
                title: 'Path Required',
                description: 'Enter a target JSON path before exporting.',
                variant: 'destructive',
            });
            return;
        }

        setIsExporting(true);
        try {
            const resolvedPath = await resolveConfigPath(manualPath.trim());
            await configApi.exportToPath(resolvedPath, 'mcpServers');
            toast({
                title: 'Config Exported',
                description: `Saved Relay Gateway config to ${resolvedPath}`,
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Export Failed',
                description: String(error),
                variant: 'destructive',
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Connect Custom Client</DialogTitle>
                    <DialogDescription>
                        Use this MCP config for any compatible client. If auto-connect fails, export
                        to a custom config path manually.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-2">
                    <div className="grid gap-2">
                        <Label>Manual Config Path (Fallback)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={manualPath}
                                onChange={(e) => setManualPath(e.target.value)}
                                placeholder="e.g. ~/.cursor/mcp.json"
                                className="font-mono text-xs"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handlePickFile}
                            >
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Pick
                            </Button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileSelected}
                        />
                        <div className="flex flex-wrap gap-2">
                            {COMMON_PATH_SUGGESTIONS.map((path) => (
                                <button
                                    key={path}
                                    type="button"
                                    className="text-xs px-2 py-1 rounded border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setManualPath(path)}
                                >
                                    {path}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative border rounded-md bg-muted/50 mt-4">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2 h-8 w-8 bg-background/50 hover:bg-background"
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                    <pre className="p-4 overflow-auto h-full text-xs font-mono">
                        {configString}
                    </pre>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button variant="outline" onClick={handleCopy}>
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Config
                            </>
                        )}
                    </Button>
                    <Button onClick={handleExportToPath} disabled={isExporting}>
                        <Save className="h-4 w-4 mr-2" />
                        {isExporting ? 'Exporting...' : 'Export to Path'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
