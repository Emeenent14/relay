import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../../ui/button';
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

interface ConnectCustomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ConnectCustomDialog({ open, onOpenChange }: ConnectCustomDialogProps) {
    const { servers } = useServerStore();
    const [copied, setCopied] = useState(false);

    const generateConfig = () => {
        const config = {
            mcpServers: servers
                .filter(s => s.enabled)
                .reduce((acc, server) => {
                    // Use name as key, but sanitize slightly if needed.
                    // Most clients allow arbitrary strings as keys.
                    const key = server.name;

                    const env = parseServerEnv(server);

                    acc[key] = {
                        command: server.command,
                        args: parseServerArgs(server),
                        ...(Object.keys(env).length > 0 && { env }),
                    };
                    return acc;
                }, {} as Record<string, any>)
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Connect Custom Client</DialogTitle>
                    <DialogDescription>
                        Use this configuration to connect any MCP-compatible client to your Relay servers.
                        Copy the JSON below and add it to your client's config file.
                    </DialogDescription>
                </DialogHeader>

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
                    <Button onClick={handleCopy}>
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
