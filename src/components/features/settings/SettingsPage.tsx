import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Slider } from '../../ui/slider';
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
import { THEMES, COMMAND_RUNNERS } from '../../../lib/constants';
import { MCP_CLIENTS } from '../../../lib/clientCatalog';
import { Moon, Sun, Monitor, Upload, RotateCcw, Download, AlertTriangle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../../ui/alert-dialog';

const themeIcons: Record<string, React.ReactNode> = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
};

export function SettingsPage() {
    const { settings, loading, fetchSettings, updateSettings, resetToDefaults } = useSettingsStore();
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

    const handleResetToDefaults = async () => {
        try {
            await resetToDefaults();
            toast({
                title: 'Settings Reset',
                description: 'All settings have been restored to defaults',
            });
        } catch (error) {
            toast({
                title: 'Reset Failed',
                description: String(error),
                variant: 'destructive',
            });
        }
    };

    const supportedClients = MCP_CLIENTS.filter(c => c.supported);

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
                                onValueChange={(value) => updateSettings({ theme: value as typeof settings.theme })}
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

                {/* Command Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Command Settings</CardTitle>
                        <CardDescription>
                            Configure how MCP servers are executed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Default Command Runner</Label>
                                <p className="text-sm text-muted-foreground">
                                    Default runtime for new servers
                                </p>
                            </div>
                            <Select
                                value={settings.defaultRunner}
                                onValueChange={(value) => updateSettings({ defaultRunner: value as typeof settings.defaultRunner })}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMMAND_RUNNERS.map((runner) => (
                                        <SelectItem key={runner.value} value={runner.value}>
                                            {runner.label}
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
                        <CardTitle className="text-lg">Integrations</CardTitle>
                        <CardDescription>
                            Configure how server configurations are exported
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Default Export Client</Label>
                                <p className="text-sm text-muted-foreground">
                                    Client used for quick export actions
                                </p>
                            </div>
                            <Select
                                value={settings.defaultExportClient}
                                onValueChange={(value) => updateSettings({ defaultExportClient: value })}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedClients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Auto-export on changes</Label>
                                <p className="text-sm text-muted-foreground">
                                    Automatically export config when servers change
                                </p>
                            </div>
                            <Switch
                                checked={settings.autoExport}
                                onCheckedChange={(checked) => updateSettings({ autoExport: checked })}
                                disabled={loading}
                            />
                        </div>

                        <div className="pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Primary Integration</Label>
                                    <p className="text-sm text-muted-foreground font-mono truncate max-w-[300px]">
                                        Claude Desktop ({configPath || 'Loading...'})
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleExport}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Connect
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Behavior Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Behavior</CardTitle>
                        <CardDescription>
                            Configure app behavior and preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Confirm before delete</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show confirmation when deleting servers
                                </p>
                            </div>
                            <Switch
                                checked={settings.confirmBeforeDelete}
                                onCheckedChange={(checked) => updateSettings({ confirmBeforeDelete: checked })}
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Enable notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show desktop notifications for events
                                </p>
                            </div>
                            <Switch
                                checked={settings.notificationsEnabled}
                                onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Start minimized</Label>
                                <p className="text-sm text-muted-foreground">
                                    Start Relay minimized to system tray
                                </p>
                            </div>
                            <Switch
                                checked={settings.startMinimized}
                                onCheckedChange={(checked) => updateSettings({ startMinimized: checked })}
                                disabled={loading}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Health Check Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Server Health</CardTitle>
                        <CardDescription>
                            Monitor the status of your MCP servers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Enable health checks</Label>
                                <p className="text-sm text-muted-foreground">
                                    Periodically check if servers are running
                                </p>
                            </div>
                            <Switch
                                checked={settings.healthCheckEnabled}
                                onCheckedChange={(checked) => updateSettings({ healthCheckEnabled: checked })}
                                disabled={loading}
                            />
                        </div>

                        {settings.healthCheckEnabled && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Check interval</Label>
                                    <span className="text-sm text-muted-foreground">
                                        {settings.healthCheckInterval} minutes
                                    </span>
                                </div>
                                <Slider
                                    value={[settings.healthCheckInterval]}
                                    onValueChange={(values: number[]) => updateSettings({ healthCheckInterval: values[0] })}
                                    min={5}
                                    max={60}
                                    step={5}
                                    disabled={loading}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Data Management</CardTitle>
                        <CardDescription>
                            Backup, restore, and manage your data
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled>
                                <Download className="h-4 w-4 mr-2" />
                                Backup Servers
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                <Upload className="h-4 w-4 mr-2" />
                                Restore Servers
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-border flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                    Reset Settings
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Restore all settings to defaults
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will restore all settings to their default values.
                                            Your servers will not be affected.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleResetToDefaults}>
                                            Reset Settings
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Community & Support */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Community & Support</CardTitle>
                        <CardDescription>
                            Get help and contribute to Relay
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <a
                                href="https://discord.gg/pjA3ag9H"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <div className="p-2 bg-[#5865F2]/10 rounded-md">
                                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#5865F2]">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-medium">Join Discord</div>
                                    <div className="text-xs text-muted-foreground">Get help & chat</div>
                                </div>
                            </a>

                            <a
                                href="https://github.com/Emeenent14/relay/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <AlertTriangle className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="font-medium">Report Issue</div>
                                    <div className="text-xs text-muted-foreground">Found a bug?</div>
                                </div>
                            </a>
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
                            <div className="pt-2 flex gap-4">
                                <a
                                    href="https://github.com/modelcontextprotocol"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    MCP Documentation
                                </a>
                                <a
                                    href="https://github.com/modelcontextprotocol/servers"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Server Catalog
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
