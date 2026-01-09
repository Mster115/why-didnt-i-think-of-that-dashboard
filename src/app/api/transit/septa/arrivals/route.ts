import { NextRequest, NextResponse } from 'next/server';

const SEPTA_API_BASE = 'https://api.septa.org/api';
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

// Mock data for when API is unavailable
const MOCK_ARRIVALS: TrainArrival[] = [
    { id: '101', line: 'Paoli/Thorndale', destination: 'Thorndale', scheduledTime: '10:15 AM', estimatedTime: null, delay: 0, platform: '3', status: 'on-time', direction: 'Westbound' },
    { id: '102', line: 'Airport', destination: 'Airport Terminal E-F', scheduledTime: '10:22 AM', estimatedTime: '10:27 AM', delay: 5, platform: '2', status: 'delayed', direction: 'Southbound' },
    { id: '103', line: 'Lansdale/Doylestown', destination: 'Doylestown', scheduledTime: '10:30 AM', estimatedTime: null, delay: 0, platform: '4', status: 'on-time', direction: 'Northbound' },
    { id: '104', line: 'Media/Wawa', destination: 'Media', scheduledTime: '10:35 AM', estimatedTime: null, delay: 0, platform: '1', status: 'on-time', direction: 'Westbound' },
    { id: '105', line: 'Trenton', destination: 'Trenton', scheduledTime: '10:42 AM', estimatedTime: null, delay: 0, platform: '5', status: 'on-time', direction: 'Eastbound' },
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station') || 'Suburban Station';

    try {
        const params = new URLSearchParams({
            station,
            results: '10',
        });

        const response = await fetch(
            `${SEPTA_API_BASE}/Arrivals/index.php?${params.toString()}`,
            {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: CACHE_TTL },
            }
        );

        if (!response.ok) {
            throw new Error(`SEPTA API error: ${response.status}`);
        }

        const data = await response.json();
        const arrivals: TrainArrival[] = [];

        // The API returns a dynamic key like "Suburban Station Departures: January 8, 2026, 10:23 pm"
        // We get the first value from the object
        const rootKey = Object.keys(data)[0];
        const directionsData = data[rootKey];

        if (Array.isArray(directionsData)) {
            for (const directionGroup of directionsData) {
                // directionGroup is like { "Northbound": [...] } or { "Southbound": [...] }
                for (const [dir, trains] of Object.entries(directionGroup)) {
                    if (Array.isArray(trains)) {
                        for (const train of trains as SeptaArrival[]) {
                            arrivals.push(transformSeptaArrival(train, dir));
                        }
                    }
                }
            }
        }

        arrivals.sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

        return NextResponse.json({
            arrivals,
            station,
            count: arrivals.length,
            timestamp: new Date().toISOString(),
            isMock: false,
        });
    } catch (error) {
        console.error('SEPTA API error:', error);
        // Return mock data on error
        return NextResponse.json({
            arrivals: MOCK_ARRIVALS,
            station,
            count: MOCK_ARRIVALS.length,
            timestamp: new Date().toISOString(),
            isMock: true,
        });
    }
}

interface SeptaArrival {
    train_id: string;
    line: string;
    destination: string;
    sched_time: string;
    depart_time: string;
    track: string;
    platform: string;
    status: string;
}

function transformSeptaArrival(train: SeptaArrival, direction: string): TrainArrival {
    let delay = 0;
    let status: 'on-time' | 'delayed' | 'cancelled' = 'on-time';
    const statusStr = train.status || 'On Time';
    const statusLower = statusStr.toLowerCase();

    if (statusLower.includes('min')) {
        const match = statusStr.match(/(\d+)/);
        if (match) {
            delay = parseInt(match[1], 10);
            status = 'delayed';
        }
    } else if (statusLower.includes('cancel')) {
        status = 'cancelled';
    }

    return {
        id: train.train_id,
        line: train.line,
        destination: train.destination,
        scheduledTime: train.sched_time,
        estimatedTime: delay > 0 ? train.depart_time : null,
        delay,
        platform: train.track || train.platform || null,
        status,
        direction,
    };
}
