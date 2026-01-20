import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { ServerTemplate, ConfigField } from '../../../lib/serverCatalog';

interface ServerConfigFormProps {
    template: ServerTemplate;
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
}

export function ServerConfigForm({ template, values, onChange }: ServerConfigFormProps) {
    if (!template.configSchema || template.configSchema.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {template.configSchema.map((field) => (
                <ConfigFieldInput
                    key={field.key}
                    field={field}
                    value={values[field.key] || ''}
                    onChange={(val) => onChange(field.key, val)}
                />
            ))}
        </div>
    );
}

function ConfigFieldInput({
    field,
    value,
    onChange
}: {
    field: ConfigField;
    value: string;
    onChange: (val: string) => void
}) {
    const [showPassword, setShowPassword] = useState(false);

    // Initial load of default value is handled by parent or initial state logic, 
    // but we can also set it here if empty? 
    // Ideally the parent initializes 'values' with defaults.

    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
            </div>

            <div className="relative">
                <Input
                    id={field.key}
                    type={field.type === 'password' && !showPassword ? 'password' : 'text'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || (field.default ? `Default: ${field.default}` : '')}
                    className="pr-10"
                />

                {field.type === 'password' && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                )}
            </div>

            {field.description && (
                <p className="text-xs text-muted-foreground">
                    {field.description}
                </p>
            )}
        </div>
    );
}
