/**
 * useSocialFeed - Hook for fetching Bluesky and RSS feed data
 * Uses TanStack Query for caching and auto-refresh
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export type FeedSource = 'bluesky' | 'rss';

export interface FeedItem {
    id: string;
    source: FeedSource;
    author: string;
    authorHandle?: string;
    authorAvatar?: string;
    content: string;
    timestamp: string;
    url: string;
    title?: string;
    engagement?: {
        likes?: number;
        reposts?: number;
        replies?: number;
    };
}

export interface UseSocialFeedOptions {
    sources?: FeedSource[];
    keywords?: string[];
    blueskyQuery?: string;
    rssFeeds?: string[];
    refreshInterval?: number;
    limit?: number;
}

interface BlueskyApiResponse {
    items: FeedItem[];
    count: number;
    query: string;
    timestamp: string;
}

interface RssApiResponse {
    items: FeedItem[];
    count: number;
    feeds: string[];
    timestamp: string;
}

async function fetchBluesky(query: string, limit: number): Promise<FeedItem[]> {
    const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
    });

    const response = await fetch(`/api/social/bluesky?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch Bluesky feed');
    }

    const data: BlueskyApiResponse = await response.json();
    return data.items;
}

async function fetchRss(feeds: string[], limit: number): Promise<FeedItem[]> {
    const params = new URLSearchParams({
        limit: limit.toString(),
    });

    if (feeds.length > 0) {
        params.set('feeds', feeds.join(','));
    }

    const response = await fetch(`/api/social/rss?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch RSS feeds');
    }

    const data: RssApiResponse = await response.json();
    return data.items;
}

export function useSocialFeed(options: UseSocialFeedOptions = {}) {
    const {
        sources = ['bluesky', 'rss'],
        keywords = [],
        blueskyQuery = 'technology OR politics OR breaking news',
        rssFeeds = [],
        refreshInterval = 60000,
        limit = 25,
    } = options;

    const includeBluesky = sources.includes('bluesky');
    const includeRss = sources.includes('rss');

    // Fetch Bluesky posts
    const blueskyQuery$ = useQuery({
        queryKey: ['social', 'bluesky', blueskyQuery, limit],
        queryFn: () => fetchBluesky(blueskyQuery, limit),
        enabled: includeBluesky,
        refetchInterval: refreshInterval,
        staleTime: 30000,
    });

    // Fetch RSS feeds
    const rssQuery$ = useQuery({
        queryKey: ['social', 'rss', rssFeeds, limit],
        queryFn: () => fetchRss(rssFeeds, limit),
        enabled: includeRss,
        refetchInterval: refreshInterval,
        staleTime: 30000,
    });

    // Combine and filter items
    const items = useMemo(() => {
        const blueskyItems = includeBluesky ? (blueskyQuery$.data || []) : [];
        const rssItems = includeRss ? (rssQuery$.data || []) : [];

        let combined = [...blueskyItems, ...rssItems];

        // Sort by timestamp (newest first)
        combined.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Apply keyword filtering if provided
        if (keywords.length > 0) {
            const lowerKeywords = keywords.map(k => k.toLowerCase());
            combined = combined.filter(item => {
                const text = `${item.content} ${item.title || ''} ${item.author}`.toLowerCase();
                return lowerKeywords.some(keyword => text.includes(keyword));
            });
        }

        return combined;
    }, [blueskyQuery$.data, rssQuery$.data, includeBluesky, includeRss, keywords]);

    const isLoading = (includeBluesky && blueskyQuery$.isLoading) ||
        (includeRss && rssQuery$.isLoading);

    const error = blueskyQuery$.error || rssQuery$.error;

    const lastUpdated = useMemo(() => {
        const times = [
            blueskyQuery$.dataUpdatedAt,
            rssQuery$.dataUpdatedAt,
        ].filter(Boolean);

        return times.length > 0 ? new Date(Math.max(...times)) : null;
    }, [blueskyQuery$.dataUpdatedAt, rssQuery$.dataUpdatedAt]);

    const refetch = () => {
        if (includeBluesky) blueskyQuery$.refetch();
        if (includeRss) rssQuery$.refetch();
    };

    return {
        items,
        isLoading,
        error: error as Error | null,
        lastUpdated,
        refetch,
        blueskyStatus: blueskyQuery$.status,
        rssStatus: rssQuery$.status,
    };
}

export default useSocialFeed;
