import { useState, useEffect } from 'react';
import { useServerStore } from '../../stores/serverStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Play, Terminal, Info, AlertCircle, Cpu, Send, Code } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { invoke } from '@tauri-apps/api/core';

export function InspectorPage() {
    const { servers, fetchServers } = useServerStore();
    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
    const [capabilities, setCapabilities] = useState<{ tools: any[] }>({ tools: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Tool Call State
    const [selectedTool, setSelectedTool] = useState<any | null>(null);
    const [argsJson, setArgsJson] = useState('{}');
    const [callResult, setCallResult] = useState<any | null>(null);
    const [isCalling, setIsCalling] = useState(false);

    useEffect(() => {
        fetchServers();
    }, [fetchServers]);

    const selectedServer = servers.find(s => s.id === selectedServerId);

    const handleInspect = async () => {
        if (!selectedServerId) return;
        setIsLoading(true);
        setError(null);
        setSelectedTool(null);
        setCallResult(null);
        try {
            const result = await invoke<{ tools: any[] }>('list_server_tools', { serverId: selectedServerId });
            setCapabilities(result || { tools: [] });
        } catch (e: any) {
            console.error("Failed to inspect server:", e);
            setError(e.toString());
        } finally {
            setIsLoading(false);
        }
    };

    const handleCallTool = async () => {
        if (!selectedServerId || !selectedTool) return;
        setIsCalling(true);
        setCallResult(null);
        try {
            const parsedArgs = JSON.parse(argsJson);
            const result = await invoke<any>('call_server_tool', {
                serverId: selectedServerId,
                toolName: selectedTool.name,
                arguments: parsedArgs
            });
            setCallResult(result);
        } catch (e: any) {
            console.error("Failed to call tool:", e);
            setCallResult({ error: e.toString() });
        } finally {
            setIsCalling(false);
        }
    };

    return (
        <div className="p-8 h-full flex flex-col gap-6">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">MCP Inspector</h2>
                <p className="text-muted-foreground">Test and debug your MCP servers in real-time.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Server Selection & Connection */}
                <Card className="md:col-span-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Connection</CardTitle>
                        <CardDescription>Select a server to inspect.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Active Servers</label>
                            <Select onValueChange={setSelectedServerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a server..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {servers.map((server) => (
                                        <SelectItem key={server.id} value={server.id}>
                                            {server.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full gap-2"
                            disabled={!selectedServerId || isLoading}
                            onClick={handleInspect}
                        >
                            <Play className="h-4 w-4" />
                            {isLoading ? 'Connecting...' : 'Connect & Inspect'}
                        </Button>

                        {selectedServer && (
                            <div className="mt-4 p-3 bg-accent/50 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">Status</span>
                                    <Badge variant={selectedServer.enabled ? "default" : "secondary"}>
                                        {selectedServer.enabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                                <div className="text-xs break-all">
                                    <span className="text-muted-foreground">Cmd: </span>
                                    <code>{selectedServer.command}</code>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tools & Resources List */}
                <Card className="md:col-span-2 flex flex-col overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Available Capabilities</CardTitle>
                            <CardDescription>Tools and resources exposed by the server.</CardDescription>
                        </div>
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0 border-t mt-4">
                        <div className="h-full flex flex-col">
                            {error && (
                                <div className="p-4 bg-destructive/10 border-b border-destructive/20 text-destructive flex gap-3 items-center">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="flex-1 overflow-auto p-6">
                                {capabilities.tools.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                                        <div className="bg-accent p-4 rounded-full">
                                            <Info className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div className="max-w-[250px]">
                                            <p className="text-sm font-medium">No tools loaded</p>
                                            <p className="text-xs text-muted-foreground mt-1 mb-3">
                                                Connect to a server to view its available tools and resources.
                                            </p>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                                                <a href="https://modelcontextprotocol.io/introduction" target="_blank" rel="noopener noreferrer">
                                                    Learn to build MCP servers
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {capabilities.tools.map((tool) => (
                                            <div
                                                key={tool.name}
                                                className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedTool?.name === tool.name
                                                    ? 'bg-primary/5 border-primary shadow-sm'
                                                    : 'bg-card hover:bg-accent hover:border-accent-foreground/20'
                                                    }`}
                                                onClick={() => setSelectedTool(tool)}
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h4 className="font-semibold text-sm flex items-center gap-2">
                                                            <Cpu className="h-3 w-3 text-primary" />
                                                            {tool.name}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                            {tool.description || 'No description provided.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tool Call Section */}
                            {selectedTool && (
                                <div className="border-t bg-accent/30 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold flex items-center gap-2">
                                            <Send className="h-4 w-4" />
                                            Invoke: {selectedTool.name}
                                        </h3>
                                        <Button
                                            size="sm"
                                            onClick={handleCallTool}
                                            disabled={isCalling}
                                        >
                                            {isCalling ? 'Executing...' : 'Run Tool'}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                                                <Code className="h-3 w-3" />
                                                Arguments (JSON)
                                            </label>
                                            <Textarea
                                                className="font-mono text-xs h-32"
                                                value={argsJson}
                                                onChange={(e) => setArgsJson(e.target.value)}
                                                placeholder="{ ... }"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                                                <Terminal className="h-3 w-3" />
                                                Output
                                            </label>
                                            <div className="bg-black/80 text-green-400 p-3 rounded-md font-mono text-[11px] h-32 overflow-auto border border-white/10 shadow-inner">
                                                {callResult ? (
                                                    <pre>{JSON.stringify(callResult, null, 2)}</pre>
                                                ) : (
                                                    <span className="text-muted-foreground italic">Waiting for execution...</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
