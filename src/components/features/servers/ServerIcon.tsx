import {
    Database,
    HardDrive,
    Globe,
    Zap,
    Code,
    Cloud,
    MessageSquare,
    Search,
    Bot,
    Box,
    GitBranch,
    Terminal,
    LayoutList,
    Brain,
    CloudRain,
    Clock,
    FileText,
    Image,
    Music,
    Video,
    Share2,
    Shield
} from 'lucide-react';
import { type ServerCategory } from '../../../lib/constants';

export interface ServerIconProps {
    name: string;
    category?: string;
    iconUrl?: string | null;
    className?: string;
}

const ICON_MAP: Record<string, any> = {
    // Categories
    filesystem: HardDrive,
    database: Database,
    api: Globe,
    productivity: Zap,
    development: Code,
    cloud: Cloud,
    communication: MessageSquare,
    search: Search,
    automation: Bot,
    other: Box,

    // Specific Keywords
    'postgres': Database,
    'mysql': Database,
    'sqlite': Database,
    'redis': Database,
    'mongo': Database,
    'github': GitBranch,
    'gitlab': GitBranch,
    'git': GitBranch,
    'slack': MessageSquare,
    'discord': MessageSquare,
    'linear': LayoutList,
    'jira': LayoutList,
    'trello': LayoutList,
    'openai': Brain,
    'anthropic': Brain,
    'claude': Brain,
    'gpt': Brain,
    'llm': Brain,
    'weather': CloudRain,
    'time': Clock,
    'date': Clock,
    'fetch': Globe,
    'curl': Globe,
    'http': Globe,
    'terminal': Terminal,
    'bash': Terminal,
    'shell': Terminal,
    'docker': Box, // or default
    'notion': FileText,
    'obsidian': FileText,
    'google-drive': Cloud,
    'gdrive': Cloud,
    's3': Cloud,
    'aws': Cloud,
    'azure': Cloud,
    'gcp': Cloud,
    'vercel': Cloud,
    'netlify': Cloud,
    'cloudflare': Cloud,
    'image': Image,
    'video': Video,
    'audio': Music,
    'music': Music,
    'youtube': Video,
    'spotify': Music,
    'social': Share2,
    'security': Shield,
};

export function ServerIcon({ name, category, iconUrl, className }: ServerIconProps) {
    // 1. Use URL if available
    if (iconUrl) {
        return (
            <img
                src={iconUrl}
                alt={name}
                className={`object-cover rounded-md ${className || 'h-10 w-10'}`}
            />
        );
    }

    // 2. Try to find icon by keyword in name
    const normalizedName = name.toLowerCase();
    for (const [keyword, Icon] of Object.entries(ICON_MAP)) {
        if (normalizedName.includes(keyword)) {
            return <Icon className={className || 'h-10 w-10'} />;
        }
    }

    // 3. Try category
    if (category) {
        const catKey = category.toLowerCase() as ServerCategory;
        // Ensure we have mapped it above or fetch from lucide imports
        // For simplicity, we mapped categories in ICON_MAP too
        const Icon = ICON_MAP[catKey] || Box;
        return <Icon className={className || 'h-10 w-10'} />;
    }

    // 4. Default
    return <Box className={className || 'h-10 w-10'} />;
}
