import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AlertTriangle, X } from 'lucide-react';

interface ConflictingServer {
    id: string;
    name: string;
}

interface ToolConflict {
    tool_name: string;
    servers: ConflictingServer[];
}

interface ConflictWarningBannerProps {
    refreshKey?: number;
}

export function ConflictWarningBanner({ refreshKey }: ConflictWarningBannerProps) {
    const [conflicts, setConflicts] = useState<ToolConflict[]>([]);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const checkConflicts = async () => {
            try {
                const result = await invoke<ToolConflict[]>('detect_tool_conflicts');
                setConflicts(result);
                setDismissed(false);
            } catch (err) {
                console.warn('Failed to check tool conflicts:', err);
            }
        };
        checkConflicts();
    }, [refreshKey]);

    if (dismissed || conflicts.length === 0) return null;

    return (
        <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-yellow-200">
                            Tool Conflict Detected
                        </p>
                        {conflicts.map((conflict, i) => (
                            <p key={i} className="text-xs text-muted-foreground">
                                <code className="text-yellow-300/80 font-mono">{conflict.tool_name}</code>
                                {' '}is provided by{' '}
                                {conflict.servers.map((s, j) => (
                                    <span key={s.id}>
                                        {j > 0 && ' and '}
                                        <span className="font-medium text-foreground">{s.name}</span>
                                    </span>
                                ))}
                                . This may cause unexpected behavior.
                            </p>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 rounded hover:bg-yellow-500/20 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
