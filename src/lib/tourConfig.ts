import { DriveStep } from 'driver.js';

export const tourSteps: DriveStep[] = [
    {
        element: '#sidebar-servers',
        popover: {
            title: 'Server Management',
            description: 'Here you can view and manage all your connected MCP servers. Click here to see the catalog.',
            side: 'right',
            align: 'start',
        }
    },
    {
        element: '#sidebar-marketplace',
        popover: {
            title: 'Marketplace',
            description: 'Discover and install new MCP servers from the community marketplace.',
            side: 'right',
            align: 'start',
        }
    },
    {
        element: '#sidebar-inspector',
        popover: {
            title: 'Inspector',
            description: 'Debug and inspect MCP server communication in real-time.',
            side: 'right',
            align: 'start',
        }
    },
    {
        element: '#sidebar-settings',
        popover: {
            title: 'Settings',
            description: 'Configure global application settings, themes, and more.',
            side: 'right',
            align: 'start',
        }
    },
    {
        popover: {
            title: 'All Set!',
            description: 'You are ready to start using Relay. Enjoy!',
        }
    }
];
