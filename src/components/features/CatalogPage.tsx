import { useState } from 'react';
import { CatalogTabs, type CatalogTab } from './CatalogTabs';
import { MyServersList } from './servers/MyServersList';
import { ServerCatalog } from './servers/ServerCatalog';
import { ClientList } from './clients/ClientList';
import { useServerStore } from '../../stores/serverStore';
import { ALL_SERVER_TEMPLATES } from '../../lib/serverCatalog';

export function CatalogPage() {
    const [activeTab, setActiveTab] = useState<CatalogTab>('my-servers');
    const { servers } = useServerStore();

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Tab Navigation */}
            <CatalogTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                serverCount={servers.length}
                catalogCount={ALL_SERVER_TEMPLATES.length}
            />

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'my-servers' && <MyServersList />}
                {activeTab === 'catalog' && <ServerCatalog />}
                {activeTab === 'clients' && <ClientList />}
            </div>
        </div>
    );
}
