/**
 * filterStore - Zustand store for global filter state
 * Manages filters across all widgets
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PolymarketCategory = 'politics' | 'crypto' | 'sports' | 'tech' | 'unusual' | 'all';

export interface FilterState {
    // Polymarket filters
    polymarketCategories: PolymarketCategory[];
    polymarketMinVolume: number;

    // Flight filters
    flightRegion: 'us' | 'europe' | 'asia' | 'global';
    flightMinAltitude: number;
    flightAirlines: string[];

    // Transit filters
    transitCity: 'philadelphia' | 'newyork' | 'saltlake';
    transitStation: string | null;

    // Social filters
    socialKeywords: string[];
    socialSources: ('bluesky' | 'rss')[];

    // Actions
    setPolymarketCategories: (categories: PolymarketCategory[]) => void;
    setPolymarketMinVolume: (volume: number) => void;
    setFlightRegion: (region: 'us' | 'europe' | 'asia' | 'global') => void;
    setFlightMinAltitude: (altitude: number) => void;
    setTransitCity: (city: 'philadelphia' | 'newyork' | 'saltlake') => void;
    setTransitStation: (station: string | null) => void;
    setSocialKeywords: (keywords: string[]) => void;
    setSocialSources: (sources: ('bluesky' | 'rss')[]) => void;
}

export const useFilterStore = create<FilterState>()(
    persist(
        (set) => ({
            // Polymarket defaults: Politics & Unusual
            polymarketCategories: ['politics', 'unusual'],
            polymarketMinVolume: 0,

            // Flight defaults: US
            flightRegion: 'us',
            flightMinAltitude: 0,
            flightAirlines: [],

            // Transit defaults: Philadelphia (SEPTA first)
            transitCity: 'philadelphia',
            transitStation: null,

            // Social defaults
            socialKeywords: [],
            socialSources: ['bluesky', 'rss'],

            // Actions
            setPolymarketCategories: (categories) =>
                set({ polymarketCategories: categories }),
            setPolymarketMinVolume: (volume) =>
                set({ polymarketMinVolume: volume }),
            setFlightRegion: (region) =>
                set({ flightRegion: region }),
            setFlightMinAltitude: (altitude) =>
                set({ flightMinAltitude: altitude }),
            setTransitCity: (city) =>
                set({ transitCity: city }),
            setTransitStation: (station) =>
                set({ transitStation: station }),
            setSocialKeywords: (keywords) =>
                set({ socialKeywords: keywords }),
            setSocialSources: (sources) =>
                set({ socialSources: sources }),
        }),
        {
            name: 'yap-it-filters',
        }
    )
);

export default useFilterStore;
