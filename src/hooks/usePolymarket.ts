/**
 * usePolymarket - Hook for fetching Polymarket data
 * Uses TanStack Query for caching and background refetch
 */

'use client';

import { useQuery } from '@tanstack/react-query';

export interface Market {
    id: string;
    slug: string;
    question: string;
    description: string;
    category: string;
    outcomes: string[];
    outcomePrices: number[];
    volume: number;
    volume24h: number;
    liquidity: number;
    endDate?: string;
    image?: string;
    active: boolean;
    closed: boolean;
}

export interface MarketsResponse {
    markets: Market[];
    count: number;
    timestamp: string;
}

export type PolymarketCategory = 'all' | 'politics' | 'crypto' | 'sports' | 'pop-culture' | 'business' | 'science';

export interface UsePolymarketOptions {
    category?: PolymarketCategory;
    limit?: number;
    enabled?: boolean;
}

async function fetchMarkets(category: PolymarketCategory, limit: number): Promise<MarketsResponse> {
    const params = new URLSearchParams({
        limit: limit.toString(),
        active: 'true',
    });

    if (category !== 'all') {
        params.append('tag', category);
    }

    const response = await fetch(`/api/polymarket/markets?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to fetch markets');
    }

    return response.json();
}

export function usePolymarket(options: UsePolymarketOptions = {}) {
    const { category = 'all', limit = 20, enabled = true } = options;

    const query = useQuery({
        queryKey: ['polymarket', 'markets', category, limit],
        queryFn: () => fetchMarkets(category, limit),
        refetchInterval: 30000, // 30 seconds
        staleTime: 15000, // 15 seconds
        enabled,
    });

    return {
        markets: query.data?.markets ?? [],
        count: query.data?.count ?? 0,
        timestamp: query.data?.timestamp,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
        lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    };
}

export default usePolymarket;
