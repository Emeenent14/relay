import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { ALL_SERVER_TEMPLATES, type ServerTemplate } from '../../../lib/serverCatalog';
import { CATEGORY_COLORS, type ServerCategory } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import {
    Search,
    Plus,
    ExternalLink,
    FolderOpen,
    Database,
    Globe,
    Zap,
    Code,
    Box,
    Star,
    Cloud,
    MessageSquare,
    Bot,
} from 'lucide-react';

const categoryIcons: Record<ServerCategory, React.ReactNode> = {
    filesystem: <FolderOpen className="h-4 w-4" />,
    database: <Database className="h-4 w-4" />,
    api: <Globe className="h-4 w-4" />,
    productivity: <Zap className="h-4 w-4" />,
    development: <Code className="h-4 w-4" />,
    cloud: <Cloud className="h-4 w-4" />,
    communication: <MessageSquare className="h-4 w-4" />,
    search: <Search className="h-4 w-4" />,
    automation: <Bot className="h-4 w-4" />,
    other: <Box className="h-4 w-4" />,
};

interface ServerCatalogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ServerCatalogDialog({ open, onOpenChange }: ServerCatalogDialogProps) {
    const { createServer } = useServerStore();
    const { openAddDialog } = useUIStore();
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ServerCategory | 'all'>('all');
    const [adding, setAdding] = useState<string | null>(null);

    const filteredServers = ALL_SERVER_TEMPLATES.filter((server) => {
        const matchesSearch =
            server.name.toLowerCase().includes(search.toLowerCase()) ||
            server.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || server.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddServer = async (template: ServerTemplate) => {
        setAdding(template.id);
        try {
            await createServer({
                name: template.name,
                description: template.description,
                command: template.command,
                args: template.args,
                category: template.category,
                marketplace_id: template.id,
            });

            toast({
                title: 'Server Added',
                description: `${template.name} has been added to your servers`,
                variant: 'success',
            });

            if (template.requiresConfig) {
                toast({
                    title: 'Configuration Required',
                    description: template.configHint || 'This server requires additional configuration',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: String(error),
                variant: 'destructive',
            });
        } finally {
            setAdding(null);
        }
    };

    const categories: { value: ServerCategory | 'all'; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'filesystem', label: 'File System' },
        { value: 'database', label: 'Database' },
        { value: 'development', label: 'Development' },
        { value: 'api', label: 'API' },
        { value: 'productivity', label: 'Productivity' },
        { value: 'cloud', label: 'Cloud' },
        { value: 'communication', label: 'Communication' },
        { value: 'search', label: 'Search' },
        { value: 'automation', label: 'Automation' },
        { value: 'other', label: 'Other' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Server Catalog</DialogTitle>
                    <DialogDescription>
                        Add pre-configured MCP servers to your collection
                    </DialogDescription>
                </DialogHeader>

                {/* Search and filters */}
                <div className="flex gap-2 py-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search servers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Category tabs */}
                <div className="flex gap-1 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <Button
                            key={cat.value}
                            variant={selectedCategory === cat.value ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedCategory(cat.value)}
                            className="shrink-0"
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>

                {/* Server list */}
                <div className="flex-1 overflow-auto space-y-2 min-h-0">
                    {/* Community servers disclaimer */}
                    {filteredServers.some(s => s.verified === false) && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-2">
                            <p className="text-xs text-yellow-600 dark:text-yellow-500">
                                <strong>⚠️ Unverified Servers:</strong> Community servers marked as "Unverified" have not been tested.
                                Some packages may not exist on npm or may require different installation steps.
                                Use at your own discretion and report issues if you encounter problems.
                            </p>
                        </div>
                    )}
                    {filteredServers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No servers found
                        </div>
                    ) : (
                        filteredServers.map((server) => (
                            <Card key={server.id} className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div className={cn(
                                            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                                            CATEGORY_COLORS[server.category].replace('text-', 'bg-').split(' ')[0],
                                            CATEGORY_COLORS[server.category].split(' ')[1]
                                        )}>
                                            {categoryIcons[server.category]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h4 className="font-medium">{server.name}</h4>
                                                {server.source === 'official' && (
                                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                )}
                                                {server.verified === true && (
                                                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                                                        Verified
                                                    </Badge>
                                                )}
                                                {server.verified === false && (
                                                    <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                                                        Unverified
                                                    </Badge>
                                                )}
                                                <span className={cn(
                                                    'px-2 py-0.5 rounded-full text-xs',
                                                    CATEGORY_COLORS[server.category]
                                                )}>
                                                    {server.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {server.description}
                                            </p>
                                            {server.requiresConfig && (
                                                <p className="text-xs text-yellow-500 mt-1">
                                                    ⚠️ {server.configHint || 'Requires configuration'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {server.documentationUrl && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => window.open(server.documentationUrl, '_blank')}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            onClick={() => handleAddServer(server)}
                                            disabled={adding === server.id}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            {adding === server.id ? 'Adding...' : 'Add'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => {
                        onOpenChange(false);
                        openAddDialog();
                    }}>
                        + Add Custom Server
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
