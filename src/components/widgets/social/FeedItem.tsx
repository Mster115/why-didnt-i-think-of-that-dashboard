'use client';

import { FeedItem as FeedItemType } from '@/hooks/useSocialFeed';

interface FeedItemProps {
    item: FeedItemType;
    keywords?: string[];
}

/**
 * FeedItem - Individual feed item display
 * Shows source badge, author, content with keyword highlighting, and engagement
 */
export function FeedItem({ item, keywords = [] }: FeedItemProps) {
    const timeAgo = getRelativeTime(item.timestamp);

    return (
        <article className="group p-3 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {item.authorAvatar ? (
                        <img
                            src={item.authorAvatar}
                            alt={item.author}
                            className="w-8 h-8 rounded-full bg-zinc-800"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                            <span className="text-xs text-zinc-400 font-medium">
                                {item.author.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <SourceBadge source={item.source} />
                        <span className="text-sm font-medium text-white truncate">
                            {item.author}
                        </span>
                        {item.authorHandle && (
                            <span className="text-xs text-zinc-500 truncate">
                                @{item.authorHandle}
                            </span>
                        )}
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">{timeAgo}</span>
                    </div>

                    {/* Title (for RSS) */}
                    {item.title && (
                        <h3 className="text-sm font-medium text-zinc-200 mb-1 line-clamp-1">
                            <HighlightedText text={item.title} keywords={keywords} />
                        </h3>
                    )}

                    {/* Body */}
                    <p className="text-sm text-zinc-400 line-clamp-2">
                        <HighlightedText text={item.content} keywords={keywords} />
                    </p>

                    {/* Engagement */}
                    {item.engagement && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-600">
                            {item.engagement.replies !== undefined && (
                                <span className="flex items-center gap-1">
                                    <ReplyIcon />
                                    {formatNumber(item.engagement.replies)}
                                </span>
                            )}
                            {item.engagement.reposts !== undefined && (
                                <span className="flex items-center gap-1">
                                    <RepostIcon />
                                    {formatNumber(item.engagement.reposts)}
                                </span>
                            )}
                            {item.engagement.likes !== undefined && (
                                <span className="flex items-center gap-1">
                                    <LikeIcon />
                                    {formatNumber(item.engagement.likes)}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Link */}
                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1.5 rounded hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Open in new tab"
                >
                    <ExternalLinkIcon />
                </a>
            </div>
        </article>
    );
}

function SourceBadge({ source }: { source: 'bluesky' | 'rss' }) {
    const isBluesky = source === 'bluesky';

    return (
        <span
            className={`
                inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide
                ${isBluesky
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }
            `}
        >
            {isBluesky ? '🦋' : '📰'} {source}
        </span>
    );
}

function HighlightedText({ text, keywords }: { text: string; keywords: string[] }) {
    if (keywords.length === 0) {
        return <>{text}</>;
    }

    const pattern = new RegExp(`(${keywords.map(k => escapeRegex(k)).join('|')})`, 'gi');
    const parts = text.split(pattern);

    return (
        <>
            {parts.map((part, i) => {
                const isHighlighted = keywords.some(k =>
                    part.toLowerCase() === k.toLowerCase()
                );
                return isHighlighted ? (
                    <mark key={i} className="bg-yellow-500/30 text-yellow-200 px-0.5 rounded">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                );
            })}
        </>
    );
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getRelativeTime(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}

// Icons
function ReplyIcon() {
    return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
    );
}

function RepostIcon() {
    return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    );
}

function LikeIcon() {
    return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    );
}

function ExternalLinkIcon() {
    return (
        <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    );
}

export default FeedItem;
