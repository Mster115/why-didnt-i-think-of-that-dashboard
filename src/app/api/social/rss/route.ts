import { NextRequest, NextResponse } from 'next/server';

const CACHE_TTL = 60; // 60 seconds

// Default RSS feeds if none provided
const DEFAULT_FEEDS = [
    'https://feeds.arstechnica.com/arstechnica/index',
    'https://www.theverge.com/rss/index.xml',
    'https://techcrunch.com/feed/',
];

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const feedsParam = searchParams.get('feeds');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const feedUrls = feedsParam ? feedsParam.split(',') : DEFAULT_FEEDS;

    try {
        // Fetch all feeds concurrently
        const feedPromises = feedUrls.map(async (url) => {
            try {
                const response = await fetch(url.trim(), {
                    headers: {
                        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
                        'User-Agent': 'YAP-IT Monitor/1.0',
                    },
                    next: {
                        revalidate: CACHE_TTL,
                    },
                });

                if (!response.ok) {
                    console.warn(`Failed to fetch feed ${url}: ${response.status}`);
                    return [];
                }

                const xml = await response.text();
                return parseRssFeed(xml, url);
            } catch (error) {
                console.warn(`Error fetching feed ${url}:`, error);
                return [];
            }
        });

        const feedResults = await Promise.all(feedPromises);

        // Flatten and sort by timestamp
        const allItems = feedResults
            .flat()
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);

        return NextResponse.json({
            items: allItems,
            count: allItems.length,
            feeds: feedUrls,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('RSS aggregation error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch RSS feeds', items: [] },
            { status: 500 }
        );
    }
}

interface RssFeedItem {
    id: string;
    source: 'rss';
    author: string;
    content: string;
    timestamp: string;
    url: string;
    feedUrl: string;
    title: string;
}

function parseRssFeed(xml: string, feedUrl: string): RssFeedItem[] {
    const items: RssFeedItem[] = [];

    // Extract feed title for author attribution
    const feedTitleMatch = xml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const feedTitle = feedTitleMatch ? cleanText(feedTitleMatch[1]) : new URL(feedUrl).hostname;

    // Try RSS 2.0 format first
    const rssItemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = rssItemRegex.exec(xml)) !== null) {
        const itemXml = match[1];

        const title = extractTag(itemXml, 'title');
        const link = extractTag(itemXml, 'link') || extractTag(itemXml, 'guid');
        const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'content:encoded');
        const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'dc:date');
        const author = extractTag(itemXml, 'author') || extractTag(itemXml, 'dc:creator') || feedTitle;

        if (title && link) {
            items.push({
                id: link,
                source: 'rss',
                author: cleanText(author),
                content: cleanText(description || title).slice(0, 280),
                timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                url: link,
                feedUrl,
                title: cleanText(title),
            });
        }
    }

    // If no RSS items found, try Atom format
    if (items.length === 0) {
        const atomEntryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;

        while ((match = atomEntryRegex.exec(xml)) !== null) {
            const entryXml = match[1];

            const title = extractTag(entryXml, 'title');
            const linkMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
            const link = linkMatch ? linkMatch[1] : null;
            const summary = extractTag(entryXml, 'summary') || extractTag(entryXml, 'content');
            const updated = extractTag(entryXml, 'updated') || extractTag(entryXml, 'published');
            const authorName = extractTag(entryXml, 'name') || feedTitle;

            if (title && link) {
                items.push({
                    id: link,
                    source: 'rss',
                    author: cleanText(authorName),
                    content: cleanText(summary || title).slice(0, 280),
                    timestamp: updated ? new Date(updated).toISOString() : new Date().toISOString(),
                    url: link,
                    feedUrl,
                    title: cleanText(title),
                });
            }
        }
    }

    return items;
}

function extractTag(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
}

function cleanText(text: string): string {
    return text
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
