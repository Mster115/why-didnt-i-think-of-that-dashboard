import { NextRequest, NextResponse } from 'next/server';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

// Cache configuration
const CACHE_TTL = 30; // 30 seconds

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const active = searchParams.get('active') || 'true';
    const tag = searchParams.get('tag'); // politics, crypto, sports, etc.

    try {
        // Build query params for Gamma API
        const params = new URLSearchParams({
            limit,
            offset,
            active,
            closed: 'false',
        });

        if (tag && tag !== 'all') {
            params.append('tag', tag);
        }

        const response = await fetch(`${GAMMA_API_BASE}/markets?${params.toString()}`, {
            headers: {
                'Accept': 'application/json',
            },
            next: {
                revalidate: CACHE_TTL,
            },
        });

        if (!response.ok) {
            throw new Error(`Gamma API error: ${response.status}`);
        }

        const markets = await response.json();

        // Transform to our schema
        const transformedMarkets = markets.map((market: GammaMarket) => ({
            id: market.id,
            slug: market.slug,
            question: market.question,
            description: market.description,
            category: market.tags?.[0] || 'other',
            outcomes: market.outcomes || ['Yes', 'No'],
            outcomePrices: parseOutcomePrices(market.outcomePrices),
            volume: parseFloat(market.volume || '0'),
            volume24h: parseFloat(market.volume24hr || '0'),
            liquidity: parseFloat(market.liquidity || '0'),
            endDate: market.endDate,
            image: market.image,
            active: market.active,
            closed: market.closed,
        }));

        return NextResponse.json({
            markets: transformedMarkets,
            count: transformedMarkets.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Polymarket API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch markets', markets: [] },
            { status: 500 }
        );
    }
}

// Types for Gamma API response
interface GammaMarket {
    id: string;
    slug: string;
    question: string;
    description: string;
    tags?: string[];
    outcomes?: string[];
    outcomePrices?: string;
    volume?: string;
    volume24hr?: string;
    liquidity?: string;
    endDate?: string;
    image?: string;
    active: boolean;
    closed: boolean;
}

function parseOutcomePrices(pricesStr?: string): number[] {
    if (!pricesStr) return [0.5, 0.5];
    try {
        const prices = JSON.parse(pricesStr);
        return prices.map((p: string) => parseFloat(p));
    } catch {
        return [0.5, 0.5];
    }
}
