'use client';

import { FeedSource } from '@/hooks/useSocialFeed';
import { useState, useCallback } from 'react';

interface SourceFilterProps {
    activeSources: FeedSource[];
    onSourcesChange: (sources: FeedSource[]) => void;
    keywords: string[];
    onKeywordsChange: (keywords: string[]) => void;
}

/**
 * SourceFilter - Toggle controls for feed sources and keyword filtering
 */
export function SourceFilter({
    activeSources,
    onSourcesChange,
    keywords,
    onKeywordsChange,
}: SourceFilterProps) {
    const [keywordInput, setKeywordInput] = useState('');

    const toggleSource = useCallback((source: FeedSource) => {
        if (activeSources.includes(source)) {
            // Don't allow deselecting all sources
            if (activeSources.length > 1) {
                onSourcesChange(activeSources.filter(s => s !== source));
            }
        } else {
            onSourcesChange([...activeSources, source]);
        }
    }, [activeSources, onSourcesChange]);

    const addKeyword = useCallback(() => {
        const trimmed = keywordInput.trim();
        if (trimmed && !keywords.includes(trimmed)) {
            onKeywordsChange([...keywords, trimmed]);
            setKeywordInput('');
        }
    }, [keywordInput, keywords, onKeywordsChange]);

    const removeKeyword = useCallback((keyword: string) => {
        onKeywordsChange(keywords.filter(k => k !== keyword));
    }, [keywords, onKeywordsChange]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword();
        }
    };

    return (
        <div className="flex flex-col gap-2 p-2 bg-zinc-900/50 border-b border-zinc-800">
            {/* Source toggles */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wide">Sources:</span>
                <SourceToggle
                    source="bluesky"
                    label="🦋 Bluesky"
                    isActive={activeSources.includes('bluesky')}
                    onToggle={() => toggleSource('bluesky')}
                    activeColor="sky"
                />
                <SourceToggle
                    source="rss"
                    label="📰 RSS"
                    isActive={activeSources.includes('rss')}
                    onToggle={() => toggleSource('rss')}
                    activeColor="orange"
                />
            </div>

            {/* Keyword filter */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wide">Filter:</span>
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add keyword..."
                        className="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                    {keywordInput && (
                        <button
                            onClick={addKeyword}
                            className="absolute right-1 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-zinc-700 hover:bg-zinc-600 text-white rounded"
                        >
                            Add
                        </button>
                    )}
                </div>
            </div>

            {/* Active keyword badges */}
            {keywords.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                    {keywords.map((keyword) => (
                        <span
                            key={keyword}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded"
                        >
                            {keyword}
                            <button
                                onClick={() => removeKeyword(keyword)}
                                className="hover:text-yellow-100 transition-colors"
                                aria-label={`Remove ${keyword}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

interface SourceToggleProps {
    source: FeedSource;
    label: string;
    isActive: boolean;
    onToggle: () => void;
    activeColor: 'sky' | 'orange';
}

function SourceToggle({ label, isActive, onToggle, activeColor }: SourceToggleProps) {
    const activeStyles = {
        sky: 'bg-sky-500/20 text-sky-400 border-sky-500/50',
        orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    };

    return (
        <button
            onClick={onToggle}
            className={`
                px-2 py-1 text-xs font-medium rounded border transition-all
                ${isActive
                    ? activeStyles[activeColor]
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-600'
                }
            `}
        >
            {label}
        </button>
    );
}

export default SourceFilter;
