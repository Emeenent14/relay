import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { ExternalLink } from 'lucide-react';
import { ServerTemplate } from '../../../lib/serverCatalog';
import { ServerConfigForm } from './ServerConfigForm';
import { useServerStore } from '../../../stores/serverStore';
import { useToast } from '../../ui/use-toast';

interface ServerDetailsDialogProps {
    template: ServerTemplate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ServerDetailsDialog({ template, open, onOpenChange, onSuccess }: ServerDetailsDialogProps) {
    const { createServer } = useServerStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [configValues, setConfigValues] = useState<Record<string, string>>({});

    if (!template) return null;

    const hasConfig = template.configSchema && template.configSchema.length > 0;

    const handleChange = (key: string, value: string) => {
        setConfigValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Prepare args and env
            const newArgs = [...template.args];
            const newEnv = { ...template.env };

            // Process configuration if exists
            if (hasConfig) {
                template.configSchema?.forEach(field => {
                    const value = configValues[field.key] || field.default || '';
                    if (field.key === 'args') {
                        if (value) newArgs.push(value);
                    } else {
                        if (value) newEnv[field.key] = value;
                    }
                });
            }

            await createServer({
                name: template.name,
                description: template.description,
                command: template.command,
                args: newArgs,
                env: Object.keys(newEnv).length > 0 ? newEnv : undefined,
                category: template.category,
            });

            toast({
                title: 'Server Added',
                description: `${template.name} has been added to your servers.`,
                variant: 'success',
            });

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: String(error),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl flex items-center gap-2">
                        {template.name}
                        {template.source === 'official' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-normal">
                                Official
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-foreground/80 mt-2">
                        {template.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {/* Documentation Link */}
                    {template.documentationUrl && (
                        <div className="flex items-center">
                            <a
                                href={template.documentationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                                View Documentation <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    )}

                    {/* Configuration Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium border-b pb-2">Configuration</h3>
                        {hasConfig ? (
                            <ServerConfigForm
                                template={template}
                                values={configValues}
                                onChange={handleChange}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground italic">
                                No additional configuration required.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-6 pt-2 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Installing...' : 'Install Server'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
