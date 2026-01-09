/**
 * useOpenSky - Hook for fetching flight data from OpenSky Network
 * Uses TanStack Query for caching and auto-refresh
 */

import { useQuery } from '@tanstack/react-query';
import { useFilterStore } from '@/stores';

export interface Aircraft {
    icao24: string;
    callsign: string | null;
    originCountry: string;
    longitude: number | null;
    latitude: number | null;
    altitude: number | null;
    velocity: number | null;
    heading: number | null;
    onGround: boolean;
    verticalRate?: number | null;
}

export interface BoundingBox {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
}

// Region presets
export const REGION_BOUNDS: Record<string, BoundingBox> = {
    us: {
        minLat: 24.396308,
        maxLat: 49.384358,
        minLon: -125.0,
        maxLon: -66.93457,
    },
    europe: {
        minLat: 35.0,
        maxLat: 71.0,
        minLon: -10.0,
        maxLon: 40.0,
    },
    asia: {
        minLat: 10.0,
        maxLat: 55.0,
        minLon: 60.0,
        maxLon: 145.0,
    },
    global: {
        minLat: -60.0,
        maxLat: 70.0,
        minLon: -180.0,
        maxLon: 180.0,
    },
};

// Legacy export for compatibility
export const US_BOUNDS = REGION_BOUNDS.us;

interface OpenSkyApiResponse {
    aircraft: Aircraft[];
    timestamp: number;
    count: number;
    error?: string;
}

async function fetchAircraft(bounds: BoundingBox): Promise<OpenSkyApiResponse> {
    const params = new URLSearchParams({
        minLat: bounds.minLat.toString(),
        maxLat: bounds.maxLat.toString(),
        minLon: bounds.minLon.toString(),
        maxLon: bounds.maxLon.toString(),
    });

    const response = await fetch(`/api/opensky?${params}`);
    if (!response.ok) {
        throw new Error('Failed to fetch aircraft data');
    }
    return response.json();
}

export interface UseOpenSkyOptions {
    bounds?: BoundingBox;
    refreshInterval?: number;
    enabled?: boolean;
}

export function useOpenSky(options: UseOpenSkyOptions = {}) {
    const { refreshInterval = 30000, enabled = true } = options;
    const flightRegion = useFilterStore((state) => state.flightRegion);

    // Use provided bounds or get from filter store
    const bounds = options.bounds ?? REGION_BOUNDS[flightRegion] ?? REGION_BOUNDS.us;

    const query = useQuery({
        queryKey: ['opensky', bounds.minLat, bounds.maxLat, bounds.minLon, bounds.maxLon],
        queryFn: () => fetchAircraft(bounds),
        refetchInterval: refreshInterval,
        enabled,
        staleTime: 5000, // Consider data stale after 5 seconds
        retry: 2,
    });

    return {
        aircraft: query.data?.aircraft ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
        totalCount: query.data?.count ?? 0,
        refetch: query.refetch,
    };
}

export default useOpenSky;
