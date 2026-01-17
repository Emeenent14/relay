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
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { SERVER_CATEGORIES } from '../../../lib/constants';
import { parseServerArgs } from '../../../types/server';

export function EditServerDialog() {
    const { updateServer } = useServerStore();
    const { activeDialog, dialogServer, closeDialog } = useUIStore();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [command, setCommand] = useState('');
    const [args, setArgs] = useState('');
    const [category, setCategory] = useState('other');
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
        }
    }, [dialogServer]);

    const handleClose = () => {
        closeDialog();
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
            // Parse args - split by newlines or spaces
            const argsArray = args
                .split(/[\n\s]+/)
                .map(a => a.trim())
                .filter(Boolean);

            await updateServer({
                id: dialogServer.id,
                name: name.trim(),
                description: description.trim() || undefined,
                command: command.trim(),
                args: argsArray.length > 0 ? argsArray : [],
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
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Server</DialogTitle>
                        <DialogDescription>
                            Update the configuration for this MCP server.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
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

                    <DialogFooter>
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
