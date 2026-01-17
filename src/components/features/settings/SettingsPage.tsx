import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import { Button } from '../../ui/button';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useToast } from '../../ui/use-toast';
import { configApi } from '../../../lib/tauri';
import { THEMES } from '../../../lib/constants';
import { Moon, Sun, Monitor, Upload } from 'lucide-react';

const themeIcons: Record<string, React.ReactNode> = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
};

export function SettingsPage() {
    const { settings, loading, fetchSettings, setTheme, setAutoExport } = useSettingsStore();
    const { toast } = useToast();
    const [configPath, setConfigPath] = useState('');

    useEffect(() => {
        fetchSettings();
        loadConfigPath();
    }, [fetchSettings]);

    const loadConfigPath = async () => {
        try {
            const path = await configApi.getPath();
            setConfigPath(path);
        } catch (error) {
            console.error('Failed to get config path:', error);
        }
    };

    const handleExport = async () => {
        try {
            const path = await configApi.exportToClaude();
            toast({
                title: 'Config Exported',
                description: `Saved to ${path}`,
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Export Failed',
                description: String(error),
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="h-full overflow-auto">
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configure Relay preferences
                    </p>
                </div>

                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Appearance</CardTitle>
                        <CardDescription>
                            Customize how Relay looks on your device
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Theme</Label>
                                <p className="text-sm text-muted-foreground">
                                    Select your preferred color scheme
                                </p>
                            </div>
                            <Select
                                value={settings.theme}
                                onValueChange={setTheme}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {THEMES.map((theme) => (
                                        <SelectItem key={theme.value} value={theme.value}>
                                            <div className="flex items-center gap-2">
                                                {themeIcons[theme.value]}
                                                {theme.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Export Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Export</CardTitle>
                        <CardDescription>
                            Configure how server configurations are exported
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Auto-export on changes</Label>
                                <p className="text-sm text-muted-foreground">
                                    Automatically export config when servers change
                                </p>
                            </div>
                            <Switch
                                checked={settings.autoExport}
                                onCheckedChange={setAutoExport}
                                disabled={loading}
                            />
                        </div>

                        <div className="pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Claude Desktop Config</Label>
                                    <p className="text-sm text-muted-foreground font-mono truncate max-w-[300px]">
                                        {configPath || 'Loading...'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleExport}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Export Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* About */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p><strong className="text-foreground">Relay</strong> - MCP Server Manager</p>
                            <p>Version 0.1.0</p>
                            <p>Built with Tauri, React, and TypeScript</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
