'use client';

import { ReactNode } from 'react';

interface WidgetFrameProps {
    title: string;
    children: ReactNode;
    className?: string;
    isLoading?: boolean;
    lastUpdated?: Date | null;
    itemCount?: number;
}

/**
 * WidgetFrame - Individual widget wrapper
 * Minimalist design: Top header removed, title integrated into footer
 */
export function WidgetFrame({
    title,
    children,
    className = '',
    isLoading = false,
    lastUpdated = null,
    itemCount,
}: WidgetFrameProps) {
    return (
        <div
            className={`flex flex-col h-full w-full bg-zinc-950 border border-zinc-800 rounded overflow-hidden ${className}`}
        >
            {/* Body */}
            <div className="flex-1 overflow-auto min-h-0 relative group">
                {children}

                {/* Loading Grid Overlay (optional visual flair) */}
                {isLoading && (
                    <div className="absolute top-2 right-2 z-50">
                        <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                    </div>
                )}
            </div>

            {/* Combined Footer: Title + Stats */}
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-800 bg-zinc-900/90 text-xs backdrop-blur-sm z-10">
                {/* Left: Title */}
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="font-bold text-zinc-300 uppercase tracking-wider">
                        {title}
                    </span>
                </div>

                {/* Right: Stats */}
                <div className="flex items-center gap-3 text-zinc-500 font-mono">
                    {itemCount !== undefined && <span>{itemCount} items</span>}
                    <span className="hidden sm:inline">
                        {lastUpdated
                            ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                            : '--:--:--'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default WidgetFrame;
