'use client';

import { WidgetFrame } from '@/components/core';
import { useTransit } from '@/hooks/useTransit';
import { CityTabs } from './CityTabs';
import { StationSelector } from './StationSelector';
import { ArrivalBoard } from './ArrivalBoard';

/**
 * TransitPanel - Rail and transit status display
 * Shows arrivals, departures, and delays for selected cities
 */
export function TransitPanel() {
    const {
        arrivals,
        lineColors,
        isLoading,
        lastUpdated,
        count,
        isMock,
        city,
        station,
        changeCity,
        changeStation,
        refresh,
    } = useTransit();

    return (
        <WidgetFrame
            title="Transit"
            isLoading={isLoading}
            lastUpdated={lastUpdated}
            itemCount={count}
        >
            <div className="flex flex-col h-full gap-3 p-2">
                {/* Controls Row */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CityTabs activeCity={city} onCityChange={changeCity} />

                    <div className="flex items-center gap-2">
                        <StationSelector
                            city={city}
                            station={station}
                            onStationChange={changeStation}
                        />

                        <button
                            onClick={refresh}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Refresh"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mock Data Indicator */}
                {isMock && (
                    <div className="text-xs text-yellow-500/70 bg-yellow-500/10 px-2 py-1 rounded">
                        ⚠ Demo data - Real API integration in progress
                    </div>
                )}

                {/* Arrival Board */}
                <div className="flex-1 min-h-0">
                    <ArrivalBoard
                        arrivals={arrivals}
                        lineColors={lineColors}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </WidgetFrame>
    );
}

export default TransitPanel;
