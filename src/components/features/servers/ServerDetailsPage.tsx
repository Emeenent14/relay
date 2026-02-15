
import { useState, useEffect, Fragment } from 'react';
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Separator } from '../../ui/separator';
import { ArrowLeft, Save, Play, Square, Trash2, Terminal, Plus, Eye, EyeOff, Lock, AlertCircle, ExternalLink } from 'lucide-react';
import { parseServerArgs, parseServerEnv, parseServerSecrets } from '../../../types/server';
import { SERVER_CATEGORIES } from '../../../lib/constants';
import { ALL_SERVER_TEMPLATES } from '../../../lib/serverCatalog';
import { cn } from '../../../lib/utils';
import { useToast } from '../../ui/use-toast';
import { diagnosticsApi } from '../../../lib/tauri';
import type { ConnectionTestResult, DependencyIssue } from '../../../types/diagnostics';

interface EnvVar {
    id: string;
    key: string;
    value: string;
    isSecret: boolean;
    showValue?: boolean;
    isRequired?: boolean;
    description?: string;
}

export function ServerDetailsPage() {
    const { servers, updateServer, toggleServer, deleteServer } = useServerStore();
    const { selectedServerId, setCurrentPage, openLogsDialog } = useUIStore();
    const { toast } = useToast();

    // Find the server
    const server = servers.find(s => s.id === selectedServerId);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [command, setCommand] = useState('');
    const [args, setArgs] = useState('');
    const [category, setCategory] = useState('other');
    const [envVars, setEnvVars] = useState<EnvVar[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
    const [dependencyIssues, setDependencyIssues] = useState<DependencyIssue[]>([]);

    // Initialize state from server
    useEffect(() => {
        if (!server) return;

        setName(server.name);
        setDescription(server.description || '');
        setCommand(server.command);
        setArgs(parseServerArgs(server).join('\n'));
        setCategory(server.category || 'other');

        // Parse existing envs and secrets
        const normalEnv = parseServerEnv(server);
        const secretKeys = parseServerSecrets(server);

        // Find template to identify required keys
        // Find template to identify required keys with robust fallbacks
        let template = ALL_SERVER_TEMPLATES.find(t => t.id === server.marketplace_id);

        // Fallback 1: Match by package name in args
        if (!template) {
            const argsArray = parseServerArgs(server);
            template = ALL_SERVER_TEMPLATES.find(t =>
                t.packageName && argsArray.some(arg => arg.includes(t.packageName!))
            );
        }

        // Fallback 2: Match by name (case-insensitive)
        if (!template) {
            template = ALL_SERVER_TEMPLATES.find(t => t.name.toLowerCase() === server.name.toLowerCase());
        }

        // Fallback 3: Substring match (The "Nuclear Option" for widely known servers)
        if (!template) {
            const serverString = JSON.stringify({ name: server.name, args: server.args }).toLowerCase();
            if (serverString.includes('brave')) template = ALL_SERVER_TEMPLATES.find(t => t.id === 'brave-search');
            else if (serverString.includes('postgres')) template = ALL_SERVER_TEMPLATES.find(t => t.id === 'postgres');
            else if (serverString.includes('github')) template = ALL_SERVER_TEMPLATES.find(t => t.id === 'github');
            else if (serverString.includes('gitlab')) template = ALL_SERVER_TEMPLATES.find(t => t.id === 'gitlab');
            else if (serverString.includes('slack')) template = ALL_SERVER_TEMPLATES.find(t => t.id === 'slack');
            else if (serverString.includes('google') && serverString.includes('drive')) template = ALL_SERVER_TEMPLATES.find(t => t.id === 'google-drive');
            else if (serverString.includes('google') && serverString.includes('maps')) template = ALL_SERVER_TEMPLATES.find(t => t.id === 'google-maps');
            else if (serverString.includes('sentry')) template = ALL_SERVER_TEMPLATES.find(t => t.id === 'sentry');
            else if (serverString.includes('sqlite')) template = ALL_SERVER_TEMPLATES.find(t => t.id === 'sqlite');
        }

        const configSchema = template?.configSchema || [];

        const vars: EnvVar[] = [];
        const usedKeys = new Set<string>();

        // 1. Process Schema Fields (Required/Known Keys)
        configSchema.forEach(field => {
            if (field.type === 'password' || field.type === 'text') { // Only map env vars, 'path' usually goes to args
                // Check if we have a value for this schema key
                let value = '';
                let isSecret = field.type === 'password';

                if (secretKeys.includes(field.key)) {
                    value = '********'; // Placeholder
                    isSecret = true;
                } else if (normalEnv[field.key]) {
                    value = normalEnv[field.key];
                }

                // If not found, it's empty but still displayed
                vars.push({
                    id: `req-${field.key}`,
                    key: field.key,
                    value,
                    isSecret,
                    isRequired: field.required,
                    description: field.description
                });
                usedKeys.add(field.key);
            }
        });

        // 2. Add remaining normal env vars
        Object.entries(normalEnv).forEach(([key, value]) => {
            if (!usedKeys.has(key)) {
                vars.push({
                    id: Math.random().toString(36).substr(2, 9),
                    key,
                    value,
                    isSecret: false
                });
                usedKeys.add(key);
            }
        });

        // 3. Add remaining secrets
        secretKeys.forEach(key => {
            if (!usedKeys.has(key)) {
                vars.push({
                    id: Math.random().toString(36).substr(2, 9),
                    key,
                    value: '********',
                    isSecret: true
                });
            }
        });

        setEnvVars(vars);
        setIsDirty(false);
        setTestResult(null);
        // Expose hint/docUrl to render scope if needed, or derived in render
    }, [server]);

    useEffect(() => {
        const trimmedCommand = command.trim();
        if (!trimmedCommand) {
            setDependencyIssues([]);
            return;
        }

        const argsArray = args.split(/[\n\s]+/).map(a => a.trim()).filter(Boolean);
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

    useEffect(() => {
        setTestResult(null);
    }, [name, description, command, args, category, envVars]);

    // Derived values for render
    const template = server ? ALL_SERVER_TEMPLATES.find(t => t.id === server.marketplace_id) : null;
    const configHint = template?.configHint;
    const docUrl = server?.documentation_url || template?.documentationUrl;

    if (!server) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Server Not Found</h2>
                <Button onClick={() => setCurrentPage('servers')}>Return to Catalog</Button>
            </div>
        );
    }

    const handleBack = () => {
        if (isDirty) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                setCurrentPage('servers');
            }
        } else {
            setCurrentPage('servers');
        }
    };

    const buildConfigPayload = () => {
        const argsArray = args.split(/[\n\s]+/).map(a => a.trim()).filter(Boolean);
        const env: Record<string, string> = {};
        const secrets: string[] = [];

        envVars.forEach(v => {
            const key = v.key.trim();
            if (!key) return;

            if (v.isSecret) {
                secrets.push(key);
                if (v.value && v.value !== '********') {
                    env[key] = v.value;
                }
                return;
            }

            env[key] = v.value;
        });

        return { argsArray, env, secrets };
    };

    const runConnectionTest = async () => {
        if (!server) return false;
        if (!command.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Command is required to test the connection.',
                variant: 'destructive',
            });
            return false;
        }
        setTesting(true);
        try {
            const { argsArray, env, secrets } = buildConfigPayload();
            const result = await diagnosticsApi.testConnection({
                server_id: server.id,
                command: command.trim(),
                args: argsArray,
                env,
                secrets,
            });
            setTestResult(result);

            if (!result.success) {
                toast({
                    title: 'Connection Test Failed',
                    description: result.hints[0] || result.message,
                    variant: 'destructive',
                });
                return false;
            }

            toast({
                title: 'Connection Test Passed',
                description: result.message,
                variant: 'success',
            });
            return true;
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

    const handleSave = async () => {
        if (!name.trim() || !command.trim()) {
            toast({
                title: "Validation Error",
                description: "Name and command are required.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const passed = await runConnectionTest();
            if (!passed) return;

            const { argsArray, env, secrets } = buildConfigPayload();

            await updateServer({
                id: server.id,
                name: name.trim(),
                description: description.trim() || undefined,
                command: command.trim(),
                args: argsArray,
                env,
                secrets,
                category
            });

            toast({ title: "Server Saved", description: "Configuration updated successfully.", variant: "success" });
            setIsDirty(false);
        } catch (e) {
            toast({ title: "Error", description: String(e), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const updateEnvVar = (id: string, updates: Partial<EnvVar>) => {
        setEnvVars(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
        setIsDirty(true);
    };

    const addCustomVar = () => {
        setEnvVars([...envVars, {
            id: Math.random().toString(36).substr(2, 9),
            key: '',
            value: '',
            isSecret: false
        }]);
        setIsDirty(true);
    };

    const removeVar = (id: string) => {
        setEnvVars(prev => prev.filter(v => v.id !== id));
        setIsDirty(true);
    };

    const requiredVars = envVars.filter(v => v.isRequired);
    const customVars = envVars.filter(v => !v.isRequired);

    return (
        <Fragment>
            <div className="flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {/* Header */}
                <div className="flex flex-col px-8 py-6 border-b shrink-0 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full hover:bg-accent -ml-3">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <span>{server.category || 'other'}</span>
                                    <span>•</span>
                                    <Badge variant={server.enabled ? "default" : "secondary"} className={cn("text-xs font-mono h-5", !server.enabled && "opacity-50")}>
                                        {server.enabled ? "Running" : "Stopped"}
                                    </Badge>
                                    {server.context_usage && server.context_usage.total_tokens > 0 && (
                                        <Badge variant="outline" className="text-xs font-mono h-5">
                                            {server.context_usage.total_tokens} tok
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Top Actions */}
                            <Button variant="outline" size="sm" onClick={() => openLogsDialog(server)}>
                                <Terminal className="h-4 w-4 mr-2" /> Logs
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => void runConnectionTest()} disabled={testing}>
                                {testing ? 'Testing...' : 'Test Connection'}
                            </Button>
                            <div className="h-6 w-px bg-border mx-1" />
                            <Button variant="default" size="sm" onClick={handleSave} disabled={!isDirty || loading || testing}>
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content with Tabs */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <Tabs defaultValue="configuration" className="flex-1 flex flex-col h-full min-h-0">
                        <div className="px-8 border-b bg-muted/20">
                            <TabsList className="bg-transparent p-0 h-auto gap-4">
                                <TabsTrigger
                                    value="overview"
                                    className="rounded-none border-b-2 border-transparent px-2 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none radius-0"
                                >
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="configuration"
                                    className="rounded-none border-b-2 border-transparent px-2 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none radius-0"
                                >
                                    Configuration
                                </TabsTrigger>
                                <TabsTrigger
                                    value="tools"
                                    disabled
                                    className="rounded-none border-b-2 border-transparent px-2 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none radius-0 opacity-50"
                                >
                                    Tools (0)
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-muted/5 min-h-0">
                            <div className="max-w-4xl mx-auto pb-24">

                                {/* Overview Tab */}
                                <TabsContent value="overview" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>About {name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-muted-foreground">{server.description || "No description available."}</p>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                                <div>
                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Package</Label>
                                                    <p className="font-mono text-sm mt-1">{template?.packageName || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Version</Label>
                                                    <p className="font-mono text-sm mt-1">latest</p>
                                                </div>
                                            </div>

                                            {docUrl && (
                                                <div className="pt-4">
                                                    <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline inline-flex items-center">
                                                        Visit Official Documentation <ExternalLink className="h-3 w-3 ml-1" />
                                                    </a>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Manage Server</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium">Server State</h4>
                                                    <p className="text-sm text-muted-foreground">Stop or start the server process.</p>
                                                </div>
                                                <Button
                                                    variant={server.enabled ? "secondary" : "default"}
                                                    onClick={async () => {
                                                        if (!server.enabled) {
                                                            const passed = await runConnectionTest();
                                                            if (!passed) return;
                                                        }
                                                        await toggleServer(server.id);
                                                    }}
                                                    className="w-32"
                                                >
                                                    {server.enabled ? <Square className="h-4 w-4 mr-2 fill-current" /> : <Play className="h-4 w-4 mr-2 fill-current" />}
                                                    {server.enabled ? 'Stop' : 'Start'}
                                                </Button>
                                            </div>
                                            <Separator className="my-6" />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-destructive">Delete Server</h4>
                                                    <p className="text-sm text-muted-foreground">Irreversibly remove this server from your configuration.</p>
                                                </div>
                                                <Button variant="outline" className="w-32 border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => {
                                                    deleteServer(server.id);
                                                    setCurrentPage('servers');
                                                }}>
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Configuration Tab - The "Docker Style" Request */}
                                <TabsContent value="configuration" className="mt-0 space-y-8">
                                    {testResult && !testResult.success && (
                                        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 space-y-2">
                                            <p className="font-semibold text-destructive">Connection diagnostics</p>
                                            <p className="text-sm">{testResult.message}</p>
                                            {testResult.hints.length > 0 && (
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                    {testResult.hints.map((hint, index) => (
                                                        <li key={index}>{hint}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    {/* General Settings */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold mb-4">General Information</h3>
                                        <div className="grid grid-cols-2 gap-4 max-w-2xl">
                                            <div className="space-y-2">
                                                <Label>Server Name</Label>
                                                <Input value={name} onChange={e => { setName(e.target.value); setIsDirty(true); }} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select value={category} onValueChange={v => { setCategory(v); setIsDirty(true); }}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {SERVER_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2 max-w-2xl">
                                            <Label>Description</Label>
                                            <Input value={description} onChange={e => { setDescription(e.target.value); setIsDirty(true); }} />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Secrets / API Keys Section */}
                                    <div className="space-y-6">

                                        {requiredVars.length > 0 && (
                                            <>
                                                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-md flex items-start gap-3">
                                                    <Lock className="h-5 w-5 shrink-0 mt-0.5" />
                                                    <div className="text-sm">
                                                        <p className="font-medium">{server.name} requires secrets to work.</p>
                                                        <p className="opacity-90">Please provide the API keys below to enable functionality.</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-semibold mb-4">Secrets</h3>
                                                    <div className="space-y-6">
                                                        {requiredVars.map(v => (
                                                            <div key={v.id} className="group">
                                                                <Label className="block text-sm font-medium mb-2 font-mono text-muted-foreground">
                                                                    {v.key}
                                                                </Label>
                                                                <div className="relative max-w-2xl">
                                                                    <Input
                                                                        type={v.showValue ? "text" : "password"}
                                                                        value={v.value}
                                                                        onChange={e => updateEnvVar(v.id, { value: e.target.value })}
                                                                        className="font-mono bg-background"
                                                                        placeholder={v.value === '********' ? '********' : `Enter ${v.key}...`}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateEnvVar(v.id, { showValue: !v.showValue })}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                                                    >
                                                                        {v.showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                    </button>
                                                                </div>

                                                                {/* Contextual Link - "See Getting an API key" */}
                                                                {(() => {
                                                                    // Simple URL extraction from configHint
                                                                    const urlMatch = configHint?.match(/(https?:\/\/[^\s]+)/g);
                                                                    const url = urlMatch ? urlMatch[0] : null;

                                                                    if (url) {
                                                                        return (
                                                                            <div className="mt-2">
                                                                                <a
                                                                                    href={url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
                                                                                >
                                                                                    See Getting an API key <ExternalLink className="h-3 w-3 ml-1.5" />
                                                                                </a>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {requiredVars.length === 0 && (
                                            <div className="text-center py-12 text-muted-foreground">
                                                <p>No secrets or API keys required for this server.</p>
                                            </div>
                                        )}

                                        <Separator />

                                        {/* Environment Variables & Advanced */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Environment & Advanced</h3>
                                            <div className="space-y-6 max-w-2xl">
                                                <div className="space-y-2">
                                                    <Label>Command</Label>
                                                    <Input className="font-mono" value={command} onChange={e => { setCommand(e.target.value); setIsDirty(true); }} />
                                                    {dependencyIssues.length > 0 && (
                                                        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                                                            <p className="font-semibold">Missing prerequisites</p>
                                                            {dependencyIssues.map((issue) => (
                                                                <p key={issue.binary}>
                                                                    <strong>{issue.binary}</strong>: {issue.install_hint}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Arguments</Label>
                                                    <Textarea
                                                        className="font-mono text-sm"
                                                        rows={3}
                                                        value={args}
                                                        onChange={e => { setArgs(e.target.value); setIsDirty(true); }}
                                                    />
                                                </div>

                                                {/* Custom Vars */}
                                                <div className="pt-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Label>Custom Environment Variables</Label>
                                                        <Button variant="outline" size="sm" onClick={addCustomVar} className="h-7 text-xs">
                                                            <Plus className="h-3 w-3 mr-1" /> Add
                                                        </Button>
                                                    </div>
                                                    {customVars.map(v => (
                                                        <div key={v.id} className="flex gap-2 mb-2">
                                                            <Input
                                                                value={v.key}
                                                                onChange={e => updateEnvVar(v.id, { key: e.target.value })}
                                                                placeholder="KEY"
                                                                className="flex-1 font-mono text-xs"
                                                            />
                                                            <Input
                                                                value={v.value}
                                                                onChange={e => updateEnvVar(v.id, { value: e.target.value })}
                                                                placeholder="VALUE"
                                                                className="flex-1 font-mono text-xs"
                                                            />
                                                            <Button variant="ghost" size="icon" onClick={() => removeVar(v.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </div>
        </Fragment>
    );
}
