interface LoadingStateProps {
    message?: string;
}

/**
 * LoadingState - Loading placeholder
 */
export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-500">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">{message}</span>
        </div>
    );
}

export default LoadingState;
