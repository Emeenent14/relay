import { cn } from '../../lib/utils';
import { Server, BookOpen, MonitorSmartphone } from 'lucide-react';

export type CatalogTab = 'my-servers' | 'catalog' | 'clients';

interface CatalogTabsProps {
    activeTab: CatalogTab;
    onTabChange: (tab: CatalogTab) => void;
    serverCount: number;
    catalogCount: number;
}

export function CatalogTabs({ activeTab, onTabChange, serverCount, catalogCount }: CatalogTabsProps) {
    const tabs = [
        { id: 'my-servers' as const, label: 'My servers', count: serverCount, icon: Server },
        { id: 'catalog' as const, label: 'Catalog', count: catalogCount, icon: BookOpen },
        { id: 'clients' as const, label: 'Clients', count: null, icon: MonitorSmartphone },
    ];

    return (
        <div className="border-b border-border">
            <div className="flex gap-1 px-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
                            activeTab === tab.id
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {tab.label}
                        {tab.count !== null && (
                            <span className={cn(
                                'text-xs',
                                activeTab === tab.id ? 'text-muted-foreground' : 'text-muted-foreground/70'
                            )}>
                                ({tab.count})
                            </span>
                        )}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
