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
import { ServerTemplate } from '../../../lib/serverCatalog';
import { ServerConfigForm } from './ServerConfigForm';
import { useServerStore } from '../../../stores/serverStore';
import { useToast } from '../../ui/use-toast';

interface ServerSetupDialogProps {
    template: ServerTemplate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ServerSetupDialog({ template, open, onOpenChange, onSuccess }: ServerSetupDialogProps) {
    const { createServer } = useServerStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [configValues, setConfigValues] = useState<Record<string, string>>({});

    if (!template) return null;

    // Initialize defaults
    // useEffect(() => {
    //     if (template?.configSchema) {
    //         const defaults: Record<string, string> = {};
    //         template.configSchema.forEach(field => {
    //             if (field.default) defaults[field.key] = field.default;
    //         });
    //         setConfigValues(defaults);
    //     }
    // }, [template]);
    // Effect seems brittle if template changes, better to do lazy init or just handle defaults in render/submit

    const handleChange = (key: string, value: string) => {
        setConfigValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare args and env
            const newArgs = [...template.args];
            const newEnv = { ...template.env };

            // Process configuration
            template.configSchema?.forEach(field => {
                const value = configValues[field.key] || field.default || '';

                if (field.key === 'args') {
                    // Special handling for args - currently we just append
                    // In future, could use placeholders in template.args
                    if (value) {
                        newArgs.push(value);
                    }
                } else {
                    // Assume it's an environment variable
                    if (value) {
                        newEnv[field.key] = value;
                    }
                }
            });

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
                description: `${template.name} is now configured and added.`,
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
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Setup {template.name}</DialogTitle>
                        <DialogDescription>
                            {template.configHint || 'Configure the server settings below.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <ServerConfigForm
                            template={template}
                            values={configValues}
                            onChange={handleChange}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Save & Add'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
