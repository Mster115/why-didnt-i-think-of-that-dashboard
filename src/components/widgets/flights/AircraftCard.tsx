'use client';

import type { Aircraft } from '@/hooks/useOpenSky';

interface AircraftCardProps {
    aircraft: Aircraft;
    onClose: () => void;
}

/**
 * AircraftCard - Detail card for selected aircraft
 * Shows comprehensive flight information
 */
export function AircraftCard({ aircraft, onClose }: AircraftCardProps) {
    // Convert meters to feet
    const altitudeFt = aircraft.altitude !== null
        ? Math.round(aircraft.altitude * 3.28084)
        : null;

    // Convert m/s to knots
    const velocityKts = aircraft.velocity !== null
        ? Math.round(aircraft.velocity * 1.94384)
        : null;

    return (
        <div className="absolute top-2 right-2 w-56 bg-zinc-900/95 border border-zinc-700 rounded-lg shadow-xl backdrop-blur-sm z-[1000]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                    <span className="text-lg">✈️</span>
                    <span className="font-bold text-white">
                        {aircraft.callsign || 'Unknown'}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>

            {/* Body */}
            <div className="p-3 space-y-3">
                {/* Origin */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500">🌍</span>
                    <span className="text-zinc-300">{aircraft.originCountry}</span>
                </div>

                {/* ICAO24 */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">ICAO24</span>
                    <span className="font-mono text-zinc-300">{aircraft.icao24.toUpperCase()}</span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Altitude */}
                    <div className="bg-zinc-800/50 rounded p-2">
                        <div className="text-xs text-zinc-500 mb-1">Altitude</div>
                        <div className="text-sm font-semibold text-white">
                            {altitudeFt !== null ? `${altitudeFt.toLocaleString()} ft` : '—'}
                        </div>
                    </div>

                    {/* Speed */}
                    <div className="bg-zinc-800/50 rounded p-2">
                        <div className="text-xs text-zinc-500 mb-1">Speed</div>
                        <div className="text-sm font-semibold text-white">
                            {velocityKts !== null ? `${velocityKts} kts` : '—'}
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="bg-zinc-800/50 rounded p-2">
                        <div className="text-xs text-zinc-500 mb-1">Heading</div>
                        <div className="text-sm font-semibold text-white">
                            {aircraft.heading !== null ? `${Math.round(aircraft.heading)}°` : '—'}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-zinc-800/50 rounded p-2">
                        <div className="text-xs text-zinc-500 mb-1">Status</div>
                        <div className={`text-sm font-semibold ${aircraft.onGround ? 'text-yellow-500' : 'text-green-500'}`}>
                            {aircraft.onGround ? 'On Ground' : 'In Flight'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AircraftCard;
