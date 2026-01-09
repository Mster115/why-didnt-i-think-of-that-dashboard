'use client';

import { useFilterStore } from '@/stores';

const REGIONS = [
    { id: 'us', label: 'US' },
    { id: 'europe', label: 'Europe' },
    { id: 'asia', label: 'Asia' },
    { id: 'global', label: 'Global' },
] as const;

/**
 * RegionFilter - Region selection buttons for flight tracking
 */
export function RegionFilter({ onManualChange }: { onManualChange?: () => void }) {
    const flightRegion = useFilterStore((state) => state.flightRegion);
    const setFlightRegion = useFilterStore((state) => state.setFlightRegion);

    const handleRegionClick = (regionId: typeof flightRegion) => {
        setFlightRegion(regionId);
        onManualChange?.();
    };

    return (
        <div className="flex gap-1">
            {REGIONS.map((region) => (
                <button
                    key={region.id}
                    onClick={() => handleRegionClick(region.id)}
                    className={`
                        px-2 py-1 text-xs rounded transition-colors
                        ${flightRegion === region.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                        }
                    `}
                >
                    {region.label}
                </button>
            ))}
        </div>
    );
}

export default RegionFilter;
