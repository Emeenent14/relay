import { useState, useEffect } from 'react';
import { marketplaceService, MarketplaceServer } from '../../services/marketplace';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Download, ExternalLink, ShieldCheck, Globe, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useUIStore } from '../../stores/uiStore';

export function MarketplacePage() {
    const [servers, setServers] = useState<MarketplaceServer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { openAddDialog } = useUIStore();

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
            setPage(1);
            try {
                const data = await marketplaceService.fetchServers(debouncedQuery, 1);
                setServers(data);
                setHasMore(data.length >= 30);
            } catch (error) {
                console.error('Failed to load marketplace:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadServers();
    }, [debouncedQuery]);

    // Fetch more logic
    const fetchMore = async () => {
        if (isFetchingMore || !hasMore) return;
        setIsFetchingMore(true);
        const nextPage = page + 1;
        try {
            const data = await marketplaceService.fetchServers(debouncedQuery, nextPage);
            if (data.length === 0) {
                setHasMore(false);
            } else {
                setServers(prev => [...prev, ...data]);
                setPage(nextPage);
                setHasMore(data.length >= 30);
            }
        } catch (error) {
            console.error('Failed to fetch more:', error);
        } finally {
            setIsFetchingMore(false);
        }
    };

    const handleInstall = (server: MarketplaceServer) => {
        openAddDialog(server);
    };

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            {/* Header section - matched with other pages */}
            <div className="p-4 border-b border-border bg-card/30">
                <div className="flex flex-col gap-1 mb-4">
                    <h2 className="text-2xl font-bold tracking-tight">Marketplace</h2>
                    <p className="text-xs text-muted-foreground">Discover and install community-built MCP servers.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search GitHub & Registry..."
                        className="pl-9 h-10 text-sm bg-background border-border"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-48 bg-muted/50 rounded-lg border border-border animate-pulse" />
                        ))}
                    </div>
                ) : servers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-sm font-medium text-muted-foreground">No servers found for "{searchQuery}"</p>
                        <p className="text-xs text-zinc-500 mt-1">Try a different search term or check your connection.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {servers.map((server) => (
                                <Card key={server.id} className="group flex flex-col hover:border-primary/50 transition-all duration-200 shadow-none border-border/60 bg-card overflow-hidden h-full">
                                    <div className="p-4 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="p-2 bg-primary/5 rounded-lg">
                                                {server.iconUrl ? (
                                                    <img src={server.iconUrl} alt={server.name} className="h-5 w-5 rounded-sm" />
                                                ) : (
                                                    <Globe className="h-5 w-5 text-primary/70" />
                                                )}
                                            </div>
                                            <Badge variant="secondary" className="text-[9px] uppercase font-bold px-1.5 py-0">
                                                {server.category}
                                            </Badge>
                                        </div>

                                        <div className="mb-2">
                                            <h3 className="text-sm font-semibold truncate leading-none mb-1">{server.name}</h3>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                by <span className="text-foreground/80">{server.author}</span>
                                                {server.author === 'Anthropic' && <ShieldCheck className="h-2.5 w-2.5 text-blue-500" />}
                                            </span>
                                        </div>

                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-normal flex-1">
                                            {server.description}
                                        </p>

                                        <div className="flex items-center gap-2 mt-auto">
                                            <Button size="sm" className="h-8 flex-1 text-xs" onClick={() => handleInstall(server)}>
                                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                                Install
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                                <a href={server.sourceUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="py-8 flex justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchMore}
                                    disabled={isFetchingMore}
                                    className="min-w-[120px]"
                                >
                                    {isFetchingMore ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        'Load More'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
