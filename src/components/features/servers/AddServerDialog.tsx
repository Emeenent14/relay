import { useState } from 'react';
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
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { SERVER_CATEGORIES } from '../../../lib/constants';

export function AddServerDialog() {
    const { createServer } = useServerStore();
    const { activeDialog, closeDialog } = useUIStore();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [command, setCommand] = useState('');
    const [args, setArgs] = useState('');
    const [category, setCategory] = useState('other');
    const [loading, setLoading] = useState(false);

    const isOpen = activeDialog === 'add';

    const resetForm = () => {
        setName('');
        setDescription('');
        setCommand('');
        setArgs('');
        setCategory('other');
    };

    const handleClose = () => {
        resetForm();
        closeDialog();
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
            // Parse args - split by newlines or spaces
            const argsArray = args
                .split(/[\n\s]+/)
                .map(a => a.trim())
                .filter(Boolean);

            await createServer({
                name: name.trim(),
                description: description.trim() || undefined,
                command: command.trim(),
                args: argsArray.length > 0 ? argsArray : undefined,
                category: category,
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
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add MCP Server</DialogTitle>
                        <DialogDescription>
                            Configure a new MCP server. It will be disabled by default.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
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
                            <Label htmlFor="command">Command *</Label>
                            <Input
                                id="command"
                                placeholder="e.g., npx or python"
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                            />
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Server'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
