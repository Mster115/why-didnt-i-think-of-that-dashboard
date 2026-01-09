'use client';

import { useState } from 'react';
import { WidgetFrame } from '@/components/core';
import { MarketCard } from './MarketCard';
import { CategoryFilter } from './CategoryFilter';
import { usePolymarket, PolymarketCategory } from '@/hooks/usePolymarket';

type SortOption = 'volume' | 'change' | 'newest';

/**
 * PolymarketPanel - Prediction markets display
 * Shows live odds, volume, and market movement
 */
export function PolymarketPanel() {
    const [category, setCategory] = useState<PolymarketCategory>('politics');
    const [sortBy, setSortBy] = useState<SortOption>('volume');

    const { markets, isLoading, isFetching, lastUpdated, count } = usePolymarket({
        category,
        limit: 50,
    });

    // Sort markets
    const sortedMarkets = [...markets].sort((a, b) => {
        switch (sortBy) {
            case 'volume':
                return b.volume24h - a.volume24h;
            case 'change':
                // Sort by how far from 50/50 (more decisive markets first)
                const aDecisiveness = Math.abs(a.outcomePrices[0] - 0.5);
                const bDecisiveness = Math.abs(b.outcomePrices[0] - 0.5);
                return bDecisiveness - aDecisiveness;
            case 'newest':
                return new Date(b.endDate || 0).getTime() - new Date(a.endDate || 0).getTime();
            default:
                return 0;
        }
    });

    return (
        <WidgetFrame
            title="Polymarket"
            isLoading={isFetching}
            lastUpdated={lastUpdated}
            itemCount={count}
        >
            <div className="flex flex-col h-full gap-3 p-2">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CategoryFilter
                        selected={category}
                        onChange={setCategory}
                    />
                    <SortSelector selected={sortBy} onChange={setSortBy} />
                </div>

                {/* Market List */}
                <div className="flex-1 overflow-auto space-y-2 pr-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32 text-zinc-500">
                            <div className="w-5 h-5 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : sortedMarkets.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
                            No markets found
                        </div>
                    ) : (
                        sortedMarkets.map((market) => (
                            <MarketCard
                                key={market.id}
                                id={market.id}
                                question={market.question}
                                outcomes={market.outcomes}
                                outcomePrices={market.outcomePrices}
                                volume24h={market.volume24h}
                                category={market.category}
                                endDate={market.endDate}
                            />
                        ))
                    )}
                </div>
            </div>
        </WidgetFrame>
    );
}

interface SortSelectorProps {
    selected: SortOption;
    onChange: (sort: SortOption) => void;
}

function SortSelector({ selected, onChange }: SortSelectorProps) {
    const options: { value: SortOption; label: string }[] = [
        { value: 'volume', label: 'Volume' },
        { value: 'change', label: 'Decisive' },
        { value: 'newest', label: 'Ending Soon' },
    ];

    return (
        <div className="flex items-center gap-1">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`
            px-2 py-1 text-xs rounded transition-colors
            ${selected === opt.value
                            ? 'bg-zinc-700 text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }
          `}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

export default PolymarketPanel;
