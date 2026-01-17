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
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { AlertTriangle } from 'lucide-react';

export function DeleteServerDialog() {
    const { deleteServer } = useServerStore();
    const { activeDialog, dialogServer, closeDialog } = useUIStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const isOpen = activeDialog === 'delete' && dialogServer !== null;

    const handleDelete = async () => {
        if (!dialogServer) return;

        setLoading(true);
        try {
            await deleteServer(dialogServer.id);

            toast({
                title: 'Server Deleted',
                description: `${dialogServer.name} has been removed`,
            });

            closeDialog();
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
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <DialogTitle>Delete Server</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">
                            {dialogServer?.name}
                        </span>
                        ? This will remove the server configuration permanently.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={closeDialog}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete Server'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
