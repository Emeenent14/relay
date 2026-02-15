export interface DependencyIssue {
    binary: string;
    required_by: string;
    install_hint: string;
}

export interface DependencyCheckInput {
    command: string;
    args?: string[];
}

export interface TestConnectionInput {
    server_id?: string;
    command: string;
    args?: string[];
    env?: Record<string, string>;
    secrets?: string[];
}

export interface ConnectionTestResult {
    success: boolean;
    message: string;
    exit_code: number | null;
    missing_dependencies: DependencyIssue[];
    hints: string[];
    stderr_preview: string[];
}
