import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
    onLoadComplete: () => void;
}

const loadingSteps = [
    'Initializing database...',
    'Loading settings...',
    'Fetching servers...',
    'Ready!',
];

export function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Simulate loading steps with minimum display time for smooth UX
        const stepDuration = 400;

        const timer = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= loadingSteps.length - 1) {
                    clearInterval(timer);
                    // Start fade out animation
                    setTimeout(() => {
                        setFadeOut(true);
                        // Complete after fade animation
                        setTimeout(onLoadComplete, 300);
                    }, 300);
                    return prev;
                }
                return prev + 1;
            });
        }, stepDuration);

        return () => clearInterval(timer);
    }, [onLoadComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Logo/Brand */}
            <div className="mb-8 flex flex-col items-center">
                {/* Animated logo */}
                <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                            <svg
                                className="w-7 h-7 text-primary-foreground"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                    </div>
                    {/* Pulse animation */}
                    <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping opacity-20" />
                </div>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Relay
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    MCP Server Manager
                </p>
            </div>

            {/* Loading indicator */}
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />

                {/* Status text with animation */}
                <div className="h-6 overflow-hidden">
                    <p
                        key={currentStep}
                        className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                        {loadingSteps[currentStep]}
                    </p>
                </div>

                {/* Progress dots */}
                <div className="flex gap-1.5 mt-2">
                    {loadingSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index <= currentStep
                                    ? 'bg-primary scale-100'
                                    : 'bg-muted-foreground/30 scale-75'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Version */}
            <p className="absolute bottom-6 text-xs text-muted-foreground/50">
                v0.1.0
            </p>
        </div>
    );
}
