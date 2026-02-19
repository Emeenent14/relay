import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import { Plus, Trash2, Lock, Eye, EyeOff, Wrench, AlertTriangle, Globe } from 'lucide-react';
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { SERVER_CATEGORIES } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import { diagnosticsApi } from '../../../lib/tauri';
import type { ConnectionTestResult, DependencyIssue } from '../../../types/diagnostics';

interface EnvVar {
    id: string;
    key: string;
    value: string;
    isSecret: boolean;
    showValue?: boolean;
}

export function AddServerDialog() {
    const { createServer } = useServerStore();
    const { activeDialog, marketplaceData, closeDialog } = useUIStore();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [command, setCommand] = useState('');
    const [args, setArgs] = useState('');
    const [category, setCategory] = useState('other');
    const [transport, setTransport] = useState<'stdio' | 'sse'>('stdio');
    const [serverUrl, setServerUrl] = useState('');
    const [envVars, setEnvVars] = useState<EnvVar[]>([]);
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [dependencyIssues, setDependencyIssues] = useState<DependencyIssue[]>([]);
    const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

    const isOpen = activeDialog === 'add';

    useEffect(() => {
        if (isOpen && marketplaceData) {
            setName(marketplaceData.name);
            setDescription(marketplaceData.description);
            setCommand(marketplaceData.command);
            setArgs(marketplaceData.args.join('\n'));
            setCategory(marketplaceData.category.toLowerCase());

            if (marketplaceData.envVariables) {
                setEnvVars(
                    marketplaceData.envVariables.map((key) => ({
                        id: Math.random().toString(36).substr(2, 9),
                        key,
                        value: '',
                        isSecret:
                            key.toLowerCase().includes('token') ||
                            key.toLowerCase().includes('key') ||
                            key.toLowerCase().includes('secret'),
                    }))
                );
            }
        }
    }, [isOpen, marketplaceData]);

    useEffect(() => {
        setTestResult(null);
    }, [name, description, command, args, category, envVars]);

    useEffect(() => {
        const trimmedCommand = command.trim();
        if (!trimmedCommand) {
            setDependencyIssues([]);
            return;
        }

        const argsArray = args
            .split(/[\n\s]+/)
            .map((a) => a.trim())
            .filter(Boolean);

        const timer = setTimeout(async () => {
            try {
                const issues = await diagnosticsApi.checkDependencies({
                    command: trimmedCommand,
                    args: argsArray,
                });
                setDependencyIssues(issues);
            } catch {
                setDependencyIssues([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [args, command]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setCommand('');
        setArgs('');
        setCategory('other');
        setTransport('stdio');
        setServerUrl('');
        setEnvVars([]);
        setDependencyIssues([]);
        setTestResult(null);
    };

    const handleClose = () => {
        resetForm();
        closeDialog();
    };

    const addEnvVar = () => {
        setEnvVars([
            ...envVars,
            {
                id: Math.random().toString(36).substr(2, 9),
                key: '',
                value: '',
                isSecret: false,
            },
        ]);
    };

    const removeEnvVar = (id: string) => {
        setEnvVars(envVars.filter((v) => v.id !== id));
    };

    const updateEnvVar = (id: string, updates: Partial<EnvVar>) => {
        setEnvVars(envVars.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    };

    const buildPayload = () => {
        const argsArray = args
            .split(/[\n\s]+/)
            .map((a) => a.trim())
            .filter(Boolean);

        const env: Record<string, string> = {};
        const secrets: string[] = [];

        envVars.forEach((v) => {
            const key = v.key.trim();
            if (!key) return;

            if (v.isSecret) {
                secrets.push(key);
                if (v.value) {
                    env[key] = v.value;
                }
                return;
            }

            env[key] = v.value;
        });

        return { argsArray, env, secrets };
    };

    const runConnectionTest = async (): Promise<boolean> => {
        if (!command.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Command is required to run a connection test.',
                variant: 'destructive',
            });
            return false;
        }

        setTesting(true);
        try {
            const { argsArray, env, secrets } = buildPayload();
            const result = await diagnosticsApi.testConnection({
                command: command.trim(),
                args: argsArray,
                env,
                secrets,
            });
            setTestResult(result);

            if (result.success) {
                toast({
                    title: 'Connection Test Passed',
                    description: result.message,
                    variant: 'success',
                });
                return true;
            }

            toast({
                title: 'Connection Test Failed',
                description: result.hints[0] || result.message,
                variant: 'destructive',
            });
            return false;
        } catch (error) {
            toast({
                title: 'Connection Test Error',
                description: String(error),
                variant: 'destructive',
            });
            return false;
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !command.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Name and command are required',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            const canProceed = await runConnectionTest();
            if (!canProceed) return;

            const { argsArray, env, secrets } = buildPayload();

            await createServer({
                name: name.trim(),
                description: description.trim() || undefined,
                command: transport === 'sse' ? 'sse' : command.trim(),
                args: argsArray.length > 0 ? argsArray : undefined,
                env,
                secrets,
                category: category,
                transport,
                url: transport === 'sse' ? serverUrl.trim() : undefined,
            });

            toast({
                title: 'Server Created',
                description: `${name} has been added`,
                variant: 'success',
            });

            handleClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: String(error),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[650px] max-h-[88vh] flex flex-col p-0 overflow-hidden">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <DialogHeader className="p-6 pb-2 shrink-0">
                        <DialogTitle>Add MCP Server</DialogTitle>
                        <DialogDescription>
                            Configure a new MCP server. Secrets are stored in your system&apos;s secure keyring.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 custom-scrollbar">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., filesystem-server"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="What does this server do?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Transport</Label>
                                <Select value={transport} onValueChange={(v) => setTransport(v as 'stdio' | 'sse')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="stdio">Stdio (Local)</SelectItem>
                                        <SelectItem value="sse">SSE (Remote)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-muted-foreground">
                                    {transport === 'stdio'
                                        ? 'Launches a local process via command + args.'
                                        : 'Connects to a remote MCP server over HTTP/SSE.'}
                                </p>
                            </div>

                            {transport === 'sse' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="serverUrl">
                                        <Globe className="h-3.5 w-3.5 inline mr-1" />
                                        Server URL *
                                    </Label>
                                    <Input
                                        id="serverUrl"
                                        placeholder="https://mcp.example.com/sse"
                                        value={serverUrl}
                                        onChange={(e) => setServerUrl(e.target.value)}
                                    />
                                </div>
                            )}

                            {transport === 'stdio' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="command">Command *</Label>
                                <Input
                                    id="command"
                                    placeholder="e.g., npx or python"
                                    value={command}
                                    onChange={(e) => setCommand(e.target.value)}
                                />
                                {dependencyIssues.length > 0 && (
                                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                                        <p className="font-semibold flex items-center gap-2">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            Missing prerequisites
                                        </p>
                                        {dependencyIssues.map((issue) => (
                                            <p key={issue.binary}>
                                                <strong>{issue.binary}</strong>: {issue.install_hint}
                                            </p>
                                        ))}
                                    </div>
                                )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="args">Arguments (one per line)</Label>
                                        <Textarea
                                            id="args"
                                            placeholder="-y&#10;@modelcontextprotocol/server-filesystem&#10;/path/to/directory"
                                            value={args}
                                            onChange={(e) => setArgs(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </>
                            )}

                            {testResult && !testResult.success && (
                                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm space-y-2">
                                    <p className="font-semibold text-destructive">Connection diagnostics</p>
                                    <p>{testResult.message}</p>
                                    {testResult.hints.length > 0 && (
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                            {testResult.hints.map((hint, index) => (
                                                <li key={index}>{hint}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Environment Variables</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addEnvVar} className="h-7 text-xs">
                                        <Plus className="h-3 w-3 mr-1" /> Add Var
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {envVars.length === 0 && (
                                        <p className="text-xs text-muted-foreground italic text-center py-2 border border-dashed rounded-lg">
                                            No environment variables defined.
                                        </p>
                                    )}
                                    {envVars.map((v) => (
                                        <div key={v.id} className="flex gap-2 items-start group">
                                            <div className="grid flex-1 gap-1">
                                                <Input
                                                    placeholder="KEY"
                                                    value={v.key}
                                                    onChange={(e) => updateEnvVar(v.id, { key: e.target.value })}
                                                    className="h-8 text-xs font-mono"
                                                />
                                            </div>
                                            <div className="grid flex-[1.5] gap-1 relative">
                                                <Input
                                                    type={v.isSecret && !v.showValue ? "password" : "text"}
                                                    placeholder="VALUE"
                                                    value={v.value}
                                                    onChange={(e) => updateEnvVar(v.id, { value: e.target.value })}
                                                    className={cn(
                                                        "h-8 text-xs font-mono pr-8",
                                                        v.isSecret && "bg-blue-500/5 border-blue-500/20"
                                                    )}
                                                />
                                                {v.isSecret && (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateEnvVar(v.id, { showValue: !v.showValue })}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {v.showValue ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                    </button>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant={v.isSecret ? "secondary" : "ghost"}
                                                size="icon"
                                                className={cn(
                                                    "h-8 w-8 shrink-0",
                                                    v.isSecret && "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20"
                                                )}
                                                onClick={() => updateEnvVar(v.id, { isSecret: !v.isSecret })}
                                                title={v.isSecret ? "Secure Secret (System Keyring)" : "Normal Variable"}
                                            >
                                                <Lock className={cn("h-3.5 w-3.5", !v.isSecret && "opacity-30")} />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeEnvVar(v.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SERVER_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 border-t bg-card/50 shrink-0">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="button" variant="outline" onClick={() => void runConnectionTest()} disabled={testing || loading}>
                            <Wrench className="h-4 w-4 mr-2" />
                            {testing ? 'Testing...' : 'Test Connection'}
                        </Button>
                        <Button type="submit" disabled={loading || testing}>
                            {loading ? 'Creating...' : 'Create Server'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
