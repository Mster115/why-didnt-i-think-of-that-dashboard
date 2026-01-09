'use client';

import { Sparkline } from '@/components/ui';

interface MarketCardProps {
    id: string;
    question: string;
    outcomes: string[];
    outcomePrices: number[];
    volume24h: number;
    category: string;
    endDate?: string;
}

/**
 * MarketCard - Individual market display
 * Shows question, odds, volume, and sparkline
 */
export function MarketCard({
    question,
    outcomes,
    outcomePrices,
    volume24h,
    category,
    endDate,
}: MarketCardProps) {
    const yesPrice = outcomePrices[0] ?? 0.5;
    const noPrice = outcomePrices[1] ?? 0.5;

    // Determine if market is decisive (far from 50/50)
    const isDecisive = Math.abs(yesPrice - 0.5) > 0.3;

    // Format volume
    const formatVolume = (vol: number) => {
        if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
        if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
        return `$${vol.toFixed(0)}`;
    };

    // Format end date
    const formatEndDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return 'Ended';
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days <= 7) return `${days}d`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Generate mock sparkline data based on current price
    const generateSparkline = () => {
        const points = [];
        let value = yesPrice - 0.1 + Math.random() * 0.2;
        for (let i = 0; i < 20; i++) {
            value += (Math.random() - 0.5) * 0.05;
            value = Math.max(0, Math.min(1, value));
            points.push(value);
        }
        points.push(yesPrice);
        return points;
    };

    return (
        <div className="p-3 border border-zinc-800 rounded bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group">
            {/* Header: Category & End Date */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wide">
                    {category}
                </span>
                {endDate && (
                    <span className="text-[10px] text-zinc-600">
                        {formatEndDate(endDate)}
                    </span>
                )}
            </div>

            {/* Question */}
            <h3 className="text-sm text-white font-medium leading-tight mb-3 line-clamp-2 group-hover:text-zinc-100">
                {question}
            </h3>

            {/* Odds Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                    <span className={`font-mono ${yesPrice > 0.5 ? 'text-green-400' : 'text-zinc-400'}`}>
                        {outcomes[0] || 'Yes'} {(yesPrice * 100).toFixed(0)}¢
                    </span>
                    <span className={`font-mono ${noPrice > 0.5 ? 'text-red-400' : 'text-zinc-400'}`}>
                        {outcomes[1] || 'No'} {(noPrice * 100).toFixed(0)}¢
                    </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
                    <div
                        className={`h-full transition-all ${isDecisive ? 'bg-green-500' : 'bg-green-600/70'}`}
                        style={{ width: `${yesPrice * 100}%` }}
                    />
                    <div
                        className={`h-full transition-all ${isDecisive ? 'bg-red-500' : 'bg-red-600/70'}`}
                        style={{ width: `${noPrice * 100}%` }}
                    />
                </div>
            </div>

            {/* Footer: Volume & Sparkline */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                    {formatVolume(volume24h)} <span className="text-zinc-600">24h</span>
                </span>
                <Sparkline
                    data={generateSparkline()}
                    width={60}
                    height={16}
                    color={yesPrice > 0.5 ? '#22c55e' : '#ef4444'}
                />
            </div>
        </div>
    );
}

export default MarketCard;
