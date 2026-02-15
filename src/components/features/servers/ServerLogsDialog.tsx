import { useEffect, useMemo, useRef, useState } from 'react';
import { Terminal, Trash2, Pause, Play } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import { useUIStore } from '../../../stores/uiStore';
import { useServerStore } from '../../../stores/serverStore';

export function ServerLogsDialog() {
    const { activeDialog, dialogServer, closeDialog } = useUIStore();
    const { logs, clearLogs } = useServerStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [streamFilter, setStreamFilter] = useState<'all' | 'stdout' | 'stderr'>('all');
    const [lineLimit, setLineLimit] = useState('500');
    const [followLogs, setFollowLogs] = useState(true);

    const isOpen = activeDialog === 'logs' && !!dialogServer;
    const serverLogs = dialogServer ? logs[dialogServer.id] || [] : [];

    const filteredLogs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const limit = Number.parseInt(lineLimit, 10);
        const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 500;

        return serverLogs
            .filter((log) => streamFilter === 'all' || log.stream === streamFilter)
            .filter((log) => !query || log.message.toLowerCase().includes(query))
            .slice(-safeLimit);
    }, [lineLimit, searchQuery, serverLogs, streamFilter]);

    useEffect(() => {
        if (!followLogs || !scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [filteredLogs, followLogs]);

    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight;
        setFollowLogs(distanceFromBottom < 24);
    };

    if (!dialogServer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogContent className="max-w-5xl h-[82vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 border-b shrink-0">
                    <div className="flex items-start justify-between gap-4">
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
                                onClick={() => setFollowLogs((prev) => !prev)}
                            >
                                {followLogs ? (
                                    <>
                                        <Pause className="h-4 w-4 mr-2" />
                                        Pause Follow
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Follow
                                    </>
                                )}
                            </Button>
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
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_180px_140px] gap-3">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search logs..."
                            className="h-9"
                        />
                        <Select
                            value={streamFilter}
                            onValueChange={(value: 'all' | 'stdout' | 'stderr') =>
                                setStreamFilter(value)
                            }
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Stream" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Streams</SelectItem>
                                <SelectItem value="stdout">Stdout</SelectItem>
                                <SelectItem value="stderr">Stderr</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={lineLimit} onValueChange={setLineLimit}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Buffer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="200">200 lines</SelectItem>
                                <SelectItem value="500">500 lines</SelectItem>
                                <SelectItem value="1000">1000 lines</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-black/95 text-zinc-300 font-mono text-xs overflow-hidden p-0">
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="h-full overflow-auto p-4 space-y-1 custom-scrollbar"
                    >
                        {filteredLogs.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-zinc-500 italic">
                                No logs match the current filters.
                            </div>
                        ) : (
                            filteredLogs.map((log, i) => (
                                <div key={i} className="flex gap-4 hover:bg-white/5 py-0.5 px-2 rounded">
                                    <span className="text-zinc-600 shrink-0 select-none">
                                        [{new Date(log.timestamp).toLocaleTimeString()}]
                                    </span>
                                    <span
                                        className={
                                            log.stream === 'stderr'
                                                ? 'text-red-400 font-semibold'
                                                : 'text-emerald-400 font-semibold'
                                        }
                                    >
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
