import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-midnight-blue text-white flex items-center justify-center p-4">
                    <Card className="max-w-md w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="bg-red-500/20 p-4 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                            <p className="text-gray-400 text-sm">
                                {this.state.error?.message || 'An unexpected error occurred.'}
                            </p>
                        </div>

                        <Button onClick={this.handleReload} className="w-full">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reload Game
                        </Button>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
