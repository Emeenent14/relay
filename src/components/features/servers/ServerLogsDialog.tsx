import { useRef, useEffect } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { useUIStore } from '../../../stores/uiStore';
import { useServerStore } from '../../../stores/serverStore';

export function ServerLogsDialog() {
    const { activeDialog, dialogServer, closeDialog } = useUIStore();
    const { logs, clearLogs } = useServerStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    const isOpen = activeDialog === 'logs' && !!dialogServer;
    const serverLogs = dialogServer ? logs[dialogServer.id] || [] : [];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [serverLogs]);

    if (!dialogServer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-md">
                                <Terminal className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle>Server Logs: {dialogServer.name}</DialogTitle>
                                <DialogDescription>
                                    Real-time stdout and stderr output.
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => clearLogs(dialogServer.id)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear Logs
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-black/95 text-zinc-300 font-mono text-xs overflow-hidden p-0">
                    <div
                        ref={scrollRef}
                        className="h-full overflow-auto p-4 space-y-1 custom-scrollbar"
                    >
                        {serverLogs.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-zinc-500 italic">
                                No logs yet. Waiting for server output...
                            </div>
                        ) : (
                            serverLogs.map((log, i) => (
                                <div key={i} className="flex gap-4 hover:bg-white/5 py-0.5 px-2 rounded">
                                    <span className="text-zinc-600 shrink-0 select-none">
                                        [{new Date(log.timestamp).toLocaleTimeString()}]
                                    </span>
                                    <span className={log.stream === 'stderr' ? 'text-red-400' : 'text-green-400'}>
                                        {log.stream.toUpperCase()}
                                    </span>
                                    <span className="break-all whitespace-pre-wrap">{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
