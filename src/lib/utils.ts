/**
 * Utility functions for YAP-IT Monitor
 */

/**
 * Format a number as currency
 */
export function formatCurrency(value: number, compact = false): string {
    if (compact) {
        if (value >= 1_000_000) {
            return `$${(value / 1_000_000).toFixed(1)}M`;
        }
        if (value >= 1_000) {
            return `$${(value / 1_000).toFixed(1)}K`;
        }
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format a percentage
 */
export function formatPercent(value: number, decimals = 1): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format a relative time (e.g., "2 min ago")
 */
export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return then.toLocaleDateString();
}

/**
 * Format flight altitude
 */
export function formatAltitude(meters: number | null): string {
    if (meters === null) return 'N/A';
    const feet = Math.round(meters * 3.28084);
    return `${feet.toLocaleString()} ft`;
}

/**
 * Format flight speed
 */
export function formatSpeed(metersPerSecond: number | null): string {
    if (metersPerSecond === null) return 'N/A';
    const knots = Math.round(metersPerSecond * 1.94384);
    return `${knots} kts`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Class name helper (like clsx)
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
