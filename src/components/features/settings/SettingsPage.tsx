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
