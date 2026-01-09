'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Aircraft } from '@/hooks/useOpenSky';
import { REGION_BOUNDS } from '@/hooks/useOpenSky';
import { useFilterStore } from '@/stores';

// Leaflet CSS must be imported
import 'leaflet/dist/leaflet.css';

interface FlightMapProps {
    aircraft: Aircraft[];
    selectedAircraft: Aircraft | null;
    onSelectAircraft: (aircraft: Aircraft | null) => void;
    isLoading?: boolean;
}

/**
 * FlightMap - Interactive Leaflet map with aircraft markers
 * Uses dynamic import to avoid SSR issues with Leaflet
 */
export function FlightMap({
    aircraft,
    selectedAircraft,
    onSelectAircraft,
    isLoading = false,
}: FlightMapProps) {
    const [MapComponents, setMapComponents] = useState<{
        MapContainer: typeof import('react-leaflet').MapContainer;
        TileLayer: typeof import('react-leaflet').TileLayer;
        Marker: typeof import('react-leaflet').Marker;
        Popup: typeof import('react-leaflet').Popup;
        useMap: typeof import('react-leaflet').useMap;
        L: typeof import('leaflet');
    } | null>(null);

    const flightRegion = useFilterStore((state) => state.flightRegion);
    const bounds = REGION_BOUNDS[flightRegion] ?? REGION_BOUNDS.us;

    // Dynamic import of Leaflet components (SSR-safe)
    useEffect(() => {
        Promise.all([
            import('react-leaflet'),
            import('leaflet'),
        ]).then(([reactLeaflet, leaflet]) => {
            setMapComponents({
                MapContainer: reactLeaflet.MapContainer,
                TileLayer: reactLeaflet.TileLayer,
                Marker: reactLeaflet.Marker,
                Popup: reactLeaflet.Popup,
                useMap: reactLeaflet.useMap,
                L: leaflet.default,
            });
        });
    }, []);

    // Create rotated aircraft icon
    const createAircraftIcon = useCallback((heading: number | null, altitude: number | null, L: typeof import('leaflet')) => {
        // Color based on altitude (meters)
        let color = '#3b82f6'; // blue - low/unknown
        if (altitude !== null) {
            if (altitude > 10000) color = '#22c55e'; // green - high
            else if (altitude > 3000) color = '#f97316'; // orange - medium
        }

        const rotation = heading ?? 0;

        return L.divIcon({
            className: 'aircraft-marker',
            html: `
                <div style="
                    transform: rotate(${rotation}deg);
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="${color}">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });
    }, []);

    if (!MapComponents) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <div className="flex flex-col items-center gap-3 text-zinc-500">
                    <div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-sm">Loading map...</span>
                </div>
            </div>
        );
    }

    const { MapContainer, TileLayer, Marker, Popup, L } = MapComponents;

    // Calculate center from bounds
    const center: [number, number] = [
        (bounds.minLat + bounds.maxLat) / 2,
        (bounds.minLon + bounds.maxLon) / 2,
    ];

    // Filter aircraft with valid coordinates
    const validAircraft = aircraft.filter(
        (a) => a.latitude !== null && a.longitude !== null && !a.onGround
    );

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={center}
                zoom={flightRegion === 'global' ? 2 : 4}
                className="w-full h-full"
                style={{ background: '#0a0a0a' }}
                zoomControl={false}
            >
                {/* Dark map tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Aircraft markers */}
                {validAircraft.slice(0, 500).map((a) => (
                    <Marker
                        key={a.icao24}
                        position={[a.latitude!, a.longitude!]}
                        icon={createAircraftIcon(a.heading, a.altitude, L)}
                        eventHandlers={{
                            click: () => onSelectAircraft(a),
                        }}
                    >
                        <Popup className="aircraft-popup">
                            <div className="text-xs">
                                <div className="font-bold">{a.callsign || a.icao24}</div>
                                <div className="text-zinc-400">{a.originCountry}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Map bounds updater */}
                <MapBoundsUpdater bounds={bounds} useMap={MapComponents.useMap} />
            </MapContainer>

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
                </div>
            )}

            {/* Aircraft count badge */}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-zinc-900/90 border border-zinc-700 rounded text-xs text-zinc-400">
                {validAircraft.length > 500
                    ? `Showing 500 of ${validAircraft.length}`
                    : `${validAircraft.length} aircraft`
                }
            </div>
        </div>
    );
}

// Component to update map bounds when region changes
function MapBoundsUpdater({
    bounds,
    useMap
}: {
    bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number };
    useMap: typeof import('react-leaflet').useMap;
}) {
    const map = useMap();

    useEffect(() => {
        const corner1 = [bounds.minLat, bounds.minLon] as [number, number];
        const corner2 = [bounds.maxLat, bounds.maxLon] as [number, number];
        map.fitBounds([corner1, corner2], { padding: [20, 20] });
    }, [map, bounds]);

    return null;
}

export default FlightMap;
