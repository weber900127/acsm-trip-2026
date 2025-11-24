import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
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

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full border border-red-200">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                        <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-60 text-sm font-mono text-gray-800 mb-4">
                            {this.state.error?.toString()}
                        </div>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Clear Data & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
