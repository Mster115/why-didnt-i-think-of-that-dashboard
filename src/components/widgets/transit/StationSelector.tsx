'use client';

import { TransitCity } from '@/hooks/useTransit';
import { TRANSIT_STATIONS } from '@/lib/constants';

interface StationSelectorProps {
    city: TransitCity;
    station: string;
    onStationChange: (station: string) => void;
}

/**
 * StationSelector - Dropdown for station selection within current city
 */
export function StationSelector({ city, station, onStationChange }: StationSelectorProps) {
    const stations = TRANSIT_STATIONS[city];

    return (
        <select
            value={station}
            onChange={(e) => onStationChange(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        >
            {stations.map((s) => (
                <option key={s.id} value={s.id}>
                    {s.name}
                </option>
            ))}
        </select>
    );
}

export default StationSelector;
