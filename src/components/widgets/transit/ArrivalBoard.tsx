import { useRef, useEffect, useState } from 'react';
import { TrainArrival } from '@/hooks/useTransit';
import { ArrivalRow } from './ArrivalRow';

interface ArrivalBoardProps {
    arrivals: TrainArrival[];
    lineColors?: Record<string, { name: string; color: string }>;
    isLoading?: boolean;
}

/**
 * ArrivalBoard - Main arrival board grid with Bloomberg-terminal styling
 */
export function ArrivalBoard({ arrivals, lineColors, isLoading }: ArrivalBoardProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-scroll effect
    useEffect(() => {
        if (isHovered || isLoading || arrivals.length === 0) return;

        const interval = setInterval(() => {
            const container = scrollContainerRef.current;
            if (!container) return;

            const { scrollTop, scrollHeight, clientHeight } = container;

            // If near bottom, reset to top
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                container.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Scroll down by 80% of view height
                container.scrollBy({ top: clientHeight * 0.8, behavior: 'smooth' });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isHovered, isLoading, arrivals.length]);

    // Get line color from colors map
    const getLineColor = (line: string): string => {
        if (!line) return '#6366f1'; // Default if line is undefined
        if (lineColors && lineColors[line]) {
            return lineColors[line].color;
        }
        // Default colors based on common patterns
        if (line.includes('Blue')) return '#0053A0';
        if (line.includes('Red')) return '#D41B2C';
        if (line.includes('Green')) return '#008144';
        return '#6366f1'; // Default indigo
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="h-10 bg-zinc-800/50 rounded animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (arrivals.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-zinc-500">
                <p>No arrivals scheduled</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-zinc-700 bg-zinc-800/50 text-xs text-zinc-400 uppercase tracking-wide">
                <div className="col-span-2">Line</div>
                <div className="col-span-4">Destination</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Platform</div>
            </div>

            {/* Arrivals List */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto scroll-smooth"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {arrivals.map((arrival, index) => (
                    <ArrivalRow
                        key={arrival.id || `arrival-${index}`}
                        arrival={arrival}
                        lineColor={getLineColor(arrival.line)}
                    />
                ))}
            </div>
        </div>
    );
}

export default ArrivalBoard;
