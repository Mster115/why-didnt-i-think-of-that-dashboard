'use client';

import { TrainArrival } from '@/hooks/useTransit';

interface ArrivalRowProps {
    arrival: TrainArrival;
    lineColor?: string;
}

/**
 * ArrivalRow - Individual arrival row with delay indicators
 * Color-coded status and pulsing animation for imminent arrivals
 */
export function ArrivalRow({ arrival, lineColor }: ArrivalRowProps) {
    const { line, destination, scheduledTime, delay, status, platform, direction } = arrival;

    // Determine status styling
    const getStatusStyles = () => {
        switch (status) {
            case 'delayed':
                if (delay > 5) {
                    return 'text-red-500 bg-red-500/10';
                }
                return 'text-yellow-500 bg-yellow-500/10';
            case 'cancelled':
                return 'text-red-600 bg-red-600/20 line-through';
            default:
                return 'text-green-500 bg-green-500/10';
        }
    };

    // Format delay display
    const getDelayDisplay = () => {
        if (status === 'cancelled') return 'CANCELLED';
        if (delay === 0) return 'On Time';
        return `+${delay} min`;
    };

    // Check if arrival is imminent (within 2 minutes)
    const isImminent = delay === 0 && scheduledTime?.includes(':');

    return (
        <div
            className={`
                grid grid-cols-12 gap-2 px-3 py-2 border-b border-zinc-800/50
                hover:bg-zinc-800/30 transition-colors
                ${isImminent ? 'animate-pulse' : ''}
            `}
        >
            {/* Line */}
            <div className="col-span-2 flex items-center gap-2">
                <span
                    className="px-2 py-0.5 rounded text-xs font-bold text-white"
                    style={{ backgroundColor: lineColor || '#6366f1' }}
                >
                    {line}
                </span>
            </div>

            {/* Destination */}
            <div className="col-span-4 flex items-center">
                <div className="truncate">
                    <span className="text-sm text-white font-medium">{destination}</span>
                    {direction && (
                        <span className="text-xs text-zinc-500 ml-2">{direction}</span>
                    )}
                </div>
            </div>

            {/* Scheduled Time */}
            <div className="col-span-2 flex items-center">
                <span className="text-sm text-zinc-300 font-mono">{scheduledTime}</span>
            </div>

            {/* Status/Delay */}
            <div className="col-span-2 flex items-center">
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyles()}`}>
                    {getDelayDisplay()}
                </span>
            </div>

            {/* Platform */}
            <div className="col-span-2 flex items-center justify-end">
                {platform && (
                    <span className="text-xs text-zinc-400 font-mono">
                        Track {platform}
                    </span>
                )}
            </div>
        </div>
    );
}

export default ArrivalRow;
