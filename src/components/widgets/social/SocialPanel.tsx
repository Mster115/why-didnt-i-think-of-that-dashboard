'use client';

import { useState, useRef, useEffect } from 'react';
import { WidgetFrame } from '@/components/core';
import { useSocialFeed, FeedSource } from '@/hooks/useSocialFeed';
import { FeedItem } from './FeedItem';
import { FeedTicker } from './FeedTicker';
import { SourceFilter } from './SourceFilter';

type ViewMode = 'list' | 'ticker';

/**
 * SocialPanel - Social feed display
 * Shows Bluesky and RSS feed content with filtering
 */
export function SocialPanel() {
    const [sources, setSources] = useState<FeedSource[]>(['bluesky', 'rss']);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [showControls, setShowControls] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-scroll ref
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { items, isLoading, error, lastUpdated } = useSocialFeed({
        sources,
        keywords,
    });

    // Auto-scroll effect
    useEffect(() => {
        if (isHovered || viewMode !== 'list' || items.length === 0) return;

        const interval = setInterval(() => {
            const container = scrollContainerRef.current;
            if (!container) return;

            const { scrollTop, scrollHeight, clientHeight } = container;

            // If near bottom (within small tolerance), reset to top
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                container.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Scroll down by roughly one "page" or segment
                // Let's do a partial scroll so they can read new items? 
                // User said "scroll down every 15 seconds to show the different messages". 
                // Usually implies scrolling by a visible amount.
                container.scrollBy({ top: clientHeight * 0.8, behavior: 'smooth' });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isHovered, viewMode, items.length]);

    return (
        <WidgetFrame
            title="Social Feed"
            isLoading={isLoading}
            lastUpdated={lastUpdated}
            itemCount={items.length}
        >
            <div className="flex flex-col h-full relative">
                {/* Controls Toggle */}
                <div className="absolute top-[-40px] right-0 p-2 z-10">
                    {/* We might need to rethink placement since WidgetFrame renders title. 
                       Actually, WidgetFrame passes children. We are IN children.
                       The title is in the parent. We can't easily put a button in the parent header from here without prop drilling or portals.
                       Let's put a small cog or expand icon in the top-right of OUR content area, overlaying the top content?
                       Or just a thin bar at the top?
                       The user image showed a "SOURCES: ..." block.
                       Let's put a small toggle button at the top right of this panel.
                   */}
                    <button
                        onClick={() => setShowControls(prev => !prev)}
                        className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Toggle filters"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                {/* Collapsible Controls */}
                <div className={`
                    border-b border-zinc-800 bg-zinc-900/95 absolute top-0 left-0 right-0 z-20 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden
                    ${showControls ? 'max-h-[200px] opacity-100 shadow-lg' : 'max-h-0 opacity-0 pointer-events-none'}
                `}>
                    <div className="flex flex-col gap-2 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-400">Settings</span>
                            <button onClick={() => setShowControls(false)} className="text-zinc-500 hover:text-white">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <SourceFilter
                            activeSources={sources}
                            onSourcesChange={setSources}
                            keywords={keywords}
                            onKeywordsChange={setKeywords}
                        />

                        {/* View mode toggle */}
                        <div className="flex items-center justify-end gap-1 mt-2">
                            <span className="text-xs text-zinc-500 mr-2">View:</span>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded transition-colors ${viewMode === 'list'
                                    ? 'bg-zinc-700 text-white'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                title="List view"
                            >
                                <ListIcon />
                            </button>
                            <button
                                onClick={() => setViewMode('ticker')}
                                className={`p-1.5 rounded transition-colors ${viewMode === 'ticker'
                                    ? 'bg-zinc-700 text-white'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                title="Ticker view"
                            >
                                <TickerIcon />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="flex-1 overflow-hidden relative pt-6" // pt-6 for the toggle button space
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {error ? (
                        <div className="flex items-center justify-center h-full p-4">
                            <div className="text-center">
                                <p className="text-red-400 text-sm mb-2">Failed to load feed</p>
                                <p className="text-zinc-500 text-xs">{error.message}</p>
                            </div>
                        </div>
                    ) : isLoading && items.length === 0 ? (
                        <div className="flex flex-col gap-2 p-3">
                            {[...Array(5)].map((_, i) => (
                                <LoadingSkeleton key={i} />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                            <p>No items found. Try adjusting your filters.</p>
                        </div>
                    ) : viewMode === 'ticker' ? (
                        <FeedTicker items={items} />
                    ) : (
                        <div
                            ref={scrollContainerRef}
                            className="h-full overflow-y-auto scroll-smooth"
                        >
                            {items.map((item) => (
                                <FeedItem
                                    key={item.id}
                                    item={item}
                                    keywords={keywords}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </WidgetFrame>
    );
}

function LoadingSkeleton() {
    return (
        <div className="flex items-start gap-3 p-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-3 bg-zinc-800 rounded" />
                    <div className="w-24 h-3 bg-zinc-800 rounded" />
                </div>
                <div className="w-full h-4 bg-zinc-800 rounded" />
                <div className="w-3/4 h-4 bg-zinc-800 rounded" />
            </div>
        </div>
    );
}

function ListIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
    );
}

function TickerIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
    );
}

export default SocialPanel;
