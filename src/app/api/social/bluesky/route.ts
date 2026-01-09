import { NextRequest, NextResponse } from 'next/server';

const BLUESKY_PUBLIC_API = 'https://public.api.bsky.app';
const CACHE_TTL = 30;

export const runtime = 'edge';

// Mock data for when API is unavailable
const MOCK_POSTS = [
    {
        id: 'mock-1',
        source: 'bluesky' as const,
        author: 'TechNews',
        authorHandle: 'technews.bsky.social',
        content: 'Breaking: Major developments in AI technology as companies race to build more efficient models.',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        url: 'https://bsky.app',
        engagement: { likes: 234, reposts: 45, replies: 12 },
    },
    {
        id: 'mock-2',
        source: 'bluesky' as const,
        author: 'MarketWatch',
        authorHandle: 'markets.bsky.social',
        content: 'Markets update: S&P 500 reaches new highs as tech sector leads gains.',
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        url: 'https://bsky.app',
        engagement: { likes: 156, reposts: 28, replies: 8 },
    },
    {
        id: 'mock-3',
        source: 'bluesky' as const,
        author: 'WorldNews',
        authorHandle: 'worldnews.bsky.social',
        content: 'Global leaders gather for climate summit, major announcements expected.',
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
        url: 'https://bsky.app',
        engagement: { likes: 89, reposts: 34, replies: 15 },
    },
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'technology OR news';
    const limit = searchParams.get('limit') || '25';

    try {
        const params = new URLSearchParams({
            q: query,
            limit,
            sort: 'latest',
        });

        const response = await fetch(
            `${BLUESKY_PUBLIC_API}/xrpc/app.bsky.feed.searchPosts?${params.toString()}`,
            {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: CACHE_TTL },
            }
        );

        if (!response.ok) {
            throw new Error(`Bluesky API error: ${response.status}`);
        }

        const data = await response.json();

        const items = data.posts?.map((post: BlueskyPost) => ({
            id: post.uri,
            source: 'bluesky' as const,
            author: post.author?.displayName || post.author?.handle || 'Unknown',
            authorHandle: post.author?.handle,
            authorAvatar: post.author?.avatar,
            content: post.record?.text || '',
            timestamp: post.record?.createdAt || new Date().toISOString(),
            url: `https://bsky.app/profile/${post.author?.handle}/post/${post.uri.split('/').pop()}`,
            engagement: {
                likes: post.likeCount || 0,
                reposts: post.repostCount || 0,
                replies: post.replyCount || 0,
            },
        })) || [];

        return NextResponse.json({
            items,
            count: items.length,
            query,
            timestamp: new Date().toISOString(),
            isMock: false,
        });
    } catch (error) {
        console.error('Bluesky API error:', error);
        // Return mock data on error
        return NextResponse.json({
            items: MOCK_POSTS,
            count: MOCK_POSTS.length,
            query,
            timestamp: new Date().toISOString(),
            isMock: true,
        });
    }
}

interface BlueskyPost {
    uri: string;
    cid: string;
    author: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
    };
    record: {
        text: string;
        createdAt: string;
    };
    likeCount?: number;
    repostCount?: number;
    replyCount?: number;
}
