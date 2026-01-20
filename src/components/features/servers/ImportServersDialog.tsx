import { useState } from 'react';
import { useServerStore } from '../../../stores/serverStore';
import { useToast } from '../../ui/use-toast';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { Upload, FileJson, AlertCircle } from 'lucide-react';

interface ImportServersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface MCPConfig {
    mcpServers?: Record<string, {
        command: string;
        args?: string[];
        env?: Record<string, string>;
    }>;
}

export function ImportServersDialog({ open, onOpenChange }: ImportServersDialogProps) {
    const { createServer } = useServerStore();
    const { toast } = useToast();
    const [jsonInput, setJsonInput] = useState('');
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async () => {
        setError(null);

        if (!jsonInput.trim()) {
            setError('Please paste a JSON configuration');
            return;
        }

        try {
            const config: MCPConfig = JSON.parse(jsonInput);

            if (!config.mcpServers || typeof config.mcpServers !== 'object') {
                setError('Invalid configuration: missing mcpServers object');
                return;
            }

            const serverEntries = Object.entries(config.mcpServers);

            if (serverEntries.length === 0) {
                setError('No servers found in configuration');
                return;
            }

            setImporting(true);
            let importedCount = 0;
            const errors: string[] = [];

            for (const [name, serverConfig] of serverEntries) {
                try {
                    await createServer({
                        name,
                        description: `Imported from configuration`,
                        command: serverConfig.command,
                        args: serverConfig.args || [],
                        env: serverConfig.env || {},
                        category: 'other',
                    });
                    importedCount++;
                } catch (err) {
                    errors.push(`Failed to import ${name}: ${String(err)}`);
                }
            }

            if (importedCount > 0) {
                toast({
                    title: 'Import Complete',
                    description: `Successfully imported ${importedCount} server${importedCount !== 1 ? 's' : ''}`,
                });
            }

            if (errors.length > 0) {
                toast({
                    title: 'Some imports failed',
                    description: errors.join(', '),
                    variant: 'destructive',
                });
            }

            if (importedCount > 0) {
                setJsonInput('');
                onOpenChange(false);
            }
        } catch (err) {
            setError(`Invalid JSON: ${String(err)}`);
        } finally {
            setImporting(false);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            setJsonInput(text);
            setError(null);
        } catch (err) {
            setError(`Failed to read file: ${String(err)}`);
        }
    };

    const exampleConfig = `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    }
  }
}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Import Servers
                    </DialogTitle>
                    <DialogDescription>
                        Import MCP servers from a Claude Desktop or other client configuration file.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* File upload */}
                    <div className="space-y-2">
                        <Label htmlFor="config-file">Upload configuration file</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="config-file"
                                type="file"
                                accept=".json"
                                onChange={handleFileSelect}
                                className="file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-muted file:text-muted-foreground"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        <div className="flex-1 h-px bg-border" />
                        <span>or paste JSON directly</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* JSON input */}
                    <div className="space-y-2">
                        <Label htmlFor="json-input">Configuration JSON</Label>
                        <Textarea
                            id="json-input"
                            placeholder={exampleConfig}
                            value={jsonInput}
                            onChange={(e) => {
                                setJsonInput(e.target.value);
                                setError(null);
                            }}
                            className="font-mono text-sm min-h-[200px]"
                        />
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Format info */}
                    <div className="bg-muted rounded-md p-3 text-sm">
                        <p className="font-medium flex items-center gap-2 mb-2">
                            <FileJson className="h-4 w-4" />
                            Expected format
                        </p>
                        <p className="text-muted-foreground text-xs">
                            The configuration should contain an <code className="bg-background px-1 py-0.5 rounded">mcpServers</code> object
                            with server names as keys. Each server should have a <code className="bg-background px-1 py-0.5 rounded">command</code>
                            and optionally <code className="bg-background px-1 py-0.5 rounded">args</code> and <code className="bg-background px-1 py-0.5 rounded">env</code>.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={importing || !jsonInput.trim()}>
                        {importing ? 'Importing...' : 'Import Servers'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
