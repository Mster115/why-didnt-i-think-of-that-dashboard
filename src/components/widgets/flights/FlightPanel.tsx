'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { WidgetFrame } from '@/components/core';
import { useFilterStore } from '@/stores';
import { useOpenSky, type Aircraft } from '@/hooks/useOpenSky';
import { AircraftCard } from './AircraftCard';
import { RegionFilter } from './RegionFilter';
import { LoadingState } from '@/components/ui';

// Dynamic import for FlightMap (Leaflet requires window)
const FlightMap = dynamic(
    () => import('./FlightMap').then((mod) => mod.FlightMap),
    {
        ssr: false,
        loading: () => <LoadingState message="Loading map..." />,
    }
);

/**
 * FlightPanel - Flight tracking display
 * Shows interactive map with aircraft positions
 */
export function FlightPanel() {
    const { aircraft, isLoading, isFetching, lastUpdated, totalCount, error } = useOpenSky();
    const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

    // Auto-cycle regions
    const flightRegion = useFilterStore((state) => state.flightRegion);
    const setFlightRegion = useFilterStore((state) => state.setFlightRegion);
    const [isPaused, setIsPaused] = useState(false);
    const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const REGIONS = ['us', 'europe', 'asia', 'global'] as const;

    // Cycle regions every 15 seconds
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            const currentIndex = REGIONS.indexOf(flightRegion);
            const nextIndex = (currentIndex + 1) % REGIONS.length;
            setFlightRegion(REGIONS[nextIndex]);
        }, 15000);

        return () => clearInterval(interval);
    }, [isPaused, flightRegion, setFlightRegion]);

    // Handle manual interaction (region change or aircraft select)
    const handleManualInteraction = () => {
        setIsPaused(true);

        if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
        }

        pauseTimeoutRef.current = setTimeout(() => {
            setIsPaused(false);
        }, 30000);
    };

    const handleAircraftSelect = (aircraft: Aircraft | null) => {
        setSelectedAircraft(aircraft);
        if (aircraft) {
            handleManualInteraction(); // Pause region cycling if viewing a specific plane
        }
    };

    return (
        <WidgetFrame
            title="Flight Tracker"
            isLoading={isLoading}
            lastUpdated={lastUpdated}
            itemCount={totalCount}
        >
            {/* Map content */}
            <div className="relative w-full h-full">
                {/* Region filter - positioned inside map container */}
                <div className="absolute top-3 left-3 z-[1000]">
                    <RegionFilter onManualChange={handleManualInteraction} />
                </div>

                {error ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-500">
                        <span className="text-2xl">⚠️</span>
                        <span className="text-sm">Failed to load flight data</span>
                        <span className="text-xs text-zinc-600">{error.message}</span>
                    </div>
                ) : (
                    <FlightMap
                        aircraft={aircraft}
                        selectedAircraft={selectedAircraft}
                        onSelectAircraft={handleAircraftSelect}
                        isLoading={isLoading}
                    />
                )}

                {/* Selected aircraft detail card */}
                {selectedAircraft && (
                    <AircraftCard
                        aircraft={selectedAircraft}
                        onClose={() => setSelectedAircraft(null)}
                    />
                )}
            </div>
        </WidgetFrame>
    );
}

export default FlightPanel;
