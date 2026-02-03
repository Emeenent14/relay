import { useState, useEffect } from 'react';
import { marketplaceService, MarketplaceServer } from '../../services/marketplace';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, ExternalLink, ShieldCheck, Globe, RefreshCw, Box, AlertCircle, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useUIStore } from '../../stores/uiStore';
import { SERVER_CATEGORIES, type ServerCategory } from '../../lib/constants';
import { ServerIcon } from './servers/ServerIcon';
import { useToast } from '../ui/use-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../ui/tooltip';

export function MarketplacePage() {
    const [servers, setServers] = useState<MarketplaceServer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ServerCategory | 'all'>('all');
    const { openAddDialog } = useUIStore();
    const { toast } = useToast();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Initial load and search
    useEffect(() => {
        const loadServers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await marketplaceService.fetchServers(debouncedQuery, 1);
                setServers(response.servers);

                if (response.isFallback) {
                    const msg = response.error || 'Connection failed';
                    setError(`Offline Mode: ${msg}`);
                    toast({
                        title: 'Marketplace Offline',
                        description: `Using local catalog. Error: ${msg}`,
                        variant: 'destructive'
                    });
                } else {
                    toast({
                        title: 'Marketplace Debug',
                        description: `Fetched: ${response.servers.length} online servers.`,
                    });
                }
            } catch (err) {
                console.error('Failed to load marketplace:', err);
                setError(String(err));
            } finally {
                setIsLoading(false);
            }
        };
        loadServers();
    }, [debouncedQuery]);

    const handleInstall = (server: MarketplaceServer) => {
        openAddDialog(server);
    };

    // Filter servers
    const filteredServers = servers.filter(server => {
        if (selectedCategory === 'all') return true;
        return server.category.toLowerCase() === selectedCategory.toLowerCase();
    });

    // Get source badge for server
    const getSourceBadge = (server: MarketplaceServer) => {
        if (server.source === 'docker') {
            return (
                <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-blue-600 hover:bg-blue-600">
                    <Box className="h-2.5 w-2.5 mr-0.5" />
                    Docker
                </Badge>
            );
        }
        if (server.source === 'registry') {
            return (
                <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-green-600 hover:bg-green-600">
                    <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
                    Official
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
                Curated
            </Badge>
        );
    };

    // Format pull count for display
    const formatPullCount = (count?: number) => {
        if (!count) return null;
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
        return count.toString();
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div className="h-full flex flex-col bg-background overflow-hidden">
                {/* Header section */}
                <div className="p-4 border-b border-border bg-card/30 space-y-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight">Marketplace</h2>
                        <p className="text-xs text-muted-foreground">
                            Discover 200+ MCP servers from Docker Hub and the official registry.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search servers..."
                                className="pl-9 h-10 text-sm bg-background border-border"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            <Button
                                variant={selectedCategory === 'all' ? "secondary" : "ghost"}
                                size="sm"
                                className="h-7 text-xs whitespace-nowrap"
                                onClick={() => setSelectedCategory('all')}
                            >
                                All
                            </Button>
                            {SERVER_CATEGORIES.map(cat => (
                                <Button
                                    key={cat.value}
                                    variant={selectedCategory === cat.value ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-7 text-xs whitespace-nowrap"
                                    onClick={() => setSelectedCategory(cat.value)}
                                >
                                    {cat.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    {/* GitHub Star Banner */}
                    <div className="mb-6 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded-full border border-border">
                                <span className="text-xl">⭐️</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Star us on GitHub</h3>
                                <p className="text-xs text-muted-foreground">
                                    Love Relay? Support us by starring the repository!
                                </p>
                            </div>
                        </div>
                        <Button size="sm" className="gap-2" asChild>
                            <a href="https://github.com/Emeenent14/relay" target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4" />
                                Star Repo
                            </a>
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-48 bg-muted/50 rounded-lg border border-border animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
                            <p className="text-sm font-medium text-destructive">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => setDebouncedQuery(debouncedQuery)}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    ) : filteredServers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                            <div className="p-4 bg-accent/50 rounded-full">
                                <Globe className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <div className="max-w-xs mx-auto">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {searchQuery || selectedCategory !== 'all'
                                        ? 'No servers found matching your criteria'
                                        : 'No servers available'}
                                </p>
                                <p className="text-xs text-zinc-500 mt-2">
                                    Try adjusting filters or check the official registry.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <a href="https://github.com/modelcontextprotocol/servers" target="_blank" rel="noopener noreferrer">
                                    Browse Official Registry <ExternalLink className="ml-2 h-3 w-3" />
                                </a>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {/* Results count & Submit CTA */}
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Found {filteredServers.length} server{filteredServers.length !== 1 ? 's' : ''}
                                    {searchQuery && ` for "${searchQuery}"`}
                                </p>
                                <a
                                    href="https://github.com/Emeenent14/relay/issues/new?template=server_request.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                    Submit a Server <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredServers.map((server) => (
                                    <Card key={server.id} className="group flex flex-col hover:border-primary/50 transition-all duration-200 shadow-none border-border/60 bg-card overflow-hidden h-full">
                                        <div className="p-4 flex flex-col h-full">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="p-2 bg-primary/5 rounded-lg shrink-0">
                                                    <ServerIcon
                                                        name={server.name}
                                                        category={server.category}
                                                        iconUrl={server.iconUrl}
                                                        className="w-5 h-5 text-primary/70"
                                                    />
                                                </div>
                                                <div className="flex gap-1">
                                                    {getSourceBadge(server)}
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <h3 className="text-sm font-semibold truncate leading-none mb-1">{server.name}</h3>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    by <span className="text-foreground/80">{server.author}</span>
                                                </span>
                                            </div>

                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-normal flex-1">
                                                {server.description || 'No description available'}
                                            </p>

                                            {/* Package name and stats */}
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-[10px] text-zinc-500 font-mono truncate">
                                                    {server.packageName}
                                                </p>
                                                {server.pullCount && server.pullCount > 0 && (
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                        <TrendingUp className="h-2.5 w-2.5" />
                                                        {formatPullCount(server.pullCount)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mt-auto">
                                                <Button size="sm" className="h-8 flex-1 text-xs" onClick={() => handleInstall(server)}>
                                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                                    Install
                                                </Button>
                                                {server.sourceUrl && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                                                <a href={server.sourceUrl} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </a>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View source</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
