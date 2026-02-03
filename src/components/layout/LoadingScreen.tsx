import { useEffect, useState } from 'react';

interface LoadingScreenProps {
    onLoadComplete?: () => void;
    minDisplayTime?: number;
}

export function LoadingScreen({ onLoadComplete, minDisplayTime = 1500 }: LoadingScreenProps) {
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Faster at start, slower near end
                const increment = prev < 70 ? 15 : prev < 90 ? 5 : 2;
                return Math.min(prev + increment, 100);
            });
        }, minDisplayTime / 10);

        // Trigger fade out and completion
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                onLoadComplete?.();
            }, 500); // Wait for fade animation
        }, minDisplayTime);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [minDisplayTime, onLoadComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Logo with pulse animation */}
            <div className="mb-8">
                <img
                    src="/relay.png"
                    alt="Relay"
                    className="w-32 h-32 animate-logo-pulse"
                />
            </div>

            {/* App name */}
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Relay
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
                Visual MCP Server Manager
            </p>

            {/* Loading bar */}
            <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Loading text */}
            <p className="mt-4 text-xs text-muted-foreground animate-pulse">
                {progress < 30 && 'Initializing...'}
                {progress >= 30 && progress < 60 && 'Loading settings...'}
                {progress >= 60 && progress < 90 && 'Syncing servers...'}
                {progress >= 90 && 'Almost ready...'}
            </p>
        </div>
    );
}
