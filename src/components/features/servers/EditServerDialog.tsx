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
import { Plus, Trash2, Lock, Eye, EyeOff } from 'lucide-react';
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { SERVER_CATEGORIES } from '../../../lib/constants';
import { parseServerArgs, parseServerEnv, parseServerSecrets } from '../../../types/server';
import { cn } from '../../../lib/utils';

interface EnvVar {
    id: string;
    key: string;
    value: string;
    isSecret: boolean;
    showValue?: boolean;
}

export function EditServerDialog() {
    const { updateServer } = useServerStore();
    const { activeDialog, dialogServer, closeDialog } = useUIStore();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [command, setCommand] = useState('');
    const [args, setArgs] = useState('');
    const [category, setCategory] = useState('other');
    const [envVars, setEnvVars] = useState<EnvVar[]>([]);
    const [loading, setLoading] = useState(false);

    const isOpen = activeDialog === 'edit' && dialogServer !== null;

    // Populate form when dialog opens
    useEffect(() => {
        if (dialogServer) {
            setName(dialogServer.name);
            setDescription(dialogServer.description || '');
            setCommand(dialogServer.command);
            setArgs(parseServerArgs(dialogServer).join('\n'));
            setCategory(dialogServer.category || 'other');

            // Map env variables and secrets
            const normalEnv = parseServerEnv(dialogServer);
            const secretKeys = parseServerSecrets(dialogServer);

            const vars: EnvVar[] = [];

            // Add normal env vars
            Object.entries(normalEnv).forEach(([key, value]) => {
                vars.push({
                    id: Math.random().toString(36).substr(2, 9),
                    key,
                    value,
                    isSecret: false
                });
            });

            // Add secret placeholders (we don't get the values back for safety)
            secretKeys.forEach(key => {
                vars.push({
                    id: Math.random().toString(36).substr(2, 9),
                    key,
                    value: '********', // Placeholder
                    isSecret: true
                });
            });

            setEnvVars(vars);
        }
    }, [dialogServer]);

    const handleClose = () => {
        closeDialog();
    };

    const addEnvVar = () => {
        setEnvVars([...envVars, {
            id: Math.random().toString(36).substr(2, 9),
            key: '',
            value: '',
            isSecret: false
        }]);
    };

    const removeEnvVar = (id: string) => {
        setEnvVars(envVars.filter(v => v.id !== id));
    };

    const updateEnvVar = (id: string, updates: Partial<EnvVar>) => {
        setEnvVars(envVars.map(v => v.id === id ? { ...v, ...updates } : v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!dialogServer) return;

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
            const argsArray = args
                .split(/[\n\s]+/)
                .map(a => a.trim())
                .filter(Boolean);

            const env: Record<string, string> = {};
            const secrets: string[] = [];

            envVars.forEach(v => {
                if (v.key.trim()) {
                    // Only send value if it's not the secret placeholder
                    if (!v.isSecret || v.value !== '********') {
                        env[v.key.trim()] = v.value;
                    } else if (v.isSecret) {
                        // Keep existing secret key
                        secrets.push(v.key.trim());
                    }

                    if (v.isSecret && v.value !== '********') {
                        secrets.push(v.key.trim());
                    }
                }
            });

            await updateServer({
                id: dialogServer.id,
                name: name.trim(),
                description: description.trim() || undefined,
                command: command.trim(),
                args: argsArray.length > 0 ? argsArray : [],
                env,
                secrets,
                category: category,
            });

            toast({
                title: 'Server Updated',
                description: `${name} has been updated`,
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
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <DialogHeader className="p-6 pb-2 shrink-0">
                        <DialogTitle>Edit Server</DialogTitle>
                        <DialogDescription>
                            Update the configuration for this MCP server.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 custom-scrollbar">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name *</Label>
                                <Input
                                    id="edit-name"
                                    placeholder="e.g., filesystem-server"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Input
                                    id="edit-description"
                                    placeholder="What does this server do?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-command">Command *</Label>
                                <Input
                                    id="edit-command"
                                    placeholder="e.g., npx or python"
                                    value={command}
                                    onChange={(e) => setCommand(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-args">Arguments (one per line)</Label>
                                <Textarea
                                    id="edit-args"
                                    placeholder="-y&#10;@modelcontextprotocol/server-filesystem&#10;/path/to/directory"
                                    value={args}
                                    onChange={(e) => setArgs(e.target.value)}
                                    rows={3}
                                />
                            </div>

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
                                <Label htmlFor="edit-category">Category</Label>
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
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
