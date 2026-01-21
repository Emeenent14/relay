import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { useServerStore } from '../../../stores/serverStore';
import { useUIStore } from '../../../stores/uiStore';
import { useToast } from '../../ui/use-toast';
import { ServerConfigForm } from './ServerConfigForm';
import {
    ALL_SERVER_TEMPLATES,
    type ServerTemplate
} from '../../../lib/serverCatalog';
import type { Server } from '../../../types/server';

interface ServerDetailsPageProps {
    server: Server;
    onBack: () => void;
}

export function ServerDetailsPage({ server, onBack }: ServerDetailsPageProps) {
    const { updateServer } = useServerStore();
    const { openDeleteDialog } = useUIStore();
    const { toast } = useToast();

    const [template, setTemplate] = useState<ServerTemplate | null>(null);
    const [configValues, setConfigValues] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Find the template to get the schema
    useEffect(() => {
        const found = ALL_SERVER_TEMPLATES.find(t => t.name === server.name);
        setTemplate(found || null);

        // Pre-fill values from existing server
        const initialValues: Record<string, string> = {};

        let existingEnv: Record<string, string> = {};
        try {
            existingEnv = JSON.parse(server.env);
        } catch { }

        // existingArgs parsing removed - not currently used

        // Map inputs to schema keys
        if (found && found.configSchema) {
            found.configSchema.forEach(field => {
                if (field.key === 'args') {
                    // This is tricky for args list, assume the first custom arg is what we want if schema has only 1 arg input?
                    // Or we just store args as-is.
                    // For now, let's assume valid configSchema maps nicely.
                    // If schema expects an arg, we look in existingArgs.
                    // But existingArgs might contain default fixed args too.
                    // This is complex. 
                    // Simplified: We assume appended args are the user config.
                    // Ideally we should store config values separately from raw args.
                    // But we don't.
                    // Let's rely on Env vars mostly as they are key-value key based.
                } else {
                    // Env var
                    if (existingEnv[field.key]) {
                        initialValues[field.key] = existingEnv[field.key];
                    }
                }
            });
        }

        // As a fallback for un-templated servers, we might want a raw editor, but for now focus on templated ones.
        setConfigValues(initialValues);

    }, [server]);

    const hasConfig = template?.configSchema && template.configSchema.length > 0;

    // Check if configuration is missing
    const isConfigMissing = () => {
        if (!hasConfig || !template) return false;
        // Check if any required field is empty
        return template.configSchema?.some(field => field.required && !configValues[field.key]);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!template) return;

            const newArgs = [...template.args]; // Start with base args
            const newEnv = { ...template.env }; // Start with base env

            // Apply config
            if (hasConfig) {
                template.configSchema?.forEach(field => {
                    const value = configValues[field.key];
                    if (value) {
                        if (field.key === 'args') {
                            newArgs.push(value);
                        } else {
                            newEnv[field.key] = value;
                        }
                    }
                });
            }

            await updateServer({
                id: server.id,
                args: newArgs,
                env: newEnv
            });

            toast({
                title: 'Configuration Saved',
                description: 'Server updated successfully.',
                variant: 'success',
            });

            // Optionally go back
            // onBack(); 
        } catch (error) {
            toast({
                title: 'Error',
                description: String(error),
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-background animate-in fade-in duration-200">
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            {server.name}
                            <Badge variant="outline" className="text-xs font-normal">
                                {server.category}
                            </Badge>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(server)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-8">
                {/* Status Banner */}
                {isConfigMissing() ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-amber-900 dark:text-amber-500">Configuration Required</h3>
                            <p className="text-sm text-amber-800/80 dark:text-amber-400/80 mt-1">
                                This server requires API keys or configuration to function properly. Please fill in the details below.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-green-900 dark:text-green-500">Ready to Use</h3>
                            <p className="text-sm text-green-800/80 dark:text-green-400/80 mt-1">
                                Server is configured and added to your list.
                            </p>
                        </div>
                    </div>
                )}

                {/* Description */}
                <div>
                    <h3 className="text-lg font-medium mb-2">About</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        {template?.description || server.description}
                    </p>
                    {template?.documentationUrl && (
                        <a
                            href={template.documentationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline mt-2 text-sm"
                        >
                            Documentation <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>

                {/* Config Form */}
                <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        Configuration
                        {hasConfig && <Badge variant="secondary" className="text-xs">Required</Badge>}
                    </h3>

                    <div className="bg-card border rounded-lg p-6 shadow-sm">
                        {template ? (
                            <ServerConfigForm
                                template={template}
                                values={configValues}
                                onChange={(k, v) => setConfigValues(p => ({ ...p, [k]: v }))}
                            />
                        ) : (
                            <div className="text-muted-foreground italic">
                                No configuration template found for this server.
                                <br />
                                <span className="text-xs">Advanced: You can manually edit the server JSON in settings to add custom args.</span>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t flex justify-end">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
