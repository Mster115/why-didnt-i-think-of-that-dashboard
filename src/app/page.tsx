'use client';

import { Header, CommandPalette, ErrorBoundary } from '@/components/core';
import { PolymarketPanel, FlightPanel, TransitPanel, SocialPanel } from '@/components/widgets';
import { useWidgetStore, useFilterStore } from '@/stores';
import { useKeyboardNav } from '@/hooks';

export default function Home() {
  const { isKioskMode, toggleKioskMode } = useWidgetStore();
  const { setFlightRegion, setTransitCity } = useFilterStore();

  // All available commands for the command palette
  const commands = [
    { id: 'kiosk', label: 'Toggle Kiosk Mode', shortcut: 'K', category: 'View', action: toggleKioskMode },
    { id: 'refresh', label: 'Refresh All Data', shortcut: '⌘R', category: 'View', action: () => window.location.reload() },
    { id: 'region-us', label: 'Switch to US Region', category: 'Flights', action: () => setFlightRegion('us') },
    { id: 'region-europe', label: 'Switch to Europe Region', category: 'Flights', action: () => setFlightRegion('europe') },
    { id: 'region-asia', label: 'Switch to Asia Region', category: 'Flights', action: () => setFlightRegion('asia') },
    { id: 'region-global', label: 'Switch to Global View', category: 'Flights', action: () => setFlightRegion('global') },
    { id: 'transit-philly', label: 'Philadelphia Transit', category: 'Transit', action: () => setTransitCity('philadelphia') },
    { id: 'transit-nyc', label: 'New York Transit', category: 'Transit', action: () => setTransitCity('newyork') },
    { id: 'transit-slc', label: 'Salt Lake City Transit', category: 'Transit', action: () => setTransitCity('saltlake') },
  ];

  // Register keyboard shortcuts
  useKeyboardNav([
    { key: 'k', description: 'Toggle Kiosk Mode', action: toggleKioskMode },
    { key: '1', description: 'US Region', action: () => setFlightRegion('us') },
    { key: '2', description: 'Europe Region', action: () => setFlightRegion('europe') },
    { key: '3', description: 'Asia Region', action: () => setFlightRegion('asia') },
    { key: '4', description: 'Global View', action: () => setFlightRegion('global') },
  ]);

  return (
    <div className={`flex flex-col h-screen bg-black ${isKioskMode ? 'kiosk-mode' : ''}`}>
      {/* Header - hidden in kiosk mode */}
      {!isKioskMode && (
        <Header isKioskMode={isKioskMode} onToggleKiosk={toggleKioskMode} />
      )}

      {/* Command Palette */}
      <CommandPalette commands={commands} />

      {/* Main Dashboard Grid - Tight Layout */}
      <main className="flex-1 grid grid-cols-12 grid-rows-6 gap-1 p-1 overflow-hidden">
        {/* Flight Tracker - Top Left (8 cols, 4 rows) */}
        <div className="col-span-12 lg:col-span-8 row-span-4">
          <ErrorBoundary>
            <FlightPanel />
          </ErrorBoundary>
        </div>

        {/* Polymarket - Top Right (4 cols, 4 rows) */}
        <div className="col-span-12 lg:col-span-4 row-span-4">
          <ErrorBoundary>
            <PolymarketPanel />
          </ErrorBoundary>
        </div>

        {/* Transit - Bottom Left (8 cols, 2 rows) */}
        <div className="col-span-12 lg:col-span-8 row-span-2">
          <ErrorBoundary>
            <TransitPanel />
          </ErrorBoundary>
        </div>

        {/* Social Feed - Bottom Right (4 cols, 2 rows) */}
        <div className="col-span-12 lg:col-span-4 row-span-2">
          <ErrorBoundary>
            <SocialPanel />
          </ErrorBoundary>
        </div>
      </main>

      {/* Kiosk mode indicator */}
      {isKioskMode && (
        <div className="fixed bottom-4 right-4 text-xs text-zinc-600 opacity-50">
          Press K to exit • ⌘K for commands
        </div>
      )}
    </div>
  );
}
