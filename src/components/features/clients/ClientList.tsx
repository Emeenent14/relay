import { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { MCP_CLIENTS, type ClientConfig } from '../../../lib/clientCatalog';
import {
    MessageSquare,
    MousePointer,
    Code,
    Wind,
    Zap,
    Terminal,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Settings,
} from 'lucide-react';

const clientIcons: Record<string, React.ReactNode> = {
    'claude-desktop': <MessageSquare className="h-5 w-5" />,
    'cursor': <MousePointer className="h-5 w-5" />,
    'vscode': <Code className="h-5 w-5" />,
    'windsurf': <Wind className="h-5 w-5" />,
    'zed': <Zap className="h-5 w-5" />,
    'cline': <Terminal className="h-5 w-5" />,
};

export function ClientList() {
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <p className="text-muted-foreground">
                    Configure MCP clients to execute your AI workloads
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Generic connect section */}
                <Card className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Settings className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium">Connect your MCP client</h3>
                            <p className="text-sm text-muted-foreground">
                                Set up any MCP client to connect to Relay
                            </p>
                        </div>
                        <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>

                {/* Divider */}
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <div className="flex-1 h-px bg-border" />
                    <span>or</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Description */}
                <p className="text-center text-sm text-muted-foreground">
                    Connect with one of our preconfigured MCP clients:
                </p>

                {/* Client list */}
                <div className="space-y-2">
                    {MCP_CLIENTS.map((client) => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ClientCard({ client }: { client: ClientConfig }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
            <div className="p-4 flex items-center gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    {clientIcons[client.id] || <Code className="h-5 w-5" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        Set up {client.name} to connect to Relay
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {client.supported ? (
                        <Button size="sm">Connect</Button>
                    ) : (
                        <Button variant="outline" size="sm" disabled>
                            Coming Soon
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border">
                    <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">{client.description}</p>
                        <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                                Platforms: {client.platforms.join(', ')}
                            </span>
                            {client.documentationUrl && (
                                <a
                                    href={client.documentationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-foreground hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Documentation
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
