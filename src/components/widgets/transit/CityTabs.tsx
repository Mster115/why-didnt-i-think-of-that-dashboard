'use client';

import { TransitCity } from '@/hooks/useTransit';
import { TRANSIT_CITIES } from '@/lib/constants';

interface CityTabsProps {
    activeCity: TransitCity;
    onCityChange: (city: TransitCity) => void;
}

/**
 * CityTabs - Tab switcher for transit cities
 * Keyboard navigable with arrow keys
 */
export function CityTabs({ activeCity, onCityChange }: CityTabsProps) {
    const cities = Object.entries(TRANSIT_CITIES) as [TransitCity, { label: string }][];

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'ArrowRight') {
            const nextIndex = (index + 1) % cities.length;
            onCityChange(cities[nextIndex][0]);
        } else if (e.key === 'ArrowLeft') {
            const prevIndex = (index - 1 + cities.length) % cities.length;
            onCityChange(cities[prevIndex][0]);
        }
    };

    return (
        <div className="flex gap-1 bg-zinc-900 rounded p-1" role="tablist">
            {cities.map(([cityKey, cityData], index) => {
                const isActive = cityKey === activeCity;
                return (
                    <button
                        key={cityKey}
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => onCityChange(cityKey)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`
                            px-3 py-1.5 text-xs font-medium rounded transition-all
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${isActive
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }
                        `}
                    >
                        {cityData.label}
                    </button>
                );
            })}
        </div>
    );
}

export default CityTabs;
