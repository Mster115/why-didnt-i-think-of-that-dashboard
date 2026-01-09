import { NextRequest, NextResponse } from 'next/server';

// MTA GTFS-RT feeds require protobuf parsing which is complex in Edge Runtime
// For initial implementation, we'll use a simplified approach with mock data
// that matches the expected structure, then enhance with real GTFS-RT parsing

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

// NYC Subway lines with their colors for UI
const NYC_LINES: Record<string, { name: string; color: string }> = {
    '1': { name: '1', color: '#EE352E' },
    '2': { name: '2', color: '#EE352E' },
    '3': { name: '3', color: '#EE352E' },
    '4': { name: '4', color: '#00933C' },
    '5': { name: '5', color: '#00933C' },
    '6': { name: '6', color: '#00933C' },
    '7': { name: '7', color: '#B933AD' },
    'A': { name: 'A', color: '#0039A6' },
    'C': { name: 'C', color: '#0039A6' },
    'E': { name: 'E', color: '#0039A6' },
    'B': { name: 'B', color: '#FF6319' },
    'D': { name: 'D', color: '#FF6319' },
    'F': { name: 'F', color: '#FF6319' },
    'M': { name: 'M', color: '#FF6319' },
    'G': { name: 'G', color: '#6CBE45' },
    'J': { name: 'J', color: '#996633' },
    'Z': { name: 'Z', color: '#996633' },
    'L': { name: 'L', color: '#A7A9AC' },
    'N': { name: 'N', color: '#FCCC0A' },
    'Q': { name: 'Q', color: '#FCCC0A' },
    'R': { name: 'R', color: '#FCCC0A' },
    'W': { name: 'W', color: '#FCCC0A' },
    'S': { name: 'S', color: '#808183' },
};

// Generate realistic mock arrivals for demonstration
function generateMockArrivals(station: string): TrainArrival[] {
    const now = new Date();
    const lines = Object.keys(NYC_LINES);
    const arrivals: TrainArrival[] = [];

    // Generate 8-12 arrivals
    const numArrivals = 8 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numArrivals; i++) {
        const minutesAway = 1 + Math.floor(Math.random() * 15);
        const arrivalTime = new Date(now.getTime() + minutesAway * 60000);
        const line = lines[Math.floor(Math.random() * lines.length)];
        const delay = Math.random() > 0.7 ? Math.floor(Math.random() * 8) : 0;

        arrivals.push({
            id: `${line}-${i}-${Date.now()}`,
            line,
            destination: getDestinationForLine(line),
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
            direction: Math.random() > 0.5 ? 'Uptown' : 'Downtown',
        });
    }

    return arrivals.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

function getDestinationForLine(line: string): string {
    const destinations: Record<string, string[]> = {
        '1': ['Van Cortlandt Park', 'South Ferry'],
        '2': ['Wakefield-241 St', 'Flatbush Ave'],
        '3': ['Harlem-148 St', 'New Lots Ave'],
        '4': ['Woodlawn', 'Crown Heights'],
        '5': ['Eastchester-Dyre Av', 'Flatbush Ave'],
        '6': ['Pelham Bay Park', 'Brooklyn Bridge'],
        '7': ['Flushing-Main St', 'Hudson Yards'],
        'A': ['Inwood-207 St', 'Far Rockaway'],
        'C': ['168 St', 'Euclid Ave'],
        'E': ['Jamaica Center', 'World Trade Center'],
        'B': ['Bedford Park Blvd', 'Brighton Beach'],
        'D': ['Norwood-205 St', 'Coney Island'],
        'F': ['Jamaica-179 St', 'Coney Island'],
        'M': ['Forest Hills', 'Middle Village'],
        'G': ['Court Sq', 'Church Ave'],
        'J': ['Jamaica Center', 'Broad St'],
        'Z': ['Jamaica Center', 'Broad St'],
        'L': ['8 Ave', 'Canarsie-Rockaway Pkwy'],
        'N': ['Astoria-Ditmars Blvd', 'Coney Island'],
        'Q': ['96 St', 'Coney Island'],
        'R': ['Forest Hills', 'Bay Ridge-95 St'],
        'W': ['Astoria-Ditmars Blvd', 'Whitehall St'],
        'S': ['Times Sq-42 St', 'Grand Central-42 St'],
    };

    const dests = destinations[line] || ['Unknown'];
    return dests[Math.floor(Math.random() * dests.length)];
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station') || 'Times Sq-42 St';

    try {
        // TODO: Implement actual GTFS-RT parsing
        // For now, return realistic mock data
        const arrivals = generateMockArrivals(station);

        return NextResponse.json({
            arrivals,
            station,
            count: arrivals.length,
            timestamp: new Date().toISOString(),
            lineColors: NYC_LINES,
            isMock: true, // Flag to indicate this is mock data
        });
    } catch (error) {
        console.error('MTA API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch MTA arrivals', arrivals: [] },
            { status: 500 }
        );
    }
}
