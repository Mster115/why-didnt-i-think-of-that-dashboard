/**
 * useTransit - Hook for fetching transit data from SEPTA, MTA, UTA
 * Uses TanStack Query for caching and automatic refetching
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { UPDATE_INTERVALS, DEFAULT_STATIONS } from '@/lib/constants';

export type TransitCity = 'philadelphia' | 'newyork' | 'saltlake';

export interface TrainArrival {
    id: string;
    line: string;
    destination: string;
    scheduledTime: string;
    estimatedTime: string | null;
    delay: number; // minutes
    platform: string | null;
    status: 'on-time' | 'delayed' | 'cancelled';
    direction?: string;
}

interface TransitResponse {
    arrivals: TrainArrival[];
    station: string;
    count: number;
    timestamp: string;
    lineColors?: Record<string, { name: string; color: string }>;
    isMock?: boolean;
}

export interface UseTransitOptions {
    city?: TransitCity;
    station?: string;
    enabled?: boolean;
}

// API endpoints per city
const API_ENDPOINTS: Record<TransitCity, string> = {
    philadelphia: '/api/transit/septa/arrivals',
    newyork: '/api/transit/mta/arrivals',
    saltlake: '/api/transit/uta/arrivals',
};

async function fetchArrivals(city: TransitCity, station: string): Promise<TransitResponse> {
    const endpoint = API_ENDPOINTS[city];
    const params = new URLSearchParams({ station });

    const response = await fetch(`${endpoint}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${city} arrivals`);
    }

    return response.json();
}

export function useTransit(options: UseTransitOptions = {}) {
    const {
        city: initialCity = 'philadelphia',
        station: initialStation,
        enabled = true,
    } = options;

    // Local state for city and station selection
    const [city, setCity] = useState<TransitCity>(initialCity);
    const [station, setStation] = useState<string>(
        initialStation || DEFAULT_STATIONS[initialCity]
    );

    const queryClient = useQueryClient();

    // TanStack Query for fetching arrivals
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        dataUpdatedAt,
    } = useQuery({
        queryKey: ['transit', city, station],
        queryFn: () => fetchArrivals(city, station),
        refetchInterval: UPDATE_INTERVALS.TRANSIT,
        enabled,
        staleTime: UPDATE_INTERVALS.TRANSIT / 2,
    });

    // City change handler - also updates station to default
    const changeCity = useCallback((newCity: TransitCity) => {
        setCity(newCity);
        setStation(DEFAULT_STATIONS[newCity]);
    }, []);

    // Station change handler
    const changeStation = useCallback((newStation: string) => {
        setStation(newStation);
    }, []);

    // Manual refresh
    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['transit', city, station] });
        refetch();
    }, [queryClient, city, station, refetch]);

    return {
        // Data
        arrivals: data?.arrivals ?? [],
        lineColors: data?.lineColors,
        isMock: data?.isMock ?? false,

        // Loading/Error states
        isLoading,
        isError,
        error: error as Error | null,

        // Metadata
        lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
        count: data?.count ?? 0,

        // Current selection
        city,
        station,

        // Actions
        changeCity,
        changeStation,
        refresh,
    };
}

export default useTransit;
