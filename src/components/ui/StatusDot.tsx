interface StatusDotProps {
    status: 'success' | 'warning' | 'error' | 'neutral';
    pulse?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * StatusDot - Visual status indicator
 */
export function StatusDot({
    status,
    pulse = false,
    size = 'md',
}: StatusDotProps) {
    const colors = {
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
        neutral: 'bg-zinc-500',
    };

    const sizes = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
    };

    return (
        <span
            className={`
        inline-block rounded-full
        ${colors[status]}
        ${sizes[size]}
        ${pulse ? 'animate-pulse' : ''}
      `}
        />
    );
}

export default StatusDot;
