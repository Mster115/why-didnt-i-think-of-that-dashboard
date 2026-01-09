import { NextRequest, NextResponse } from 'next/server';

// UTA GTFS-RT feeds - similar approach to MTA
// Real implementation would parse protobuf from https://apps.rideuta.com/tms/gtfs/TripUpdate

const CACHE_TTL = 30;

export const runtime = 'edge';

interface TrainArrival {
    id: string;
    line: string;
    destination: string;
    scheduledTime: string;
    estimatedTime: string | null;
    delay: number;
    platform: string | null;
    status: 'on-time' | 'delayed' | 'cancelled';
    direction: string;
}

// UTA TRAX lines
const UTA_LINES: Record<string, { name: string; color: string }> = {
    'Blue': { name: 'Blue Line', color: '#0053A0' },
    'Red': { name: 'Red Line', color: '#D41B2C' },
    'Green': { name: 'Green Line', color: '#008144' },
    'S-Line': { name: 'S-Line Streetcar', color: '#FDB813' },
};

// UTA destinations
const UTA_DESTINATIONS: Record<string, string[]> = {
    'Blue': ['Draper Town Center', 'Salt Lake Central'],
    'Red': ['Daybreak Parkway', 'University Medical Center'],
    'Green': ['West Valley Central', 'Salt Lake Central'],
    'S-Line': ['Fairmont', 'Central Pointe'],
};

function generateMockArrivals(station: string): TrainArrival[] {
    const now = new Date();
    const lines = Object.keys(UTA_LINES);
    const arrivals: TrainArrival[] = [];

    const numArrivals = 4 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numArrivals; i++) {
        const minutesAway = 2 + Math.floor(Math.random() * 20);
        const arrivalTime = new Date(now.getTime() + minutesAway * 60000);
        const line = lines[Math.floor(Math.random() * lines.length)];
        const delay = Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0;
        const dests = UTA_DESTINATIONS[line] || ['Unknown'];

        arrivals.push({
            id: `${line}-${i}-${Date.now()}`,
            line: UTA_LINES[line].name,
            destination: dests[Math.floor(Math.random() * dests.length)],
            scheduledTime: arrivalTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            }),
            estimatedTime: delay > 0
                ? new Date(arrivalTime.getTime() + delay * 60000).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                })
                : null,
            delay,
            platform: null,
            status: delay > 0 ? 'delayed' : 'on-time',
            direction: Math.random() > 0.5 ? 'Northbound' : 'Southbound',
        });
    }

    return arrivals.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station') || 'Salt Lake Central';

    try {
        // TODO: Implement actual GTFS-RT parsing
        const arrivals = generateMockArrivals(station);

        return NextResponse.json({
            arrivals,
            station,
            count: arrivals.length,
            timestamp: new Date().toISOString(),
            lineColors: UTA_LINES,
            isMock: true,
        });
    } catch (error) {
        console.error('UTA API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch UTA arrivals', arrivals: [] },
            { status: 500 }
        );
    }
}
