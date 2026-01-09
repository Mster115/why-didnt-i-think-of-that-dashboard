'use client';

import { FeedItem as FeedItemType } from '@/hooks/useSocialFeed';
import { useEffect, useRef, useState } from 'react';

interface FeedTickerProps {
    items: FeedItemType[];
    speed?: number; // pixels per second
    pauseOnHover?: boolean;
}

/**
 * FeedTicker - Bloomberg-style horizontal scrolling ticker
 * CSS animation-based for smooth performance
 */
export function FeedTicker({ items, speed = 50, pauseOnHover = true }: FeedTickerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [animationDuration, setAnimationDuration] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            const contentWidth = contentRef.current.scrollWidth / 2; // Divide by 2 because content is duplicated
            setAnimationDuration(contentWidth / speed);
        }
    }, [items, speed]);

    if (items.length === 0) {
        return (
            <div className="h-8 flex items-center justify-center text-zinc-600 text-sm">
                No items to display
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden h-10 bg-zinc-900/50 border-y border-zinc-800"
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        >
            <div
                ref={contentRef}
                className="absolute whitespace-nowrap flex items-center h-full ticker-scroll"
                style={{
                    animationDuration: `${animationDuration}s`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                }}
            >
                {/* Render items twice for seamless loop */}
                {[...items, ...items].map((item, index) => (
                    <TickerItem key={`${item.id}-${index}`} item={item} />
                ))}
            </div>

            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none z-10" />

            {/* Ticker animation styles */}
            <style jsx>{`
                .ticker-scroll {
                    animation: ticker-scroll linear infinite;
                }
                
                @keyframes ticker-scroll {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </div>
    );
}

function TickerItem({ item }: { item: FeedItemType }) {
    const isBluesky = item.source === 'bluesky';

    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
            {/* Source indicator */}
            <span className={`text-xs ${isBluesky ? 'text-sky-400' : 'text-orange-400'}`}>
                {isBluesky ? '🦋' : '📰'}
            </span>

            {/* Author */}
            <span className="text-sm font-medium text-zinc-300">
                {item.author}:
            </span>

            {/* Content preview */}
            <span className="text-sm text-zinc-400 max-w-[300px] truncate">
                {item.title || item.content}
            </span>

            {/* Separator */}
            <span className="text-zinc-700 mx-2">|</span>
        </a>
    );
}

export default FeedTicker;
