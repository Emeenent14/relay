import { useState } from 'react';
import { Search, Filter, Grid3X3, List, Plus, Users, Download } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card } from '../../ui/card';
import { useServerStore } from '../../../stores/serverStore';
import { useToast } from '../../ui/use-toast';
import { ALL_SERVER_TEMPLATES, OFFICIAL_SERVERS, type ServerTemplate } from '../../../lib/serverCatalog';
import { SERVER_CATEGORIES, type ServerCategory } from '../../../lib/constants';
import { ServerIcon } from './ServerIcon';

export function ServerCatalog() {
    const { createServer } = useServerStore();
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ServerCategory | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
                description: `${template.name} added to your servers`,
            });
        } catch (error) {
            toast({ title: 'Error', description: String(error), variant: 'destructive' });
        } finally {
            setAdding(null);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Search and filters */}
            <div className="p-4 border-b border-border space-y-3">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search servers"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button variant="ghost" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <div className="flex border border-border rounded-md">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="rounded-r-none border-0"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="rounded-l-none border-0"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Category filters */}
                <div className="flex gap-1 flex-wrap">
                    <Button
                        variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedCategory('all')}
                    >
                        All
                    </Button>
                    {SERVER_CATEGORIES.map((cat) => (
                        <Button
                            key={cat.value}
                            variant={selectedCategory === cat.value ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedCategory(cat.value)}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Server grid/list */}
            <div className="flex-1 overflow-auto p-4">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Servers</h2>
                    <p className="text-sm text-muted-foreground">
                        Add servers from the MCP Catalog
                    </p>
                </div>

                {filteredServers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No servers found matching your search
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredServers.map((server) => (
                            <ServerCard
                                key={server.id}
                                server={server}
                                onAdd={() => handleAddServer(server)}
                                adding={adding === server.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredServers.map((server) => (
                            <ServerListItem
                                key={server.id}
                                server={server}
                                onAdd={() => handleAddServer(server)}
                                adding={adding === server.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ServerCard({ server, onAdd, adding }: { server: ServerTemplate; onAdd: () => void; adding: boolean }) {
    const isOfficial = OFFICIAL_SERVERS.some(s => s.id === server.id);

    return (
        <Card className="p-4 hover:border-foreground/20 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {server.category}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onAdd}
                    disabled={adding}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <ServerIcon
                        name={server.name}
                        category={server.category}
                        className="w-8 h-8 text-muted-foreground/80"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{server.name}</h3>
                        {isOfficial && (
                            <span className="text-xs text-muted-foreground">(Reference)</span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">{server.source}</p>
                </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {server.description}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>1</span>
                </div>
                <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>10K+</span>
                </div>
            </div>
        </Card>
    );
}

function ServerListItem({ server, onAdd, adding }: { server: ServerTemplate; onAdd: () => void; adding: boolean }) {
    return (
        <Card className="p-3 hover:border-foreground/20 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <ServerIcon
                        name={server.name}
                        category={server.category}
                        className="w-6 h-6 text-muted-foreground/80"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium">{server.name}</h3>
                        <span className="text-xs text-muted-foreground">
                            {server.category}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{server.description}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onAdd} disabled={adding}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}
