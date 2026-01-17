import { cn } from '../../lib/utils';
import { Server, Settings, Zap } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const navItems = [
    { id: 'servers' as const, label: 'Servers', icon: Server },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function Sidebar() {
    const { currentPage, setCurrentPage } = useUIStore();

    return (
        <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
            {/* Logo / Brand */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Relay</h1>
                        <p className="text-xs text-muted-foreground">MCP Server Manager</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentPage(item.id)}
                            className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                currentPage === item.id
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                    Relay v0.1.0
                </p>
            </div>
        </aside>
    );
}
